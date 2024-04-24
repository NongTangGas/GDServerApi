import React, { useState, useEffect } from 'react';
import Navbarprof from './Navbarprof'
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function AssignEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  const classData = location.state;
  const Email = classData.Email;
  const classId = classData.classid;
  const oldlab = classData.lab;
  const oldlabname = classData.labname;

  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);



  const [labNum, setLabNum] = useState('');
  const [labName, setLabName] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalQNum, setTotalQNum] = useState('');
  const [sections, setSections] = useState([1, 2, 3, 4, 5]); //ใส่ sec ที่จะเอา
  const [Question, setScores] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [checkedSections, setCheckedSections] = useState([]);
  const currentDate = new Date().toISOString().slice(0, 16);
  const [submittedDates, setSubmittedDates] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [inputQnum, setInputQnum] = useState('');
  const [links, setLinks] = useState(null);
  const [classDetail, setClassDetail] = useState(null);


  const fetchLab = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/TA/class/Assign/data?CSYID=${classId}&labnumber=${oldlab}`);
      const data = await response.json();
      console.log('sections:', data);
      setTotalQNum(data.Question.length);
      setScores(data.Question)
      setCheckedSections(data.section)
      setSubmittedDates(data.LabTime)
      setLinks(data.file.join(','))
      console.log(submittedDates)
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchClassData = async () => {
    try {
      const classResponse = await fetch(`http://127.0.0.1:5000/class/TA/data?CSYID=${classId}`);
      const classData = await classResponse.json();
      setClassDetail(classData);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchSection = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/section?CSYID=${classId}`);
      const data = await response.json();
      console.log('sections:', data);
      setSections(data);
      

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  useEffect(() => {
    
    fetchClassData()
    fetchLab()
    fetchSection()

    setLabNum(oldlab)
    setLabName(oldlabname)

    //Set QuestionNumber
    const event = {
      target: {
        value: totalQNum 
      }
    };
    handleTotalQNumChangeWrapper(event);

    //Set QuestionScore
    Question.forEach(item => {
      const id = item.id;
      const score = item.score;
      handleScoreChange(id, score);
    });
    
    //Set Publish&Due
    

    setIsLoading(false)
  }, []);

  const handleShowModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = async () =>{
    const formData = new FormData();
    formData.append('CSYID',classId)
    formData.append('oldlabNum',oldlab)
    try {
      const response = await fetch('http://127.0.0.1:5000/TA/class/Assign/delete', {
        method: 'POST',
        body: formData,
      });
        const responseData = await response.json();
        console.log(responseData);
        if (responseData.Status)
          navigate("/AssignList", { state: { Email: Email,classid: classId,delete:true} })
    } catch (error) {
      console.error('Error delete class:', error);
    }
  }

  
  const handlePublishDateChange = (e, section) => {
    const selectedPublishDate = new Date(e.target.value);
    const formattedPublishDate = selectedPublishDate.toISOString().slice(0, 16);
    // Update state with formatted date
    setSubmittedDates(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        publishDate: formattedPublishDate,
      }
    }));
  };
  
  const handleDueDateChange = (e, section) => {
    const selectedDueDate = new Date(e.target.value);
    const formattedDueDate = selectedDueDate.toISOString().slice(0, 16);
    // Update state with formatted date
    setSubmittedDates(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        dueDate: formattedDueDate,
      }
    }));
  };
  
  
  
  
  const handleCheckboxChange = (section) => {
    if (checkedSections.includes(section)) {
      setCheckedSections(checkedSections.filter((item) => item !== section));
    } else {
      setCheckedSections([...checkedSections, section]);
    }
    setSections([...sections].sort((a, b) => a - b));
  };

  const handleTotalQNumChangeWrapper = (e) => {
    handleTotalQNumChange(e);
  };

  const handleTotalQNumChange = (e) => {
    let numQuestions = parseInt(e.target.value);
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions === null) {
        numQuestions = 1;
    } else if (numQuestions > 20) {
        numQuestions = 20;
    }
    setTotalQNum(numQuestions);

    const newScores = Array.from({ length: numQuestions }, (_, index) => ({
        id: index + 1,
        score: 1,
    }));
    setScores(newScores);
};

  

  const handleScoreChange = (id, score) => {
    const updatedScores = Question.map((item) =>
      item.id === id ? { ...item, score } : item
    );
    setScores(updatedScores);
  };

  const isFormValid = () => {
    return (
      labNum !== '' &&
      labName !== '' &&
      checkedSections !== null &&
      checkedSections !== undefined &&
      checkedSections.length > 0 &&
      checkedSections.every(section => 
        submittedDates[section] && 
        submittedDates[section].publishDate && 
        submittedDates[section].dueDate &&
        new Date(submittedDates[section].publishDate) <= new Date(submittedDates[section].dueDate)
      )
    );
  };
  
  const handleButtonClick = async () => {
    const formData = new FormData();
    formData.append('oldlabNum', oldlab);
    formData.append('Creator', Email);
    formData.append('labNum', labNum);
    formData.append('labName', labName);
    formData.append('CSYID', classId);
    formData.append('Question', JSON.stringify(Question)); // Stringify Question array
    formData.append('submittedDates', JSON.stringify(submittedDates)); // Stringify submittedDates object
    formData.append('link',links);
    if (isFormValid()) {
      try {
        
        const response = await fetch('http://127.0.0.1:5000/TA/class/Assign/Edit', {
              method: 'POST',
              body: formData,
        })
        console.log(response)

      } catch (error) {
        console.error('Error');
      }

      
  
      setShowAlert(true);
      console.log('Form submitted!',formData);
    } else {
      console.log('Please fill in all fields correctly.');
    }
  };
  

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <div>
      <Navbarprof />
      <br />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          
      {classDetail ? (
        <div className="media d-flex align-items-center">
        <span style={{ margin: '0 10px' }}></span>
        <img className="mr-3" src={classDetail.Thumbnail ? "/Thumbnail/" + classDetail.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"}  style={{ width: '40px', height: '40px' }} />
        <span style={{ margin: '0 10px' }}></span>
          <h5>{classDetail.ClassID} {classDetail.ClassName} {classDetail.SchoolYear}</h5>
          <h6></h6>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/StudentList", { state: { Email: Email,classid:classId} })} style={{ marginLeft: 40 + 'em' }}>Student lists</button>
      </div>
      ):("")}

      <br />
      <div className="card" style={{ marginLeft: '10em', marginRight: '10em' }}>
        <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <button className="nav-link active">Edit</button>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link link" onClick={() => navigate("/Sentin", { state: { Email: Email,classid:classId,lab:oldlab,labname:oldlabname} })} >Sent in</button>
                    </li>
                </ul>
            </div>
        <div className="card-body">
          <form className="row g-3">
            <div className="col-md-6">
              <label htmlFor="LabNum" className="form-label">Lab Number*</label>
              <input type="number" min="1" className="form-control" id="LabNum" value={labNum} onChange={(e) => setLabNum(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label htmlFor="LabName" className="form-label">Lab Name*</label>
              <input type="name" className="form-control" id="LabName" value={labName} onChange={(e) => setLabName(e.target.value)} />
            </div>

            <div className="col-6">
              <label htmlFor="inputlink" className="form-label">Attach Link</label>
              <input type="text" className="form-control" id="inputlink" placeholder="link1,link2 (seperated by comma)" value={links} onChange={(e) => setLinks(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputQnum" className="form-label">Total Question Number*</label>
              <input type="number" min="1" className="form-control" id="inputQnum" value={totalQNum} onChange={(e) => {handleTotalQNumChange(e)}} />
            </div>

            {Question.map((scoreItem) => (
              <div key={scoreItem.id} className="col-md-2">
                <label htmlFor={`inputScore${scoreItem.id}`} className="form-label">
                  Score Q.{scoreItem.id}
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  id={`inputScore${scoreItem.id}`}
                  value={scoreItem.score}
                  onChange={(e) => handleScoreChange(scoreItem.id, e.target.value)}
                />
              </div>
            ))}

            <div className="col-md-12">
              <label htmlFor="inputState" className="form-label">Section*</label>
              <br />
              {sections.map((section) => (
                <div key={section} className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`inlineCheckbox${section}`}
                    value={section}
                    checked={checkedSections.includes(section)}
                    onChange={() => handleCheckboxChange(section)}
                  />
                  <label className="form-check-label" htmlFor={`inlineCheckbox${section}`}>
                    {section}
                  </label>
                </div>
              ))}
            </div>
              <br></br>
              {sections
  .filter(section => checkedSections.includes(section))
  .map((section) => (
    <div key={section} className="row">
      <div className="col-md-6">
        <label htmlFor={`PublishDate${section}`} className="form-label">Publish Date* for sec{section}</label>
        <input
          type="datetime-local"
          className="form-control"
          id={`publishdate${section}`}
          value={submittedDates[section]?.publishDate ? submittedDates[section].publishDate.slice(0, 16) : ''}

          onChange={(e) => handlePublishDateChange(e, section)}
          min={currentDate}
        />
      </div>
      <div className="col-md-6">
        <label htmlFor={`DueDate${section}`} className="form-label">Due Date* for sec{section}</label>
        <input
          type="datetime-local"
          className="form-control"
          id={`duedate${section}`}
          value={submittedDates[section]?.dueDate ? submittedDates[section].dueDate.slice(0, 16) : ''}
          onChange={(e) => handleDueDateChange(e, section)}
          min={submittedDates[section]?.dueDate ? submittedDates[section].dueDate.slice(0, 16) : currentDate}
        />
      </div>
    </div>
  ))}


            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" className="btn btn-primary" onClick={() => navigate("/AssignList", { state: { Email: Email,classid:classId} })}>Back</button>
              <button type="button" className="btn btn-primary" id="liveToastBtn" onClick={handleButtonClick} disabled={!isFormValid()}>Save</button>
              <button type="button" className="btn btn-danger" onClick={handleShowModal}>Delete</button>
            </div>

            {showAlert && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                Assignment created successfully
              </div>
            )}
          </form>
        </div>
      </div>
        </div>
      )}
      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Remove Class</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Do you want to delete this Assignment?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignEdit;