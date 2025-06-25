import React, { useEffect } from 'react';
import { motion } from 'motion/react';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    // The better-auth client will automatically handle the callback
    // and redirect the user back to the main app
    const handleCallback = async () => {
      try {
        // Wait a moment for the auth to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to the main app
        window.location.href = '/';
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to main app even on error
        window.location.href = '/';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div className="mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
        <p className="text-gray-400">Please wait while we finish setting up your account...</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;