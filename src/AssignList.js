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
  const [classDetail, setClassDetail] = useState(null);

  const classData = location.state;
  const Email = classData.Email;
  const classId = classData.classid;
  
  console.log(classData)

  const [userData, setUserData] = useState(null);

  const [assignmentsData, setAssignmentsData] = useState(null);

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
        fetchClassData()
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchClassData = async () => {
      try {
        const classResponse = await fetch(`http://127.0.0.1:5000/class/TA/data?CSYID=${classId}`);
        const classData = await classResponse.json();
        setClassDetail(classData);

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
      {classDetail ? (
        <div className="media d-flex align-items-center">
        <span style={{ margin: '0 10px' }}></span>
        <img className="mr-3" src={classDetail.Thumbnail ? "/Thumbnail/" + classDetail.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"}  style={{ width: '40px', height: '40px' }} />
        <span style={{ margin: '0 10px' }}></span>
          <h5>{classDetail.ClassID} {classDetail.ClassName} {classDetail.SchoolYear}</h5>
          <h6></h6>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/StudentList", { state: { Email: Email,classid:classId} })} style={{ marginLeft: 40 + 'em' }}>Student lists</button>
      </div>
      ):("")}

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
      {assignmentsData ? (Object.keys(assignmentsData.Assignment).length === 0  ? (
        <div className="card" style={{ marginLeft: '10em', marginRight: '10em' }}>
          <div className="card-header">
            <h5 style={{ display: 'inline-block' }}>Assignments</h5>
            <span style={{ margin: '0 10px' }}></span>
            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => navigate("/AssignCreate", { state: { Email: Email, classid: classId } })}>+ New</button>
          </div>
          <div className="card-body">
            <ol className="list-group">
              <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-start" style={{ padding: '1rem' }}>
                <div className="ms-2 me-auto">
                  <div className="fw-bold" style={{ fontSize: 'larger' }}>
                    There is no assignment
                  </div>
                </div>
              </button>
            </ol>
          </div>
        </div>
        
      ) : (
        <div className="card" style={{ marginLeft: '10em', marginRight: '10em' }}>
          <div className="card-header">
            <h5 style={{ display: 'inline-block' }}>Assignments</h5>
            <span style={{ margin: '0 10px' }}></span>
            <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => navigate("/AssignCreate", { state: { Email: Email, classid: classId } })}>+ New</button>
          </div>
          <div className="card-body" style={{ overflowY: 'scroll' }}>
            <div>
              {Object.keys(assignmentsData.Assignment).map((labNumber, labIndex) => {
                const lab = assignmentsData.Assignment[labNumber];
                const isLabExpanded = expandedLabs[labIndex];
                return (
                  <div key={labIndex} className='card' style={{ marginBottom: '2rem' }} onClick={() => navigate("/AssignEdit", { state: { Email: Email, classid: classId, lab: labNumber, labname: lab.LabName } })}>
                    <button style={{ fontSize: '1.2rem', height: '4rem' }} class="fw-bold ">
                      <span>{`Lab ${labNumber}: ${lab.LabName}`}</span>
                      {Object.keys(lab.Section).length > 0 && (
                        <span style={{ marginLeft: '2rem', fontWeight: 'normal' }}>
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
      )) : ""}

    </div>
  )
}

export default AssignList;