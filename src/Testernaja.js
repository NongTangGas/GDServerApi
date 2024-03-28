import React, { useState } from 'react';
import Navbarprof from './Navbarprof';
import axios from 'axios';

function Testernaja() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [PreData, setFormData] = useState({
    SchoolYear: '',
    ClassID: '',
    file: null, // Initialize file as null
  });

  const handleChange = (e) => {
    console.log(e.target);
    if (e.target.name === 'file') {
      const file = e.target.files[0];
      setFormData({
        ...PreData,
        file: file
      });
    } else {
      setFormData({
        ...PreData,
        [e.target.name]: e.target.value
      });
    }
  };
  
  const handleGetStudent = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://127.0.0.1:5000/TA/Student/List?class_id=${PreData.ClassID}&school_year=${PreData.SchoolYear}`);
    const data = await response.json();
    console.log(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(PreData)
    const formData = new FormData();
    formData.append('ClassID', PreData.ClassID);
    formData.append('SchoolYear', PreData.SchoolYear);
    formData.append('file', PreData.file);


    try {
      const response = await fetch('http://127.0.0.1:5000/upload/CSV', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      console.log(responseData);
      // Update the submission response state for the specific question
      console.log('response:',responseData)
      console.log('Data submitted successfully!');
      /* setMessage(response.data.message);
      setError(''); */
    } catch (error) {
      console.error('Error submitting data:', error);
      /* setMessage('');
      setError(error.response.data.error); */
    }
  };

  return (
    <div>
      <Navbarprof />
      <div className="container">
        <h2>Upload CSV File</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="classID" className="form-label">Class ID:</label>
            <input type="text" className="form-control" id="ClassID" name="ClassID" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="schoolYear" className="form-label">School Year:</label>
            <input type="text" className="form-control" id="SchoolYear" name="SchoolYear" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="file" className="form-label">Choose CSV File:</label>
            <input type="file" className="form-control" id="file" name="file" onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary">Upload</button>
        </form>
        {message && <div className="alert alert-success mt-3" role="alert">{message}</div>}
        {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
      </div>
      <button className="btn btn-primary" onClick={handleGetStudent}>getStudentList</button>
    </div>
  );
}

export default Testernaja;
