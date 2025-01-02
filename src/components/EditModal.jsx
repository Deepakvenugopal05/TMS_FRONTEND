import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditForm = ({ editData, setShowModal }) => {
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const isAdmin = sessionStorage.getItem("user_role") === "admin";
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: '',
        status: '',
        start_date:'',
        deadline: '',
        Assigned_to: '',
    });
    // UseEffect to initialize the formData when the task is available
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
        if (editData) {
            setFormData({
                title: editData.title || '',
                description: editData.description || '',
                priority: editData.priority || '',
                status: editData.status || '',
                start_date: editData.start_date || '',
                deadline: editData.deadline || '',
                Assigned_to: editData.Assigned_to|| '',
            });
        }
    }, [editData]);



    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const access_token = sessionStorage.getItem('access_token');
    
        try {
            const response = await fetch(`http://localhost:5000/task/edit_task/${editData.task_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            console.log(formData.Assigned_to);
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Update failed:', errorData);
                alert(`Error: ${errorData.message}`);
            } else {
                setShowModal(false);
                console.log('Task updated successfully');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('An error occurred while updating the task');
        }
    };
    

    if (!editData) {
        // If task is undefined, show a loading indicator or message
        return <div>Loading...</div>;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Edit Task</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Priority:</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Deadline:</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    
                    <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Assign To:</label>
            {isAdmin ? (
              <>
                <select
                name = 'Assigned_to'
                  value={formData.Assigned_to}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  
                >
                  <option value="">Select a manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.username}</option>
                  ))}
                </select>
                <select
                  name = 'Assigned_to'
                  value={formData.Assigned_to}
                  onChange={handleChange}
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
                name = 'Assigned_to'
                value={formData.Assigned_to}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 mt-2"
                
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            )}
          </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Update Task
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditForm;
