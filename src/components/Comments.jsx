import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';


const Comments = ({ taskId }) => {
  console.log(taskId);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  console.log("Task_comments_id",taskId);
  // Fetch comments when the component is mounted
  useEffect(() => {
    fetchComments(taskId);
  }, [taskId]);

  const fetchComments = async (taskId) => {
    const access_token = sessionStorage.getItem('access_token');
    try{
      const response = await fetch(`http://localhost:5000/comments/tasks/${taskId}/comments`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      const data = await response.json();
      setComments(data)
    }
    catch (error) {
        toast.error("An error occurred while fetching comments.");
      }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    const access_token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:5000/comments/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        comments: newComment,
        task_id: taskId,
        created_by: sessionStorage.getItem('user_id') 
      })
    });

    if (response.ok) {
      setNewComment(''); // Clear the comment input
      fetchComments(taskId); // Refresh the comments after submission
    } else {
      toast.error("Failed to add comment.!!");
    }
  };


  return (
    <div className="mt-4">
      <div className='place-content-left'>
        {comments.length > 0 ? (
          comments.map(comment => (
            <p key={comment.comment_id}> {comment.created_by_username}: {comment.content}</p>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

      <textarea
        value={newComment}
        onChange={handleCommentChange}
        placeholder="Add a comment..."
        className="w-full p-2 mb-2 border rounded-lg focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleCommentSubmit}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Add Comment
      </button>
    </div>
  );
};

export default Comments;
