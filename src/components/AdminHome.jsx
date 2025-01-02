import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ProjectComments from './ProjectComments';
import 'react-toastify/dist/ReactToastify.css';
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { IoLogOut } from "react-icons/io5";

const AdminHome = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectData, setEditingProjectData] = useState({});
  const [editMode, setEditMode] = useState(null); 
  const [editedUser, setEditedUser] = useState({});
  const [summary, setSummary] = useState({total_projects: 0,completed_projects: 0,total_tasks: 0,completed_tasks: 0});

  // Search states
  const [searchProjectTerm, setSearchProjectTerm] = useState('');
  const [searchUserTerm, setSearchUserTerm] = useState('');

  // Status options for the dropdown
  const statusOptions = ['Pending', 'In Progress', 'Completed'];

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const response = await fetch('http://localhost:5000/project/dashboard/summary', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/project/get_all_project', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setProjects(data);
      } catch (error) {
        toast.error('Failed to fetch Projects.');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/profile/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error('Failed to fetch users.');
      }
    };
    fetchDashboardSummary();
    fetchUsers();
    fetchProjects();
  }, []);

  const handleEditProject = (project_id) => {
    const projectToEdit = projects.find((project) => project.project_id === project_id);
    setEditingProjectId(project_id);
    setEditingProjectData({ ...projectToEdit });
  };

  const handleChangeProjectData = (e, field) => {
    setEditingProjectData({ ...editingProjectData, [field]: e.target.value });
  };

  const handleSaveProject = async (project_id) => {
    try {
      const response = await fetch(`http://localhost:5000/project/update_project_data/${project_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProjectData),
      });

      if (response.ok) {
        toast.success('Project updated successfully.');
        setProjects(
          projects.map((project) =>
            project.project_id === project_id ? { ...editingProjectData } : project
          )
        );
        setEditingProjectId(null);
      } else {
        toast.error('Failed to update project.');
      }
    } catch (error) {
      toast.error('Failed to update project.');
    }
  };

  const handleDeleteProject = async (project_id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:5000/project/delete_project/${project_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        if (response.ok) {
          toast.success('Project deleted successfully.');
          setProjects(projects.filter(project => project.id !== project_id));
        } else {
          toast.error('Failed to delete project.');
        }
      } catch (error) {
        toast.error('Failed to delete project.');
      }
    }
  };

  const handleCancelProject = () => {
    setEditingProjectId(null); // Cancel editing
  };

  const handleDeleteUser = async (user_id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/user/delete_user/${user_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        if (response.ok) {
          toast.success('User deleted successfully.');
          setUsers(users.filter(user => user.id !== user_id));
        } else {
          toast.error('Failed to delete user.');
        }
      } catch (error) {
        toast.error('Failed to delete user.');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditMode(user.user_id);
    setEditedUser(user); // Set the user details for editing
  };

  const handleInputChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSave = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:5000/user/update_user/${user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(editedUser),
      });
      if (response.ok) {
        toast.success('User updated successfully.');
        setUsers(users.map(user => (user.user_id === user_id ? editedUser : user)));
        setEditMode(null); // Exit edit mode
      } else {
        toast.error('Failed to update user.');
      }
    } catch (error) {
      toast.error('Failed to update user.');
    }
  };

  const handleCancel = () => {
    setEditMode(null); // Cancel editing
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchProjectTerm.toLowerCase())
  );

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  const handleSprints= () =>{

  }

  return (
    
    <div className="min-h-screen bg-gray-100 p-8">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div className='flex gap-4'>
          <RxDashboard onClick={() => navigate('/dashboard')} className="mr-4 text-blue-500" size={35} title='Dashboard'/>
          <CgProfile onClick={() => navigate('/profile')} className="mr-4 text-blue-500" size={35} title={"Profile"}/>
          <IoLogOut onClick={() => navigate('/login')} className="text-blue-500" size={35} title={"logout"}/>
          <button onClick={handleSprints}/>
        </div>
      </nav>

      {/* Summary Section */}
      <section className="bg-white p-10 text-center">
        <h2 className="text-3xl font-bold mb-10">Dashboard Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Total Projects</h3>
            <p>{summary.total_projects}</p>
          </div>

          <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Completed Projects</h3>
            <p>{summary.completed_projects}</p>
          </div>

          <button onClick={() => navigate('/dashboard')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Total Tasks</h3>
              <p>{summary.total_tasks}</p>
            </div>
          </button>
          
          <button onClick={() => navigate('/dashboard?filter=Completed')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Completed Tasks</h3>
              <p>{summary.completed_tasks}</p>
            </div>
          </button>
          
        </div>
      </section>
    
      <div className="flex flex-col gap-y-2">
        <div className="admin-home-container bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Projects</h2>
          <div className='flex justify-left gap-x-20 mb-4'>
            <div className='flex gap-x-2 items-center'>
              <label className='font-bold'> Search</label>
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchProjectTerm}
              onChange={(e) => setSearchProjectTerm(e.target.value)}
              className="border p-2 w-full"
            />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">ID</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Title</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Description</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Status</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Start Date</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">End Date</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Duration</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Created By</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Comments</th>
                  <th   className=" p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.project_id}>
                    <td className="p-3 border border-gray-300">{project.project_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingProjectId === project.project_id ? (
                        <input
                          type="text"
                          value={editingProjectData.title}
                          onChange={(e) => handleChangeProjectData(e, 'title')}
                          className="border border-gray-300 p-2 rounded-lg"
                        />
                      ) : (
                        <span
                          className="text-blue-500 cursor-pointer"
                          onClick={() => navigate(`/sprint/${project.project_id}`)}
                        >
                          {project.title}
                        </span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {editingProjectId === project.project_id ? (
                        <input
                          type="text"
                          value={editingProjectData.description}
                          onChange={(e) => handleChangeProjectData(e, 'description')}
                          className="border border-gray-300 p-2 rounded-lg"
                        />
                      ) : (
                        project.description
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {editingProjectId === project.project_id ? (
                        <select
                          value={editingProjectData.status}
                          onChange={(e) => handleChangeProjectData(e, 'status')}
                          className="border border-gray-300 p-2 rounded-lg"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        project.status
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {editingProjectId === project.project_id ? (
                        <input
                          type="date"
                          value={editingProjectData.start_date}
                          onChange={(e) => handleChangeProjectData(e, 'start_date')}
                          className="border border-gray-300 p-2 rounded-lg"
                        />
                      ) : (
                        project.start_date
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {editingProjectId === project.project_id ? (
                        <input
                          type="date"
                          value={editingProjectData.end_date}
                          onChange={(e) => handleChangeProjectData(e, 'end_date')}
                          className="border border-gray-300 p-2 rounded-lg"
                        />
                      ) : (
                        project.end_date
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">{project.duration} days</td>
                    <td className="p-3 border border-gray-300">{project.created_by}</td>
                    <td className="p-3 border border-gray-300"><ProjectComments projectId={project.project_id} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingProjectId === project.project_id ? (
                        <>
                          <button
                            onClick={() => handleSaveProject(project.project_id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelProject}
                            className="bg-gray-500 text-white px-4 py-2 ml-2 rounded-lg hover:bg-gray-600 transition duration-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditProject(project.project_id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mr-2"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.project_id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-home-container bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Users</h2>
      <div className='flex justify-left gap-x-20 mb-4'>
        <div className='flex gap-x-2 items-center'>
          <label className='font-bold'> Search</label>
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchUserTerm}
          onChange={(e) => setSearchUserTerm(e.target.value)}
          className="border p-2 w-full"
        />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">ID</th>
              <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Username</th>
              <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Role</th>
              <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Email</th>
              <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.user_id}>
                <td className="p-3 border border-gray-300">{user.user_id}</td>
                <td className="p-3 border border-gray-300">
                  {editMode === user.user_id ? (
                    <input
                      type="text"
                      name="username"
                      value={editedUser.username}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-lg"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="p-3 border border-gray-300">
                  {editMode === user.user_id ? (
                    <input
                      type="text"
                      name="role"
                      value={editedUser.role}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-lg"
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td className="p-3 border border-gray-300">
                  {editMode === user.user_id ? (
                    <input
                      type="text"
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-2 rounded-lg"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="p-3 border border-gray-300">
                  {editMode === user.user_id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSave(user.user_id)}
                        className="bg-green-500 text-white p-2 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white p-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-500 text-white p-2 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="bg-red-500 text-white p-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>

      <ToastContainer />
    </div>
  );
};

export default AdminHome;