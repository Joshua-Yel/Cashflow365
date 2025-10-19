# CASHFLOW365 Web Version - Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/cashflow365-web.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect React and configure the build settings
   - Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   cd web-version
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set up project settings
   - Deploy

## Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_database_url
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Firebase Configuration

1. **Enable Firebase AI**:
   - Go to Firebase Console
   - Navigate to AI & ML > Gemini API
   - Enable the API
   - Add your domain to allowed origins

2. **Configure Authentication**:
   - Enable Email/Password authentication
   - Add your Vercel domain to authorized domains

3. **Set up Realtime Database**:
   - Create a Realtime Database
   - Set up security rules for authenticated users

## Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Firebase**:
   - Add your custom domain to Firebase Auth authorized domains

## Performance Optimization

The web version includes several optimizations:

- **Code Splitting**: Automatic with React Router
- **Lazy Loading**: Components load on demand
- **Firebase Optimization**: Efficient real-time listeners
- **CSS Optimization**: Minimal, utility-first CSS
- **Bundle Optimization**: Tree shaking and minification

## Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Firebase Analytics**: User behavior tracking
3. **Error Monitoring**: Console logging and Firebase error reporting

## Troubleshooting

### Common Issues:

1. **Firebase AI Not Working**:
   - Ensure Node.js 20+ is used in build
   - Check Firebase AI is enabled
   - Verify API keys are correct

2. **Authentication Issues**:
   - Check authorized domains in Firebase
   - Verify environment variables
   - Check Firebase Auth configuration

3. **Database Issues**:
   - Verify Realtime Database rules
   - Check Firebase project configuration
   - Ensure proper authentication flow

### Build Issues:

1. **TypeScript Errors**:

   ```bash
   npm run build
   ```

   Fix any TypeScript errors before deploying

2. **Dependency Issues**:
   ```bash
   npm install
   npm audit fix
   ```

## Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **Firebase Rules**: Implement proper security rules
3. **HTTPS**: Vercel provides automatic HTTPS
4. **CORS**: Configure Firebase for your domain

## Scaling

The application is designed to scale with:

- **Firebase**: Automatic scaling for database and auth
- **Vercel**: Global CDN and edge functions
- **React**: Efficient rendering and state management
- **AI**: Firebase AI handles scaling automatically

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Review Firebase console for errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
