
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./components/Login";
import Dashboard from './components/Dashboard';
import Forms from './components/Forms';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import ProjectForm from './components/ProjectForm';
import AdminHome from './components/AdminHome';
import ManagerHome from './components/ManagerHome';
import CreateForms from './components/CreateForms';
import SprintForm from './components/SprintForm';
import SprintPage from './components/SprintPage';
import SprintTask from './components/SprintTask';
import AssignedTasksGrid from './components/AssignedTasksGrid';
import TaskDetailsPage from './components/TaskDetail'
import KanbanBoard from './components/KanbanBoard';
import { useEffect, useState } from 'react';


function App() {
  const [session, setSession] = useState("")
  useEffect(() => {
    const userRole = sessionStorage.getItem('user_role');
    setSession(userRole)
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/sprints' element={<SprintPage />} />
        <Route path='/sprint_tasks/:sprint_id' element={<SprintTask />} />
        <Route path='/project' element={<ProjectForm />} />
        <Route path='/sprint/:project_id' element={<SprintForm />} />
        <Route path='/forms/:project_id/:sprint_id' element={<Forms />} />
        <Route path='/home' element={<Home />} />
        <Route path="/admin" element={session === 'admin' ? <AdminHome /> : <Navigate to="/admin" />} />
        <Route path="/manager" element={session === 'manager' ? <ManagerHome /> : <Navigate to="/dashboard" />} />
        <Route path='/Profile' element={<Profile />} />
        <Route path='/dashboard_forms' element={<CreateForms />} />
        <Route path='/AssignedTasksGrid' element={<AssignedTasksGrid/>}/>
        <Route path="/task_details/:taskId" element={<TaskDetailsPage/>} />
        <Route path='/kanbanBoard' element={<KanbanBoard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
