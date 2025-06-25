import React from 'react';
import AuthCallback from './AuthCallback';
import App from '../App';

const Router: React.FC = () => {
  const path = window.location.pathname;

  // Handle auth callback route
  if (path === '/auth/callback') {
    return <AuthCallback />;
  }

  // Default to main app
  return <App />;
};

export default Router;