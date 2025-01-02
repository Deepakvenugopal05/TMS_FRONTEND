import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { FiPlus, FiX } from 'react-icons/fi';


const SubtaskModal = ({ isOpen, onClose, taskId, refreshTasks }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [status, setStatus] = useState('Pending');
  const [start_date, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading,setLoading] = useState(true);
  const isAdmin = sessionStorage.getItem("user_role") === "admin"

  useEffect(() => {
    let isMounted = true; // flag to track if the component is mounted
  
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/profile/get_users_and_managers", {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          if (isMounted) { // only update state if component is still mounted
            setUsers(data.users);
            setManagers(data.managers);
          }
        } else {
          if (isMounted) {
            toast.error("Failed to fetch users.");
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error("An error occurred while fetching users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    fetchUsers();
  
    return () => { isMounted = false }; // cleanup function to set flag on unmount
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      parent_task_id: taskId,
      title,
      description,
      priority,
      status,
      start_date,
      deadline,
      assigned_to: assignedTo,
    };

    const response = await fetch('http://localhost:5000/task/create_subtask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}` 
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setUsers(data.users);
      setManagers(data.managers);
      toast.success('Subtask created successfully');
      refreshTasks(); // Refresh the tasks to show the new subtask
      onClose(); // Close the modal
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to create subtask');
    }
  };

  const handleCancel = () =>{
    onClose()
  }

  return (
    isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-5 rounded shadow-lg w-3/5">
          <h2 className="text-lg font-bold mb-4">Create Subtask</h2>
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">
            <FiX />
          </button>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border rounded w-full p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border rounded w-full p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border rounded w-full p-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded w-full p-2"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Start Date</label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded w-full p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border rounded w-full p-2"
              />
            </div>
            <div className="mb-4">
            <label className="block text-gray-700">Assign To:</label>
            {isAdmin ? (
              <>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.username}</option>
                  ))}
                </select>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 mt-2"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </>
            ) : (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 mt-2"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            )}
          </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded mr-80"
            >
              <FiPlus className="inline mr-1" /> Create Subtask
            </button>
            <button
             type="button"
            onClick={()=>{handleCancel()}}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-60"
            >
            Cancel
            </button>
          </form>
        </div>
      </div>
    ) : null
  );
};

export default SubtaskModal;
