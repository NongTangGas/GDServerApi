import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from './Navbar.js';
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const classData = location.state;
  const Email = classData.Email;
  const classId = classData.classid;

  const [assignmentData, setAssignmentData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [classDetail, setClassDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`http://127.0.0.1:5000/ST/user/profile?Email=${Email}`);
        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch class data
        const classResponse = await fetch(`http://127.0.0.1:5000/class/ST/data?CSYID=${classId}&UID=${userData.ID}`);
        const classData = await classResponse.json();
        setClassDetail(classData);

        // Fetch assignment data
        const assignmentResponse = await fetch(`http://127.0.0.1:5000/ST/assignment/all?SID=${userData.ID}&CID=${classId}`);
        const assignmentData = await assignmentResponse.json();
        setAssignmentData(assignmentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    
    fetchData();
  }, [Email, classId]);
  
  //Check TurnIn Late
  function CheckSend(labData) {
    let turnInCount = 0;
    let totalQuestions = 0;
    for (const question in labData) {
        if (question.startsWith("Q")) {
            totalQuestions++;
            if (labData[question].IsTurnIn) {
                turnInCount++;
            }}}
    return `${turnInCount}/${totalQuestions}`;
}

  //Check Status
  function generateBadge(labData) {
    const sendStatus = CheckSend(labData);
    const [turnInCount, totalQuestions] = sendStatus.split('/');
    
    // Convert string to numbers
    const numTurnIn = parseInt(turnInCount);
    const numTotalQuestions = parseInt(totalQuestions);

    const allTurnIn = numTurnIn === numTotalQuestions;
    
    let anyLate = false;

    // Iterate over each lab in labData
    for (const lab in labData) {
        if (Object.prototype.hasOwnProperty.call(labData, lab)) {
            // Iterate over each question in the lab
            for (const question in labData[lab]) {
                if (question.startsWith("Q")) {
                    // Check if the question is late
                    if (labData[lab][question].IsLate) {
                        anyLate = true;
                        break; // no need to continue checking if any question is late
                    }
                }
            }
        }
    }

    let status;
    if (allTurnIn) {
        status = 'Success';
    } else if (anyLate) {
        status = 'Late';
    } else {
        status = 'Waiting';
    }

    const badgeClass = status === 'Success' ? 'success' : status === 'Late' ? 'warning' : 'warning';
    const badgeText = `Submitted - (${turnInCount}/${totalQuestions})`;

    return (
        <h5>
            <span className={`badge bg-${badgeClass}`}>
                 {badgeText}
            </span>
        </h5>
    );
}




return (
  <div className="App">
    <Navbar />
    {userData && classDetail && assignmentData ? (
      <>
        <br />
        <div className="media d-flex align-items-center">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <img className="mr-3" src={classDetail.Thumbnail ? "/Thumbnail/" + classDetail.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"}  style={{ width: '40px', height: '40px' }} />
          <h5>&nbsp;&nbsp;&nbsp;&nbsp; {classDetail.ClassID} {classDetail.ClassName} {classDetail.SchoolYear} Sec{classDetail.Section}</h5>
        </div>
        <br />
        <div className="card text-left" style={{ marginLeft: '10em', marginRight: '10em' }}>
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <a className="nav-link active">Assignments</a>
              </li>
            </ul>
          </div>
          {assignmentData && Object.keys(assignmentData.Assignment).length > 0 ? (
            <div>
              {Object.keys(assignmentData.Assignment).map((lab) => {
                const labInfo = assignmentData.Assignment[lab];
                return (
                  <div key={lab} className="card-body">
                    <ol className="list-group">
                      <button onClick={() => navigate("/Lab", { state:{ Email: Email,lab:lab.slice(-1),classid:classId} })} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                        <div className="ms-2 me-auto">
                          <div className="fw-bold">
                            {lab}: {labInfo.Name}
                          </div>
                          <div className='row'>
                            <div className='col-sm-12'>Due date: {labInfo.Due}</div>
                            <div className='col-sm-12'>Score - ({labInfo.Score}/{labInfo.Maxscore})</div>
                          </div>
                        </div>
                        {generateBadge(labInfo)}
                      </button>
                    </ol>
                  </div>
                );
              })}
            </div>
          ) : (
            assignmentData && Object.keys(assignmentData.Assignment).length === 0 ? (
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
            ) : (
              <div className="card-body">
                <ol className="list-group">
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-start" style={{ padding: '1rem' }}>
                    <div className="ms-2 me-auto">
                      <div className="fw-bold" style={{ fontSize: 'larger' }}>
                        Loading...
                      </div>
                    </div>
                  </button>
                </ol>
              </div>
            )
          )}
        </div>
      </>
    ) : ("")}
  </div>
);
}

export default App;