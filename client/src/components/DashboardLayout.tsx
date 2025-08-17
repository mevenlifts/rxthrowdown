import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ListItemButton from '@mui/material/ListItemButton';

const drawerWidth = 220;

const navItems = [
  { text: 'My Profile', icon: <PersonIcon /> },
  { text: 'Throwdowns', icon: <SportsKabaddiIcon /> },
  { text: 'Create Throwdown', icon: <EditNoteIcon sx={{ color: 'grey.600' }} /> },
  { text: 'Logout', icon: <AddCircleIcon color="error" /> },
];

const DashboardLayout: React.FC<{ user: { name: string; avatarUrl?: string }, children: React.ReactNode }> = ({ user, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();
  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map(({ text, icon }) => (
          <ListItemButton
            key={text}
            onClick={() => {
              if (text === 'Throwdowns') navigate('/dashboard');
              else if (text === 'My Profile') navigate('/profile');
              else if (text === 'Create Throwdown') navigate('/create-throwdown');
              else if (text === 'Logout') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
              }
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMdDown && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <FitnessCenterIcon color="secondary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
            RxThrowdown
          </Typography>
          <Avatar alt={user.name} src={user.avatarUrl} />
        </Toolbar>
      </AppBar>
      {/* Side Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;