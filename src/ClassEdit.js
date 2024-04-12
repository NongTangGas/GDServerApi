import Navbarprof from './Navbarprof'
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react';

function ClassEdit() {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);

    const location = useLocation();
    const classData = location.state;
    const Email = classData.Email;
    const CSYID = classData.classid;

    const [classID, setClassID] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [className, setClassName] = useState('');

    
    useEffect(() => {
        const PreData = async () => {
            if (classData) {
            setClassID(classData.ClassID||"");
            setSchoolYear(classData.SchoolYear||"");
            setClassName(classData.ClassName||"");
        }}
        PreData();
        
      }, [classData]);

    const handleEditClick = async () => {
        const formData = new FormData();
        formData.append('ClassName', className);
        formData.append('ClassID',classID)
        formData.append('SchoolYear',schoolYear)
        formData.append('CSYID',CSYID)
  
    try {
        const response = await fetch('http://127.0.0.1:5000/TA/class/edit', {
            method: 'POST',
            body: formData,
      });
        const responseData = await response.json();
        console.log(responseData);
        if (responseData.Status)
            setShowAlert(true);
    } catch (error) {
        console.error('Error submitting data:', error);
    }
    }
  
    const [timestamps, setTimestamps] = useState(Array(2).fill('')); // กำหนดขนาดของอาร์เรย์ตามจำนวนที่ต้องการใช้งาน (ในที่นี้คือ 2)

    const handleUpload = async (index) => {
      // Get the current date and time
      const now = new Date();
      const formattedTimestamp = now.toLocaleString();
      const response = null
  

      /* Thumbnail */
      if(index == 0){
        const fileInput = document.getElementById('inputGroupFile01');
        const fileThumbnail = fileInput.files[0];

        const formData = new FormData();
        formData.append('CSYID', CSYID)
        formData.append('file',fileThumbnail)

        try {
            const response = await fetch('http://127.0.0.1:5000/upload/Thumbnail', {
                method: 'POST',
                body: formData,
          });
            const responseData = await response.json();
            console.log(responseData);
            if (responseData.Status)
                setShowAlert(true);
        } catch (error) {
            console.error('Error submitting data:', error);
        }
        
      }
      /* CSV */
      if (index === 1) {
        const fileInput = document.getElementById('inputGroupFile02');
        const fileCSV = fileInput.files[0];
    
        const formData = new FormData();
        formData.append('CSYID', CSYID)
        formData.append('file', fileCSV)
        try {
            const response = await fetch('http://127.0.0.1:5000/upload/CSV', {
                method: 'POST',
                body: formData,
            });
            const responseData = await response.json();
            console.log(responseData);
            if (responseData.Status) {
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    }
    

      if(response){
        setTimestamps(prevTimestamps => {
            const newTimestamps = [...prevTimestamps];
            newTimestamps[index] = formattedTimestamp;
            return newTimestamps;
      })};
  };
        const [showModal, setShowModal] = useState(false);

        const handleShowModal = () => {
            setShowModal(true);
        };

        const handleCloseModal = () => {
            setShowModal(false);
        };

      
        const handleDelete = async () =>{
            const formData = new FormData();
            formData.append('CSYID',CSYID)
  
    try {
        const response = await fetch('http://127.0.0.1:5000/TA/class/delete', {
            method: 'POST',
            body: formData,
      });
        const responseData = await response.json();
        console.log(responseData);
        if (responseData.Status)
            navigate("/Homeprof", { state: { Email: Email,classid: CSYID,delete:true} })
    } catch (error) {
        console.error('Error delete class:', error);
    }
    }


      const handleClassIDChange = (e) => {
          setClassID(e.target.value);
        }
        
        const handleSchoolYearChange = (e) => {
          setSchoolYear(e.target.value);
        }
        
        const handleClassNameChange = (e) => {
          setClassName(e.target.value);
        }
        const isCreateButtonDisabled = !classID || !schoolYear || !className;
        
  return (
    <div>
        <Navbarprof></Navbarprof> 
      <br></br>
      <div class="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
        <div class="card-header">
          <h5>Edit Class</h5> 
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-3">
                    <label for="inputID" class="form-label">Class ID*</label>
                    <input type="text" class="form-control" id="inputID" placeholder="ex. 2301233 (7 digits number)" value={classID} onChange={handleClassIDChange} />
                </div>
                <div class="col-md-3">
                    <label for="inputYear" class="form-label">School Year/Semester*</label>
                    <input type="text" class="form-control" id="inputYear" placeholder="ex. 2020/1" value={schoolYear} onChange={handleSchoolYearChange}/>
                </div>
                <div class="col-6">
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
                <button onClick={() => navigate("/Homeprof", { state: { Email: Email,classid: CSYID} })} type="button" className="btn btn-primary">Back</button>
                    <button type="button" class="btn btn-primary" disabled={isCreateButtonDisabled} onClick={handleEditClick}>Save</button>
                    
                    <button type="button" class="btn btn-danger" onClick={handleShowModal}>Delete</button>

                </div>
            </div>
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
                            <button onClick={() =>handleDelete()} type="button" className="btn btn-primary">
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
