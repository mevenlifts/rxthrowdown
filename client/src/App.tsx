import React from 'react';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import theme from './theme';
import AuthPage from './components/auth/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ThrowdownDetailPage from './pages/ThrowdownDetailPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={
            <Container maxWidth="sm">
              <AuthPage />
            </Container>
          } />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage user={{ name: 'Jane Doe' }} />} />
          <Route path="/throwdowns/:id" element={<ThrowdownDetailPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
