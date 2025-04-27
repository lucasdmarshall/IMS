import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login(email, password);
      
      console.log('Login response:', {
        user: response.data.user,
        token: response.token
      });
      
      // Store token in local storage
      localStorage.setItem('token', response.token);
      console.log('Token stored in localStorage:', response.token);

      // Use the login method from AuthContext
      login(response.data.user, response.token);
      
      // Show success message
      message.success('Login successful');
    } catch (err) {
      // Handle login errors
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      message.error(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-300 shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-dark-foreground">Inventory Management</h2>
            <p className="text-dark-muted mt-2">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block text-dark-muted text-sm font-bold mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 
                  bg-dark-200 text-dark-foreground border-dark-primary 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="mb-6 relative">
              <label 
                htmlFor="password" 
                className="block text-dark-muted text-sm font-bold mb-2"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 
                  bg-dark-200 text-dark-foreground border-dark-primary 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-dark-muted"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="mb-4 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded 
                  focus:outline-none focus:shadow-outline w-full"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
