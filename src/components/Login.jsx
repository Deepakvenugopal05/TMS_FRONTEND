import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    const data = {
      email: email,
      password: password,
    };
    console.log(data)

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      console.log(response)

      if (response.ok) {
        const result = await response.json();
        console.log(result,"loginnnnn");
        sessionStorage.setItem('access_token', result.access_token);
        sessionStorage.setItem('user_role', result.user_role); // Store user role
        sessionStorage.setItem('user_id', result.user_id);

        console.log(result.user_role)
        toast.success("Logged in successfully!");
        if (result.user_role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error("Invalid credentials");
      }
    } catch (e) {
      console.log(e);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/forget_password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: forgotEmail,
          new_password: newPassword
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        setShowForgotPassword(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Log In
          </button>
        </form>
        <button
          onClick={() => setShowForgotPassword(true)}
          className="text-blue-500 hover:underline mt-4 block text-center"
        >
          Forgot Password?
        </button>

        {showForgotPassword && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Forgot Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleForgotPassword}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Submit
            </button>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition duration-300 mt-2"
            >
              Close
            </button>
          </div>
        )}
        <button
          onClick={() => navigate('/register')}
          className="text-blue-500 hover:underline mt-4 block text-center"
        >
          Don't have an account? Register here.
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;