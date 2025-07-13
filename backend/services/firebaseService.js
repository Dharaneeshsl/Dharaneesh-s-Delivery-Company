const admin = require('firebase-admin');

let firebaseApp;

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    } else {
      firebaseApp = admin.app();
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
  }
};

// Firebase Authentication Service
const authService = {
  // Verify Firebase ID token
  verifyToken: async (idToken) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  },

  // Create custom token
  createCustomToken: async (uid, additionalClaims = {}) => {
    try {
      const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      throw new Error(`Custom token creation failed: ${error.message}`);
    }
  },

  // Get user by UID
  getUser: async (uid) => {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      throw new Error(`User retrieval failed: ${error.message}`);
    }
  },

  // Update user profile
  updateUser: async (uid, userData) => {
    try {
      const userRecord = await admin.auth().updateUser(uid, userData);
      return userRecord;
    } catch (error) {
      throw new Error(`User update failed: ${error.message}`);
    }
  },

  // Delete user
  deleteUser: async (uid) => {
    try {
      await admin.auth().deleteUser(uid);
      return true;
    } catch (error) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  },
};

// Firebase Cloud Messaging (FCM) Service
const messagingService = {
  // Send notification to single device
  sendToDevice: async (token, notification, data = {}) => {
    try {
      const message = {
        token,
        notification,
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'delivery_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw new Error(`FCM send failed: ${error.message}`);
    }
  },

  // Send notification to multiple devices
  sendToMultipleDevices: async (tokens, notification, data = {}) => {
    try {
      const message = {
        notification,
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'delivery_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast({
        tokens,
        ...message,
      });
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      throw new Error(`FCM multicast failed: ${error.message}`);
    }
  },

  // Send notification to topic
  sendToTopic: async (topic, notification, data = {}) => {
    try {
      const message = {
        topic,
        notification,
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'delivery_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw new Error(`FCM topic send failed: ${error.message}`);
    }
  },

  // Subscribe device to topic
  subscribeToTopic: async (tokens, topic) => {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      return response;
    } catch (error) {
      throw new Error(`Topic subscription failed: ${error.message}`);
    }
  },

  // Unsubscribe device from topic
  unsubscribeFromTopic: async (tokens, topic) => {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return response;
    } catch (error) {
      throw new Error(`Topic unsubscription failed: ${error.message}`);
    }
  },
};

// Firebase Firestore Service
const firestoreService = {
  // Get Firestore instance
  getDb: () => {
    return admin.firestore();
  },

  // Create document
  createDocument: async (collection, data, docId = null) => {
    try {
      const db = admin.firestore();
      const docRef = docId 
        ? db.collection(collection).doc(docId)
        : db.collection(collection).doc();
      
      await docRef.set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error) {
      throw new Error(`Document creation failed: ${error.message}`);
    }
  },

  // Get document
  getDocument: async (collection, docId) => {
    try {
      const db = admin.firestore();
      const doc = await db.collection(collection).doc(docId).get();
      
      if (!doc.exists) {
        throw new Error('Document not found');
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Document retrieval failed: ${error.message}`);
    }
  },

  // Update document
  updateDocument: async (collection, docId, data) => {
    try {
      const db = admin.firestore();
      await db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return true;
    } catch (error) {
      throw new Error(`Document update failed: ${error.message}`);
    }
  },

  // Delete document
  deleteDocument: async (collection, docId) => {
    try {
      const db = admin.firestore();
      await db.collection(collection).doc(docId).delete();
      return true;
    } catch (error) {
      throw new Error(`Document deletion failed: ${error.message}`);
    }
  },

  // Query documents
  queryDocuments: async (collection, conditions = [], orderBy = null, limit = null) => {
    try {
      const db = admin.firestore();
      let query = db.collection(collection);
      
      // Apply conditions
      conditions.forEach(condition => {
        query = query.where(condition.field, condition.operator, condition.value);
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }
      
      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      throw new Error(`Document query failed: ${error.message}`);
    }
  },

  // Real-time listener
  onSnapshot: (collection, callback, conditions = []) => {
    try {
      const db = admin.firestore();
      let query = db.collection(collection);
      
      // Apply conditions
      conditions.forEach(condition => {
        query = query.where(condition.field, condition.operator, condition.value);
      });
      
      return query.onSnapshot(snapshot => {
        const documents = [];
        snapshot.forEach(doc => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      });
    } catch (error) {
      throw new Error(`Snapshot listener failed: ${error.message}`);
    }
  },
};

// Firebase Storage Service
const storageService = {
  // Upload file to Firebase Storage
  uploadFile: async (file, destination, metadata = {}) => {
    try {
      const bucket = admin.storage().bucket();
      const blob = bucket.file(destination);
      
      await blob.save(file.data, {
        metadata: {
          contentType: file.mimetype,
          ...metadata,
        },
      });
      
      // Make file publicly accessible
      await blob.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      return publicUrl;
    } catch (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  },

  // Delete file from Firebase Storage
  deleteFile: async (filename) => {
    try {
      const bucket = admin.storage().bucket();
      await bucket.file(filename).delete();
      return true;
    } catch (error) {
      throw new Error(`Storage deletion failed: ${error.message}`);
    }
  },

  // Generate signed URL
  generateSignedUrl: async (filename, expirationMinutes = 60) => {
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(filename);
      
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000,
      });
      
      return url;
    } catch (error) {
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
  },
};

module.exports = {
  initializeFirebase,
  authService,
  messagingService,
  firestoreService,
  storageService,
  firebaseApp,
}; 