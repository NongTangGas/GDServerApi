import React from 'react'
import Navbarprof from './Navbarprof'
import { Link } from 'react-router-dom'

function StudentList() {
  return (
    <div>
        <Navbarprof></Navbarprof>
      <br></br>
      
      <div className="media d-flex align-items-center">
        <img className="mr-3" src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" style={{ width: '40px', height: '40px' }} />
        &nbsp;&nbsp;&nbsp; 
        <div className="card" style={{ width: '30rem', padding: '10px',}}>
            <h5>210xxx comp prog 2566/2 sec1</h5>
            <h6>Instructor: Name Surname</h6>
        </div>
        <div class="d-grid gap-2 d-md-flex justify-content-between"style={{ marginRight: '40em' }}>
          <Link to="/AssignList">
            <button type="submit" class="btn btn-primary">Back</button>
          </Link>
            <button type="button" class="btn btn-secondary" >Export</button>
        </div>
      </div>
      <br></br>
        <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
            <div class="card-header">
            <strong> Student Name List </strong>
            </div>
            <div class="card-body">
                    <form class="d-flex">
                        <input class="form-control me-2" type="search" placeholder="id or name" aria-label="Search"/>
                        <button class="btn btn-outline-primary" type="submit">Search</button>
                    </form>
                    <br></br>
                    <ol class="list-group list-group-numbered">
                        <li class="list-group-item">6xxxxxxxxx Cras justo odio</li>
                        <li class="list-group-item">6xxxxxxxxx Cras justo odio</li>
                        <li class="list-group-item">6xxxxxxxxx Cras justo odio</li>
                    </ol>
            </div>
        </div>
    </div>
  )
}

export default StudentList