import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditModal from './EditModal';
import SearchModal from './SearchModal';
import TaskModal from './TaskModal';
import AssignedTasks from './AssignedTasks';
import CreatedTasks from './CreatedTasks';
import { MdKeyboardVoice } from "react-icons/md";
import { useVoice } from './useVoice';
import { IoHome } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { LuLogIn } from "react-icons/lu";
import { MdTask } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { GiSprint } from "react-icons/gi";
import { MdCameraAlt } from "react-icons/md";
import CryptoJS from 'crypto-js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [createdTasks, setCreatedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdFilterStatus, setCreatedFilterStatus] = useState('All');
  const [assignedFilterStatus, setAssignedFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [task, setTask] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { text, isListening, listen, voiceSupported } = useVoice();
  const [query, setQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchType, setSearchType] = useState('task'); 
  const [imageSearchResults, setImageSearchResults] = useState([]);

  const [checkTasks,setcheckTasks ] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('user_role');
    setUserRole(role);
    fetchData();
  }, []);

  const fetchData = async () => {
    const access_token = sessionStorage.getItem('access_token');
    const response = await fetch('http://localhost:5000/task/get_tasks', {
      method: "GET",
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const data = await response.json();
    console.log(data);

    if (data.message == "No Task Found!!"){
      setcheckTasks(true)
      return
    }

    if (data.project_id) {
      setProjectId(data.project_id);
    }
    setCreatedTasks(data.created_tasks);
    setAssignedTasks(data.assigned_tasks);
  };

  const handleforms = () => {
    navigate(`/dashboard_forms`);
  };

  const handleKanban = () => {
    navigate(`/kanbanBoard`)
  }

  const handleRegister = () =>{
    navigate(`/Register`)
  }

  const handleSprints = () => {
    navigate(`/sprints`)
  }

  const handleHomeNavigation = () => {
    console.log("user role", userRole)
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'manager') {
      navigate('/manager')
    } else {
      navigate('/home');
    }
  };

  const handleEditTask = (task) => {
    setTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    const access_token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:5000/task/delete_task/${taskId}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    if (response.ok) {
      toast.success("Task deleted successfully!");
      fetchData();
    } else {
      toast.error("Failed to delete task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const access_token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:5000/task/edit_status/${taskId}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (response.ok) {
      toast.success("Task status updated successfully!");
      fetchData();
    } else {
      toast.error("Failed to update task status.");
    }
  };

  const handleSearch = async (query) => {
    try {
      const endpoint = searchType === 'task' ? 'task/search' : 'attachment/search';
      const response = await fetch(`http://localhost:5000/${endpoint}?title=${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("search_result...", data);
        setSearchResults(data);
        setShowSearchResults(true);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      toast.error('Failed to search.');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleViewSearch = () => {
    setShowSearchModal(true);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeySearch = (event) => {
    console.log(query);
    if (event.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer

    reader.onloadend = async () => {
        const arrayBuffer = reader.result;

        // Convert ArrayBuffer to WordArray for crypto-js
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const sha256Hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

        console.log("SHA-256 Hash:", sha256Hash);

        // Send hash to the backend
        const response = await fetch(`http://localhost:5000/attachment/sha256_search?hash=${sha256Hash}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hash: sha256Hash }),
        });

        const data = await response.json();
        console.log("Results:", data);
        setImageSearchResults(data);
        console.log("img search Results: ",imageSearchResults);
        setShowSearchResults(true);
    };

    reader.onerror = (error) => {
        console.error("Error converting image to SHA-256 hash", error);
    };
};


  useEffect(() => {
    if (text) {
      setQuery(text);
      handleSearch(text);
     // handleImageUpload();
    }
  }, [text]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div className='flex gap-8'>
          <div className="border relative w-4/5 mb-4">
            <input
              type="text"
              placeholder="Search By title..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeySearch}
              className=" p-2 pl-10 w-3/5"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className=" p-2 w-1/4"
            >
              <option value="task">Task Search</option>
              <option value="attachment">Attachment Search</option>
            </select>
            {voiceSupported && (
              <MdKeyboardVoice
                onClick={listen}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer ${isListening ? 'bg-red-500 text-white' : 'bg-blue-300 text-gray-700'}`}
                size={24}
                title="search"
              />
            )}
          </div>
          {/* <IoMdSearch className="mr-4 text-blue-500 " onClick={handleViewSearch} size={40} title={"search"}/> */}
          <IoHome onClick={handleHomeNavigation} className="mr-4 text-blue-500" size={35} title='Home' />
          <CgProfile onClick={() => navigate('/profile')} className="mr-4 text-blue-500" size={35} title='Profile' />
          <LuLogIn onClick={() => navigate('/login')} className="text-blue-500" size={35} title='Login' />
        </div>
      </nav>
 
      {/* Conditionally render the file input based on searchType */}
      {searchType === 'attachment' && (
        <div className="relative w-4/5 mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 w-full"
          />
        </div>
      )}
 
      {/* Search Results Section */}
      {showSearchResults && (
        <div className="mt-6 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Results</h2>
          {searchType === 'task' ? (
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
                  {checkTasks === false ?(searchResults.map((task) => (
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
                  ))):(<></>)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">ID</th>
                    <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Name</th>
                    <th className="p-3 font-semibold bg-gray-200 text-gray-600 border border-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...searchResults, ...imageSearchResults].map((attachment) => (
                    <tr key={attachment.attachment_id}>
                      <td className="p-3 border border-gray-300">{attachment.attachment_id}</td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate(`/task_details/${attachment.task_id}`)}
                      >
                        {attachment.attachment}
                      </td>
                      <td className="p-3 border border-gray-300">{attachment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
 
      {/* Navigation and other dashboard elements */}
      <div className="grid grid-cols-1 gap-8">
 
        {userRole === 'user' ? (
          <>
            <AssignedTasks
            assignedTasks={assignedTasks}
            assignedFilterStatus={assignedFilterStatus}
            setAssignedFilterStatus={setAssignedFilterStatus}
            handleStatusChange={handleStatusChange}
            project_id={projectId}
          />
          </>
          
        ) : userRole === 'admin' ? (
          <>
            <div className="flex justify-between items-center mt-8 mb-8 col-span-1">
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex space-x-4">
              <button onClick={handleRegister} className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300">register</button>
              <button onClick={handleKanban} className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300">Kanban</button>
                <MdTask onClick={handleforms} className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300" size={50} title='create task' />
                <GiSprint onClick={handleSprints} className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-300" size={50} title='create sprint' />
              </div>
            </div>
            <CreatedTasks
              createdTasks={createdTasks}
              createdFilterStatus={createdFilterStatus}
              setCreatedFilterStatus={setCreatedFilterStatus}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
              showModal={showModal}
              setShowModal={setShowModal}
            />
 
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mt-8 mb-8 col-span-1">
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex space-x-4">
                <button onClick={handleKanban} className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300">Kanban</button>
                <MdTask onClick={handleforms} className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300" size={50} title='create task' />
              </div>
            </div>
            <CreatedTasks
              createdTasks={createdTasks}
              createdFilterStatus={createdFilterStatus}
              setCreatedFilterStatus={setCreatedFilterStatus}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
              showModal={showModal}
              setShowModal={setShowModal}
            />
            <AssignedTasks
              assignedTasks={assignedTasks}
              assignedFilterStatus={assignedFilterStatus}
              setAssignedFilterStatus={setAssignedFilterStatus}
              handleStatusChange={handleStatusChange}
              project_id={projectId}
            />
          </>)
        }
        {showModal && <EditModal editData={task} setShowModal={setShowModal} />}
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

export default Dashboard;