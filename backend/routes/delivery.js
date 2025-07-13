const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { mapsService, storageService } = require('../services/googleServices');
const { messagingService, firestoreService } = require('../services/firebaseService');
const { requireCustomer, requireDriverOrAdmin, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory delivery storage (replace with database in production)
const deliveries = new Map();

// Create new delivery
router.post('/', [
  body('pickupAddress').notEmpty().withMessage('Pickup address is required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerEmail').isEmail().withMessage('Valid customer email is required'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('type').isIn(['express', 'standard', 'economy']).withMessage('Valid delivery type is required'),
  body('pickupDate').isISO8601().withMessage('Valid pickup date is required'),
], requireCustomer, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    pickupAddress,
    deliveryAddress,
    customerName,
    customerPhone,
    customerEmail,
    description,
    weight,
    items,
    type,
    pickupDate,
  } = req.body;

  try {
    // Get distance and duration using Google Maps
    const distanceMatrix = await mapsService.getDistanceMatrix(
      pickupAddress,
      deliveryAddress
    );

    // Calculate price based on distance and type
    const basePrice = distanceMatrix.distance.value / 1000 * 2; // $2 per km
    let price = basePrice;
    
    switch (type) {
      case 'express':
        price *= 1.5;
        break;
      case 'standard':
        price *= 1.0;
        break;
      case 'economy':
        price *= 0.8;
        break;
    }

    // Add weight factor
    price += weight * 0.5; // $0.5 per kg

    // Calculate estimated delivery date
    const pickupMoment = moment(pickupDate);
    const estimatedDeliveryDate = pickupMoment
      .add(distanceMatrix.duration.value / 3600, 'hours')
      .add(2, 'hours') // Buffer time
      .toDate();

    // Create delivery object
    const deliveryId = uuidv4();
    const delivery = {
      id: deliveryId,
      customerId: req.user.userId,
      pickupAddress,
      deliveryAddress,
      customerName,
      customerPhone,
      customerEmail,
      description,
      weight,
      items,
      type,
      status: 'pending',
      price: Math.round(price * 100) / 100, // Round to 2 decimal places
      pickupDate: new Date(pickupDate),
      estimatedDeliveryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingData: {
        distance: distanceMatrix.distance,
        duration: distanceMatrix.duration,
        pickupCoordinates: null, // Will be set when driver picks up
        deliveryCoordinates: null, // Will be set when driver delivers
      },
    };

    // Store delivery
    deliveries.set(deliveryId, delivery);

    // Store in Firestore
    await firestoreService.createDocument('deliveries', delivery, deliveryId);

    // Send notification to admin/drivers
    try {
      await messagingService.sendToTopic('delivery_requests', {
        title: 'New Delivery Request',
        body: `New ${type} delivery from ${pickupAddress} to ${deliveryAddress}`,
      }, {
        deliveryId,
        type: 'new_delivery',
      });
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.status(201).json({
      message: 'Delivery created successfully',
      delivery,
    });
  } catch (error) {
    console.error('Delivery creation error:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
}));

// Get all deliveries for user
router.get('/', asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let userDeliveries = Array.from(deliveries.values());

  // Filter by user role
  if (req.user.role === 'customer') {
    userDeliveries = userDeliveries.filter(d => d.customerId === req.user.userId);
  } else if (req.user.role === 'driver') {
    userDeliveries = userDeliveries.filter(d => d.driverId === req.user.userId);
  }

  // Apply filters
  if (status) {
    userDeliveries = userDeliveries.filter(d => d.status === status);
  }
  if (type) {
    userDeliveries = userDeliveries.filter(d => d.type === type);
  }

  // Sort by creation date (newest first)
  userDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const total = userDeliveries.length;
  const paginatedDeliveries = userDeliveries.slice(skip, skip + parseInt(limit));

  res.json({
    deliveries: paginatedDeliveries,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

// Get single delivery
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const delivery = deliveries.get(id);

  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  // Check permissions
  if (req.user.role === 'customer' && delivery.customerId !== req.user.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (req.user.role === 'driver' && delivery.driverId !== req.user.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ delivery });
}));

// Update delivery status (driver only)
router.patch('/:id/status', [
  body('status').isIn(['confirmed', 'pickedUp', 'inTransit', 'delivered', 'cancelled'])
    .withMessage('Valid status is required'),
  body('location').optional().isObject().withMessage('Location must be an object'),
], requireDriverOrAdmin, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { status, location } = req.body;

  const delivery = deliveries.get(id);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  // Check if driver is assigned to this delivery
  if (req.user.role === 'driver' && delivery.driverId !== req.user.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Update status
  delivery.status = status;
  delivery.updatedAt = new Date().toISOString();

  // Update tracking data based on status
  if (location) {
    if (status === 'pickedUp') {
      delivery.trackingData.pickupCoordinates = location;
    } else if (status === 'delivered') {
      delivery.trackingData.deliveryCoordinates = location;
      delivery.actualDeliveryDate = new Date().toISOString();
    }
  }

  // Update in Firestore
  await firestoreService.updateDocument('deliveries', id, {
    status,
    updatedAt: delivery.updatedAt,
    trackingData: delivery.trackingData,
    ...(status === 'delivered' && { actualDeliveryDate: delivery.actualDeliveryDate }),
  });

  // Send notification to customer
  try {
    const statusMessages = {
      confirmed: 'Your delivery has been confirmed',
      pickedUp: 'Your package has been picked up',
      inTransit: 'Your package is on the way',
      delivered: 'Your package has been delivered',
      cancelled: 'Your delivery has been cancelled',
    };

    await messagingService.sendToTopic(`customer_${delivery.customerId}`, {
      title: 'Delivery Update',
      body: statusMessages[status] || 'Delivery status updated',
    }, {
      deliveryId: id,
      status,
      type: 'status_update',
    });
  } catch (notificationError) {
    console.error('Notification error:', notificationError);
  }

  res.json({
    message: 'Delivery status updated successfully',
    delivery,
  });
}));

// Assign driver to delivery (admin only)
router.patch('/:id/assign', [
  body('driverId').notEmpty().withMessage('Driver ID is required'),
], requireAdmin, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { driverId } = req.body;

  const delivery = deliveries.get(id);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  // Update driver assignment
  delivery.driverId = driverId;
  delivery.status = 'confirmed';
  delivery.updatedAt = new Date().toISOString();

  // Update in Firestore
  await firestoreService.updateDocument('deliveries', id, {
    driverId,
    status: 'confirmed',
    updatedAt: delivery.updatedAt,
  });

  // Send notification to driver
  try {
    await messagingService.sendToTopic(`driver_${driverId}`, {
      title: 'New Delivery Assignment',
      body: `You have been assigned a new ${delivery.type} delivery`,
    }, {
      deliveryId: id,
      type: 'driver_assignment',
    });
  } catch (notificationError) {
    console.error('Notification error:', notificationError);
  }

  res.json({
    message: 'Driver assigned successfully',
    delivery,
  });
}));

