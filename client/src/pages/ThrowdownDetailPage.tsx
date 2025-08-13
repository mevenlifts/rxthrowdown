import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchThrowdownById } from '../services/throwdownApi';
import { signupForThrowdown } from '../services/api';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';


interface Gym {
  _id: string;
  name: string;
}

interface ParticipantUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  homeGym?: Gym | string;
}

interface Participant {
  user: ParticipantUser;
  score?: number;
}

interface ThrowdownDetail {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  workout: string;
  scale: string;
  author: ParticipantUser;
  participants: Participant[];
}

const ThrowdownDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [throwdown, setThrowdown] = useState<ThrowdownDetail | null>(null);

  useEffect(() => {
    if (id) {
      fetchThrowdownById(id).then(setThrowdown);
    }
  }, [id]);

  const handleSignup = async () => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) throw new Error('Not logged in');
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      if (!userId || !throwdown?._id) throw new Error('Missing user or throwdown ID');
      await signupForThrowdown(throwdown._id, userId);
      // Refresh throwdown details after signup
      fetchThrowdownById(throwdown._id).then(setThrowdown);
      alert('Signed up successfully!');
    } catch (err: any) {
      alert(err.message || 'Signup failed');
    }
  };

  if (!throwdown) return <div>Loading...</div>;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor="#f7f9fb" px={2}>
      <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom sx={{ mt: 8, mb: 2, textAlign: 'center' }}>
        {throwdown.name}
      </Typography>
      <Paper elevation={4} sx={{ p: 5, maxWidth: 600, width: '100%', mb: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {`Dates: ${new Date(throwdown.startDate).toLocaleDateString()} - ${new Date(throwdown.endDate).toLocaleDateString()}`}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Duration:</b> {throwdown.duration} day(s)
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <b>Scale:</b> {throwdown.scale.charAt(0).toUpperCase() + throwdown.scale.slice(1)}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <b>Workout:</b> {throwdown.workout}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <b>Author:</b> {throwdown.author ? `${throwdown.author.firstName} ${throwdown.author.lastName}` : 'Unknown'}
        </Typography>
      </Paper>
      <Box width="100%" maxWidth={600} mb={2} display="flex" justifyContent="flex-end">
        <button
          style={{ padding: '8px 24px', fontWeight: 'bold', fontSize: 16, borderRadius: 6, background: '#1976d2', color: 'white', border: 'none', cursor: 'pointer' }}
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </Box>
      <Box width="100%" maxWidth={600}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Participants
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <thead>
              <TableRow>
                <TableCell align="center"><b>First Name</b></TableCell>
                <TableCell align="center"><b>Last Name</b></TableCell>
                <TableCell align="center"><b>Home Gym</b></TableCell>
                <TableCell align="center"><b>Score</b></TableCell>
              </TableRow>
            </thead>
            <TableBody>
              {throwdown.participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No participants yet.</TableCell>
                </TableRow>
              ) : (
                throwdown.participants
                  .filter(p => p.user)
                  .map((p, idx) => (
                    <TableRow key={p.user._id} sx={{ backgroundColor: idx % 2 === 0 ? '#f5f5f5' : 'white' }}>
                      <TableCell align="center" sx={{ fontWeight: 500 }}>{p.user.firstName}</TableCell>
                      <TableCell align="center">{p.user.lastName}</TableCell>
                      <TableCell align="center">{p.user.homeGym && typeof p.user.homeGym === 'object' ? p.user.homeGym.name : ''}</TableCell>
                      <TableCell align="center">{p.score ?? '-'}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ThrowdownDetailPage;
