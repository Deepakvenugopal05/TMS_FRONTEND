import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Comments from './Comments';

const TaskModal = ({ taskId, onClose, buttonState }) => {
  const [task, setTask] = useState({});
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const access_token = sessionStorage.getItem('access_token');

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  },[]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/task/task_specific/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTask(data);
      } else {
        toast.error("Failed to fetch Task.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching Task.");
    }
  };

  const handleSaveClick = async () => {
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
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating the task');
    }
  };

  const handleEditClick = () => {
    setEditTaskId(task.task_id);
    setEditedTask({ ...task });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask({
      ...editedTask,
      [name]: value,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Task Details</h2>
        {editTaskId === task.task_id ? (
          <div className="task-edit-form space-y-2">
            <p>Title</p>
            <input
              type="text"
              name="title"
              value={editedTask.title || ''}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="Title"
            />
            <p>Description</p>
            <textarea
              name="description"
              value={editedTask.description || ''}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="Description"
            />
            <p>Status</p>
            <select
              name="status"
              value={editedTask.status || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <p>Priority</p>
            <select
              name="priority"
              value={editedTask.priority || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <p>End Date</p>
            <input
              type="date"
              name="deadline"
              value={editedTask.deadline || ''}
              onChange={handleInputChange}
              className="border p-2 w-full"
            />
            <p>Duration (Days)</p>
            <input
              type="number"
              name="duration"
              value={editedTask.duration || ''}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="Duration"
            />
            <p>Work Hours</p>
            <input
              type="number"
              name="working_hours"
              value={editedTask.working_hours || ''}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="Working Hours"
            />
            <div className="modal-actions mt-6 flex justify-end space-x-2">
              <button onClick={() => handleSaveClick(task.task_id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                <FiSave /> Save
              </button>
              <button onClick={() => setEditTaskId(null)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                <FiX /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="task-details space-y-2">
            <p><strong>Sprint:</strong> {task.sprint_name}</p>
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Due Date:</strong> {task.deadline}</p>
            <p><strong>Duration:</strong> {task.duration} Days</p>
            <p><strong>Work Hours:</strong> {task.working_hours}/{task.estimated_hours} Hours</p>
            <th className="border px-4 py-2"><Comments taskId={task.task_id} /></th>
          </div>
        )}
        
        <div className="modal-actions mt-6 flex justify-end gap-x-2">
          {buttonState && editTaskId !== task.task_id && (
            <button onClick={handleEditClick} className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
              <FiEdit />
            </button>
          )}
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default TaskModal;
