import React from 'react'
import Navbarprof from './Navbarprof'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function AssignList() {
  const navigate = useNavigate();
  const [assignmentsData, setAssignmentsData] = useState([
    {
      Assignment: {
        Lab1: {
          Name: "helloworld",
          Publish: "12 Dec 2012",
          Due: "18 Dec 2012",
          LabNumber:"1",
        },
        
      },
    },])

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
        <Link to="/StudentList">
        <button type="button" class="btn btn-secondary" style={{ marginLeft: 40 +'em'}}>Student lists</button>
        </Link>
      </div>

      <br></br>
      <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
        <div class="card-header">
          Assignments
          <span style={{ margin: '0 10px' }}></span>
          <Link to="/AssignCreate">
          <button class="btn btn-outline-secondary" type="button" id="button-addon2">+ New</button>
          </Link>
        </div>
        <div class="card-body">
        <div>
                {assignmentsData.map((assignment, assignmentIndex) => (
                  <div key={assignmentIndex}>
                    {Object.keys(assignment.Assignment).map((labName, labIndex) => {
                      const labInfo = assignment.Assignment[labName];
                      return (
                        <div key={labIndex} className="card-body">
                          <ol className="list-group">
                            <button onClick={() => navigate("/AssignEdit")} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                              <div className="container">
                                <div class= "row align-items-start">
                                  <div class="col">
                                    <div className="fw-bold">
                                    Lab{labInfo.LabNumber}: {labInfo.Name}
                                    </div>
                                  </div>
                                  <div class="col">
                                    <span className="fw-bold">Publish:</span> {labInfo.Publish}
                                  </div>
                                  <div class="col">
                                    <span className="fw-bold">Due:</span> {labInfo.Due}
                                  </div>
                                </div>
                                </div>
              
                            </button>
                          </ol>
                        </div>

                      );
                    })}
                  </div>
                ))}
              </div>
        </div>
      </div>




    </div>
  )
}

export default AssignList