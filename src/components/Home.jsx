import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { IoLogOut } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { GiSprint } from "react-icons/gi";
import { ToastContainer, toast } from 'react-toastify';
import TaskModal from './TaskModal';

const Home = () => {
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);


  const [summary, setSummary] = useState({
    total_projects: 0,
    completed_projects: 0,
    total_tasks: 0,
    completed_tasks: 0,
  });

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const response = await fetch('http://localhost:5000/project/dashboard/user_summary', {
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

    fetchDashboardSummary();
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
      }
      else {
          const errorData = await response.json();
          toast.error(`Error: ${errorData.message}`);
        }
      
    } catch (error) {
      toast.error('Failed to search tasks.');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleViewSearch = () => {
    setShowSearchModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div>
          <div className='flex gap-4'>
              <IoMdSearch className="mr-4 text-blue-500 " onClick={handleViewSearch} size={35} title={"search"}/>
              <RxDashboard onClick={() => navigate('/dashboard')} className="mr-4 text-blue-500" size={35} title='Dashboard'/>
              <CgProfile onClick={() => navigate('/profile')} className="mr-4 text-blue-500" size={35} title={"Profile"}/>
              <IoLogOut onClick={() => navigate('/login')} className="text-blue-500" size={35} title={"logout"}/>
          </div>
        </div>
      </nav>

      <section className="bg-gray-100 p-8 text-black text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Task Manager</h1>
        <p className="text-xl mb-8">Manage your tasks efficiently</p>
        <div>
          <button onClick={() => navigate('/dashboard')} className="bg-white text-blue-500 px-6 py-3 rounded-lg mr-4">Get Started</button>
          <button onClick={() => window.scrollTo(0, document.body.scrollHeight)} className="bg-white text-blue-500 px-6 py-3 rounded-lg">Learn More</button>
        </div>
      </section>

      {/* Summary Section */}
      <section className="bg-white p-10 text-center">
        <h2 className="text-3xl font-bold mb-10">Dashboard Summary</h2>
        {/* <button onClick={() => navigate('/home?my_works')}>My Works</button> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <button onClick={() => navigate('/dashboard')}>
              <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Total Tasks Created</h3>
                <p>{summary.total_tasks_created}</p>
              </div>
          </button>
          <button onClick={() => navigate('/dashboard?filter=Completed')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Completed Created tasks</h3>
              <p>{summary.completed_tasks_created}</p>
            </div>
          </button>
          <button onClick={() => navigate('/dashboard')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Total Tasks Assigned</h3>
              <p>{summary.total_tasks_assigned}</p>
            </div>
          </button>
          <button onClick={() => navigate('/dashboard?filter_assigned=Completed')}>
            <div className="summary-card p-6 bg-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Completed Tasks</h3>
              <p>{summary.completed_tasks_assigned}</p>
            </div>
          </button>
        </div>
      </section>

      <section className="features p-10">
        <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Task Management</h3>
            <p>Efficiently manage your tasks with our intuitive interface.</p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">User Roles</h3>
            <p>Assign different roles to users for better collaboration.</p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Notifications</h3>
            <p>Stay updated with real-time notifications.</p>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Analytics</h3>
            <p>Track your progress with detailed analytics.</p>
          </div>
        </div>
      </section>

      <section className="testimonials p-10 bg-gray-200">
        <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="testimonial-card p-6 bg-white rounded-lg shadow-lg">
            <p className="mb-4">"Great tool for managing tasks!"</p>
            <div className="flex items-center">
              <img src="user1.jpg" alt="User 1" className="w-10 h-10 rounded-full mr-4" />
              <span>John Doe</span>
            </div>
          </div>
          <div className="testimonial-card p-6 bg-white rounded-lg shadow-lg">
            <p className="mb-4">"Very user-friendly and efficient."</p>
            <div className="flex items-center">
              <img src="user2.jpg" alt="User 2" className="w-10 h-10 rounded-full mr-4" />
              <span>Jane Smith</span>
            </div>
          </div>
          <div className="testimonial-card p-6 bg-white rounded-lg shadow-lg">
            <p className="mb-4">"Helps me stay organized."</p>
            <div className="flex items-center">
              <img src="user3.jpg" alt="User 3" className="w-10 h-10 rounded-full mr-4" />
              <span>Alice Johnson</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">About</h3>
            <p>Learn more about our mission and team.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p>Get in touch with us.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Privacy Policy</h3>
            <p>Read our privacy policy.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Terms of Service</h3>
            <p>Review our terms of service.</p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <p>&copy; 2023 Task Manager. All rights reserved.</p>
        </div>
      </footer>

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

export default Home;