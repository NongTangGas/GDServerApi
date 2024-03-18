import React from 'react'
import Navbarprof from './Navbarprof'
import { useState } from 'react';
import { Link } from 'react-router-dom';

function AssignCreate() {
  const [showAlert, setShowAlert] = useState(false);
  const [labNum, setLabNum] = useState('');
  const [labName, setLabName] = useState('');
  const [link, setLink] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [section, setSection] = useState('');
  const [totalQNum, setTotalQNum] = useState('');
  const [scores, setScores] = useState([]);
  const [submittedData, setSubmittedData] = useState(null); 
  // เพิ่ม state สำหรับเก็บข้อมูลที่ถูกส่งไป

  const handleTotalQNumChange = (e) => {
    const numQuestions = parseInt(e.target.value, 10);
    setTotalQNum(numQuestions);

    // Generate an array of scores based on the total number of questions
    const newScores = Array.from({ length: numQuestions }, (_, index) => ({
      id: index + 1,
      score: 1, // You can set the default score here
    }));
    setScores(newScores);
  };

  const handleScoreChange = (id, score) => {
    const updatedScores = scores.map((item) =>
      item.id === id ? { ...item, score } : item
    );
    setScores(updatedScores);
  };
  
  const isFormValid = () => {
    return labNum !== '' && labName !== '' && link !== '' && publishDate !== '' && dueDate !== '' && section !== '' && totalQNum !== '';
  };

  const handleButtonClick = () => {
  
  if (isFormValid()) {
    // Set submitted data
    const data = {
      labNum,
      labName,
      link,
      publishDate,
      dueDate,
      section,
      totalQNum,
      scores
    };
    setSubmittedData(data);

    // Reset the form fields
    setLabNum('');
    setLabName('');
    setLink('');
    setPublishDate('');
    setDueDate('');
    setSection('');
    setTotalQNum('');
    setScores([]);
    
    setShowAlert(true);
    console.log('Form submitted!');
  } else {
    // Show an error message or handle invalid form
    console.log('Please fill in all fields.');
  }
};


  const handleAlertClose = () => {
    // Hide the alert
    setShowAlert(false);
  };

  const now = new Date();
const currentDate = now.toISOString().split('T')[0];
  
  return (
    <div>
      <Navbarprof></Navbarprof> 
      <br></br>
      
      <div className="media d-flex align-items-center">
        <img className="mr-3" src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" style={{ width: '40px', height: '40px' }} />
        &nbsp;&nbsp;&nbsp; 
        <div className="card" style={{ width: '30rem', padding: '10px' }}>
            <h5>210xxx comp prog 2566/2 sec1</h5>
            <h6>Instructor: Name Surname</h6>
        </div>
      </div>
 
        <br></br>
      <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
        <div class="card-header">
          Create new assignment
        </div>
        <div class="card-body">
        <form class="row g-3">
            <div class="col-md-6">
              <label for="LabNum" class="form-label">Lab Number</label>
              <input type="number" min="1"  class="form-control" id="LabNum" onChange={(e) => setLabNum(e.target.value)}/>
            </div>
            <div class="col-md-6">
              <label for="LabName" class="form-label">Lab Name</label>
              <input type="name" class="form-control" id="LabName" onChange={(e) => setLabName(e.target.value)}/>
            </div>
            
            <div class="col-12">
              <label for="inputlink" class="form-label">Attach Link</label>
              <input type="text" class="form-control" id="inputlink" placeholder="link1, link2 or -" onChange={(e) => setLink(e.target.value)}/>
            </div>
            <div class="col-md-6">
            <label for="PublishDate" class="form-label">Publish Date</label>
            <input
              type="datetime-local"
              class="form-control"
              id="publishdate"
              onChange={(e) => {
                const selectedPublishDate = new Date(e.target.value);
                const currentDate = new Date();
                if (selectedPublishDate < currentDate) {
                  alert('Publish Date cannot be in the past.');
                  e.target.value = ''; // Clear the input value
                } else {
                  setPublishDate(e.target.value);
                }
              }}
              min={currentDate}
            />
          </div>
            <div class="col-md-6">
              <label for="DueDate" class="form-label">Due Date</label>
              <input
                type="datetime-local"
                class="form-control"
                id="duedate"
                onChange={(e) => {
                  const selectedDueDate = new Date(e.target.value);
                  const selectedPublishDate = new Date(publishDate);
                  if (selectedDueDate < selectedPublishDate) {
                    alert('Due Date must be after Publish Date.');
                    e.target.value = ''; // Clear the input value
                  } else {
                    setDueDate(e.target.value);
                  }
                }}
                min={currentDate}
              />
            </div>
            <div class="col-md-6">
              <label for="inputQnum" class="form-label">Total Question Number</label>
              <input type="number" min="1" class="form-control" id="inputQnum"  onChange={handleTotalQNumChange}/>
            </div>
            <div class="col-md-6">
              <label for="inputState" class="form-label">Section</label>
              <select id="inputState" class="form-select" onChange={(e) => setSection(e.target.value)}>
                <option selected>Choose...</option>
                <option>1</option>
                <option>2</option>
                <option>All</option>
              </select>
            </div>
                {scores.map((scoreItem) => (
                  <div key={scoreItem.id} class="col-md-2">
                    <label for={`inputScore${scoreItem.id}`} class="form-label">
                      Score Q.{scoreItem.id}
                    </label>
                    <input
                      type="number"
                      min="1"
                      class="form-control"
                      id={`inputScore${scoreItem.id}`}
                      value={scoreItem.score}
                      onChange={(e) => handleScoreChange(scoreItem.id, e.target.value)}
                    />
                  </div>
                ))}
            
            
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <Link to="/AssignList">
              <button type="button" class="btn btn-primary">Back</button>
              </Link> 
              <button type="button" class="btn btn-primary" id="liveToastBtn" onClick={handleButtonClick} disabled={!isFormValid()}>Submit</button>
          </div>

        {showAlert && (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          Assignment created successfully
          {/*<pre>{JSON.stringify(submittedData, null, 2)}</pre>*/}
          <button type="button" className="btn-close align-items-left" aria-label="Close" onClick={handleAlertClose}></button>
        </div>
      )}
   

        </form>
        </div>
     </div>     
</div>
    
  )
}

export default AssignCreate