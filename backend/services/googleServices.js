const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise,
});

let storage;
let visionClient;
let auth;

const initializeGoogleServices = () => {
  try {
    // Initialize Google Cloud credentials
    auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
        client_cert_url: process.env.GOOGLE_CLOUD_CLIENT_CERT_URL,
      },
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/maps-platform',
      ],
    });

    // Initialize Cloud Storage
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
        client_cert_url: process.env.GOOGLE_CLOUD_CLIENT_CERT_URL,
      },
    });

    // Initialize Vision API
    visionClient = new vision.ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
        client_cert_url: process.env.GOOGLE_CLOUD_CLIENT_CERT_URL,
      },
    });

    console.log('✅ Google Services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Google Services:', error.message);
  }
};

// Google Maps Services
const mapsService = {
  // Get distance and duration between two points
  getDistanceMatrix: async (origin, destination, mode = 'driving') => {
    try {
      const response = await googleMapsClient.distancematrix({
        origins: [origin],
        destinations: [destination],
        mode: mode,
        units: 'metric',
      }).asPromise();

      const element = response.json.rows[0].elements[0];
      return {
        distance: element.distance,
        duration: element.duration,
        status: element.status,
      };
    } catch (error) {
      throw new Error(`Maps API error: ${error.message}`);
    }
  },

  // Geocode address to coordinates
  geocodeAddress: async (address) => {
    try {
      const response = await googleMapsClient.geocode({
        address: address,
      }).asPromise();

      if (response.json.results.length > 0) {
        const location = response.json.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: response.json.results[0].formatted_address,
        };
      }
      throw new Error('Address not found');
    } catch (error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (lat, lng) => {
    try {
      const response = await googleMapsClient.reverseGeocode({
        latlng: `${lat},${lng}`,
      }).asPromise();

      if (response.json.results.length > 0) {
        return {
          address: response.json.results[0].formatted_address,
          components: response.json.results[0].address_components,
        };
      }
      throw new Error('Location not found');
    } catch (error) {
      throw new Error(`Reverse geocoding error: ${error.message}`);
    }
  },

  // Get optimized route for multiple destinations
  getOptimizedRoute: async (origin, destinations) => {
    try {
      const response = await googleMapsClient.directions({
        origin: origin,
        destination: destinations.join('|'),
        optimize: true,
        mode: 'driving',
      }).asPromise();

      return response.json.routes[0];
    } catch (error) {
      throw new Error(`Route optimization error: ${error.message}`);
    }
  },
};

// Cloud Storage Services
const storageService = {
  // Upload file to Cloud Storage
  uploadFile: async (file, destination) => {
    try {
      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const blob = bucket.file(destination);
      
      await blob.save(file.data, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${destination}`;
      return publicUrl;
    } catch (error) {
      throw new Error(`Storage upload error: ${error.message}`);
    }
  },

  // Delete file from Cloud Storage
  deleteFile: async (filename) => {
    try {
      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      await bucket.file(filename).delete();
      return true;
    } catch (error) {
      throw new Error(`Storage delete error: ${error.message}`);
    }
  },

  // Generate signed URL for file access
  generateSignedUrl: async (filename, expirationMinutes = 60) => {
    try {
      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const file = bucket.file(filename);
      
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000,
      });
      
      return url;
    } catch (error) {
      throw new Error(`Signed URL generation error: ${error.message}`);
    }
  },

  // List files in bucket
  listFiles: async (prefix = '') => {
    try {
      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const [files] = await bucket.getFiles({ prefix });
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        timeCreated: file.metadata.timeCreated,
      }));
    } catch (error) {
      throw new Error(`File listing error: ${error.message}`);
    }
  },
};

// Vision API Services
const visionService = {
  // Extract text from image (OCR)
  extractText: async (imageBuffer) => {
    try {
      const [result] = await visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      
      if (detections.length > 0) {
        return {
          text: detections[0].description,
          confidence: detections[0].confidence || 0,
        };
      }
      return { text: '', confidence: 0 };
    } catch (error) {
      throw new Error(`OCR error: ${error.message}`);
    }
  },

  // Detect objects in image
  detectObjects: async (imageBuffer) => {
    try {
      const [result] = await visionClient.objectLocalization(imageBuffer);
      const objects = result.localizedObjectAnnotations;
      
      return objects.map(obj => ({
        name: obj.name,
        confidence: obj.score,
        boundingPoly: obj.boundingPoly,
      }));
    } catch (error) {
      throw new Error(`Object detection error: ${error.message}`);
    }
  },

  // Detect faces in image
  detectFaces: async (imageBuffer) => {
    try {
      const [result] = await visionClient.faceDetection(imageBuffer);
      const faces = result.faceAnnotations;
      
      return faces.map(face => ({
        confidence: face.detectionConfidence,
        joyLikelihood: face.joyLikelihood,
        sorrowLikelihood: face.sorrowLikelihood,
        angerLikelihood: face.angerLikelihood,
        surpriseLikelihood: face.surpriseLikelihood,
        boundingPoly: face.boundingPoly,
      }));
    } catch (error) {
      throw new Error(`Face detection error: ${error.message}`);
    }
  },

  // Analyze image properties
  analyzeImage: async (imageBuffer) => {
    try {
      const [result] = await visionClient.imageProperties(imageBuffer);
      const properties = result.imagePropertiesAnnotation;
      
      return {
        dominantColors: properties.dominantColors.colors.map(color => ({
          color: color.color,
          score: color.score,
          pixelFraction: color.pixelFraction,
        })),
      };
    } catch (error) {
      throw new Error(`Image analysis error: ${error.message}`);
    }
  },
};

module.exports = {
  initializeGoogleServices,
  mapsService,
  storageService,
  visionService,
  auth,
}; 