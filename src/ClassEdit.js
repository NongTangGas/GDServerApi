import React from 'react'
import Navbarprof from './Navbarprof'
import { Link } from 'react-router-dom'

function ClassEdit() {
  return (
    <div>
        <Navbarprof></Navbarprof> 
      <br></br>
      <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
        <div class="card-header">
          <h4>Edit Class</h4> 
        </div>
        <div class="card-body">
            <form class="row g-3">
                <div class="col-md-6">
                    <label for="inputID" class="form-label">Class ID</label>
                    <input type="text" class="form-control" id="inputID"/>
                </div>
                <div class="col-md-6">
                    <label for="inputYear" class="form-label">School Year</label>
                    <input type="text" class="form-control" id="inputYear"/>
                </div>
                <div class="col-6">
                    <label for="inputName" class="form-label">Class Name</label>
                    <input type="text" class="form-control" id="inputClass" placeholder="Name"/>
                </div>
                <div class="col-6">
                    <label for="inputSection" class="form-label">Section No.</label>
                    <input type="number" min="1" class="form-control" id="inputSection"/>
                </div>
                <div class="col-6">
                    <label for="formGroupExampleInput2" class="form-label">Class Picture</label>
                    <div class="input-group">
                    <input type="file" class="form-control" id="inputGroupFile01" aria-describedby="inputGroupFileAddon04" aria-label="Upload"/>
                    <button class="btn btn-outline-primary" type="button" id="inputGroupFileAddon04">Upload</button>
                    </div>
                </div>
                <div class="col-6">
                    <label for="formGroupExampleInput2" class="form-label">Student List</label>
                    <div class="input-group">
                    <input type="file" class="form-control" id="inputGroupFile02" aria-describedby="inputGroupFileAddon04" aria-label="Upload"/>
                    <button class="btn btn-outline-primary" type="button" id="inputGroupFileAddon04">Upload</button>
                    </div>
                </div>
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <Link to="/Homeprof">
                    <button type="submit" class="btn btn-primary">Back</button>
                    </Link>
                    <button type="submit" class="btn btn-primary">Save</button>
                    <button type="button" class="btn btn-danger">Delete</button>
                </div>
            </form>
            </div>
            </div>
      
        
      
    </div>
  )
}


export default ClassEdit