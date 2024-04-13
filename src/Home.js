import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.js';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState(null);
  const [classes, setClasses] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);
  const [ready, setReady] = useState(null);

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
          const sortedCourses = Object.fromEntries(Object.entries(classData).sort((a, b) => b[0].localeCompare(a[0])));
          setClasses(sortedCourses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/TA/class/classes?Email=${Email}`);
        const data = await response.json();
        console.log('class:', data);
        const sortedCourses = Object.fromEntries(Object.entries(data).sort((a, b) => b[0].localeCompare(a[0])));
    
        setCourses(sortedCourses);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    fetchData()
    fetchCourses()
    setReady(true);
  }, []);
  
  const toggleYear = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  return (
    
    <main>
      <div>
        <Navbar userData={userData}/>
        <br />
      </div>
      {courses && ready ? (
        <main>
          <div>
            <br></br>
            {/* วนลูปเพื่อแสดง container แยกตามปีการศึกษา */}
            {Object.entries(courses).map(([year, classes]) => (
              <div key={year} className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
                  <div className="row row-cols-1 row-cols-md-5 g-2">
                    {/* วนลูปเพื่อแสดงข้อมูลคอร์สในแต่ละปีการศึกษา */}
                    {classes.map(course => (
                      <div key={course.ID} className="col">
                        <div className="card h-100" style={{width: '15rem'}}><div>
                          <img src={course.Thumbnail ? "/Thumbnail/" + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} className="card-img-top" style={{ padding:'15px',width: '100%', height: '100%'}}  alt="..."/>
                          </div>
                          <div className="card-body" style={{ overflowY: 'scroll', height:'10rem',margin:'0',paddingBottom:"0"}}>
                            <h5 style={{margin:"0"}} className="card-title">{course.ClassName}</h5>
                            <p style={{margin:"0",marginTop:"5px"}} className="card-text">{course.ClassID}</p>
                            <p style={{margin:"0",marginBottom:"15px"}} className="card-text">{year}</p>
                            <button onClick={() => navigate("/AssignList", { state: { Email: Email,classid: course.ID} })} className="btn btn-primary">View course</button>
                          </div>
                          <div className="card-footer">
                            <Link onClick={() => navigate("/ClassEdit", { state: { Email: Email,classid: course.ID} })} className="lini text-muted">Edit</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            ))}
          </div>
        </main>
      ) : (null)}

      {(classes && Object.keys(classes).length > 0) && ready ? (
          <div>
            <br></br>
            {/* วนลูปเพื่อแสดง container แยกตามปีการศึกษา */}
            {Object.entries(classes).map(([year, classes]) => (
              <div key={year} className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
                <div className='btn align-items-left' style={{width:'100%'}}>
                    <h5 className="text-start" onClick={() => toggleYear(year)} style={{ cursor: 'pointer' }}>
                        {year} {expandedYear === year ? " (- Click to collapse)" : " (+ Click to expand)"}
                    </h5>
                </div>

                {expandedYear === year && (
                  <div className="row row-cols-1 row-cols-md-5 g-2">
                    {/* วนลูปเพื่อแสดงข้อมูลคอร์สในแต่ละปีการศึกษา */}
                    {classes.map(course => (
                      <div key={course.ID} className="col">
                        <div className="card h-100" style={{width: '15rem'}}><div>
                          <img src={course.Thumbnail ? "/Thumbnail/" + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} className="card-img-top" style={{ padding:'15px',width: '100%', height: '100%'}}  alt="..."/>
                          </div>
                          <div className="card-body" style={{ overflowY: 'scroll' }}>
                            <h5 className="card-title">{course.ClassName}</h5>
                            <p className="card-text">{course.ClassID}</p>
                            <p className='card-text'>Sec{course.Section}</p>
                            <button onClick={() => navigate("/", { state: { Email: Email,classid: course.ID} })} className="btn btn-primary">View course</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
      ) : (
        <div className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
          <div className='align-items-left' style={{width:'100%'}}>
            <h5 className="text-start"style={{ cursor: 'pointer' }}>
              There is no class
            </h5>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
