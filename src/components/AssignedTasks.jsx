import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaTasks } from 'react-icons/fa';
import TaskModal from './TaskModal';


const AssignedTasks = ({ assignedTasks, handleStatusChange }) => {
  console.log("Assigned tasks",assignedTasks);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialFilterStatus = queryParams.get('filter_assigned') || 'All';
  const [assignedFilterStatus, setAssignedFilterStatus] = useState(initialFilterStatus);
  const [subtasks, setSubtasks] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [workHours, setWorkHours] = useState({});
  const [editMode, setEditMode] = useState({});
  const [currentTime] = useState(new Date());
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('All');
  const access_token = sessionStorage.getItem('access_token');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [ModalTaskId, setModalTaskId] = useState(null);

  const button_state = false;

  const [searchTerm, setSearchTerm] = useState('');

  // Filter tasks based on search term
  const filteredTasks = assignedTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input change for search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewTasks = (taskId) => {
    console.log("taskId",taskId);
    navigate(`/task_details/${taskId}`)
  }

  const filteredAssignedTasks = assignedFilterStatus === 'All' 
    ? filteredTasks 
    : filteredTasks.filter(task => task.status === assignedFilterStatus);

  const filteredTasksBySprint = selectedSprint === 'All' 
    ? filteredAssignedTasks 
    : filteredAssignedTasks.filter(task => task.sprint_name === selectedSprint);

  useEffect(() => {
    let isMounted = true;

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
   
    fetchSprints();

    return () => { isMounted = false };
  }, []);

  // Fetch subtasks for a specific task
  const fetchSubtasks = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/tasks/${taskId}/subtasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`, // Ensure you have the correct token
          'Content-Type': 'application/json'
        }
      });

      const textResponse = await response.text();
      try {
        const data = JSON.parse(textResponse);
        console.log("Subtaasks",data);
        if (response.ok) {
          setSubtasks((prev) => ({
            ...prev,
            [taskId]: data, // Store subtasks for each task by its taskId
          }));
        } else {
          toast.error('Failed to fetch subtasks');
        }
      } catch (jsonError) {
        console.error('JSON Parsing Error:', jsonError);
        toast.error('Failed to parse subtasks response');
      }

    } catch (error) {
      console.error(error);
      toast.error('Error fetching subtasks');
    }
  };

  const toggleSubtasks = (taskId) => {
    if (subtasks[taskId]) {
      setSubtasks((prev) => ({
        ...prev,
        [taskId]: null, // Collapse subtasks if already fetched
      }));
    } else {
      fetchSubtasks(taskId); // Fetch subtasks if not already fetched
    }
  };

  const toggleEditMode = (taskId) => {
    setEditMode((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleWorkHoursChange = (taskId, value) => {
    setWorkHours((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const updateWorkHours = async (taskId) => {
    const hours = workHours[taskId];

    if (!hours || isNaN(hours)) {
      toast.error('Please enter a valid number for work hours.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/task/edit_work_hours/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ work_hours: hours }),
      });

      if (response.ok) {
        toast.success('Work hours updated successfully');
        toggleEditMode(taskId); // Exit edit mode after updating
      } else {
        toast.error('Failed to update work hours.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating work hours.');
    }
  };


/*
    const calculateDaysLeft = (deadline) => {
    const deadlineDate = new Date(deadline);
    const timeDifference = deadlineDate - currentTime;
    const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysLeft+1;
  };
*/

  const isTaskOverrun = (endDate, estimatedHours, workingHours, workingStatus) => {
    const taskEndDate = new Date(endDate);
    return (taskEndDate < currentTime || (estimatedHours < workingHours && workingStatus === 'completed'));
  };

  // File upload handler
  const handleFileUpload = async (taskId) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/task/attach_file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('File attached successfully');
      } else {
        toast.error('Failed to attach the file.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error attaching file.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        <FaTasks className="mr-2" /> Assigned Tasks
      </h2>
      <div className='flex justify-end gap-x-20 mb-4'>
        <div className='flex gap-x-2 items-center'>
          <label className='font-bold'>Search</label>
            <input
              type="text"
              placeholder="Search By title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border p-2 w-34"
            />
          <label className='font-bold'>status</label>
        <select
          value={assignedFilterStatus}
          onChange={(e) => setAssignedFilterStatus(e.target.value)}
          className="w-34 p-2  border rounded-lg focus:outline-none focus:border-blue-500"
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
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="border px-4 py-2">Project Name</th>
              <th className="border px-4 py-2">Sprint Name</th>
              <th className="border px-4 py-2">Task ID</th>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Priority</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Start Date</th>
              <th className="border px-4 py-2">Deadline</th>
              {/* <th className="border px-4 py-2">Duration</th>
              <th className="border px-4 py-2">Estimated Hours</th>
              <th className="border px-4 py-2">Work hours</th> */}
              <th className="border px-4 py-2">Created By</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasksBySprint.map((task) => (
              <tr key={task.task_id}>
                <td className="border px-4 py-2">{task.project_name}</td>
                <td className="border px-4 py-2">{task.sprint_name}</td>
                <td className="border px-4 py-2">{task.task_id}</td>
                <td className="border px-4 py-2">
                <button
                    onClick={() => handleViewTasks(task.task_id)}
                    className=" text-black p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    {task.title}
                  </button>
                  </td>
                <td className="border px-4 py-2">{task.description}</td>
                <td className="border px-4 py-2">{task.priority}</td>
                <td className="border px-4 py-2">{task.status}</td>
                <td className="border px-4 py-2">{task.start_date}</td>
                <td className={`${isTaskOverrun(task.deadline, task.estimated_hours, task.working_hours, task.status) ? 'bg-red-200' : ''}`}>{task.deadline}</td>
                {/* <td className="border px-4 py-2">{calculateDaysLeft(task.deadline)} Days</td>
                <td className="border px-4 py-2">{task.estimated_hours} Hours</td>
                <td className="border px-4 py-2">
                  {editMode[task.task_id] ? (
                    <div>
                      <input
                        type="number"
                        value={workHours[task.task_id] || task.working_hours}
                        onChange={(e) => handleWorkHoursChange(task.task_id, e.target.value)}
                        className="w-full p-1 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => updateWorkHours(task.task_id)}
                        className="bg-blue-500 text-white p-1 mt-2 rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Save Hours
                      </button>
                    </div>
                  ) : (
                    <div>
                      {task.working_hours} hours
                      <button
                        onClick={() => toggleEditMode(task.task_id)}
                        className="bg-green-500 text-white p-1 mt-2 rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        Update Hours
                      </button>
                    </div>
                  )}
                </td> */}
                <td className="border px-4 py-2">{task.created_by_username}</td>
                
                <td className="border px-4 py-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                    className="w-full p-1 border rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {task.status === 'Completed' && (
                    <div className="mt-2">
                      <p><strong>Worked Hours:</strong> {task.working_hours} Hours</p>
                      <h4 className="text-md font-bold">Upload File</h4>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="block mb-2"
                      />
                      <button
                        onClick={() => handleFileUpload(task.task_id)}
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Attach File
                      </button>
                    </div>
                  )}

                  {/* Button to show/hide subtasks */}
                  <button
                    onClick={() => toggleSubtasks(task.task_id)}
                    className="text-blue-500 underline mt-2"
                  >
                    {subtasks[task.task_id] ? 'Hide Subtasks' : 'Show Subtasks'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assigned tasks to show.</p>
      )}

      {Object.keys(subtasks).map(taskId => (
        subtasks[taskId] && (
          <div key={taskId} className="ml-4 mt-4">
            <h3 className="text-lg font-bold">Subtasks for Task ID: {taskId}</h3>
            {subtasks[taskId].length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Subtask ID</th>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Priority</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Start Date</th>
                    <th className="border px-4 py-2">Deadline</th>
                    <th className="border px-4 py-2">Duration</th>
                    <th className="border px-4 py-2">Estimated Hours</th>
                    <th className="border px-4 py-2">Working Hours</th>
                    <th className="border px-4 py-2">Created By</th>
                    <th className="border px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subtasks[taskId].map((subtask) => (
                    <tr key={subtask.subtask_id}>
                      <td className="border px-4 py-2">{subtask.task_id}</td>
                      <td className="py-2 px-4 border-b">
                          <button
                          onClick={() => handleViewTasks(subtask.task_id)}
                          className=" text-black p-2 rounded-lg hover:bg-blue-600 transition duration-300"      
                          >
                          {subtask.title}
                          </button>
                        </td>
                      <td className="border px-4 py-2">{subtask.description}</td>
                      <td className="border px-4 py-2">{subtask.status}</td>
                      <td className="border px-4 py-2">{subtask.priority}</td>
                      <td className="border px-4 py-2">{subtask.start_date}</td>
                      <td className="border px-4 py-2">{subtask.deadline}</td>
                      <td className="border px-4 py-2">{subtask.duration} Days</td>
                      <td className="border px-4 py-2">{subtask.estimated_hours} Hours</td>
                      <td className="border px-4 py-2">
                  {editMode[subtask.task_id] ? (
                    <div>
                      <input
                        type="number"
                        value={workHours[subtask.task_id] || subtask.working_hours}
                        onChange={(e) => handleWorkHoursChange(subtask.task_id, e.target.value)}
                        className="w-full p-1 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => updateWorkHours(subtask.task_id)}
                        className="bg-blue-500 text-white p-1 mt-2 rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Save Hours
                      </button>
                    </div>
                  ) : (
                    <div>
                      {subtask.working_hours} Hours
                      <button
                        onClick={() => toggleEditMode(subtask.task_id)}
                        className="bg-green-500 text-white p-1 mt-2 rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        Update Hours
                      </button>
                    </div>
                  )}
                </td>
                      <td className="border px-4 py-2">{subtask.created_username}</td>
                      
                      <td className="border px-4 py-2">
                        <select
                          value={subtask.status}
                          onChange={(e) => handleStatusChange(subtask.task_id, e.target.value)}
                          className="w-200 p-1 border rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No subtasks to show.</p>
            )}
          </div>
        )
      ))}

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

export default AssignedTasks;
