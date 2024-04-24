import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

function Lab() {
  const navigate = useNavigate();
  const location = useLocation();
  const labData = location.state;

  const Email = labData.Email;
  const csyid = labData.classid;
  const speclab = labData.lab;
  const schoolYear = labData.schoolyear;

  const [assignmentData, setAssignmentData] = useState(null);
  const [fileSelectedMap, setFileSelectedMap] = useState({}); // Map to track file selection for each question
  const [submissionResponses, setSubmissionResponses] = useState({}); // Map to hold submission responses for each question
  const [userData, setUserData] = useState(null);
  const [classDetail, setClassDetail] = useState(null);

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/ST/user/profile?Email=${Email}`);
        const userdata = await response.json();
        console.log('user:', userdata);
        setUserData(userdata);
        console.log(userdata.ID);
        // Call fetchData here after setting userData
        fetchData(userdata.ID);
        fetchClassData(userdata.ID)
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    const fetchClassData = async (UID) => {
      try {
        const classResponse = await fetch(`http://127.0.0.1:5000/class/ST/data?CSYID=${csyid}&UID=${UID}`);
        const classData = await classResponse.json();
        setClassDetail(classData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchData = async (UID) => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/ST/assignment/specific?UID=${UID}&CSYID=${csyid}&speclab=${speclab}`);
        const data = await response.json();
        console.log(data);
        setAssignmentData(data);
        // Initialize fileSelectedMap with false values for each question
        const initialFileSelectedMap = {};
        Object.keys(data?.Questions || {}).forEach((questionKey) => {
          initialFileSelectedMap[questionKey] = false;
        });
        setFileSelectedMap(initialFileSelectedMap);
        // Initialize submissionResponses with empty strings for each question
        const initialSubmissionResponses = {};
        Object.keys(data?.Questions || {}).forEach((questionKey) => {
          initialSubmissionResponses[questionKey] = '';
        });
        setSubmissionResponses(initialSubmissionResponses);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserData();
  }, [csyid, speclab]);

  function generateBadge(status) {
    if (status){
      return (
          <h5>
              <span className={`badge bg-danger`}>
                  Late
              </span>
          </h5>
      );}
  }

  const handleFileChange = (event, questionKey) => {
    // Update fileSelectedMap for the specific question with the file selection status
    setFileSelectedMap((prevMap) => ({
      ...prevMap,
      [questionKey]: event.target.files.length > 0,
    }));
  };

  const handleSubmit = async (event, questionKey) => {
    event.preventDefault();
  
    const formData = new FormData();
    formData.append('file', event.target.file.files[0]);
    formData.append('UID',userData.ID)
    formData.append('CSYID',csyid)
    formData.append('Lab',speclab)
    formData.append('Question',questionKey.slice(1))
  
    try {
      const response = await fetch('http://127.0.0.1:5000/upload/SMT', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      console.log(responseData);
      // Update the submission response state for the specific question
      setSubmissionResponses((prevResponses) => ({
        ...prevResponses,
        [questionKey]:responseData,
      }));
    } catch (error) {
      console.error('Error submitting data:', error);
      // Update the submission response state for the specific question if there's an error
      setSubmissionResponses((prevResponses) => ({
        ...prevResponses,
        [questionKey]: 'An error occurred while uploading the file.',
      }));
    }
  };
  

  return (
    <div>
      <Navbar />
      <br />
      {userData && classDetail && assignmentData ? (
      <div className="media d-flex align-items-center">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <img className="mr-3" src={classDetail.Thumbnail ? "/Thumbnail/" + classDetail.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"}  style={{ width: '40px', height: '40px' }} />
          <h5>&nbsp;&nbsp;&nbsp;&nbsp; {classDetail.ClassID} {classDetail.ClassName} {classDetail.SchoolYear} Sec{classDetail.Section}</h5>
        </div>):("")}
      <br />
      <div className="container-lg p-3 mb-2 bg-light">
        <div className="row">
          <div className="col-sm-4">
            <div className="card border-primary mb-3 " style={{ padding: '10px', marginLeft: '2rem' }}>
              <div className="card-body">
                <h5 className="card-title">{assignmentData?.Lab}: {assignmentData?.Name}</h5>
                <p className="card-text">Due Date: {new Date(assignmentData?.Due).toLocaleString()}</p>
                <ul>
                    {assignmentData?.Files.map((file, index) => (
                        <li key={index}><a href={file} target="_blank">{file}</a></li>
                    ))}
                </ul>
              </div>
            </div>
            <br />
            <button className="btn btn-primary" style={{ marginLeft: '5em' }} onClick={() => navigate("/", { state: { Email: Email,classid: csyid } })}>Back</button>
          </div>
          <div className="col">
            {assignmentData?.Questions && Object.keys(assignmentData.Questions).map((questionKey, index) => {
              const question = assignmentData.Questions[questionKey];
              return (
                <div key={questionKey} className="row" style={{ marginBottom: '2rem' }}>
                  <div className="col-sm-10">
                    <div className="card">
                      <div className="card-body row">
                        <h5 className="card-title col-sm-4">Question {question.QuestionNum}</h5>
                        <p className="card-text col-sm-6" style={{ textAlign: 'right' }}>{submissionResponses[questionKey].message}</p>
                        <span className="col-sm-2">{generateBadge(question.Late)}</span>
                        
                        {/* Upload */}
                        <form 
                          action="http://127.0.0.1:5000/upload" 
                          method="POST" 
                          encType="multipart/form-data" 
                          className="row"
                          onSubmit={(event) => handleSubmit(event, questionKey)}
                        >
                          <div className="input-group mb-3">
                            <input 
                              type="file" 
                              name="file" 
                              className="form-control" 
                              onChange={(event) => handleFileChange(event, questionKey)} // Pass questionKey to handleFileChange
                            />
                          </div>
                          
                          <p className="card-text col-sm-9">Last submission: {submissionResponses[questionKey].FileName||question.Submission.FileName}</p>
                          <div className="col-sm-10" style={{ display: 'inline' }}>
                            <div className="row">
                              <p className="card-text col-sm-9">At: {submissionResponses[questionKey].At ? new Date(submissionResponses[questionKey].At).toLocaleString():question.Submission.Date ? new Date(question.Submission.Date).toLocaleString():""}</p>
                              <p className="card-text col-sm-3">Score: {submissionResponses[questionKey].Score||question.Score || '-'}/{question.MaxScore}</p>
                            </div>
                          </div>
              
                          <div className="col-sm-2" style={{ display: 'inline' }}>
                            <input 
                              type="submit" 
                              className="btn btn-primary" 
                              style={{ textAlign: 'right' }} 
                              disabled={!fileSelectedMap[questionKey]} // Disable the button if no file is selected for the specific question
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lab;
