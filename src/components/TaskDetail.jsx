import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function TaskDetailsPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [newComment, setNewComment] = useState('');
  const loggedInUser = sessionStorage.getItem('user_id');

  useEffect(() => {
    fetchTaskDetails(taskId);
    fetchSubtasks(taskId);
    fetchComments(taskId);
    fetchAttachedFiles(taskId);
  }, [taskId]);

  const fetchTaskDetails = async (taskId) => {
    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/task/task_specific/${taskId}`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("specific_data: ", data);
        setTaskDetails(data);
        setEditedTask(data);
      } else {
        console.error("Failed to fetch task details:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while fetching task details:", error);
    }
  };

  const fetchSubtasks = async (taskId) => {
    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/task/tasks/${taskId}/subtasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("subtasks", data);
        setSubtasks(data);
      } else {
        console.error("Failed to fetch subtasks:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while fetching subtasks:", error);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/comments/tasks/${taskId}/comment`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error("Failed to fetch comments:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while fetching comments:", error);
    }
  };

  const fetchAttachedFiles = async (taskId) => {
    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/attachment/get_attached_files/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Attached_files: ", data);
        setAttachedFiles(data);
      } else {
        console.error("Failed to fetch attached files:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while fetching attached files:", error);
    }
  };

  const handleMainTaskClick = (task_id) => {
    console.log("Navigating to main task:", task_id);
    navigate(`/task_details/${task_id}`);
  };

  const handleSubtaskClick = (subtaskId) => {
    console.log("Navigating to subtask:", subtaskId);
    navigate(`/task_details/${subtaskId}`);
  };

  const handleFileUpload = async (taskId) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('file', selectedFile);

    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/task/attach_file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('File attached successfully');
        setSelectedFile(null);
        fetchAttachedFiles(taskId);
      } else {
        toast.error('Failed to attach the file.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error attaching file.');
    }
  };

  const isAssignedToUser = taskDetails?.assigned_to === loggedInUser;

  const handleEditClick = () => {
    if (!isAssignedToUser) {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isAssignedToUser && name !== 'status') {
      return;
    }
    setEditedTask({
      ...editedTask,
      [name]: value,
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const access_token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:5000/task/edit_status/${taskId}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (response.ok) {
      toast.success("Task status updated successfully!");
      fetchTaskDetails(taskId);
    } else {
      toast.error("Failed to update task status.");
    }
  };

  const handleSaveClick = async () => {
    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/task/edit_task/${taskId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTask),
      });

      if (response.ok) {
        setTaskDetails(editedTask);
        setIsEditing(false);
      } else {
        console.error("Failed to update task details:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while updating task details:", error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const access_token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/comments/post_tasks_comments/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        toast.success('Comment added successfully');
        setNewComment('');
        fetchComments(taskId);
      } else {
        toast.error('Failed to add comment.');
      }
    } catch (error) {
      toast.error('An error occurred while adding the comment');
    }
  };

  if (!taskDetails) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="sticky top-0 z-10 bg-white p-6 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center ">
        <div className="flex flex-wrap gap-2 md:mb-0">
          <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">Task</span>
          <span className="text-sm bg-green-200 text-green-700 px-2 py-1 rounded">WD1-T{taskDetails.task_id}</span>
          <span className="text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded">{taskDetails.title}</span>
          {taskDetails.parent_id !== null && (
            <span className="text-sm bg-purple-200 text-purple-700 px-2 py-1 rounded">Subtask</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{taskDetails.title}</h1>
      </div>
    </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-600">Task ID:</p>
              <p className="text-gray-800">{taskDetails.task_id}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Title:</p>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={editedTask.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAssignedToUser}
                />
              ) : (
                <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.title}</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-600">Description:</p>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedTask.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAssignedToUser}
                  rows={3}
                />
              ) : (
                <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-600">Priority:</p>
              {isEditing ? (
                <select
                  name="priority"
                  value={editedTask.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAssignedToUser}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.priority}</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-600">Status:</p>
              {isEditing ? (
                <select
                  name="status"
                  value={editedTask.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              ) : (
                <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.status}</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-600">Start Date:</p>
              {isEditing ? (
                <input
                  type="date"
                  name="start_date"
                  value={editedTask.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAssignedToUser}
                />
              ) : (
                <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.start_date}</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-600">Deadline:</p>
              {isEditing ? (
                <input
                  type="date"
                  name="deadline"
                  value={editedTask.deadline}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAssignedToUser}
                />
              ) : (
                <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.deadline}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-600">Duration:</p>
            <p className="text-gray-800">{taskDetails.duration} days</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Estimated Hours:</p>
            {isEditing ? (
              <input
                type="number"
                name="estimated_hours"
                value={editedTask.estimated_hours}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAssignedToUser}
              />
            ) : (
              <p onClick={handleEditClick} className="text-gray-800 cursor-pointer hover:underline">{taskDetails.estimated_hours} Hours</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-600">Assigned to:</p>
            <p className="text-gray-800">{taskDetails.assigned_to_username}</p>
          </div>
        </div>

        <div>
            {taskDetails.parent_id !== null && (
              <div className='mt-6'>
                <p className="text-xl font-semibold text-gray-700 mb-3">Main Task:</p>
                <ul className="space-y-2">
                  <li
                    key={taskDetails.task_id}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
                    onClick={() => handleMainTaskClick(taskDetails.parent_id)}
                  >
                    <span className="text-blue-600 hover:underline"> {taskDetails.parent_title} </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

        {taskDetails.status === 'Completed' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-600 mb-2">Worked Hours: <span className="text-gray-800">{taskDetails.working_hours} Hours</span></p>
            <h4 className="text-lg font-bold text-gray-700 mb-2">Upload File</h4>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mb-2">Selected file: {selectedFile.name}</p>
            )}
            <button
              onClick={() => handleFileUpload(taskDetails.task_id)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Attach File
            </button>
          </div>
        )}

        {subtasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Subtasks</h3>
            <ul className="space-y-2">
              {subtasks.map(subtask => (
                <li
                  key={subtask.task_id}
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
                  onClick={() => handleSubtaskClick(subtask.task_id)}
                >
                  <span className="text-blue-600 hover:underline">{subtask.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {comments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Comments</h3>
            <ul className="space-y-2">
              {comments.map((comment, index) => (
                <li key={index} className="p-2 border-b">
                  <p className="text-gray-700">{comment.created_by_username}: {comment.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Add a Comment</h3>
          <textarea
            value={newComment}
            onChange={handleCommentChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
            rows={3}
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 transition duration-300"
          >
            Submit
          </button>
        </div>

        {attachedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Attached Files</h3>
            <ul className="space-y-2">
            {attachedFiles.map((file, index) => (
              <div key={index}>
                  <a href={`http://localhost:5000/${file.attachment}`} target="_blank" rel="noopener noreferrer" download>
                    <img src={`http://localhost:5000/${file.attachment}`} alt="." />
                  </a>
                  <li className="p-2 border-b flex justify-between">
                    <a href={`http://localhost:5000/${file.attachment}`}  target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {file.attachment}
                    </a>
                    <p>Status: {file.status}</p>
                  </li>
               </div>
              ))}
            </ul>
          </div>
        )}

        {isEditing && (
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleSaveClick}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}