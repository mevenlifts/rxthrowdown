import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Paper } from '@mui/material';
import { createThrowdown } from '../services/throwdownApi';
import DashboardLayout from '../components/DashboardLayout';

const scoringTypes = [
  { value: 'rounds-reps', label: 'Rounds + Reps' },
  { value: 'reps', label: 'Reps' },
  { value: 'time', label: 'Time' },
];

const CreateThrowdownPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeCap, setTimeCap] = useState('');
  const [scoringType, setScoringType] = useState('rounds-reps');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createThrowdown({
        name: title,
        workout: description,
        duration: timeCap ? Number(timeCap) : undefined,
        scoreType: scoringType,
      });
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to create throwdown');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout user={{ name: 'User' }}>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f7f9fb" px={2} py={4}>
        <Paper elevation={3} sx={{ maxWidth: 500, width: '100%', p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} mb={2}>Create Throwdown</Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField label="Workout Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Workout Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth required multiline rows={3} sx={{ mb: 2 }} />
            <TextField label="Time Cap (minutes)" value={timeCap} onChange={e => setTimeCap(e.target.value)} fullWidth type="number" sx={{ mb: 2 }} />
            <TextField select label="Scoring Type" value={scoringType} onChange={e => setScoringType(e.target.value)} fullWidth required sx={{ mb: 3 }}>
              {scoringTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.5, fontWeight: 600, fontSize: 16 }}>
              {loading ? 'Creating...' : 'Create Throwdown'}
            </Button>
          </form>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default CreateThrowdownPage;
