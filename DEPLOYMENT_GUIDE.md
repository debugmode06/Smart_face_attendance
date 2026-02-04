# Vidyatra - Deployment Guide

## React Frontend - Vercel Deployment

### Prerequisites
- Vercel account
- Backend deployed and accessible via HTTPS

### Steps:

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Configure Environment Variables**
Edit `.env.production`:
```
VITE_API_URL=https://your-backend-url.com/api
```

3. **Test Build Locally**
```bash
cd frontend
npm install
npm run build
```

4. **Deploy to Vercel**
```bash
vercel login
vercel --prod
```

5. **Set Environment Variables in Vercel Dashboard**
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend-url.com/api`
- Redeploy

### Verification
- Visit your Vercel URL
- Test login with: `admin@test.com` / `admin123`
- Check browser console for API errors

---

## Flutter Mobile - Android APK Build

### Prerequisites
- Flutter SDK installed (>= 3.0.0)
- Android Studio with SDK
- Java JDK 11+

### Setup Steps:

1. **Navigate to Flutter Project**
```bash
cd vidyatra_flutter_mobile
```

2. **Install Dependencies**
```bash
flutter pub get
```

3. **Configure Backend URL**
Edit `.env`:
```
API_BASE_URL=https://your-backend-url.com/api
```

4. **Generate Keystore (First Time Only)**
```bash
keytool -genkey -v -keystore android/app/keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias vidyatra
```

5. **Configure Signing (android/app/build.gradle)**
```gradle
android {
    signingConfigs {
        release {
            storeFile file("keystore.jks")
            storePassword "your-password"
            keyAlias "vidyatra"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

6. **Build APK**
```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

7. **Install on Device**
```bash
flutter install
```

Or transfer APK to phone and install manually.

### Verification
- Open app on Android device
- Test login
- Test camera face capture
- Verify attendance marking

---

## Backend CORS Configuration

Ensure backend allows both React and Flutter origins:

```javascript
// backend/server.js
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true
}));
```

---

## Final Checklist

### React (Vercel)
- [ ] Environment variables configured
- [ ] No hardcoded URLs
- [ ] Build successful
- [ ] Deployed to Vercel
- [ ] Login works
- [ ] Face upload works
- [ ] JWT authentication working

### Flutter (Android)
- [ ] Dependencies installed (`flutter pub get`)
- [ ] .env configured
- [ ] Permissions added (Camera, Internet)
- [ ] APK builds successfully
- [ ] Installs on device
- [ ] Login works
- [ ] Camera captures face
- [ ] Image uploads to backend
- [ ] Attendance marks correctly

### Backend
- [ ] CORS allows both frontends
- [ ] HTTPS enabled
- [ ] JWT tokens validate
- [ ] Face service responds
- [ ] MongoDB connected
- [ ] All endpoints tested

---

## Architecture Flow

```
React (Vercel) ──┐
                 ├──> Node.js Backend ──> Python Face Service
Flutter (APK) ───┘
```

**Key Points:**
- Both frontends use IDENTICAL backend APIs
- NO direct frontend → Python communication
- Backend handles all face recognition logic
- JWT tokens secure all requests
- Images uploaded via multipart/form-data

---

## Troubleshooting

### React Issues
- **"Network Error"**: Check VITE_API_URL in .env.production
- **CORS Error**: Add Vercel URL to backend CORS config
- **401 Unauthorized**: Clear localStorage and re-login

### Flutter Issues
- **Build Failed**: Run `flutter clean && flutter pub get`
- **"Connection Refused"**: Change .env to use 10.0.2.2 for emulator
- **Camera Error**: Check AndroidManifest.xml permissions
- **Upload Failed**: Verify backend accepts multipart/form-data

### Backend Issues
- **Face Service Down**: Check Python service status
- **MongoDB Error**: Verify connection string
- **Token Invalid**: Check JWT secret matches

---

## Testing Credentials

```
Admin:   admin@test.com / admin123
Faculty: f1@test.com / faculty123
Student: s1@test.com / student123
```

Run backend seed endpoint first: `GET /api/auth/seed`
