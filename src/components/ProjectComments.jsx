import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProjectComments = ({ projectId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Fetch comments when the component is mounted
  useEffect(() => {
    fetchComments(projectId);
  }, [projectId]);

  const fetchComments = async (projectId) => {
    const access_token = sessionStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:5000/ProjectComments/get_project_comments/${projectId}`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);  // Directly set the comments from the response
      } else if (response.status === 404) {
        setComments([]);
      } else {
        toast.error("Failed to fetch comments!");
      }
    } catch (error) {
      toast.error("An error occurred while fetching comments.");
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    const access_token = sessionStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:5000/ProjectComments/create_project_comments/${projectId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          comments: newComment
        })
      });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      setNewComment('');
      fetchComments(projectId); // Refresh comments
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mt-4">
      <div>
        {comments.length > 0 ? (
          comments.map(comment => (
            <p key={comment.project_comment_id}>
              {comment.created_by_username}: {comment.content}
            </p>
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

export default ProjectComments;
