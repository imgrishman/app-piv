import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import pivoraLogo from '../assets/pivora_black.svg';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  //const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin(username, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use admin/admin or user/user to login.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={pivoraLogo || "/placeholder.svg"} alt="Pivora Logo" />
      </div>
      
      <div className="login-card">
        <h1>Welcome back <span className="wave">👋</span></h1>
        <p className="subtitle">Log in your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-with-icon">
              <span className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 9a5 5 0 0 0-5 5v1h10v-1a5 5 0 0 0-5-5z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          
          <div className="input-group">
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          {/* <div className="form-footer">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>*/}
          
          <button type="submit" className="continue-button">Continue</button>
        </form>
        
        {/* <div className="signup-link"> */}
          {/* Don't have an account? <a href="#">Sign up</a> */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default Login;