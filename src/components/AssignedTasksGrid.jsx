import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';




const AssignedTasksGrid = () => {
    const [rowData, setRowData] = useState([]);

    const DurationCellRender = (params) => {
        return(
            <div>
                {params.value} days
            </div>
        )
    }

    const EstimatorHoursCellRender = (params) => {
        return (
            <div>
                {params.value} Hours
            </div>
        )
    }

    const DeadlineCellRenderer = (params) => {
        console.log("paramas",params);
        const currentDate = new Date();
        const endDate = new Date(params.value);
    
        const isDeadlinePassed = endDate < currentDate;
    
        const cellStyle = {
            backgroundColor: isDeadlinePassed ? '#fa6161' : 'transparent',
            color: isDeadlinePassed ? 'white' : 'inherit',
        };
    
        return (
            <div style={cellStyle}>
                {params.value}
            </div>
        );
    };

    const titleCellRenderer = (params) => {
        return (
            <Link to={`/task_details/${params.data.task_id}`}>
                {params.value}
            </Link>
        );
    };

    const subtaskIcon = (params) => {
        if (params.value !== null){
            return (
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-schema">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 2h5v4h-5z" />
                        <path d="M15 10h5v4h-5z" />
                        <path d="M5 18h5v4h-5z" />
                        <path d="M5 10h5v4h-5z" />
                        <path d="M10 12h5" />
                        <path d="M7.5 6v4" />
                        <path d="M7.5 14v4" />
                    </svg>
                </div>
            )
        }
    }

    const [colDefs] = useState([
        { field: "project_name", headerName: "Project Name"},
        { field: "sprint_name", headerName: "Sprint Name" },
        { field: "task_id", headerName: "Task ID"},
        { field: "title", headerName: "Title", cellRenderer: titleCellRenderer},
        { field: "parent_id", headerName: " ", cellRenderer: subtaskIcon },
        { field: "description", headerName: "Description" },
        { field: "priority", headerName: "Priority" },
        { field: "status", headerName: "Status" },
        { field: "start_date", headerName: "Start Date" },
        { field: "deadline", headerName: "Deadline", cellRenderer: DeadlineCellRenderer },
        { field: "duration", headerName: "Duration",cellRenderer: DurationCellRender },
        { field: "created_username", headerName: "Created_by" },
        { field: "estimated_hours", headerName: "Estimated Hours", cellRenderer: EstimatorHoursCellRender }
    ]);

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 150,
            filter: "agTextColumnFilter",
            suppressHeaderMenuButton: true,
            suppressHeaderContextMenu: true,
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const access_token = sessionStorage.getItem('access_token');
                const response = await fetch('http://localhost:5000/task/get_all_tasks', {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${access_token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Grid Data:", data);
                    console.log("tasks", data.tasks);
                    setRowData(data.tasks || []);
                } else {
                    console.error("Failed to fetch tasks:", response.statusText);
                }
            } catch (error) {
                console.error("An error occurred while fetching tasks:", error);
            }
        };
        fetchData();
    }, []);

    console.log(...rowData, "rowdata");

    return (
        
        <div
            className="ag-theme-quartz"
            style={{ width: '100%', height: '300px' }}
        >
            <AgGridReact 
                rowData={rowData} 
                columnDefs={colDefs} 
                defaultColDef={defaultColDef} 
            />
        </div>
    );
};

export default AssignedTasksGrid;