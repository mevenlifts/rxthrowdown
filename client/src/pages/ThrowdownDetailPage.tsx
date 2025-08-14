import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
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

interface ScoreType {
  _id: string;
  name: string;
  description: string;
  inputFields: string[];
  compareLogic: string;
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
  scoreType?: ScoreType;
}

const ThrowdownDetailPage: React.FC = () => {
  const [scoreInput, setScoreInput] = useState('');
  const [scoreInputReps, setScoreInputReps] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [throwdown, setThrowdown] = useState<ThrowdownDetail | null>(null);
  const { id } = useParams<{ id: string }>();

  // Get current user for DashboardLayout and participant logic
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? (userObj._id || userObj.id) : '';
  const navUser = userObj ? { name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim(), avatarUrl: userObj.avatarUrl || '' } : { name: '', avatarUrl: '' };
  const isParticipant = userObj && throwdown?.participants?.some(
    p => p.user && (
      (typeof p.user === 'object' && p.user._id === userId) ||
      (typeof p.user === 'string' && p.user === userId)
    )
  ) || false;

  useEffect(() => {
    if (id) {
      fetchThrowdownById(id).then(setThrowdown);
    }
  }, [id]);

  const handleAddScore = async () => {
    const scoreType = throwdown?.scoreType?.name;
    let scoreValue: any;
    if (scoreType === 'rounds-reps') {
      if (!scoreInput || isNaN(Number(scoreInput)) || !scoreInputReps || isNaN(Number(scoreInputReps))) {
        alert('Please enter valid rounds and reps');
        return;
      }
      scoreValue = {
        rounds: Number(scoreInput),
        reps: Number(scoreInputReps)
      };
    } else if (scoreType === 'time') {
      if (!scoreInput || isNaN(Number(scoreInput))) {
        alert('Please enter a valid time');
        return;
      }
      scoreValue = { time: Number(scoreInput) };
    } else if (scoreType === 'reps') {
      if (!scoreInput || isNaN(Number(scoreInput))) {
        alert('Please enter a valid reps count');
        return;
      }
      scoreValue = { reps: Number(scoreInput) };
    } else {
      if (!scoreInput || isNaN(Number(scoreInput))) {
        alert('Please enter a valid score');
        return;
      }
      scoreValue = Number(scoreInput);
    }
    setScoreLoading(true);
    setRefreshing(true);
    try {
      if (!userId) throw new Error('Not logged in');
      if (!throwdown?._id) throw new Error('Missing user or throwdown ID');
      await fetch(`/api/throwdowns/${throwdown._id}/add-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score: scoreValue })
      });
      setScoreInput('');
      setScoreInputReps('');
      await fetchThrowdownById(throwdown._id).then(setThrowdown);
    } catch (err: any) {
      alert(err.message || 'Failed to add score');
    }
    setScoreLoading(false);
    setRefreshing(false);
  };

  const handleSignup = async () => {
    try {
      if (!userId) throw new Error('Not logged in');
      if (!throwdown?._id) throw new Error('Missing user or throwdown ID');
      await signupForThrowdown(throwdown._id, userId);
      fetchThrowdownById(throwdown._id).then(setThrowdown);
      alert('Signed up successfully!');
    } catch (err: any) {
      alert(err.message || 'Signup failed');
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!userId) throw new Error('Not logged in');
      if (!throwdown?._id) throw new Error('Missing user or throwdown ID');
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
  if (refreshing) return (
    <DashboardLayout user={navUser}>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f7f9fb" px={2} py={4}>
        <Paper elevation={3} sx={{ maxWidth: 400, p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" mb={2}>Updating leaderboard...</Typography>
          <Box display="flex" justifyContent="center" alignItems="center">
            <span className="loader" style={{ width: 48, height: 48, border: '6px solid #1976d2', borderTop: '6px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
          </Box>
        </Paper>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </Box>
    </DashboardLayout>
  );

  return (
    <DashboardLayout user={navUser}>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f7f9fb" px={2} py={4}>
        <Paper elevation={3} sx={{ maxWidth: 700, width: '100%', p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} width="100%">
            <Typography variant="h4" fontWeight={700} mb={1}>{throwdown.name}</Typography>
            <Box display="flex" gap={2}>
              {!isParticipant && (
                <button onClick={handleSignup} style={{ padding: '6px 14px', fontWeight: 500, borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', boxShadow: '0 2px 8px #1976d233', cursor: 'pointer', fontSize: 14 }}>Challenge Accepted</button>
              )}
              {isParticipant && (
                <button onClick={handleWithdraw} style={{ padding: '6px 14px', fontWeight: 500, borderRadius: 6, background: '#e53935', color: '#fff', border: 'none', boxShadow: '0 2px 8px #e5393533', cursor: 'pointer', fontSize: 14 }}>Withdraw</button>
              )}
            </Box>
          </Box>
          <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 3, background: '#f5f5f5', width: '100%', maxWidth: 500 }}>
            <Typography variant="subtitle1" mb={1} fontWeight={600} color="#1976d2">Workout</Typography>
            <Typography variant="body1" mb={2} fontWeight={500}>{throwdown.workout}</Typography>
            <Typography variant="body2" mb={1}>Scale: <b>{throwdown.scale}</b></Typography>
            <Typography variant="body2" mb={1}>Start: {new Date(throwdown.startDate).toLocaleString()}</Typography>
            <Typography variant="body2" mb={1}>End: {new Date(throwdown.endDate).toLocaleString()}</Typography>
          </Paper>
          {isParticipant && (
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {throwdown.scoreType?.name === 'rounds-reps' ? (
                <>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Rounds</Typography>
                    <input
                      type="number"
                      placeholder="Rounds"
                      value={scoreInput}
                      onChange={e => setScoreInput(e.target.value)}
                      style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 80, fontSize: 16 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Reps</Typography>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={scoreInputReps}
                      onChange={e => setScoreInputReps(e.target.value)}
                      style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 80, fontSize: 16 }}
                    />
                  </Box>
                </>
              ) : (
                <Box>
                  <Typography variant="body2" fontWeight={500}>{throwdown.scoreType?.name === 'time' ? 'Time' : 'Reps'}</Typography>
                  <input
                    type="number"
                    placeholder={throwdown.scoreType?.name === 'time' ? 'Time' : 'Reps'}
                    value={scoreInput}
                    onChange={e => setScoreInput(e.target.value)}
                    style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 120, fontSize: 16 }}
                  />
                </Box>
              )}
              <button onClick={handleAddScore} disabled={scoreLoading} style={{ padding: '10px 24px', fontWeight: 600, borderRadius: 8, background: '#43a047', color: '#fff', border: 'none', boxShadow: '0 2px 8px #43a04733', cursor: 'pointer', fontSize: 16 }}>
                {scoreLoading ? 'Adding...' : 'Add Score'}
              </button>
            </Box>
          )}
          <TableContainer component={Paper} sx={{ maxWidth: 600, mx: 'auto', mt: 2, borderRadius: 3, boxShadow: 3 }}>
            <Table>
              <thead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Place</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Home Gym</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Score</TableCell>
                </TableRow>
              </thead>
              <TableBody>
                {(() => {
                  // Sort and rank participants
                  const scoreType = throwdown.scoreType?.name;
                  let sorted = [...throwdown.participants];
                  // Sorting logic
                  if (scoreType === 'rounds-reps') {
                    sorted.sort((a, b) => {
                      const aRounds = (a.score as any)?.rounds ?? 0;
                      const bRounds = (b.score as any)?.rounds ?? 0;
                      if (aRounds !== bRounds) return bRounds - aRounds;
                      const aReps = (a.score as any)?.reps ?? 0;
                      const bReps = (b.score as any)?.reps ?? 0;
                      return bReps - aReps;
                    });
                  } else if (scoreType === 'reps') {
                    sorted.sort((a, b) => ((b.score as any)?.reps ?? 0) - ((a.score as any)?.reps ?? 0));
                  } else if (scoreType === 'time') {
                    sorted.sort((a, b) => ((a.score as any)?.time ?? Infinity) - ((b.score as any)?.time ?? Infinity));
                  } else {
                    sorted.sort((a, b) => ((b.score as any) ?? 0) - ((a.score as any) ?? 0));
                  }
                  // Placement logic with ties
                  let place = 1;
                  let prevScore: any = null;
                  let placeArr = sorted.map((p, idx) => {
                    let currScore;
                    if (scoreType === 'rounds-reps') {
                      currScore = `${(p.score as any)?.rounds ?? 0}-${(p.score as any)?.reps ?? 0}`;
                    } else if (scoreType === 'reps') {
                      currScore = (p.score as any)?.reps ?? 0;
                    } else if (scoreType === 'time') {
                      currScore = (p.score as any)?.time ?? Infinity;
                    } else {
                      currScore = p.score ?? 0;
                    }
                    if (prevScore !== null && currScore === prevScore) {
                      // Same score as previous, same place
                      return place;
                    }
                    place = idx + 1;
                    prevScore = currScore;
                    return place;
                  });
                  return sorted.map((p, idx) => (
                    <TableRow key={p.user._id || idx}>
                      <TableCell sx={{ fontWeight: 700 }}>{placeArr[idx]}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.user.firstName} {p.user.lastName}</TableCell>
                      <TableCell sx={{ color: '#1976d2', fontWeight: 500 }}>{typeof p.user.homeGym === 'object' ? p.user.homeGym?.name : p.user.homeGym}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {typeof p.score === 'object'
                          ? ((p.score as any).rounds !== undefined && (p.score as any).reps !== undefined
                              ? `${(p.score as any).rounds} rounds, ${(p.score as any).reps} reps`
                              : (p.score as any).time !== undefined
                                ? `${(p.score as any).time} sec`
                                : (p.score as any).reps !== undefined
                                  ? `${(p.score as any).reps} reps`
                                  : JSON.stringify(p.score))
                          : p.score}
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default ThrowdownDetailPage;
