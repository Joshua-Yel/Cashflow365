# CASHFLOW365 - Web Version

A modern, AI-powered personal finance management web application built with React and TypeScript.

## Features

- 🔐 **Authentication**: Secure user registration and login with Firebase Auth
- 💰 **Expense Tracking**: Add, categorize, and track expenses with AI insights
- 💵 **Income Management**: Record and manage income sources
- 🤖 **AI-Powered Insights**: Get personalized financial advice and predictions
- 📊 **Financial Health Score**: Real-time assessment of your financial status
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- 🌐 **Multi-language Support**: English and Filipino language options
- 🔄 **Real-time Data**: Live updates using Firebase Realtime Database

## Tech Stack

- **Frontend**: React 19, TypeScript, CSS3
- **Routing**: React Router DOM
- **Backend**: Firebase (Auth, Realtime Database, AI)
- **AI**: Firebase AI with Gemini 1.5 Flash
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Firebase AI requires Node 20+ for optimal performance)
- npm or yarn
- Firebase project with AI enabled

### Installation

1. Clone the repository
2. Navigate to the web-version directory
3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure Firebase:
   - Update `src/firebaseConfig.ts` with your Firebase configuration
   - Ensure Firebase AI is enabled in your Firebase project

5. Start the development server:

   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Deployment on Vercel

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Vercel will automatically detect the React app and deploy it
4. The `vercel.json` configuration file is included for optimal deployment

### Environment Variables

Make sure to set up the following environment variables in Vercel:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_DATABASE_URL`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

## Project Structure

```
src/
├── components/
│   ├── authentication/     # Login and registration components
│   ├── dashboard/          # Dashboard-specific components
│   ├── income/             # Income-related components
│   ├── expense/            # Expense-related components
│   ├── common/             # Shared components
│   └── predictions/        # Prediction components
├── screens/                # Main screen components
├── hooks/                  # Custom React hooks
├── navigation/             # Navigation components
├── utils/                  # Utility functions
├── assets/                 # Static assets
├── firebaseConfig.ts       # Firebase configuration
├── App.tsx                 # Main app component
└── index.tsx              # App entry point
```

## Key Features Implementation

### Authentication

- Firebase Authentication with email/password
- Automatic redirect based on authentication state
- Profile setup for new users

### AI Integration

- Dashboard AI analysis using Firebase AI
- Expense AI suggestions and insights
- Real-time financial health scoring

### Data Management

- Firebase Realtime Database for data persistence
- Real-time updates across all components
- Offline support with Firebase persistence

### Responsive Design

- Mobile-first approach
- Bottom navigation for mobile devices
- Responsive grid layouts
- Touch-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
