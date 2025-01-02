import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SprintPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilterStatus = queryParams.get('filter') || 'All';

  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('All'); // New state for project filter

  useEffect(() => {

    fetchSprints();
    fetchTasks();
  }, []);

  const fetchSprints = async () => {
    try {
      const response = await fetch('http://localhost:5000/sprint/get_all_sprints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setSprints(data.sprints);
    } catch (error) {
      toast.error('Failed to fetch Sprints.');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/sprint/get_sprint_tasks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      console.log("SprintsTasks",data.sprintTasks);
      setSprintTasks(data.sprintTasks);
    } catch (error) {
      toast.error('Failed to fetch Sprint Tasks.');
    }
  };


  const handleSprintsDelete = async (sprintId) => {
    const access_token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:5000/sprint/delete_sprint/${sprintId}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    if (response.ok) {
      toast.success("Sprint deleted successfully!");
      fetchSprints();
    } else {
      toast.error("Failed to delete Sprint.");
    }
  }; 

  const handleSprints = (project_id) => {
    navigate(`/sprint/${project_id}`);
  };

  const handleTaskNavigate = (sprint_id) => {
    navigate(`/sprint_tasks/${sprint_id}`);
  };

  const calculateDuration = (endDate) => {
    const taskEndDate = new Date(endDate);
    const timeDiff = taskEndDate - currentTime;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  };

  const isSprintOverrun = (endDate) => {
    const taskEndDate = new Date(endDate);
    return taskEndDate < currentTime;
  };

  const projectNames = ['All', ...new Set(sprints.map((sprint) => sprint.project_name))];

  const filteredSprints = selectedProject === 'All'
    ? sprints
    : sprints.filter((sprint) => sprint.project_name === selectedProject);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div>
          <button onClick={() => navigate('/dashboard')} className="mr-4 text-blue-500">Dashboard</button>
          <button onClick={() => navigate('/profile')} className="mr-4 text-blue-500">Profile</button>
          <button onClick={() => navigate('/login')} className="text-blue-500">Logout</button>
        </div>
      </nav>
      <div className='flex justify-end gap-x-20 mt-4 mb-4'>
        <div className='flex gap-x-2 items-center'>
        <label className='font-bold'>Projects</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
        >
          {projectNames.map((project, index) => (
            <option key={index} value={project}>
              {project}
            </option>
          ))}
        </select>
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="admin-home-container bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Sprints</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Project Name</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Sprint ID</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Title</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Start Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">End Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Duration</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Created By</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSprints.map((sprint) => (
                  <tr key={sprint.sprint_id} className={isSprintOverrun(sprint.end_date) ? 'bg-red-200' : ''}>
                    <td className="p-3 border border-gray-300">{sprint.project_name}</td>
                    <td className="p-3 border border-gray-300">{sprint.sprint_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleTaskNavigate(sprint.sprint_id)}
                      >
                        {sprint.sprint_name}
                      </span>
                    </td>
                    <td className="p-3 border border-gray-300">{sprint.start_date}</td>
                    <td className="p-3 border border-gray-300">{sprint.end_date}</td>
                    <td className="p-3 border border-gray-300">{calculateDuration(sprint.end_date)} days</td>
                    <td className="p-3 border border-gray-300">{sprint.created_username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSprints(sprint.project_id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mr-2"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => handleSprintsDelete(sprint.sprint_id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                      >
                        Delete
                      </button>
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

export default SprintPage;
