import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const CommentsModal = ({ taskId,status, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/comments/tasks/${taskId}/comment`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      console.log("Comments :", data);
      if (response.ok) {
        setComments(data);
      } else {
        toast.error("Failed to fetch comments.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching comments.");
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/comments/post_tasks_comments/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      console.log("Comment body", JSON.stringify({ comment: newComment }));
      if (response.ok) {
        toast.success('Comment added successfully');
        setNewComment('');
        fetchComments();
      } else {
        toast.error('Failed to add comment.');
      }
    } catch (error) {
      toast.error('An error occurred while adding the comment');
    }
  };

  const handleFileChange = (e) => {
    setAttachments(e.target.files[0]);
    console.log(attachments);
    console.log(e.target.files[0]); 
  };
  
  const handleUploadAttachments = async () => {
    if (attachments.length === 0) {
      toast.error("No files selected");
      return;
    }
  
    const formData = new FormData();

    formData.append('attachments', attachments)
    formData.append('task_id', taskId);
    formData.append('status', status); 
  
    try {
      const response = await fetch(`http://localhost:5000/attachment/post_attachment/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        toast.success("Attachments uploaded successfully");
        setAttachments([]);
        setFileNames([]);
      } else {
        toast.error("Failed to upload attachments");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while uploading attachments");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg w-1/2">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="max-h-60 overflow-y-auto mb-4">
          {comments.map((comment, index) => (
            <div key={index} className="border-b py-2">
              <p className="text-gray-700">{comment.created_by_username} : {comment.content}</p>
            </div>
          ))}
        </div>
        <div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white p-2 rounded-lg ml-2 hover:bg-blue-600 transition duration-300"
          >
            Add
          </button>
        </div>
        <div className="mt-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mb-2"
          />
          <button
            onClick={handleUploadAttachments}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Upload Attachments
          </button>
          <div className="mt-2">
            {fileNames.map((fileName, index) => (
              <p key={index} className="text-gray-700">{fileName}</p>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white p-2 rounded-lg mt-4 hover:bg-gray-600 transition duration-300"
        >
          Close
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CommentsModal;