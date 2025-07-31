import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { Box, Typography, TextField, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Autocomplete } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { getUserProfile, updateUserProfile } from '../services/api';

// Fetch gyms from backend
async function fetchGyms(): Promise<{ _id: string; name: string }[]> {
  const res = await fetch('/api/gyms');
  if (!res.ok) throw new Error('Failed to fetch gyms');
  return res.json();
}

// Add a new gym to backend
async function addGym(name: string) {
  const res = await fetch('/api/gyms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to add gym');
  return res.json();
}
// Dummy throwdown history data
const throwdownHistory = [
  { name: 'Spring Showdown', placement: 1, level: 'beginner', date: '2024-08-01' },
  { name: 'Summer Slam', placement: 3, level: 'rx', date: '2024-09-15' },
  { name: 'Autumn Clash', placement: 2, level: 'intermediate', date: '2024-10-10' },
];

const levelColors: { [key in 'beginner' | 'intermediate' | 'rx']: string } = {
  beginner: '#43a047',
  intermediate: '#ffa726',
  rx: '#e53935',
};

interface ProfilePageProps {
  user?: { name: string; gym?: string; birthdate?: string };
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [form, setForm] = useState({
    gym: '', // this will be gym _id
    birthdate: '',
    first_name: '',
    last_name: '',
  });
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<{ _id: string; name: string }[]>([]);
  const [addingGym, setAddingGym] = useState(false);
  const [gymError, setGymError] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          const user = await getUserProfile(token);
          console.log('User profile response:', user);
          setForm({
            gym: user.homeGym?._id || user.homeGym || '',
            birthdate: user.birthdate || '',
            first_name: user.first_name || user.firstName || '',
            last_name: user.last_name || user.lastName || '',
          });
        }
        const gymsList = await fetchGyms();
        setGyms(gymsList);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const updated = await updateUserProfile({
        homeGym: form.gym,
        birthdate: form.birthdate,
        first_name: form.first_name,
        last_name: form.last_name
      }, token);
      // Update localStorage user for DashboardLayout and DashboardPage
      const userName = (updated.first_name || '') + (updated.last_name ? ' ' + updated.last_name : '');
      localStorage.setItem('user', JSON.stringify({ ...updated, name: userName }));
      setSuccess(true);
      setEditMode(false);
    } catch (e) {
      // Optionally handle error
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    setEditMode(true);
    setLoading(true);
    try {
      const gymsList = await fetchGyms();
      setGyms(gymsList);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return '';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  };

  if (loading) return <div>Loading...</div>;

  // Capitalize first letter of each word
  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, c => c.toUpperCase());

  return (
    <DashboardLayout user={{ name: (capitalizeWords(form.first_name || 'User')) + (form.last_name ? ' ' + capitalizeWords(form.last_name) : '') }}>
      <Box maxWidth={700} mx="auto" mt={6}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome {form.first_name ? capitalizeWords(form.first_name) : ''}
          </Typography>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                name="first_name"
                value={capitalizeWords(form.first_name)}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  readOnly: !editMode
                }}
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={capitalizeWords(form.last_name)}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  readOnly: !editMode
                }}
              />
            </Stack>
            <Autocomplete
              disabled={!editMode}
              options={gyms}
              getOptionLabel={option => capitalizeWords(option.name)}
              value={gyms.find(g => g._id === form.gym) || null}
              onChange={(_, newValue) => {
                setForm(f => ({ ...f, gym: newValue?._id || '' }));
              }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Home Gym"
                  name="gym"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    readOnly: !editMode
                  }}
                />
              )}
            />
            <TextField
              label="Birthdate"
              name="birthdate"
              type="date"
              value={form.birthdate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              InputProps={{
                readOnly: !editMode
              }}
            />
            <TextField
              label="Age"
              value={calculateAge(form.birthdate)}
              InputProps={{
                readOnly: true
              }}
              disabled
              fullWidth
            />
            {editMode ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                sx={{ alignSelf: 'flex-end', mt: 2 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEdit}
                sx={{ alignSelf: 'flex-end', mt: 2 }}
              >
                Edit
              </Button>
            )}
          </Stack>
        </Paper>
        <Snackbar open={success} autoHideDuration={2000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
            Profile updated!
          </Alert>
        </Snackbar>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Throwdown History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Placement</TableCell>
                <TableCell>Scale</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {throwdownHistory.map((row, idx) => (
                  <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? 'background.paper' : 'action.hover' }}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.placement}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          row.level === 'beginner' ? 'Beginner' :
                          row.level === 'intermediate' ? 'Intermediate' :
                          row.level === 'rx' ? 'RX' : row.level
                        }
                        size="small"
                        sx={{ backgroundColor: levelColors[row.level as 'beginner' | 'intermediate' | 'rx'], color: '#fff', fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default ProfilePage;
