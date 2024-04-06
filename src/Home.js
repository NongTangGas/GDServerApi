import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.js';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [classData, setClassData] = useState(null);
  
  const Email = '6331234567@student.chula.ac.th';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`http://127.0.0.1:5000/ST/user/profile?Email=${Email}`);
        const userData = await userResponse.json();
        console.log('user:', userData);
        setUserData(userData);
  
        // Fetch class data if user data is available
        if (userData) {
          const classResponse = await fetch(`http://127.0.0.1:5000/ST/class/classes?UID=${userData.ID}`);
          const classData = await classResponse.json();
          console.log('class:', classData);
          setClassData(classData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <main>
      <div>
        <Navbar userData={userData}/>
        <br />
        <div className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
          <div className="row row-cols-md-5 g-4">
            {classData && classData.map((classItem, index) => (
              <div className="col mb-10" style={{ marginRight: '2rem' }} key={index}>
                <div className="card" style={{ width: '15rem'}}>
                  <img src={classItem.Thumbnail || "https://cdn-icons-png.flaticon.com/512/3643/3643327.png" } className="card-img-top" style={{ padding:'30px',width: '100%', height: '100%'}} alt="..." />
                  <div className="card-body">
                    <h5 className="card-title">{classItem.ClassID}</h5>
                    <div className="card-text">
                      <p style={{ display: 'inline-block', marginRight: '10px' }}className="card-text">{classItem.ClassName}</p>
                      <p style={{ display: 'inline-block', marginRight: '10px' }}>{classItem.SchoolYear}</p>
                      <p style={{ display: 'inline-block' }}>Sec{classItem.Section}</p>
                    </div>
                    <button onClick={() => navigate("/", { state: { Email: Email,classid: classItem.ID} })} className="btn btn-primary">View course</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
