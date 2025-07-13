enum DeliveryStatus {
  pending,
  confirmed,
  pickedUp,
  inTransit,
  delivered,
  cancelled,
}

enum DeliveryType {
  express,
  standard,
  economy,
}

class Delivery {
  final String id;
  final String customerId;
  final String? driverId;
  final String pickupAddress;
  final String deliveryAddress;
  final String customerName;
  final String customerPhone;
  final String customerEmail;
  final String? description;
  final double weight;
  final List<String> items;
  final DeliveryType type;
  final DeliveryStatus status;
  final double price;
  final DateTime pickupDate;
  final DateTime? estimatedDeliveryDate;
  final DateTime? actualDeliveryDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? trackingData;

  Delivery({
    required this.id,
    required this.customerId,
    this.driverId,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.customerName,
    required this.customerPhone,
    required this.customerEmail,
    this.description,
    required this.weight,
    required this.items,
    required this.type,
    required this.status,
    required this.price,
    required this.pickupDate,
    this.estimatedDeliveryDate,
    this.actualDeliveryDate,
    required this.createdAt,
    required this.updatedAt,
    this.trackingData,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'],
      customerId: json['customerId'],
      driverId: json['driverId'],
      pickupAddress: json['pickupAddress'],
      deliveryAddress: json['deliveryAddress'],
      customerName: json['customerName'],
      customerPhone: json['customerPhone'],
      customerEmail: json['customerEmail'],
      description: json['description'],
      weight: json['weight'].toDouble(),
      items: List<String>.from(json['items']),
      type: DeliveryType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
      ),
      status: DeliveryStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
      ),
      price: json['price'].toDouble(),
      pickupDate: DateTime.parse(json['pickupDate']),
      estimatedDeliveryDate: json['estimatedDeliveryDate'] != null
          ? DateTime.parse(json['estimatedDeliveryDate'])
          : null,
      actualDeliveryDate: json['actualDeliveryDate'] != null
          ? DateTime.parse(json['actualDeliveryDate'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      trackingData: json['trackingData'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'driverId': driverId,
      'pickupAddress': pickupAddress,
      'deliveryAddress': deliveryAddress,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'customerEmail': customerEmail,
      'description': description,
      'weight': weight,
      'items': items,
      'type': type.toString().split('.').last,
      'status': status.toString().split('.').last,
      'price': price,
      'pickupDate': pickupDate.toIso8601String(),
      'estimatedDeliveryDate': estimatedDeliveryDate?.toIso8601String(),
      'actualDeliveryDate': actualDeliveryDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'trackingData': trackingData,
    };
  }

  Delivery copyWith({
    String? id,
    String? customerId,
    String? driverId,
    String? pickupAddress,
    String? deliveryAddress,
    String? customerName,
    String? customerPhone,
    String? customerEmail,
    String? description,
    double? weight,
    List<String>? items,
    DeliveryType? type,
    DeliveryStatus? status,
    double? price,
    DateTime? pickupDate,
    DateTime? estimatedDeliveryDate,
    DateTime? actualDeliveryDate,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? trackingData,
  }) {
    return Delivery(
      id: id ?? this.id,
      customerId: customerId ?? this.customerId,
      driverId: driverId ?? this.driverId,
      pickupAddress: pickupAddress ?? this.pickupAddress,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      customerEmail: customerEmail ?? this.customerEmail,
      description: description ?? this.description,
      weight: weight ?? this.weight,
      items: items ?? this.items,
      type: type ?? this.type,
      status: status ?? this.status,
      price: price ?? this.price,
      pickupDate: pickupDate ?? this.pickupDate,
      estimatedDeliveryDate: estimatedDeliveryDate ?? this.estimatedDeliveryDate,
      actualDeliveryDate: actualDeliveryDate ?? this.actualDeliveryDate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      trackingData: trackingData ?? this.trackingData,
    );
  }

  String get statusText {
    switch (status) {
      case DeliveryStatus.pending:
        return 'Pending';
      case DeliveryStatus.confirmed:
        return 'Confirmed';
      case DeliveryStatus.pickedUp:
        return 'Picked Up';
      case DeliveryStatus.inTransit:
        return 'In Transit';
      case DeliveryStatus.delivered:
        return 'Delivered';
      case DeliveryStatus.cancelled:
        return 'Cancelled';
    }
  }

  String get typeText {
    switch (type) {
      case DeliveryType.express:
        return 'Express';
      case DeliveryType.standard:
        return 'Standard';
      case DeliveryType.economy:
        return 'Economy';
    }
  }

  bool get isCompleted => status == DeliveryStatus.delivered;
  bool get isCancelled => status == DeliveryStatus.cancelled;
  bool get isActive => !isCompleted && !isCancelled;
} 