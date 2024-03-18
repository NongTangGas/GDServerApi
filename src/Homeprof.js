import React, { useState, useEffect } from 'react';
import Navbarprof from './Navbarprof'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';

function Homeprof() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [classData, setClassData] = useState(null);
  
  const Email = '9876543210@student.chulac.ac.th';
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/ST/user/profile?Email=${Email}`);
        const data = await response.json();
        console.log('user:', data);
        setUserData(data);
        //กลับมาเพิ่ม checkRole ด้วย
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

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
    fetchUserData();
    fetchClassData();
  }, []);

  return (
    <div>
      <Navbarprof/>
      <br></br>
        <div className="d-flex align-items-center">
          <h5 className="me-2">Course</h5>
          <button onClick={() => navigate("/ClassCreate", { state: { Email: Email} })} className="btn btn-outline-secondary" type="button" id="button-addon2">+ New</button>
        </div>

        <main>
      <div>
        <br />
        <div className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
          <div className="row row-cols-md-5 g-4">
            {classData && classData.map((classItem, index) => (
              <div className="col mb-10" style={{ marginRight: '2rem' }} key={index}>
                <div className="card" style={{ width: '15rem'}}>
                  <img src={classItem.Thumbnail} className="card-img-top" style={{ padding:'30px',width: '100%', height: '100%'}} alt="..." />
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