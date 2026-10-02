import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ConsentModal } from '../legal/ConsentModal';
import { CanvasLayout } from '../canvas/CanvasLayout';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();

  // If user is Student, Guest, or Tutor, render the pure Canvas LMS architecture
  if (user?.isStudent() || user?.isGuest() || user?.isTutor()) {
    return <CanvasLayout />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Navbar />
      <ConsentModal />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

