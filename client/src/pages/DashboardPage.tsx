import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ThrowdownList, { Throwdown } from '../components/throwdown/ThrowdownList';
import { fetchThrowdowns } from '../services/throwdownApi';
import { useNavigate } from 'react-router-dom';




const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [throwdowns, setThrowdowns] = useState<Throwdown[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setLoading(true);
    fetchThrowdowns(page, 10)
      .then(data => {
        // Map backend throwdown objects to the ThrowdownList shape
        setThrowdowns(
          data.throwdowns.map((td: any) => ({
            id: td._id,
            name: td.name,
            startDate: new Date(td.startDate).toLocaleDateString(),
            duration: td.duration + (td.duration === 1 ? ' day' : ' days'),
            level: td.scale,
          }))
        );
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <DashboardLayout user={{ name: userName, avatarUrl: "/logo192.png" }}>
      <ThrowdownList throwdowns={throwdowns} onSelect={handleSelect} onCreate={handleCreate} />
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span style={{ margin: '0 12px' }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;