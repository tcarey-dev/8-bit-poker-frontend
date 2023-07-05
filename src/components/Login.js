import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Errors from "../Errors";
import AuthContext from "../contexts/AuthContext";
import { authenticate } from "../services/authApi";
import "nes.css/css/nes.min.css";
import "./login.css";

function LoginForm() {

  const [errors, setErrors] = useState([]);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();

  const auth = useContext(AuthContext);

  const handleChange = (evt) => {
    const nextCredentials = { ...credentials };
    nextCredentials[evt.target.name] = evt.target.value;
    setCredentials(nextCredentials);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    authenticate(credentials).then(player => {
      auth.onAuthenticated(player);
      navigate('/lobby');
    })
    .catch(err => setErrors(err));
  };

  return <div className="container-fluid">
    {/* <h1>{auth.player.username}</h1> */}
    <div id="loginFormBorder" className="nes-container is-rounded with-title">
      <h2 id="logInTitle" className="title">Log In</h2>
      <Errors errors={errors} />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text"
                     className="nes-input" 
                     id="username" 
                     name="username" 
                     value={credentials.username} 
                     onChange={handleChange} 
                     required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" 
                     className="nes-input" 
                     id="password" 
                     name="password" 
                     value={credentials.password}
                     onChange={handleChange} 
                     required />
            </div>      
            <div className="mb-3">
              <button id="buttonYes" type="submit" className="nes-btn is-primary">
                LOGIN
              </button>
              <Link to="/landing" id="buttonNo" type="button" className="nes-btn is-error">
                CANCEL
              </Link>
            </div>
          </form>
    </div>
    
  </div>;
}

export default LoginForm;