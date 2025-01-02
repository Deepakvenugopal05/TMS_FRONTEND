import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RxDashboard } from "react-icons/rx";
import { IoHome } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";

const userRole = sessionStorage.getItem('user_role');

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    role: '',
    profile_img: '',
    total_tasks_created: 0,
    total_tasks_assigned: 0,
    completed_tasks: 0,
  });

  console.log(user.profile_img)

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/profile/get_profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        //console.log(data)
        setUser(data);
      } catch (error) {
        toast.error('Failed to fetch user data.');
      }
    };
    fetchUserData();
  }, []);

  const handleProfileImageChange = async (file) => {
    const formData = new FormData();
    formData.append('profile_img', file);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/profile/update_profile_picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success('Profile picture updated successfully!');
        setUser((prevUser) => ({
          ...prevUser,
          profile_img: data.profile_img,
        }));
      } else {
        toast.error('Failed to update profile picture.');
      }
    } catch (error) {
      toast.error('Error uploading profile picture.');
    }
  };
  

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/auth/change_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          new_password: newPassword,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to change password.');
    }
  };

  const handleHomeNavigation = () => {
    console.log("user role", userRole)
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'manager'){
      navigate('/manager')
    }
     else {
      navigate('/home');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div className='flex gap-4'>
        <IoHome onClick={handleHomeNavigation} className="mr-4 text-blue-500" size={35} title='Home' />
          <RxDashboard onClick={() => navigate('/dashboard')} className="mr-4 text-blue-500" size={35} title={"Dashboard"}/>
          <IoLogOut onClick={() => navigate('/login')} className="text-blue-500" size={35} title={"logout"}/>
        </div>
      </nav>

      <div className="profile-container mt-10 bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">User Information</h2>
            <div>
  <div className="mb-4">
    <label className="block text-gray-700">Profile Picture:</label>
    <img
      src={`http://127.0.0.1:5000/${user.profile_img}`}
      alt="Profile"
      className="w-40 h-40 rounded-full"
    />
  </div>
  <div className="mb-4">
    <label className="block text-gray-700">Change Profile Picture:</label>
    <input
      type="file"
      onChange={(e) => handleProfileImageChange(e.target.files[0])}
    />
  </div>
</div>
            <div className="mb-4">
              <label className="block text-gray-700">Username:</label>
              <input
                type="text"
                value={user.username}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email:</label>
              <input
                type="email"
                value={user.email}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Role:</label>
              <input
                type="text"
                value={user.role}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                readOnly
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Password Management</h2>
            <div className="mb-4">
              <label className="block text-gray-700">New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Confirm New Password:</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Task Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {user.role === 'admin' || user.role === 'manager'?(
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Total Tasks Created</h3>
              <p>{user.total_tasks_created}</p>
            </div>):null}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Total Tasks Assigned</h3>
              <p>{user.total_tasks_assigned}</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Completed Tasks</h3>
              <p>{user.completed_tasks}</p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;