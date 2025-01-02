import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profile_img: null,
    role: 'user',
    manager_id: ''
  });
  const [managers, setManagers] = useState([]);  // To store list of managers
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    let userRole = sessionStorage.getItem("user_role")
    console.log(userRole,"Userrole");
    if (userRole === "admin"){
      setIsAdmin(true);
    }
    // Fetch managers to populate manager_id dropdown when role is 'user'
    const fetchManagers = async () => {
      try {
        const response = await fetch('http://localhost:5000/profile/managers');
        const data = await response.json();
        setManagers(data);
      } catch (error) {
        console.error('Failed to fetch managers', error);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      profile_img: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('profile_image', formData.profile_img);
    data.append('role', formData.role);

    // If role is user, include manager_id
    if (formData.role === 'user') {
      data.append('manager_id', formData.manager_id);
    }
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("User registered successfully!");
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return  isAdmin ?(
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {/* Conditionally render manager_id field if role is 'user' */}
          {formData.role === 'user' && (
            <div className="mb-4">
              <label className="block text-gray-700">Manager:</label>
              <select
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Manager</option>
                {managers.map((manager) => (
                  <option key={manager.user_id} value={manager.user_id}>
                    {manager.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700">Profile Image:</label>
            <input
              type="file"
              name="profile_image"
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Register
          </button>
        </form>
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 hover:underline mt-4 block text-center"
        >
          Already have an account? Login here.
        </button>
      </div>
      <ToastContainer />
    </div>
  ):(<></>)
};

export default Register;
