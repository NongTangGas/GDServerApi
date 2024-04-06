import React from 'react'
import Navbarprof from './Navbarprof'
import { Link } from 'react-router-dom'
import { useState } from 'react';

function ClassEdit() {
    const [showAlert, setShowAlert] = useState(false);

    const handleCreateClick = () => {
      // ทำสิ่งที่คุณต้องการเมื่อคลิกปุ่ม "Create" ที่นี่
      // เช่น สร้างข้อมูล หรือทำการตรวจสอบก่อนส่งข้อมูล
  
      // เมื่อคลิกปุ่ม "Create" ให้แสดงอัลเลิร์ต
      setShowAlert(true);
    }
  
    const [timestamps, setTimestamps] = useState(Array(2).fill('')); // กำหนดขนาดของอาร์เรย์ตามจำนวนที่ต้องการใช้งาน (ในที่นี้คือ 2)
    const handleUpload = (index) => {
      // Get the current date and time
      const now = new Date();
      const formattedTimestamp = now.toLocaleString();
  
      // Update the timestamp state
      setTimestamps(prevTimestamps => {
        const newTimestamps = [...prevTimestamps];
        newTimestamps[index] = formattedTimestamp;
        return newTimestamps;
      });
  };
        const [showModal, setShowModal] = useState(false);

        const handleShowModal = () => {
            setShowModal(true);
        };

        const handleCloseModal = () => {
            setShowModal(false);
        };

      const [classID, setClassID] = useState('');
      const [schoolYear, setSchoolYear] = useState('');
      const [semester, setSemester] = useState('');
      const [className, setClassName] = useState('');
  
      const handleClassIDChange = (e) => {
          setClassID(e.target.value);
        }
        
        const handleSchoolYearChange = (e) => {
          setSchoolYear(e.target.value);
        }
        
        const handleSemesterChange = (e) => {
          setSemester(e.target.value);
        }
        
        const handleClassNameChange = (e) => {
          setClassName(e.target.value);
        }
        const isCreateButtonDisabled = !classID || !schoolYear || !semester || !className;

  return (
    <div>
        <Navbarprof></Navbarprof> 
      <br></br>
      <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
        <div class="card-header">
          <h5>Edit Class</h5> 
        </div>
        <div class="card-body">
            <form class="row g-3">
                <div class="col-md-5">
                    <label for="inputID" class="form-label">Class ID*</label>
                    <input type="text" class="form-control" id="inputID" placeholder="ex. 2301233 (7 digits number)" value={classID} onChange={handleClassIDChange} />
                </div>
                <div class="col-md-5">
                    <label for="inputYear" class="form-label">School Year*</label>
                    <input type="text" class="form-control" id="inputYear" placeholder="ex. 2566 (4 digits number)" value={schoolYear} onChange={handleSchoolYearChange}/>
                </div>
                <div class="col-md-2">
                    <label for="inputSemester" class="form-label">Semester*</label>
                    <br></br>
                    <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="1" checked={semester === '1'}  onChange={handleSemesterChange}/>
                    <label class="form-check-label" for="inlineRadio1">1 </label>
                    </div>
                    <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="2" checked={semester === '2'} onChange={handleSemesterChange}/>
                    <label class="form-check-label" for="inlineRadio2">2</label>
                    </div>
                </div>
                <div class="col-12">
                    <label for="inputName" class="form-label">Class Name*</label>
                    <input type="text" class="form-control" id="inputClass" placeholder="Name" value={className} onChange={handleClassNameChange}/>
                </div>
                <div class="col-6">
                    <label for="formGroupExampleInput2" class="form-label">Class Picture</label>
                    <div class="input-group">
                        <input type="file" class="form-control" id="inputGroupFile01" aria-describedby="inputGroupFileAddon04" aria-label="Upload" />
                        <button class="btn btn-outline-primary" type="button" id="inputGroupFileAddon04" onClick={() => handleUpload(0)}>Upload</button>
                    </div>
                    {timestamps[0] && <p class="card-text">Last Submitted: <span>{timestamps[0]}</span></p>}
                </div>
                <div class="col-6">
                    <label for="formGroupExampleInput2" class="form-label">Student List</label>
                    <div class="input-group">
                        <input type="file" class="form-control" id="inputGroupFile02" aria-describedby="inputGroupFileAddon04" aria-label="Upload" />
                        <button class="btn btn-outline-primary" type="button" id="inputGroupFileAddon04" onClick={() => handleUpload(1)}>Upload</button>
                    </div>
                    {timestamps[1] && <p class="card-text">Last Submitted: <span>{timestamps[1]}</span></p>}
                </div>
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <Link to="/Homeprof">
                    <button type="submit" class="btn btn-primary">Back</button>
                    </Link>
                    <button type="submit" class="btn btn-primary" disabled={isCreateButtonDisabled} onClick={handleCreateClick}>Save</button>
                    <button type="button" class="btn btn-danger" onClick={handleShowModal}>Delete</button>
                </div>
            </form>
            {showAlert && (
                        <div className="alert alert-success d-flex align-items-center" role="alert">
                        Class updated successfully
                        {/*<pre>{JSON.stringify(submittedData, null, 2)}</pre>*/}
                        </div>
                    )}
            </div>
            </div>
            
             {/* Modal */}
             <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Remove Class</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Do you want to delete this class?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary">
                                 Delete
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        
      
    </div>
  )
}


export default ClassEdit