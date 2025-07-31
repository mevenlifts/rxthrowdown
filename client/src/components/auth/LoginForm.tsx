
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Stack, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { loginUser } from '../../services/api';

const LoginForm: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await loginUser(form);
      const storage = rememberMe ? localStorage : sessionStorage;
      if (result.token) storage.setItem('token', result.token);
      if (result.user) storage.setItem('user', JSON.stringify(result.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
        <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <label style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Remember Me
        </label>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
        <Divider>or</Divider>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<GoogleIcon />}
        >
          Sign in with Google
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<FacebookIcon />}
        >
          Sign in with Facebook
        </Button>
      </Stack>
    </form>
  );
};

export default LoginForm;