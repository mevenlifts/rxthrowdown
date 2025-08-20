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
  score?: number; // legacy
  scores?: any[]; // new: array of scores per workout piece
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
  title?: string;
  name?: string;
  startDate: string;
  endDate?: string;
  duration: number;
  workout?: string;
  workouts?: Array<{
    description: string;
    timeCap: number;
    scoreType: ScoreType | string;
  }>;
  scale: string;
  author: ParticipantUser;
  participants: Participant[];
  scoreType?: ScoreType;
}

const ThrowdownDetailPage: React.FC = () => {
  // Array of score inputs, one per workout piece
  const [scoreInputs, setScoreInputs] = useState<any[]>([]);
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
      fetchThrowdownById(id).then(td => {
        setThrowdown(td);
        // Initialize scoreInputs array for each workout piece
        if (td && Array.isArray(td.workouts)) {
          setScoreInputs(td.workouts.map(() => ({ value: '', reps: '', rounds: '' })));
        }
      });
    }
  }, [id]);

  const handleAddScore = async () => {
    // Validate and collect scores for each workout piece
    if (!throwdown || !Array.isArray(throwdown.workouts)) return;
    const scores = throwdown.workouts.map((w: any, idx: number) => {
      const input = scoreInputs[idx];
      if (!input) return null;
      if (typeof w.scoreType === 'object' && w.scoreType.name === 'rounds-reps') {
        if (!input.rounds || isNaN(Number(input.rounds)) || !input.reps || isNaN(Number(input.reps))) {
          throw new Error(`Please enter valid rounds and reps for workout ${idx + 1}`);
        }
        return { rounds: Number(input.rounds), reps: Number(input.reps) };
      } else if (typeof w.scoreType === 'object' && w.scoreType.name === 'time') {
        if (!input.value || isNaN(Number(input.value))) {
          throw new Error(`Please enter a valid time for workout ${idx + 1}`);
        }
        return { time: Number(input.value) };
      } else if (typeof w.scoreType === 'object' && w.scoreType.name === 'reps') {
        if (!input.value || isNaN(Number(input.value))) {
          throw new Error(`Please enter valid reps for workout ${idx + 1}`);
        }
        return { reps: Number(input.value) };
      } else {
        if (!input.value || isNaN(Number(input.value))) {
          throw new Error(`Please enter a valid score for workout ${idx + 1}`);
        }
        return Number(input.value);
      }
    });
    setScoreLoading(true);
    setRefreshing(true);
    try {
      if (!userId) throw new Error('Not logged in');
      if (!throwdown?._id) throw new Error('Missing user or throwdown ID');
      await fetch(`/api/throwdowns/${throwdown._id}/add-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, scores })
      });
      setScoreInputs((throwdown.workouts || []).map(() => ({ value: '', reps: '', rounds: '' })));
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
      <Box sx={{ width: '100%', px: 2, pt: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={2}>Throwdown Details</Typography>
      </Box>
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f7f9fb" px={2} py={4}>
        <Paper elevation={3} sx={{ maxWidth: 700, width: '100%', p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} width="100%">
            <Typography variant="h4" fontWeight={400} mb={1}>{throwdown.title || throwdown.name}</Typography>
            <Box display="flex" gap={2}>
              {!isParticipant && (
                <button onClick={handleSignup} style={{ padding: '6px 14px', fontWeight: 500, borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', boxShadow: '0 2px 8px #1976d233', cursor: 'pointer', fontSize: 14 }}>Challenge Accepted</button>
              )}
              {isParticipant && (
                <button onClick={handleWithdraw} style={{ padding: '6px 14px', fontWeight: 500, borderRadius: 6, background: '#e53935', color: '#fff', border: 'none', boxShadow: '0 2px 8px #e5393533', cursor: 'pointer', fontSize: 14 }}>Withdraw</button>
              )}
            </Box>
          </Box>
          {/* Workout Pieces Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 3, background: '#f5f5f5', width: '100%', maxWidth: 600 }}>
            <Typography variant="subtitle1" mb={2} fontWeight={600} color="#1976d2">Workout Pieces</Typography>
            {Array.isArray((throwdown as any).workouts) && (throwdown as any).workouts.length > 0 ? (
              (throwdown as any).workouts.map((w: any, idx: number) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fff' }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Piece {idx + 1}</Typography>
                  <Typography variant="body2" mb={1}><b>Description:</b> {w.description}</Typography>
                  <Typography variant="body2" mb={1}><b>Time Cap:</b> {w.timeCap} min</Typography>
                  <Typography variant="body2" mb={1}><b>Scoring Type:</b> {w.scoreTypeName || (typeof w.scoreType === 'object' && w.scoreType.name ? w.scoreType.name : typeof w.scoreType === 'string' && /^[a-f\d]{24}$/.test(w.scoreType) ? 'Scoring' : w.scoreType)}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No workout pieces found.</Typography>
            )}
            <Typography variant="body2" mt={2}><b>Scale:</b> {throwdown.scale}</Typography>
            <Typography variant="body2" mb={1}><b>Start Date:</b> {new Date(throwdown.startDate).toLocaleString()}</Typography>
            <Typography variant="body2" mb={1}><b>Duration:</b> {throwdown.duration} days</Typography>
          </Paper>
          {isParticipant && Array.isArray((throwdown as any).workouts) && (
            <Box display="flex" flexDirection="column" gap={2} mb={2}>
              {(throwdown as any).workouts.map((w: any, idx: number) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#f9f9f9' }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Score for Piece {idx + 1} ({w.scoreTypeName || (typeof w.scoreType === 'object' && w.scoreType.name ? w.scoreType.name : typeof w.scoreType === 'string' && /^[a-f\d]{24}$/.test(w.scoreType) ? 'score' : w.scoreType)})
                  </Typography>
                  {typeof w.scoreType === 'object' && w.scoreType.name === 'rounds-reps' ? (
                    <Box display="flex" gap={2}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>Rounds</Typography>
                        <input
                          type="number"
                          placeholder="Rounds"
                          value={scoreInputs[idx]?.rounds || ''}
                          onChange={e => setScoreInputs(inputs => inputs.map((input, i) => i === idx ? { ...input, rounds: e.target.value } : input))}
                          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 80, fontSize: 16 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>Reps</Typography>
                        <input
                          type="number"
                          placeholder="Reps"
                          value={scoreInputs[idx]?.reps || ''}
                          onChange={e => setScoreInputs(inputs => inputs.map((input, i) => i === idx ? { ...input, reps: e.target.value } : input))}
                          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 80, fontSize: 16 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{w.scoreTypeName || (typeof w.scoreType === 'object' && w.scoreType.name ? w.scoreType.name : typeof w.scoreType === 'string' && /^[a-f\d]{24}$/.test(w.scoreType) ? 'score' : w.scoreType)}</Typography>
                      <input
                        type="number"
                        placeholder={w.scoreTypeName || (typeof w.scoreType === 'object' && w.scoreType.name ? w.scoreType.name : typeof w.scoreType === 'string' && /^[a-f\d]{24}$/.test(w.scoreType) ? 'score' : w.scoreType)}
                        value={scoreInputs[idx]?.value || ''}
                        onChange={e => setScoreInputs(inputs => inputs.map((input, i) => i === idx ? { ...input, value: e.target.value } : input))}
                        style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', width: 120, fontSize: 16 }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
              <button onClick={handleAddScore} disabled={scoreLoading} style={{ padding: '10px 24px', fontWeight: 600, borderRadius: 8, background: '#43a047', color: '#fff', border: 'none', boxShadow: '0 2px 8px #43a04733', cursor: 'pointer', fontSize: 16 }}>
                {scoreLoading ? 'Adding...' : 'Add Score'}
              </button>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ maxWidth: 900, mx: 'auto', mt: 2, borderRadius: 3, boxShadow: 3 }}>
            <Table>
              <thead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Place</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Home Gym</TableCell>
                  {throwdown.workouts?.map((w: any, wIdx: number) => {
                    let headerTitle = w.title && !/^([a-f\d]{24})$/.test(w.title) ? w.title : `Piece ${wIdx + 1}`;
                    return (
                      <TableCell key={wIdx} sx={{ fontWeight: 700, fontSize: 16 }}>
                        {headerTitle}<br/>
                        <span style={{ fontWeight: 400, fontSize: 13 }}>
                          ({w.scoreTypeName || (typeof w.scoreType === 'object' && w.scoreType.name ? w.scoreType.name : typeof w.scoreType === 'string' && /^[a-f\d]{24}$/.test(w.scoreType) ? 'score' : w.scoreType)})
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </thead>
              <TableBody>
                {(() => {
                  // Sort and rank participants by total score (sum of all pieces)
                  let sorted = [...throwdown.participants];
                  // Calculate total score for sorting (custom logic per scoreType)
                  function getTotalScore(p: any) {
                    if (!throwdown || !Array.isArray(throwdown.workouts) || !Array.isArray(p.scores)) return 0;
                    return p.scores.reduce((acc: number, score: any, idx: number) => {
                      const w = throwdown.workouts?.[idx];
                      if (!w || !score) return acc;
                      if (typeof w.scoreType === 'object') {
                        switch (w.scoreType.name) {
                          case 'reps':
                            return acc + (score.reps ?? 0);
                          case 'lbs':
                            return acc + (score.lbs ?? 0);
                          case 'rounds-reps':
                            return acc + ((score.rounds ?? 0) * 1000 + (score.reps ?? 0));
                          case 'time':
                            return acc - (score.time ?? 0);
                          default:
                            return acc + (typeof score === 'number' ? score : 0);
                        }
                      }
                      return acc + (typeof score === 'number' ? score : 0);
                    }, 0);
                  }
                  sorted.sort((a, b) => getTotalScore(b) - getTotalScore(a));
                  // Placement logic with ties
                  let place = 1;
                  let prevScore: any = null;
                  let placeArr = sorted.map((p, idx) => {
                    let currScore = getTotalScore(p);
                    if (prevScore !== null && currScore === prevScore) {
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
                      {throwdown && Array.isArray(throwdown.workouts) && throwdown.workouts.map((w: any, wIdx: number) => {
                        const score = Array.isArray(p.scores) ? p.scores[wIdx] : undefined;
                        let display: string = '-';
                        if (score) {
                          if (typeof w.scoreType === 'object') {
                            switch (w.scoreType.name) {
                              case 'reps':
                                display = `${score.reps ?? '-'}`;
                                break;
                              case 'lbs':
                                display = `${score.lbs ?? '-'}`;
                                break;
                              case 'rounds-reps':
                                display = `${score.rounds ?? '-'} rounds, ${score.reps ?? '-'} reps`;
                                break;
                              case 'time':
                                display = `${score.time ?? '-'} sec`;
                                break;
                              default:
                                display = typeof score === 'number' ? String(score) : JSON.stringify(score);
                            }
                          } else {
                            display = typeof score === 'number' ? String(score) : JSON.stringify(score);
                          }
                        }
                        return (
                          <TableCell key={wIdx} sx={{ fontWeight: 500 }}>{display}</TableCell>
                        );
                      })}
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