// Cancel delivery
router.patch('/:id/cancel', requireCustomer, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const delivery = deliveries.get(id);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  // Check if customer owns this delivery
  if (delivery.customerId !== req.user.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check if delivery can be cancelled
  if (['pickedUp', 'inTransit', 'delivered'].includes(delivery.status)) {
    return res.status(400).json({ error: 'Delivery cannot be cancelled at this stage' });
  }

  // Update status
  delivery.status = 'cancelled';
  delivery.updatedAt = new Date().toISOString();

  // Update in Firestore
  await firestoreService.updateDocument('deliveries', id, {
    status: 'cancelled',
    updatedAt: delivery.updatedAt,
  });

  // Send notification to driver if assigned
  if (delivery.driverId) {
    try {
      await messagingService.sendToTopic(`driver_${delivery.driverId}`, {
        title: 'Delivery Cancelled',
        body: 'A delivery has been cancelled',
      }, {
        deliveryId: id,
        type: 'delivery_cancelled',
      });
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }
  }

  res.json({
    message: 'Delivery cancelled successfully',
    delivery,
  });
}));

// Get delivery statistics
router.get('/stats/overview', requireAdmin, asyncHandler(async (req, res) => {
  const allDeliveries = Array.from(deliveries.values());
  
  const stats = {
    total: allDeliveries.length,
    pending: allDeliveries.filter(d => d.status === 'pending').length,
    confirmed: allDeliveries.filter(d => d.status === 'confirmed').length,
    pickedUp: allDeliveries.filter(d => d.status === 'pickedUp').length,
    inTransit: allDeliveries.filter(d => d.status === 'inTransit').length,
    delivered: allDeliveries.filter(d => d.status === 'delivered').length,
    cancelled: allDeliveries.filter(d => d.status === 'cancelled').length,
    totalRevenue: allDeliveries
      .filter(d => d.status === 'delivered')
      .reduce((sum, d) => sum + d.price, 0),
    averageDeliveryTime: 0, // Calculate based on actual delivery times
  };

  res.json({ stats });
}));

module.exports = router; 