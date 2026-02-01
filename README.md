# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# UniqueStore

A premium lifestyle and artisanal products store for discerning customers.

## Firebase Configuration

This project uses Firebase for authentication, database, and storage. The following Firebase services have been configured:

- Authentication with Email/Password and Google Sign-in
- Firestore Database for storing user data
- Firebase Storage for storing images and files

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Make sure you have the following Firebase packages installed:
```bash
npm install firebase
```

4. Run the development server:
```bash
npm run dev
```

## Firebase Services Used

- **Authentication**: For user login, signup, and managing user sessions
- **Firestore Database**: For storing user data, products, orders, and other app data
- **Storage**: For storing images, videos, and other user-uploaded content

## Environment Variables

The Firebase configuration is set up in `src/firebase/config.js`. If you need to use a different Firebase project, update the configuration in this file.

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Features

- User authentication with email/password and Google Sign-in
- User profile management
- Product catalog and search
- Image uploads
- Real-time updates
