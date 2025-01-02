import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { MdKeyboardVoice } from "react-icons/md";
import { useVoice } from './useVoice';

const SearchModal = ({ onClose, onSearch, results, onTaskClick }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { text, isListening, listen, voiceSupported } = useVoice();

  useEffect(() => {
    if (text.trim()) {
      setQuery(text);
    }
  }, [text]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg mt-10 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">
          <FiX />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Search Tasks</h2>
        <div className='flex justify-between gap-4'>
            <input
            type="text"
            placeholder="Search By title..."
            value={query}
            onChange={handleInputChange}
            className="border p-2 w-4/5 mb-4 "
            />  
        {voiceSupported && (
            <MdKeyboardVoice 
            onClick={listen}
            className={`p-2 rounded ${isListening ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`} size={35} title={"search"} />
        )}

          <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded mb-4 w-1/5">Search</button>

        </div>
        <div className="max-h-60 overflow-y-auto bg-white p-8 rounded-lg shadow-lg mt-10 w-full max-w-md relative">
          {results.map((task) => (
            <div key={task.task_id} className="border-b py-2">
              <div className='flex justify-between gap-4'> 
                <p className="text-gray-600">Task ID: {task.task_id}</p>
              </div>
              <button onClick={() =>  navigate(`/task_details/${task.task_id}`)} className="text-blue-500 hover:underline flex justify-between gap-4">
                {task.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;