import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ProjectComments from './ProjectComments';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdSearch } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { LuLogIn } from "react-icons/lu";
import { MdKeyboardVoice } from "react-icons/md";
import { useVoice } from './useVoice';
import SearchModal from './SearchModal';
import TaskModal from './TaskModal';

const ManagerHome = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [summary, setSummary] = useState({total_projects: 0,completed_projects: 0,created_tasks: 0,created_completed_tasks: 0});
  const { text, isListening, listen, voiceSupported } = useVoice();
  const [query, setQuery] = useState('');

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
        console.log(data);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      }
    };

    const fetchUsers = async () => {
        try {
          const response = await fetch('http://localhost:5000/profile/get_users_under_manager', {
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

    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/project/get_all_project', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        toast.error('Failed to fetch Projects.');
      }
    };

    fetchUsers();
    fetchDashboardSummary();
    fetchProjects();
  }, []);

  const handleSearch = async (query) => {
    try {
      const response = await fetch(`http://localhost:5000/task/search?title=${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      if (response.ok){
        const data = await response.json();
        console.log(data);
        setSearchResults(data);
        setShowSearchResults(true);
      }
      else {
          const errorData = await response.json();
          toast.error(`Error: ${errorData.message}`);
        }
      
    } catch (error) {
      toast.error('Failed to search tasks.');
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeySearch = (event) =>{
    console.log(query);
    if (event.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleViewSearch = () => {
    setShowSearchModal(true);
  };

  useEffect(() => {
    if (text) {
      setQuery(text);
      handleSearch(text);
    }
  }, [text]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div className='flex gap-8 '>
          <input
            type="text"
            placeholder="Search By title..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeySearch}
            className="border p-2 w-4/5 mb-4 "
          />
          {voiceSupported && (
            <MdKeyboardVoice 
              onClick={listen}
              className={`p-2 rounded ${isListening ? 'bg-red-500 text-white' : 'bg-blue-300 text-grey-700'}`} size={35} title={"search"} />
          )}
          {/* <IoMdSearch className="mr-4 text-blue-500 " onClick={handleViewSearch} size={35} title={"search"}/> */}
          <RxDashboard onClick={() => navigate('/dashboard')} className="mr-4 text-blue-500" size={35} title={"Dashboard"}/>
          <CgProfile onClick={() => navigate('/profile')} className="mr-4 text-blue-500" size={35} title={"Profile"}/>
          <LuLogIn onClick={() => navigate('/login')} className="text-blue-500" size={35} title={"Login"}/>
        </div>
      </nav>

      {/* Search Results Section */}
      {showSearchResults && (
        <div className="mt-6 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">ID</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Title</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Description</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Status</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Start Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">End Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((task) => (
                  <tr key={task.task_id}>
                    <td className="p-3 border border-gray-300">{task.task_id}</td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/task_details/${task.task_id}`)}
                    >
                      {task.title}
                    </td>
                    <td className="p-3 border border-gray-300">{task.description}</td>
                    <td className="p-3 border border-gray-300">{task.status}</td>
                    <td className="p-3 border border-gray-300">{task.start_date}</td>
                    <td className="p-3 border border-gray-300">{task.deadline}</td>
                    <td className="p-3 border border-gray-300">{task.duration} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <section className="bg-white p-10 text-center">
        <h2 className="text-3xl font-bold mb-10">Dashboard Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <button>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Total Projects</h3>
              <p>{summary.total_projects}</p>
            </div>
          </button>  
          <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Completed Projects</h3>
            <p>{summary.completed_projects}</p>
          </div>
          <button onClick={() => navigate('/dashboard')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Created Tasks</h3>
              <p>{summary.created_tasks}</p>
            </div>
          </button>
          <button onClick={() => navigate('/dashboard?filter=Completed')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">completed_tasks</h3>
              <p>{summary.created_completed_tasks}</p>
            </div>
          </button>
        </div>
      </section>

      <div className="flex flex-col gap-y-2">
        <div className="admin-home-container bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Projects</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">ID</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Title</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Description</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Status</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Start Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">End Date</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Duration</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Created By</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Comments</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.project_id}>
                    <td className="p-3 border border-gray-300">{project.project_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.title}</td>
                    <td className="p-3 border border-gray-300">{project.description}</td>
                    <td className="p-3 border border-gray-300">{project.status}</td>
                    <td className="p-3 border border-gray-300">{project.start_date}</td>
                    <td className="p-3 border border-gray-300">{project.end_date}</td>
                    <td className="p-3 border border-gray-300">{project.duration} days</td>
                    <td className="p-3 border border-gray-300">{project.created_by}</td>
                    <td className="p-3 border border-gray-300"><ProjectComments projectId={project.project_id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-home-container bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">ID</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Username</th>
                  <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="p-3 border border-gray-300">{user.user_id}</td>
                    <td className="p-3 border border-gray-300"> {user.username}</td>
                    <td className="p-3 border border-gray-300"> {user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={handleSearch}
          results={searchResults}
          onTaskClick={handleTaskClick}
        />
      )}

      {showTaskModal && selectedTask && (
        <TaskModal
          taskId={selectedTask.task_id}
          onClose={() => setShowTaskModal(false)}
          buttonState={true}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default ManagerHome;