import React from 'react'
import Navbarprof from './Navbarprof'
import { Link } from 'react-router-dom'
import { useState } from 'react';

function AssignEdit() {
  const [showAlert, setShowAlert] = useState(false);

  const handleButtonClick = () => {
    setShowAlert(true);
  };

  
  const [publishDate, setPublishDate] = useState('');
  const [dueDate, setDueDate] = useState('');
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
        <div className="card text-left" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">Edit</a>
                    </li>
                    <li className="nav-item">
                     <Link to="/Sentin">
                        <button className="nav-link link" >Sent in</button>
                      </Link>
                    </li>
                </ul>
            </div>
            <div class="card-body">
        <form class="row g-3">
            <div class="col-md-6">
              <label for="LabNum" class="form-label">Lab Number</label>
              <input type="number" min="1"  class="form-control" id="LabNum"/>
            </div>
            <div class="col-md-6">
              <label for="LabName" class="form-label">Lab Name</label>
              <input type="name" class="form-control" id="LabName"/>
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
            <div class="col-12">
              <label for="inputlink" class="form-label">Attach Link</label>
              <input type="text" class="form-control" id="inputlink" placeholder="link1, link2"/>
            </div>
            
            <div class="col-md-6">
              <label for="inputQnum" class="form-label">Total Question Number</label>
              <input type="number" min="1" class="form-control" id="inputQnum"/>
            </div>
            <div class="col-md-6">
              <label for="inputState" class="form-label">Section</label>
              <select id="inputState" class="form-select">
                <option selected>Choose...</option>
                <option>1</option>
                <option>2</option>
                <option>All</option>
              </select>
            </div>
            
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/AssignList">
              <button type="bitton" class="btn btn-primary">Back</button> 
              </Link>
             
              <button type="button" class="btn btn-primary" onClick={handleButtonClick}>Save</button>
              
              <button type="button" class="btn btn-danger">Delete</button>
          </div>

          {showAlert && (
                  <div class="alert alert-success  d-flex align-items-center" role="alert">
                  Create assignment success
                  <button type="button" class="btn-close left" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
              )}
          
         
        </form>
          </div>
          
        </div>
    </div>
  )
}

export default AssignEdit