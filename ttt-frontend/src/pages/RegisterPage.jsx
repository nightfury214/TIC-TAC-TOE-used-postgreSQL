// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from './axios';
import { useNavigate  } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate ();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isPasswordValid = password => {
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    const hasSpecial = /[^A-Za-z0-9]/;
    return (
      password.length >= 12 &&
      hasNumber.test(password) &&
      hasLetter.test(password) &&
      hasSpecial.test(password)
    );
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post('register/', form);
        navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };
  
  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          type="text"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
        /><br />
        <input
          name="last_name"
          type="text"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
        /><br />
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        /><br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
