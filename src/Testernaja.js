import React, { useState } from 'react';
import Navbarprof from './Navbarprof';
import axios from 'axios';

function Testernaja() {
  const [formData, setFormData] = useState({
    ClassName: '',
    ClassID: '',
    Section: '',
    SchoolYear: '',
    file1: null,
    file2: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/TA/class/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data.message);
      // Redirect or show success message as needed
    } catch (error) {
      console.error('Error:', error.response.data.error);
      // Handle error (e.g., show error message)
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
        CSV<input type="file" name="file1" onChange={handleFileChange} />
        Thumbnail<input type="file" name="file2" onChange={handleFileChange} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Testernaja;
