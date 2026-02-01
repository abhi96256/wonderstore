import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../firebase/firestore';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'male',
    dateOfBirth: '',
    contactNumber: '',
    isAdmin: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        contactNumber: formData.contactNumber || null
      };

      if (selectedUser) {
        // Update existing user
        await updateUser(selectedUser.id, userData);
      } else {
        // Create new user
        await createUser(userData);
      }
      setShowModal(false);
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'male',
        dateOfBirth: '',
        contactNumber: '',
        isAdmin: false
      });
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      gender: user.gender || 'male',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth.toDate()).toISOString().split('T')[0] : '',
      contactNumber: user.contactNumber || '',
      isAdmin: user.isAdmin || false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Users Management</h2>
        <button className="add-user-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Date of Birth</th>
              <th>Admin</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.email}</td>
                <td>{user.gender}</td>
                <td>{user.contactNumber || 'Not set'}</td>
                <td>{formatDate(user.dateOfBirth)}</td>
                <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td className="action-buttons">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(user)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleInputChange}
                  />
                  Admin User
                </label>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  {selectedUser ? 'Update' : 'Save'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      gender: 'male',
                      dateOfBirth: '',
                      contactNumber: '',
                      isAdmin: false
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 