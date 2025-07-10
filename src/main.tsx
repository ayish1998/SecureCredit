import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize demo users for the authentication system
const initializeDemoUsers = () => {
  const existingUsers = localStorage.getItem('securecredit_users');
  if (!existingUsers) {
    const demoUsers = [
      {
        id: 'demo_user_1',
        email: 'demo@securecredit.africa',
        firstName: 'Kwame',
        lastName: 'Asante',
        phone: '+233 24 123 4567',
        country: 'Ghana',
        role: 'user',
        isVerified: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'admin_user_1',
        email: 'admin@securecredit.africa',
        firstName: 'Amina',
        lastName: 'Okafor',
        phone: '+234 80 987 6543',
        country: 'Nigeria',
        role: 'admin',
        isVerified: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date().toISOString(),
      }
    ];
    localStorage.setItem('securecredit_users', JSON.stringify(demoUsers));
  }
};

// Initialize demo data
initializeDemoUsers();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
