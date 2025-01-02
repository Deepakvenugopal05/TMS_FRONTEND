import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import TaskModal from './TaskModal';

const CreatedTasks = ({ createdTasks, handleDeleteTask }) => {
  console.log("Created Tasks",createdTasks);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialFilterStatus = queryParams.get('filter') || 'All';
  const [currentTime] = useState(new Date()); // Current Date
  const [subtasksVisible, setSubtasksVisible] = useState({});
  const [subtasks, setSubtasks] = useState({});
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [creatingSubtaskFor, setCreatingSubtaskFor] = useState(null);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    priority: 'Low',
    status: 'Pending',
    start_date: '',
    deadline: '',
    estimated_hours: '',
    assigned_to: '',
  });
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createdFilterStatus, setCreatedFilterStatus] = useState(initialFilterStatus);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('All');
  const isAdmin = sessionStorage.getItem("user_role") === "admin";
  const access_token = sessionStorage.getItem('access_token');

  const [editSubtaskId, setEditSubtaskId] = useState(null);
  const [editedSubtask, setEditedSubtask] = useState({});

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [ModalTaskId, setModalTaskId] = useState(null);

  const button_state = true;

  const [searchTerm, setSearchTerm] = useState(''); // Search term state


  useEffect(() => {
    const fetchAllSubtasks = async () => {
      const subtasksPromises = createdTasks.map(async (task) => {
        const response = await fetch(`http://localhost:5000/task/tasks/${task.task_id}/subtasks`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log("subtasks" , data);
        return { taskId: task.task_id, subtasks: data };
      });

      const subtasksData = await Promise.all(subtasksPromises);
      const subtasksMap = subtasksData.reduce((acc, { taskId, subtasks }) => {
        acc[taskId] = subtasks;
        return acc;
      }, {});

      setSubtasks(subtasksMap);
    };

    fetchAllSubtasks();
  }, [createdTasks]);

  // Flatten tasks and subtasks into a single array for filtering
  const allTasks = createdTasks.reduce((acc, task) => {
    acc.push(task);
    if (subtasks[task.task_id]) {
      acc.push(...subtasks[task.task_id]);
    }
    return acc;
  }, []);

  // Filter tasks based on search term
  const filteredTasks = allTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input change for search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewTasks = (taskId) => {
    console.log("taskId", taskId);
    navigate(`/task_details/${taskId}`)
  }

  const createdAssignedTasks = createdFilterStatus === 'All'
    ? filteredTasks
    : filteredTasks.filter(task => task.status === createdFilterStatus);

  const filteredTasksBySprint = selectedSprint === 'All'
    ? createdAssignedTasks
    : createdAssignedTasks.filter(task => task.sprint_name === selectedSprint);

  useEffect(() => {
    let isMounted = true;

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
          if (isMounted) {
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

    const fetchSprints = async () => {
      try {
        const response = await fetch("http://localhost:5000/sprint/get_all_sprints", {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          if (isMounted) {
            setSprints(data.sprints);
          }
        } else {
          if (isMounted) {
            toast.error("Failed to fetch sprints.");
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error("An error occurred while fetching sprints.");
        }
      }
    };

    fetchUsers();
    fetchSprints();

    return () => { isMounted = false };
  }, []);

  const toggleSubtasks = (taskId) => {
    setSubtasksVisible((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId], // Toggle visibility
    }));
  };

  const handleEditClick = (task) => {
    setEditTaskId(task.task_id);
    setEditedTask({ ...task });
  };

  const handleSaveClick = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/edit_task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTask),
      });

      if (response.ok) {
        toast.success('Task updated successfully');
        setEditTaskId(null);

      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('An error occurred while updating the task');
    }
  };

  const handleCancelClick = () => {
    setEditTaskId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask({
      ...editedTask,
      [name]: value,
    });
  };

  const handleCreateSubtask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/create_subtask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent_task_id: taskId,
          ...newSubtask,
        }),
      });

      if (response.ok) {
        toast.success('Subtask created successfully');
        setCreatingSubtaskFor(null);
        setNewSubtask({
          title: '',
          description: '',
          priority: 'Low',
          status: 'Pending',
          start_date: '',
          deadline: '',
          assigned_to: '',
        });
        // Fetch subtasks again to update the list
        const response = await fetch(`http://localhost:5000/task/tasks/${taskId}/subtasks`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setSubtasks((prev) => ({
          ...prev,
          [taskId]: data,
        }));
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('An error occurred while creating the subtask');
    }
  };

  const handleCancelSubtaskCreation = () => {
    setCreatingSubtaskFor(null);
    setNewSubtask({
      title: '',
      description: '',
      priority: 'Low',
      status: 'Pending',
      start_date: '',
      deadline: '',
      estimated_hours: '',
      assigned_to: '',
    });
  };

  const renderAttachment = (attachmentUrl) => (
    <div className="mt-2">
      <p><strong>Attachment:</strong></p>
      <a href={attachmentUrl} download className="text-blue-500 underline">Download Attachment</a>
    </div>
  );

  const handleEditSubtaskClick = (subtask) => {
    setEditSubtaskId(subtask.task_id);
    setEditedSubtask({ ...subtask });
  };

  const handleSaveSubtaskClick = async (subtaskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/edit_task/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedSubtask),
      });

      if (response.ok) {
        toast.success('Subtask updated successfully');
        setEditSubtaskId(null);
        // Optionally, refresh the task list
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('An error occurred while updating the subtask');
    }
  };

  const handleCancelSubtaskClick = () => {
    setEditSubtaskId(null);
  };

  const handleSubtaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubtask({
      ...newSubtask,
      [name]: value,
    });
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/delete_task/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        toast.success('Subtask deleted successfully');
        // Optionally, refresh the task list
      } else {
        toast.error('Failed to delete subtask.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('An error occurred while deleting the subtask');
    }
  };

  const calculateDaysLeft = (deadline, status) => {
    if (status === "Completed") {
      return 0;
    }
    const deadlineDate = new Date(deadline);
    const timeDifference = deadlineDate - currentTime;
    const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysLeft + 1;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        <FiEdit className="mr-2" /> Created Tasks
      </h2>
      <div className='flex justify-end gap-x-20 mb-4'>
        <div className='flex gap-x-2 items-center'>
        <label className='font-bold'>Search</label>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border p-2 w-34"
          />
          <label className='font-bold'>status</label>
          <select
            value={createdFilterStatus}
            onChange={(e) => setCreatedFilterStatus(e.target.value)}
            className="w-34 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className='flex gap-x-2 items-center'>
          <label className='font-bold'>sprint</label>
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="w-34 p-2 align-right border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="All">All</option>
            {sprints.map(sprint => (
              <option key={sprint.sprint_id} value={sprint.sprint_name}>{sprint.sprint_name}</option>
            ))}
          </select>
        </div>

      </div>

      {filteredTasksBySprint.length > 0 ? (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Project Name</th>
              <th className="py-2 px-4 border-b">Sprint Name</th>
              <th className="py-2 px-4 border-b">Task ID</th>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Priority</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Start Date</th>
              <th className="py-2 px-4 border-b">Deadline</th>
              <th className="py-2 px-4 border-b">Duration</th>
              <th className="py-2 px-4 border-b">Estimated Hours</th>
              <th className="py-2 px-4 border-b">Assigned To</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasksBySprint.map((task) => (
              <React.Fragment key={task.task_id}>
                <tr>
                  <td className="border px-4 py-2">{task.project_name}</td>
                  <td className="border px-4 py-2">{task.sprint_name}</td>
                  <td className="py-2 px-4 border-b">{task.task_id}</td>

                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleViewTasks(task.task_id)}
                      className="text-black p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      {editTaskId === task.task_id ? (
                        <input
                          type="text"
                          name="title"
                          value={editedTask.title}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        task.title
                      )}
                    </button>

                  </td>
                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <input
                        type="text"
                        name="description"
                        value={editedTask.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      task.description
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <select
                        name="priority"
                        value={editedTask.priority}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    ) : (
                      task.priority
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <select
                        name="status"
                        value={editedTask.status}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      task.status
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <input
                        type="date"
                        name="start_date"
                        value={editedTask.start_date}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      task.start_date
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <input
                        type="date"
                        name="deadline"
                        value={editedTask.deadline}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      task.deadline
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{calculateDaysLeft(task.deadline, task.status)} Days</td>
                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <input
                        type="text"
                        name="estimated_hours"
                        value={editedTask.estimated_hours}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      task.estimated_hours
                    )} Hours
                  </td>
                  <td className="py-2 px-4 border-b">{task.assigned_to_username}</td>

                  <td className="py-2 px-4 border-b">
                    {editTaskId === task.task_id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveClick(task.task_id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button onClick={() => toggleSubtasks(task.task_id)}>
                          {subtasksVisible[task.task_id] ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        <button
                          onClick={() => handleEditClick(task)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.task_id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          onClick={() => setCreatingSubtaskFor(task.task_id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Subtask Creation Row */}
                {creatingSubtaskFor === task.task_id && (
                  <tr>
                    <td colSpan="11" className="py-2 px-4 bg-gray-100">
                      <h3 className="text-lg font-bold">Create Subtask</h3>
                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                          <input
                            type="text"
                            name="title"
                            value={newSubtask.title}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                          <input
                            type="text"
                            name="description"
                            value={newSubtask.description}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Priority:</label>
                          <select
                            name="priority"
                            value={newSubtask.priority}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
                          <select
                            name="status"
                            value={newSubtask.status}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
                          <input
                            type="date"
                            name="start_date"
                            value={newSubtask.start_date}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Deadline:</label>
                          <input
                            type="date"
                            name="deadline"
                            value={newSubtask.deadline}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Estimated Hours:</label>
                          <input
                            type="text"
                            name="estimated_hours"
                            value={newSubtask.estimated_hours}
                            onChange={handleSubtaskInputChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">Assign To:</label>
                          {isAdmin ? (
                            <>
                              <select
                                name="assigned_to"
                                value={newSubtask.assigned_to}
                                onChange={handleSubtaskInputChange}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Select a manager</option>
                                {managers.map(manager => (
                                  <option key={manager.id} value={manager.id}>{manager.username}</option>
                                ))}
                              </select>
                              <select
                                name="assigned_to"
                                value={newSubtask.assigned_to}
                                onChange={handleSubtaskInputChange}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 mt-2"
                              >
                                <option value="">Select a user</option>
                                {users.map(user => (
                                  <option key={user.id} value={user.id}>{user.username}</option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <select
                              name="assigned_to"
                              value={newSubtask.assigned_to}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select a user</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleCreateSubtask(task.task_id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300 mr-2"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={handleCancelSubtaskCreation}
                          className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                        >
                          <FiX />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Subtasks Row */}
                {subtasksVisible[task.task_id] && subtasks[task.task_id] && subtasks[task.task_id].length > 0 && (
                  <>
                    <tr>
                      <td colSpan="11" className="py-2 px-4 bg-gray-100">
                        <h3 className="text-lg font-bold">Subtasks</h3>
                      </td>
                    </tr>
                    {subtasks[task.task_id].map((subtask) => (
                      <tr key={subtask.task_id}>
                        <td className="border px-4 py-2">{task.project_name}</td>
                        <td className="border px-4 py-2">{task.sprint_name}</td>
                        <td className="py-2 px-4 border-b">{subtask.task_id}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() => handleViewTasks(subtask.task_id)}
                            className="text-black p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                          >
                            {editSubtaskId === subtask.task_id ? (
                              <input
                                type="text"
                                name="title"
                                value={editedSubtask.title}
                                onChange={handleSubtaskInputChange}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              subtask.title
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <input
                              type="text"
                              name="description"
                              value={editedSubtask.description}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            subtask.description
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <select
                              name="priority"
                              value={editedSubtask.priority}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          ) : (
                            subtask.priority
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <select
                              name="status"
                              value={editedSubtask.status}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          ) : (
                            subtask.status
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <input
                              type="date"
                              name="start_date"
                              value={editedSubtask.start_date}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            subtask.start_date
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <input
                              type="date"
                              name="deadline"
                              value={editedSubtask.deadline}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            subtask.deadline
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">{calculateDaysLeft(subtask.deadline, subtask.status)} Days</td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <input
                              type="text"
                              name="estimated_hours"
                              value={editedSubtask.estimated_hours}
                              onChange={handleSubtaskInputChange}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            subtask.estimated_hours
                          )} Hours
                        </td>
                        <td className="py-2 px-4 border-b">{subtask.assigned_username}</td>
                        <td className="py-2 px-4 border-b">
                          {editSubtaskId === subtask.task_id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveSubtaskClick(subtask.task_id)}
                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
                              >
                                <FiSave />
                              </button>
                              <button
                                onClick={handleCancelSubtaskClick}
                                className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                              >
                                <FiX />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditSubtaskClick(subtask)}
                                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteSubtask(subtask.task_id)}
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No created tasks to show.</p>
      )}

      {showTaskModal && (
        <TaskModal
          taskId={ModalTaskId}
          onClose={() => setShowTaskModal(false)}
          buttonState={button_state}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default CreatedTasks;