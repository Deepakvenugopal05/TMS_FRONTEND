import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaExpandArrowsAlt } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { LuLogIn } from "react-icons/lu";
import { IoMdSearch } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";

import SearchModal from './SearchModal';
import TaskModal from './TaskModal';
import CommentsModal from './CommentsModal';

const fetchData = async () => {
  const access_token = sessionStorage.getItem('access_token');
  const response = await fetch('http://localhost:5000/task/get_all_tasks', {
    method: "GET",
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  let data = await response.json();
  data = data.tasks;
  console.log(data);
  return data;
};

const KanbanBoard = () => {
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false); 
  const [destination, setDestination] = useState(null);
  const userRole = sessionStorage.getItem('user_role');

  const [columns, setColumns] = useState({
    'Pending': [],
    'In Progress': [],
    'Completed': []
  });

  useEffect(() => {
    fetchData().then(data => {
      const updatedColumns = {
        'Pending': data.filter(task => task.status === 'Pending'),
        'In Progress': data.filter(task => task.status === 'In Progress'),
        'Completed': data.filter(task => task.status === 'Completed')
      };
      setColumns(updatedColumns);
    });
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

  const handleCardMove = async (result) => {
    console.log("result", result);
    const { source, destination, draggableId } = result;
  
    if (!destination) return;
  
    console.log("Destination", destination);
  
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
  
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const task = sourceColumn.find(task => task.task_id === parseInt(draggableId));
  
    const updatedSourceColumn = [...sourceColumn];
    updatedSourceColumn.splice(source.index, 1);
  
    const updatedDestColumn = [...destColumn];
    updatedDestColumn.splice(destination.index, 0, { ...task, status: destination.droppableId });
  
    const updatedColumns = {
      ...columns,
      [source.droppableId]: updatedSourceColumn,
      [destination.droppableId]: updatedDestColumn
    };
  
    setColumns(updatedColumns);
  
    const response = await fetch(`http://localhost:5000/task/edit_status/${task.task_id}`, {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: destination.droppableId })
    });
  
    if (!response.ok) {
      console.log("Columnss_destination", columns);
      setColumns(columns);
    } else {
      setSelectedTask(task);
      setDestination(destination);
      setShowCommentsModal(true);
    }
  };

  const handleHomeNavigation = () => {
    console.log("user role", userRole)
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'manager'){
      navigate('/manager')
    }
     else {
      navigate('/home');
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
    <>
    <div>
        <nav className=" bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Task Manager</div>
        <div className='flex gap-4'>
          <IoMdSearch className="mr-4 text-blue-500 " onClick={handleViewSearch} size={35} title={"search"}/>
          <IoHome onClick={handleHomeNavigation} className="mr-4 text-blue-500" size={35} title='Home' />
          <RxDashboard onClick={() => navigate('/dashboard')} className="mr-4 text-blue-500" size={35} title={"Dashboard"}/>
          <CgProfile onClick={() => navigate('/profile')} className="mr-4 text-blue-500" size={35} title='Profile' />
          <LuLogIn onClick={() => navigate('/login')} className="text-blue-500" size={35} title='Login'/>
        </div>
      </nav>
      </div>
   {/* <div className='bg-white shadow-lg p-4 font-bold'>Kanban</div> */}
    <DragDropContext onDragEnd={handleCardMove}>
      <div className="flex justify-between p-4 bg-gray-100 min-h-screen">
        {Object.keys(columns).map(columnKey => (
          <Droppable droppableId={columnKey} key={columnKey}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-white p-4 m-2 rounded-lg shadow-md w-1/3 overflow-auto"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800">{columnKey}</h2>
                {/* <h2 className="text-xl font-bold mb-4 text-gray-800">{columnKey}{columnKey === "Pending"&&(<h2 className='bg-slate-400'>{columnKey}</h2>)}</h2> */}
                {columns[columnKey].map((task, index) => (
                  <Draggable key={task.task_id} draggableId={task.task_id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
                          { task.parent_id !== null ? <button onClick={ () => navigate(`/task_details/${task.parent_id}`)} className="text-lg text-gray-700">Subtasks</button> : <span></span> }
                          <FaExpandArrowsAlt className="cursor-pointer" onClick={() => navigate(`/task_details/${task.task_id}`)} />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600"><strong>Description:</strong> {task.description}</p>
                          <p className="text-sm text-gray-600"><strong>Assigned to:</strong> {task.assigned_to_username}</p>
                          <p className="text-sm text-gray-600"><strong>Deadline:</strong> {task.deadline}</p>
                          <p className="text-sm text-gray-600"><strong>Priority:</strong> {task.priority}</p>
                          <p className="text-sm text-gray-600"><strong>Status:</strong> {task.status}</p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
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

            {showCommentsModal && selectedTask && (
                <CommentsModal
                taskId={selectedTask.task_id}
                status={destination.droppableId}
                onClose={() => setShowCommentsModal(false)}
                />
            )}
    </>
  );
};

export default KanbanBoard;