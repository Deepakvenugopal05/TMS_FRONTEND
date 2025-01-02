import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateForms() {
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]); 
  const [sprintId, setSprintId] = useState("");
  const [sprints, setSprints] = useState([]);
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
  const isAdmin = sessionStorage.getItem("user_role") === "admin";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch("http://localhost:5000/project/projects", {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
      });
      const projectData = await response.json();

      if (response.ok) {
        setProjects(projectData.projects || []); 
      } else {
        toast.error("Failed to fetch projects.");
      }
    };

    const fetchUsers = async () => {
      const response = await fetch("http://localhost:5000/profile/get_users_and_managers", {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);  
        setManagers(data.managers || []);  
      } else {
        toast.error("Failed to fetch users.");
      }
    };

    fetchUsers();
    fetchProjects();
  }, []);


  const handleProjectChange = async (e) => {
    setProjectId(e.target.value);  // Set the selected project ID
    const project_id = e.target.value
    console.log(project_id,"project_id");
    console.log("changing!!");
    try{
      const response = await fetch(`http://localhost:5000/sprint/sprints/${project_id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
      });
      const sprintData = await response.json();
      console.log(sprintData);
  
      if (response.ok) {
        setSprints(sprintData.sprints || []);  
      } else {
        toast.error("Failed to fetch sprints.");
      }
    }catch (error) {
      toast.error('Failed to fetch sprints.');
    }


  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newTask = {
      project_id: projectId,
      sprint_id : sprintId,
      title: title,
      description: description,
      priority: priority,
      status: status,
      start_date: start_date,
      deadline: deadline,
      estimated_hours : estimated_hours,
      assigned_to: assignedTo,
    };

    try {
      const response = await fetch(`http://localhost:5000/task/dashboard/form_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(newTask),
      });

      if (response.status === 201) {
        toast.success("Task created successfully!");
        setProjectId("");
        setSprintId("");
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
          {/* Project Name Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700">Project Name:</label>
            <select
              onChange={handleProjectChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select a project</option>
              {projects?.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          {/* Sprint Name Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700">Sprint Name:</label>
            <select
            onChange={(e) => {
              setSprintId(e.target.value)}}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select a Sprint</option>
              {sprints?.map((sprint) => (
                <option key={sprint.sprint_id} value={sprint.sprint_id}>
                  {sprint.sprint_name}
                </option>
              ))}
            </select>
          </div>
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
              // This is used when validation is needed
              // min={new Date().toISOString().split("T")[0]}
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
              // This is used when validation is needed
              // min={start_date || new Date().toISOString().split("T")[0]}
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
                  {managers?.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.username}</option>
                  ))}
                </select>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 mt-2"
                >
                  <option value="">Select a user</option>
                  {users?.map(user => (
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
                {users?.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            )}
          </div>

          <div className="text-center">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg">
              Create Task
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default CreateForms;
