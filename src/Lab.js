import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

function Lab() {
  const navigate = useNavigate();
  const location = useLocation();
  const labData = location.state;

  const classId = labData.classid;
  const speclab = labData.lab;
  const schoolYear = labData.schoolyear;

  const [assignmentData, setAssignmentData] = useState(null);
  const [fileSelectedMap, setFileSelectedMap] = useState({}); // Map to track file selection for each question
  const [submissionResponses, setSubmissionResponses] = useState({}); // Map to hold submission responses for each question

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/ST/assignment/specific?class_id=${classId}&speclab=${speclab}&school_year=${schoolYear}`);
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

    fetchData();
  }, [classId, speclab, schoolYear]);

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
  
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      console.log(responseData);
      // Update the submission response state for the specific question
      setSubmissionResponses((prevResponses) => ({
        ...prevResponses,
        [questionKey]: responseData.message,
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
      <div className="media d-flex align-items-center">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <img className="mr-3" src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" style={{ width: '40px', height: '40px' }} alt="Icon" />
        <h5>&nbsp;&nbsp;&nbsp;&nbsp; 210xxx comp prog 2566/2 sec1</h5>
      </div>
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
            <button className="btn btn-primary" style={{ marginLeft: '5em' }} onClick={() => navigate("/", { state: { classid: classId, schoolyear: schoolYear } })}>Back</button>
          </div>
          <div className="col">
            {assignmentData?.Questions && Object.keys(assignmentData.Questions).map((questionKey, index) => {
              const question = assignmentData.Questions[questionKey];
              return (
                <div key={questionKey} className="row" style={{ marginBottom: '2rem' }}>
                  <div className="col-sm-10">
                    <div className="card">
                      <div className="card-body row">
                        <h5 className="card-title col-sm-6">Question {question.QuestionNum}</h5>
                        <p className="card-text col-sm-5" style={{ textAlign: 'right' }}>{submissionResponses[questionKey]}</p>
                        
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
                          <div className="col-sm-10" style={{ display: 'inline' }}>
                            <p className="card-text">Last Submitted: {question.Submission.FileName}</p>
                            <div className="row">
                              <p className="card-text col-sm-6">At: {new Date(question.Submission.Date).toLocaleString()}</p>
                              <p className="card-text col-sm-6">Score: {question.Score}</p>
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
