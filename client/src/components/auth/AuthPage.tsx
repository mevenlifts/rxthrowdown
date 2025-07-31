import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Stack } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
        <FitnessCenterIcon color="success" sx={{ fontSize: 48 }} />
        <Typography variant="h4" color="primary">
          RxThrowdown
        </Typography>
      </Stack>
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        indicatorColor="secondary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>
      {tab === 0 ? <LoginForm /> : <SignupForm />}
    </Paper>
  );
};

export default AuthPage;