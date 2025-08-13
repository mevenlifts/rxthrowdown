import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Stack, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { signupUser } from '../../services/api';

const SignupForm: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signupUser(form);
      navigate('/dashboard'); // Navigate after successful signup
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      console.error('Signup error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2}>
          <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth required />
          <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth required />
        </Stack>
        <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
        <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
        <Divider>or</Divider>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<GoogleIcon />}
          // onClick={handleGoogleSignup}
        >
          Sign up with Google
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<FacebookIcon />}
          // onClick={handleFacebookSignup}
        >
          Sign up with Facebook
        </Button>
      </Stack>
    </form>
  );
};

export default SignupForm;