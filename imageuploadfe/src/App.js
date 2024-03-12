// App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    try {
      await axios.post('http://localhost:5000/signup', { username, password });
      alert('User created successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setToken(response.data.accessToken);
      // alert(token);
      alert("Logged in successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      });
      // setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      alert('Upload Sucessful');
      setMessage('Image uploaded successfully');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Image Upload App</h1>
      <div className="form-group">
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="form-group">
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="form-group">
        <button onClick={handleSignup}>Sign Up</button>
        <button onClick={handleLogin}>Login</button>
      </div>
      <div className="form-group">
        <input id="fileInput" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      </div>
      <div className="form-group">
        <button onClick={handleUpload}>Upload Image</button>
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default App;
