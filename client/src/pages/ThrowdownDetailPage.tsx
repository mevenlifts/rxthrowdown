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
  scores?: number[];
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
  const [scoreInput, setScoreInput] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);

  const handleAddScore = async () => {
    if (!scoreInput || isNaN(Number(scoreInput))) {
      alert('Please enter a valid score');
      return;
    }
    setScoreLoading(true);
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) throw new Error('Not logged in');
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      if (!userId || !throwdown?._id) throw new Error('Missing user or throwdown ID');
      await fetch(`/api/throwdowns/${throwdown._id}/add-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score: Number(scoreInput) })
      });
      setScoreInput('');
      fetchThrowdownById(throwdown._id).then(setThrowdown);
      alert('Score added!');
    } catch (err: any) {
      alert(err.message || 'Failed to add score');
    }
    setScoreLoading(false);
  };
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
      fetchThrowdownById(throwdown._id).then(setThrowdown);
      alert('Signed up successfully!');
    } catch (err: any) {
      alert(err.message || 'Signup failed');
    }
  };

  const handleWithdraw = async () => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) throw new Error('Not logged in');
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      if (!userId || !throwdown?._id) throw new Error('Missing user or throwdown ID');
      // Call withdraw API (to be implemented)
      await fetch(`/api/throwdowns/${throwdown._id}/withdraw-participant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      fetchThrowdownById(throwdown._id).then(setThrowdown);
      alert('Withdrawn successfully!');
    } catch (err: any) {
      alert(err.message || 'Withdraw failed');
    }
  };

  if (!throwdown) return <div>Loading...</div>;

  // Determine if logged-in user is a participant
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  let isParticipant = false;
  let userId = '';
  if (userStr) {
    const userObj = JSON.parse(userStr);
    userId = userObj._id || userObj.id;
    isParticipant = throwdown.participants.some(
      p => p.user && (
        (typeof p.user === 'object' && p.user._id === userId) ||
        (typeof p.user === 'string' && p.user === userId)
      )
    );
  }

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor="#f7f9fb" px={2}>
      <Box width="100%" maxWidth={600} display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mt: 8 }}>
        <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
          {throwdown.name}
        </Typography>
        <Box width="100%" display="flex" justifyContent="center" gap={2} mb={2}>
          {isParticipant ? (
            <>
              <button
                style={{ padding: '8px 24px', fontWeight: 'bold', fontSize: 16, borderRadius: 6, background: '#d32f2f', color: 'white', border: 'none', cursor: 'pointer' }}
                onClick={handleWithdraw}
              >
                Withdraw
              </button>
            </>
          ) : (
            <button
              style={{ padding: '8px 24px', fontWeight: 'bold', fontSize: 16, borderRadius: 6, background: '#1976d2', color: 'white', border: 'none', cursor: 'pointer' }}
              onClick={handleSignup}
            >
              Sign Up
            </button>
          )}
        </Box>
      </Box>
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
        {isParticipant && (
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
            <input
              type="number"
              value={scoreInput}
              onChange={e => setScoreInput(e.target.value)}
              placeholder="Add score"
              style={{ padding: '8px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', width: 120 }}
              disabled={scoreLoading}
            />
            <button
              style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: 16, borderRadius: 6, background: '#388e3c', color: 'white', border: 'none', cursor: 'pointer' }}
              onClick={handleAddScore}
              disabled={scoreLoading}
            >
              {scoreLoading ? 'Adding...' : 'Add Score'}
            </button>
          </Box>
        )}
      </Paper>
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
                      <TableCell align="center">{p.scores && p.scores.length > 0 ? p.scores.join(', ') : '-'}</TableCell>
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
