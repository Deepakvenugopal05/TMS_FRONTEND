import { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Forms() {
  

  const [title, setTitle] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const { project_id } = useParams();
  const navigate = useNavigate();

  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newTask = {
      title: title,
      start_date : start_date,
      end_date: end_date,
    };

    try {
      const response = await fetch(`http://localhost:5000/sprint/create_sprint/${project_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(newTask),
      });

      if (response.status === 201) {
        const data=await response.json()
        console.log(data);
        toast.success("Sprint created successfully!");
        setTitle("");
        setStartDate("");
        setEndDate("");
        navigate(`/forms/${data.project_id}/${data.sprint_id}`);
      } else {
        setMessage("Failed to create the project. Please try again.");
        toast.error("Failed to create the project. Please try again.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setMessage("Failed to create the project. Please try again.");
      toast.error("Failed to create the project. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white p-8 rounded-lg shadow-lg w-4/5 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create a New Sprint</h2>
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
            <label className="block text-gray-700">Start Date:</label>
            <input
              type="date"
              value={start_date}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">end_date:</label>
            <input
              type="date"
              value={end_date}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              min={new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0]}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Create Sprint
          </button>
          <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-500 hover:underline mt-4 block text-center"
        >
          Go to Dashboard
        </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Forms;
