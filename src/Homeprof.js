import React, { useState, useEffect } from 'react';
import Navbarprof from './Navbarprof'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';
import axios from 'axios';

function Homeprof() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const Email = '9876543210@student.chulac.ac.th';


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [formData, setFormData] = useState({
    Creator: '',
    ClassName: '',
    ClassID: '',
    SchoolYear: ''
  });

  

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/class/classes?Email=${Email}`);
        const data = await response.json();
        console.log('class:', data);
        setClassData(data);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };
  
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/ST/user/profile?Email=${Email}`);
        const data = await response.json();
        console.log('user:', data);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
    fetchClassData();
  }, []);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
    setFormData({
      Creator: userData.Email,
      ClassName: '',
      ClassID: '',
      SchoolYear: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      Creator: userData.Email,
      ClassName: '',
      ClassID: '',
      SchoolYear: ''
    });
    setExpanded(false);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleCreateClick = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    try {
      const response = await axios.post('http://127.0.0.1:5000/TA/class/create', formData);
      if (response.data.Status) {
        console.log("True"); // Log "True" if response.data is true
        setShowAlert(true);
      } else {
        console.log("False"); // Log "False" if response.data is false
      }
      
    } catch (error) {
      console.error('Error');
    }
  };

  return (
    <div>
      <Navbarprof />
      {showAlert && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    Class created successfully
                    <button type="button" className="btn-close align-items-right" aria-label="Close" onClick={handleAlertClose}></button>
                  </div>
                )}
      <br />
      <div className="d-flex align-items-center">
        <h5 className="me-2">Course</h5>
        <button onClick={() => navigate("/ClassCreate", { state: { Email: Email } })} className="btn btn-outline-secondary" type="button" id="button-addon2">+ New</button>
        {!expanded ? (
          <button onClick={handleToggleExpand} className="btn btn-outline-secondary" type="button" id="button-addon2">+ New</button>
        ) : (
          <div className="card" style={{ marginLeft: '10em', marginRight: '10em', width: '640px' }}>
            <div className="card-header">
              <h4>Create Class</h4>
            </div>
            <div className="card-body">
              <form className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="inputID" className="form-label">Class ID</label>
                  <input type="text" name="ClassID" className="form-control" id="inputID" onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label htmlFor="inputYear" className="form-label">School Year</label>
                  <input type="text" name="SchoolYear" className="form-control" id="inputYear" onChange={handleChange} />
                </div>
                <div className="col-6">
                  <label htmlFor="inputName" className="form-label">Class Name</label>
                  <input type="text" name="ClassName" className="form-control" id="inputClass" onChange={handleChange} />
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="button" className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                  <div>
                    <button type="button" className="btn btn-primary" onClick={handleCreateClick}>Create</button>
                    <br />
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
        
        

        <main>
      <div>
        <br />
        <div className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
          <div className="row row-cols-md-5 g-4">
            {classData && classData.map((classItem, index) => (
              <div className="col mb-10" style={{ marginRight: '2rem' }} key={index}>
                <div className="card" style={{ width: '15rem'}}>
                  <img src={classItem.Thumbnail||"https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} className="card-img-top" style={{ padding:'30px',width: '100%', height: '100%'}} alt="..." />
                  <div className="card-body">
                    <h5 className="card-title">{classItem.ClassID}</h5>
                    <div className="card-text">
                      <p style={{ display: 'inline-block', marginRight: '10px' }}className="card-text">{classItem.ClassName}</p>
                      <p style={{ display: 'inline-block', marginRight: '10px' }}>{classItem.SchoolYear}</p>
                      <p style={{ display: 'inline-block' }}>Sec{classItem.Section}</p>
                    </div>
                    <button onClick={() => navigate("/AssignList", { state: { classid: classItem.ClassID, schoolyear: classItem.SchoolYear } })} className="btn btn-primary">View course</button>
                  </div>
                  <div class="card-footer">
                  <Link onClick={() => navigate("/ClassEdit", { state: { classid: classItem.ClassID, schoolyear: classItem.SchoolYear } })}>Edit</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>

    </div>
  )
}

export default Homeprof
