import React, { useState, useEffect } from 'react';
import Navbarprof from './Navbarprof'
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function AssignList() {
  
  const [expandedLabs, setExpandedLabs] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreate, setAssignCreate] = useState(false);
  const [isEdit, setAssignEdit] = useState(false);

  const classData = location.state;
  const Email = classData.Email;
  const classId = classData.classid;
  
  console.log(classData)

  const [userData, setUserData] = useState(null);

  const [assignmentsData, setAssignmentsData] = useState({
    "Assignment": {
      "1": {
        "LabName": "Genmaicha",
        "Section": {
          "1": {
            "Due": "Tue, 28 Nov 2023 14:45:00 GMT",
            "Publish": "Wed, 18 Oct 2023 14:45:00 GMT"
          },
          "2": {
            "Due": "Sat, 20 Jan 2024 14:45:00 GMT",
            "Publish": "Tue, 28 Nov 2023 14:45:00 GMT"
          }
        }
      }
    }
  });

  const handleToggleLab = (labIndex) => {
    setExpandedLabs((prevExpandedLabs) => ({
      ...prevExpandedLabs,
      [labIndex]: !prevExpandedLabs[labIndex],
    }));
  };

  useEffect(() => {
    console.log('getHome:',classData);

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/ST/user/profile?Email=${Email}`);
        const userdata = await response.json();
        console.log('user:', userdata);
        setUserData(userdata);
        console.log(userdata.ID);
        // Call fetchData here after setting userData
        fetchData(userdata.ID);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    const fetchData = async () => {
      try {
        console.log(classId)
        const response = await fetch(`http://127.0.0.1:5000/TA/class/Assign?CSYID=${classId}`);
        const data = await response.json();
        console.log(data);
        setAssignmentsData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    try{setAssignCreate(classData.statusCreate)}catch{}
    try{setAssignEdit(classData.statusEdit)}catch{}
    fetchUserData();
    fetchData()
  }, []);


  return (
    <div>
      <Navbarprof />

      <br></br>
      <div className="media d-flex align-items-center">
        <span style={{ margin: '0 10px' }}></span>
        <img className="mr-3" src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" style={{ width: '40px', height: '40px' }} />
        <span style={{ margin: '0 10px' }}></span>
        <div className="card" style={{ width: '30rem', padding: '10px' }}>
          <h5>210xxx comp prog 2566/2 sec1</h5>
          <h6>Instructor: Name Surname</h6>
        </div>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/StudentList", { state: { Email: Email,classid:classId} })} style={{ marginLeft: 40 + 'em' }}>Student lists</button>
      </div>

      <br></br>
      {isCreate && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                Assignment created successfully
              </div>
            )}
      {isEdit && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                Assignment Edit successfully
              </div>
            )}
      <div className="card" style={{ marginLeft: 10 + 'em', marginRight: 10 + 'em' }}>
        <div className="card-header">
          <h5 style={{ display: 'inline-block' }}>Assignments</h5>
          <span style={{ margin: '0 10px' }}></span>
            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => navigate("/AssignCreate", { state: { Email: Email,classid:classId} })} >+ New</button>
        </div>
        <div className="card-body" style={{ overflowY: 'scroll' }}>
          <div>
            {Object.keys(assignmentsData.Assignment).map((labNumber, labIndex) => {
              const lab = assignmentsData.Assignment[labNumber];
              const isLabExpanded = expandedLabs[labIndex];
              return (
                <div key={labIndex} className='card ' style={{ marginBottom: '2rem' }} onClick={() => navigate("/AssignEdit", { state: { Email: Email,classid:classId,lab:labNumber,labname:lab.LabName} })}>
                  <button  style={{ fontSize: '1.2rem', height:'4rem'}} class="fw-bold ">
                    <span>{`Lab ${labNumber}: ${lab.LabName}`}</span>
                    {Object.keys(lab.Section).length > 0 && (
                      <span style={{ marginLeft: '2rem', fontWeight:'normal'}}>
                        (First Publish: {lab.Section[Object.keys(lab.Section)[0]].Publish} | Last Due: {lab.Section[Object.keys(lab.Section)[Object.keys(lab.Section).length - 1]].Due})
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Link to="/Homeprof">
                <button type="button" className="btn btn-primary">Back</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignList;