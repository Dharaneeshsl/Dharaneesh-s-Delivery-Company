# Dharaneesh's Delivery Company

A modern, full-stack delivery management application built with Flutter frontend and Node.js backend, featuring Google Services integration, real-time tracking, and comprehensive delivery management.

## 🚀 Features

### Frontend (Flutter)
- **Modern UI/UX**: Beautiful, responsive design with Material 3
- **Authentication**: Secure login/register with JWT and Firebase
- **Real-time Tracking**: Live delivery status updates
- **Maps Integration**: Google Maps for location services
- **Push Notifications**: Firebase Cloud Messaging
- **Offline Support**: Local data caching
- **Multi-platform**: iOS, Android, and Web support

### Backend (Node.js/Express)
- **RESTful API**: Complete CRUD operations
- **Authentication**: JWT-based security
- **Google Services**: Maps, Cloud Storage, Vision API
- **Firebase Integration**: Real-time database and notifications
- **File Upload**: Cloud Storage for images and documents
- **Rate Limiting**: API protection
- **Error Handling**: Comprehensive error management

### Core Functionality
- **User Management**: Customer, Driver, and Admin roles
- **Delivery Booking**: Express, Standard, and Economy options
- **Real-time Tracking**: Live location updates
- **Route Optimization**: Google Maps integration
- **Payment Processing**: Secure payment handling
- **Notifications**: SMS and Email alerts
- **Analytics**: Delivery statistics and reporting

## 🛠️ Tech Stack

### Frontend
- **Framework**: Flutter 3.x
- **State Management**: Provider
- **HTTP Client**: http package
- **Local Storage**: SharedPreferences, SecureStorage
- **Maps**: Google Maps Flutter
- **Notifications**: flutter_local_notifications
- **UI Components**: Custom widgets with Material 3

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT, bcryptjs
- **Validation**: express-validator
- **File Upload**: multer, express-fileupload
- **Google Services**: googleapis, @google-cloud/storage
- **Firebase**: firebase-admin
- **Notifications**: Twilio (SMS), Nodemailer (Email)
- **Security**: helmet, cors, rate-limiting

### External Services
- **Google Cloud Platform**: Maps, Storage, Vision API
- **Firebase**: Authentication, Firestore, Cloud Messaging
- **Twilio**: SMS notifications
- **Cloudinary**: Image processing

## 📱 Screenshots

### Authentication Screens
- Splash Screen with animated logo
- Login with social options
- Registration with role selection
- Forgot Password flow

### Main App Screens
- Home Dashboard
- Delivery Booking
- Real-time Tracking
- Order History
- Profile Management

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.x
- Node.js 18+
- Google Cloud Platform account
- Firebase project
- Twilio account (for SMS)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dharaneesh-delivery.git
cd dharaneesh-delivery
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Google Services Configuration
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id

# Add other environment variables as needed
```

#### 4. Start Backend Server
```bash
npm run dev
```

#### 5. Flutter Setup
```bash
cd ..
flutter pub get
```

#### 6. Run Flutter App
```bash
flutter run
```

## 📁 Project Structure

```
dharaneesh-delivery/
├── lib/
│   ├── main.dart
│   ├── models/
│   │   ├── user.dart
│   │   └── delivery.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   └── delivery_provider.dart
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── auth/
│   │   ├── home_screen.dart
│   │   └── delivery/
│   ├── widgets/
│   │   ├── custom_button.dart
│   │   └── custom_text_field.dart
│   └── utils/
│       └── theme.dart
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── delivery.js
│   │   └── user.js
│   ├── services/
│   │   ├── googleServices.js
│   │   └── firebaseService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Google Services Setup
1. Create a Google Cloud Project
2. Enable required APIs:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API
   - Cloud Storage API
   - Vision API
3. Create service account and download credentials
4. Set up Cloud Storage bucket

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication, Firestore, and Cloud Messaging
3. Download service account key
4. Configure FCM for push notifications

### Twilio Setup
1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase phone number for SMS

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Delivery Endpoints
- `POST /api/delivery` - Create delivery
- `GET /api/delivery` - Get user deliveries
- `GET /api/delivery/:id` - Get single delivery
- `PATCH /api/delivery/:id/status` - Update status
- `PATCH /api/delivery/:id/assign` - Assign driver
- `PATCH /api/delivery/:id/cancel` - Cancel delivery

### User Endpoints
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/change-password` - Change password

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Secure password hashing

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Deploy to cloud platform (Heroku, AWS, GCP)
3. Configure domain and SSL
4. Set up monitoring and logging

### Flutter App Deployment
1. Build for target platforms
2. Upload to app stores
3. Configure production API endpoints
4. Set up crash reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Dharaneesh**
- Email: dharaneesh@example.com
- LinkedIn: [Dharaneesh](https://linkedin.com/in/dharaneesh)

## 🙏 Acknowledgments

- Google Cloud Platform for mapping and storage services
- Firebase for real-time features
- Flutter team for the amazing framework
- Express.js community for the robust backend framework

## 📞 Support

For support and questions:
- Email: support@dharaneeshdelivery.com
- Documentation: [docs.dharaneeshdelivery.com](https://docs.dharaneeshdelivery.com)
- Issues: [GitHub Issues](https://github.com/yourusername/dharaneesh-delivery/issues)

---

**Made with ❤️ by Dharaneesh's Delivery Company** 