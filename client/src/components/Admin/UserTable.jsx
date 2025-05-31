import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import Toolbar from './Toolbar';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await api.get('/users');
      const sortedUsers = response.data.sort((a, b) => 
        new Date(b.lastLogin) - new Date(a.lastLogin)
      );
      setUsers(sortedUsers);
      setErrorMessage(null);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to fetch users.';
      console.error('Fetch users error:', error.response || error);
      setErrorMessage(errMsg);
      if (error.response?.status === 401) {
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBlock = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      setErrorMessage('No users selected to block.');
      return;
    }
    try {
      console.log('Blocking users with IDs:', userIds);
      const response = await api.post('/users/block', userIds);
      console.log('Block response:', response.data);
      toast.success('Users blocked successfully!');
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to block users.';
      console.error('Block error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setErrorMessage(errMsg);
      }
    }
  };
  
  const handleUnblock = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      setErrorMessage('No users selected to unblock.');
      return;
    }
    try {
      console.log('Unblocking users with IDs:', userIds);
      const response = await api.post('/users/unblock', userIds);
      console.log('Unblock response:', response.data);
      toast.success('Users unblocked successfully!');
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to unblock users.';
      console.error('Unblock error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setErrorMessage(errMsg);
      }
    }
  };
  
  const handleDelete = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      setErrorMessage('No users selected to delete.');
      return;
    }
    try {
      console.log('Deleting users with IDs:', userIds);
      const response = await api.delete('/users/delete', { data: userIds });
      console.log('Delete response:', response.data);
      toast.success('Users deleted successfully!');
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to delete users.';
      console.error('Delete error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setErrorMessage(errMsg);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

  return (
      <div 
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
          padding: '40px 20px'
        }}
      >
        <div 
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 
              style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}
            >
              User Management
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', margin: '0' }}>
              Manage and monitor user accounts
            </p>
          </div>
          {errorMessage && (
            <div 
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {errorMessage}
            </div>
          )}
  
          <div style={{ marginBottom: '24px' }}>
            <Toolbar
              selectedUsers={selectedUsers}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onDelete={handleDelete}
            />
          </div>
  
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <th 
                    style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'left',
                      borderBottom: 'none',
                      width: '60px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#ffffff'
                      }}
                    />
                  </th>
                  <th 
                    style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'left',
                      borderBottom: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Name
                  </th>
                  <th 
                    style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'left',
                      borderBottom: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Email
                  </th>
                  <th 
                    style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'left',
                      borderBottom: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Last Login Time
                  </th>
                  <th 
                    style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'left',
                      borderBottom: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                    }}
                  >
                    <td 
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#667eea'
                        }}
                      />
                    </td>
                    <td 
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}
                    >
                      {user.name}
                    </td>
                    <td 
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '14px',
                        color: '#64748b'
                      }}
                    >
                      {user.email}
                    </td>
                    <td 
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '14px',
                        color: '#64748b'
                      }}
                    >
                      {formatDate(user.lastLogin)}
                    </td>
                    <td 
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          backgroundColor: user.status === 0 ? '#dcfce7' : '#fee2e2',
                          color: user.status === 0 ? '#16a34a' : '#dc2626',
                          border: `1px solid ${user.status === 0 ? '#bbf7d0' : '#fecaca'}`
                        }}
                      >
                        <div 
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: user.status === 0 ? '#16a34a' : '#dc2626',
                            marginRight: '8px'
                          }}
                        />
                        {user.status === 0 ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
  
            {users.length === 0 && !errorMessage && (
              <div 
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#64748b'
                }}
              >
                <div 
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    opacity: '0.5'
                  }}
                >
                  👥
                </div>
                <h3 
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  No Users Found
                </h3>
                <p style={{ fontSize: '14px', margin: '0' }}>
                  There are no users to display at the moment.
                </p>
              </div>
            )}
          </div>
  
          {users.length > 0 && (
            <div 
              style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#64748b'
              }}
            >
              Showing {users.length} user{users.length !== 1 ? 's' : ''} • 
              {selectedUsers.length > 0 && ` ${selectedUsers.length} selected`}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default UserTable;