import React, { useState, useMemo } from 'react';
import { List, ListItemButton, Typography, Box, TextField, InputAdornment, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';



// DifficultyTag component for colored tag or icon
const levelColors: { [key in 'beginner' | 'intermediate' | 'rx']: string } = {
  beginner: '#43a047', // green
  intermediate: '#ffa726', // orange
  rx: '#e53935', // red
};

const levelLabels: { [key in 'beginner' | 'intermediate' | 'rx']: string } = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  rx: 'RX',
};

const DifficultyTag: React.FC<{ level: 'beginner' | 'intermediate' | 'rx' }> = ({ level }) => (
  <Chip
    label={levelLabels[level]}
    size="small"
    sx={{ backgroundColor: levelColors[level], color: '#fff', fontWeight: 'bold' }}
  />
);

export interface Throwdown {
  id: string;
  name: string;
  startDate: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'rx';
  participants: number;
}

interface ThrowdownListProps {
  throwdowns: Throwdown[];
  onSelect: (id: string) => void;
  onCreate?: () => void;
}

const ThrowdownList: React.FC<ThrowdownListProps> = ({ throwdowns, onSelect, onCreate }) => {
  const [search, setSearch] = useState('');

  // Simple fuzzy search (case-insensitive, partial match)
  const filtered = useMemo(
    () =>
      throwdowns.filter(td =>
        [td.name, td.startDate, td.duration].some(field => field.toLowerCase().includes(search.toLowerCase()))
      ),
    [throwdowns, search]
  );

  return (
    <>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Throwdowns
      </Typography>
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search throwdowns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <IconButton color="secondary" onClick={onCreate} sx={{ ml: 1 }} aria-label="Create Throwdown">
          <AddIcon />
        </IconButton>
      </Box>
      {/* Table-style headers */}
      <Box display="flex" width="100%" px={2} py={1} bgcolor="grey.100" borderRadius={1} mb={1} fontWeight="bold">
        <Box flex={1} fontWeight="bold">Name</Box>
        <Box flex={1} fontWeight="bold">Date</Box>
        <Box flex={1} fontWeight="bold">Duration</Box>
        <Box flex={1} textAlign="center" fontWeight="bold">Scale</Box>
        <Box flex={1} textAlign="center" fontWeight="bold">Participants</Box>
      </Box>
      <List disablePadding>
        {filtered.map((td, idx) => (
          <ListItemButton
            key={td.id}
            onClick={() => onSelect(td.id)}
            sx={{
              backgroundColor: idx % 2 === 0 ? 'background.paper' : 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
              py: 1.5,
            }}
          >
            <Box display="flex" width="100%" alignItems="center">
              <Box flex={1}>
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  {td.name}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  {td.startDate}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  {td.duration}
                </Typography>
              </Box>
              <Box flex={1} display="flex" justifyContent="center">
                <DifficultyTag level={td.level as 'beginner' | 'intermediate' | 'rx'} />
              </Box>
              <Box flex={1} display="flex" justifyContent="center">
                <Typography variant="body2" color="text.secondary">
                  {td.participants}
                </Typography>
              </Box>
            </Box>
          </ListItemButton>
        ))}
      </List>
    </>
  );
};

export default ThrowdownList;