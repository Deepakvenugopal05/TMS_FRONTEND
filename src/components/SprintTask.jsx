import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';


const SprintTask = () => {
  const navigate = useNavigate();
  const [sprintTasks,setSprintTasks] = useState([]);
  const { sprint_id } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());




  useEffect(() => {

    const fetchTasks = async () => {
        try {
          const response = await fetch(`http://localhost:5000/sprint/get_sprint_tasks/${sprint_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
            },
          });
          const data = await response.json();
          console.log(data);
          setSprintTasks(data.tasks);
        } catch (error) {
          toast.error('Failed to fetch sprintTasks.');
        }
      };

    fetchTasks();
  }, []);

  const handleforms = (project_id) => {

    navigate(`/sprint/${project_id}`)
  };

  const calculateDuration = (endDate) => {
    const taskEndDate = new Date(endDate);
    const timeDiff = taskEndDate - currentTime;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert time difference to days
  };

  const isSprintOverrun = (endDate) => {
    const taskEndDate = new Date(endDate);
    return taskEndDate < currentTime;
  };

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
    
      <div className="flex flex-col gap-y-2">
        <div className="admin-home-container bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">sprintTasks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Task ID</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Title</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Description</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Priority</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Status</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Start Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Deadline</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Duration</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Assigned To</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Created By</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sprintTasks.map((sprint) => (
                  <tr key={sprint.task_id} className={isSprintOverrun(sprint.deadline) ? 'bg-red-200' : ''}>
                    <td className="p-3 border border-gray-300">{sprint.task_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span
                          className="text-blue-500 cursor-pointer"
                        >
                          {sprint.title}
                        </span></td>
                    <td className="p-3 border border-gray-300">{sprint.description}</td>
                    <td className="p-3 border border-gray-300">{sprint.priority}</td>
                    <td className="p-3 border border-gray-300">{sprint.status}</td>
                    <td className="p-3 border border-gray-300">{sprint.start_date}</td>
                    <td className="p-3 border border-gray-300">{sprint.deadline}</td>
                    <td className="p-3 border border-gray-300">{calculateDuration(sprint.deadline)} days</td>
                    <td className="p-3 border border-gray-300">{sprint.assigned_to_username}</td>
                    <td className="p-3 border border-gray-300">{sprint.created_username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={()=>{handleforms(sprint.project_id)}}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mr-2"
                          >
                            add
                          </button>
                          <button
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

export default SprintTask;