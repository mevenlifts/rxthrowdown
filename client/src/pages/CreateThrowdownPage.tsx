import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Paper, CircularProgress, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { createThrowdown, fetchScoreTypes } from '../services/throwdownApi';
import DashboardLayout from '../components/DashboardLayout';

const CreateThrowdownPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [workouts, setWorkouts] = useState([
    { description: '', timeCap: '', scoringType: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [durationMonths, setDurationMonths] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [videoRequired, setVideoRequired] = useState(false);
  const [scoreTypes, setScoreTypes] = useState<any[]>([]);
  const [scoreTypesLoading, setScoreTypesLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [scale, setScale] = useState<'beginner' | 'intermediate' | 'rx'>('beginner');

  React.useEffect(() => {
    fetchScoreTypes()
      .then(data => {
        const mappedTypes = data.map((type: any) => ({ value: type._id, label: type.name }));
        setScoreTypes(mappedTypes);
        setScoreTypesLoading(false);
        // If workouts[0].scoringType is empty or not a valid _id, set it to the first scoreType _id
        setWorkouts(prev => prev.map((w, i) =>
          i === 0 && (!w.scoringType || !mappedTypes.some((t: any) => t.value === w.scoringType))
            ? { ...w, scoringType: mappedTypes[0]?.value || '' }
            : w
        ));
      })
      .catch(() => {
        setScoreTypesLoading(false);
        setScoreTypes([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate start date
      const todayStr = new Date().toISOString().split('T')[0];
      if (startDate < todayStr) {
        setLoading(false);
        alert('Start date must be today or in the future.');
        return;
      }
      // Get current user ID from localStorage/sessionStorage
      let author;
      try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : null;
        author = userObj ? (userObj._id || userObj.id) : undefined;
      } catch (err) {
        console.error('Error fetching or parsing user from storage:', err);
        author = undefined;
      }
      if (!author) {
        setLoading(false);
        console.error('Could not determine current user. Please log in again.');
        alert('Could not determine current user. Please log in again.');
        return;
      }
      // Calculate total duration in days
      const months = Number(durationMonths) || 0;
      const days = Number(durationDays) || 0;
      const totalDuration = months * 30 + days;
      console.log('Creating throwdown with title:', title);
      // Map workouts to use scoreType _id and ensure timeCap is a number
      const mappedWorkouts = workouts.map(w => ({
        ...w,
        scoreType: w.scoringType, // already _id from dropdown
        timeCap: Number(w.timeCap)
      }));
      await createThrowdown({
        title,
        startDate,
        duration: totalDuration > 0 ? totalDuration : undefined,
        workouts: mappedWorkouts,
        videoRequired,
        scale,
        author,
      });
      setLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Failed to create throwdown');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleWorkoutChange = (idx: number, field: string, value: string) => {
    setWorkouts(prev => prev.map((w, i) => i === idx ? { ...w, [field]: value } : w));
  };

  const handleAddWorkout = () => {
    setWorkouts(prev => [...prev, { description: '', timeCap: '', scoringType: scoreTypes[0]?.value || '' }]);
  };

  const handleRemoveWorkout = (idx: number) => {
    setWorkouts(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <DashboardLayout user={{ name: 'User' }}>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f7f9fb" px={2} py={4}>
        <Paper elevation={3} sx={{ maxWidth: 500, width: '100%', p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} mb={2}>Create Throwdown</Typography>
          <Box display="flex" alignItems="center" gap={1} mb={2} width="100%" justifyContent="flex-end">
            <IconButton size="small" color="error" onClick={handleCancel} aria-label="Cancel">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField label="Throwdown Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={{ mb: 2 }} />
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              required
            />
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                label="Duration (months)"
                type="number"
                value={durationMonths}
                onChange={e => setDurationMonths(e.target.value)}
                fullWidth
                sx={{ mb: 0 }}
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Duration (days)"
                type="number"
                value={durationDays}
                onChange={e => setDurationDays(e.target.value)}
                fullWidth
                sx={{ mb: 0 }}
                inputProps={{ min: 0 }}
              />
            </Box>
            <TextField
              label="Scale"
              select
              value={scale}
              onChange={e => setScale(e.target.value as 'beginner' | 'intermediate' | 'rx')}
              fullWidth
              sx={{ mb: 2 }}
              required
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="rx">RX</MenuItem>
            </TextField>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 3 }}>
              {workouts.map((workout, idx) => (
                <Box key={idx} sx={{ mb: 3, border: '1px solid #eee', borderRadius: 2, p: 2, position: 'relative' }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>Workout Piece {idx + 1}</Typography>
                  <TextField label="Workout Description" value={workout.description} onChange={e => handleWorkoutChange(idx, 'description', e.target.value)} fullWidth required multiline rows={2} sx={{ mb: 2 }} />
                  <TextField label="Time Cap (minutes)" value={workout.timeCap} onChange={e => handleWorkoutChange(idx, 'timeCap', e.target.value)} fullWidth type="number" sx={{ mb: 2 }} />
                  <TextField select label="Scoring Type" value={workout.scoringType} onChange={e => handleWorkoutChange(idx, 'scoringType', e.target.value)} fullWidth required sx={{ mb: 2 }}>
                    {scoreTypesLoading ? (
                      <MenuItem value="" disabled>Loading...</MenuItem>
                    ) : scoreTypes.length === 0 ? (
                      <MenuItem value="" disabled>No score types found</MenuItem>
                    ) : (
                      scoreTypes.map((type: any) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))
                    )}
                  </TextField>
                  {workouts.length > 1 && (
                    <Button size="small" color="error" variant="outlined" onClick={() => handleRemoveWorkout(idx)} sx={{ position: 'absolute', top: 8, right: 8 }}>Remove</Button>
                  )}
                </Box>
              ))}
            </Box>
            {/* Add Workout Piece IconButton above video submission */}
            <Box sx={{ mb: 0, p: 0, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <IconButton color="primary" onClick={handleAddWorkout} aria-label="Add Workout Piece">
                <AddIcon />
              </IconButton>
            </Box>
            <FormControlLabel
              control={<Checkbox checked={videoRequired} onChange={e => setVideoRequired(e.target.checked)} color="primary" />}
              label="Video submission required"
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.5, fontWeight: 600, fontSize: 16, position: 'relative' }}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white', position: 'absolute', left: '50%', top: '50%', marginTop: '-12px', marginLeft: '-12px' }} /> : 'Create Throwdown'}
            </Button>
          </form>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default CreateThrowdownPage;
