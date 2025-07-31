import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ThrowdownList, { Throwdown } from '../components/throwdown/ThrowdownList';
import { useNavigate } from 'react-router-dom';

const mockThrowdowns: Throwdown[] = [
  {
      id: '1', name: 'Spring Showdown', startDate: '2024-08-01', duration: '2 hours',
      level: 'beginner'
  },
  {
      id: '2', name: 'Summer Slam', startDate: '2024-09-15', duration: '3 hours',
      level: 'rx'
  },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    navigate(`/throwdowns/${id}`);
  };

  const handleCreate = () => {
    navigate('/throwdowns/create');
  };

  // Get user name from localStorage or fallback
  let userName = 'User';
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj) {
        if (userObj.first_name || userObj.last_name) {
          userName = (userObj.first_name || '') + (userObj.last_name ? ' ' + userObj.last_name : '');
        } else if (userObj.name) {
          userName = userObj.name;
        }
      }
    }
  } catch {}

  return (
    <DashboardLayout user={{ name: userName, avatarUrl: "/logo192.png" }}>
      <ThrowdownList throwdowns={mockThrowdowns} onSelect={handleSelect} onCreate={handleCreate} />
    </DashboardLayout>
  );
};

export default DashboardPage;