import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Paper, CircularProgress, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { createThrowdown, fetchScoreTypes } from '../services/throwdownApi';
import DashboardLayout from '../components/DashboardLayout';


//TODO: pull from db
const CreateThrowdownPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [workouts, setWorkouts] = useState([
    { description: '', timeCap: '', scoringType: 'rounds-reps' }
  ]);
  const [loading, setLoading] = useState(false);
  const [durationMonths, setDurationMonths] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [videoRequired, setVideoRequired] = useState(false);
  const [scoreTypes, setScoreTypes] = useState<any[]>([]);
  const [scoreTypesLoading, setScoreTypesLoading] = useState(true);

  React.useEffect(() => {
    fetchScoreTypes()
      .then(data => {
        setScoreTypes(data.map((type: any) => ({ value: type.name, label: type.name })));
        setScoreTypesLoading(false);
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
      // Calculate total duration in days
      const months = Number(durationMonths) || 0;
      const days = Number(durationDays) || 0;
      const totalDuration = months * 30 + days;
      await createThrowdown({
        name: title,
        duration: totalDuration > 0 ? totalDuration : undefined,
        workouts,
        videoRequired,
      });
      setLoading(false);
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Failed to create throwdown');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
    window.location.reload();
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
