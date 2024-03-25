import React from 'react'
import Navbarprof from './Navbarprof'
import { Link } from 'react-router-dom'
import { useState } from 'react';


function ClassCreate() {
  const [showAlert, setShowAlert] = useState(false);

  const handleAlertClose = () => {
      // Hide the alert
      setShowAlert(false);
    };


  const handleCreateClick = () => {
    // ทำสิ่งที่คุณต้องการเมื่อคลิกปุ่ม "Create" ที่นี่
    // เช่น สร้างข้อมูล หรือทำการตรวจสอบก่อนส่งข้อมูล

    // เมื่อคลิกปุ่ม "Create" ให้แสดงอัลเลิร์ต
    setShowAlert(true);
  }

  return (
    <div>
        <Navbarprof></Navbarprof> 
      <br></br>
      <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
        <div class="card-header">
          <h4>Create Class</h4> 
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
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <Link to="/Homeprof">
                    <button type="back" class="btn btn-primary" >Back</button>
                </Link>
                <div>
                    <button type="submit" class="btn btn-primary" onClick={handleCreateClick}>Create</button>
                    <br></br>   
                </div>
                
                </div>
                {showAlert && (
                        <div className="alert alert-success d-flex align-items-center" role="alert">
                        Class created successfully
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

export default ClassCreate