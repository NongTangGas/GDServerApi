import React, { useState } from 'react';
import Navbarprof from './Navbarprof';
import axios from 'axios';

function Testernaja() {
  const [formData, setFormData] = useState({
    ClassName: '',
    ClassID: '',
    SchoolYear: ''
  });

  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('data1:', formData);
    try {
      const response = await axios.post('http://127.0.0.1:5000/PostTester', formData);
      console.log(response.data);
      console.log(response.data.message);
      console.log(response.data.Status);
    } catch (error) {
      console.error('Error:', error.response.data.Status);
    }
  };

  return (
    <div>
      <Navbarprof />
      <br />
      <form onSubmit={handleSubmit}>
        <input type="text" name="ClassName" placeholder="Class Name" onChange={handleChange} />
        <input type="text" name="ClassID" placeholder="Class ID" onChange={handleChange} />
        <input type="text" name="SchoolYear" placeholder="School Year" onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>} {/* Display response message */}
    </div>
  );
}

export default Testernaja;
