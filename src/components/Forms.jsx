import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Forms() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [status, setStatus] = useState("Pending");
  const [start_date, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimated_hours, setEstimatedHours] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const isAdmin = sessionStorage.getItem("user_role") === "admin"; // Check if user is an admin
  const navigate = useNavigate();
  const {project_id}=useParams();
  const {sprint_id} = useParams();
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:5000/profile/get_users_and_managers", {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
        setManagers(data.managers); // API returns both users and managers
      } else {
        toast.error("Failed to fetch users.");
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newTask = {
      title: title,
      description: description,
      priority: priority,
      status: status,
      start_date : start_date,
      deadline: deadline,
      estimated_hours: estimated_hours,
      assigned_to: assignedTo,
    };

    try {
      const response = await fetch(`http://localhost:5000/task/form_data/${project_id}/${sprint_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(newTask),
      });

      if (response.status === 201) {
        toast.success("Task created successfully!");
        setTitle("");
        setDescription("");
        setPriority("Low");
        setStatus("Pending");
        setStartDate("");
        setDeadline("");
        setEstimatedHours("");
        setAssignedTo("");
        navigate('/dashboard');
      } else {
        setMessage("Failed to create the task. Please try again.");
        toast.error("Failed to create the task. Please try again.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setMessage("Failed to create the task. Please try again.");
      toast.error("Failed to create the task. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-4/5 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create a New Task</h2>
        {message && <p className="text-red-500 mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Start Date:</label>
            <input
              type="date"
              value={start_date}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Deadline:</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Estimated Hours:</label>
            <input
              value={estimated_hours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
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
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Create Task
          </button>
        </form>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-500 hover:underline mt-4 block text-center"
        >
          Go to Dashboard
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Forms;
