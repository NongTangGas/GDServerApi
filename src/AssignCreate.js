import React, { useState } from 'react';
import Navbarprof from './Navbarprof';
import { Link } from 'react-router-dom';

function AssignCreate() {
  const [showAlert, setShowAlert] = useState(false);
  const [labNum, setLabNum] = useState('');
  const [labName, setLabName] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalQNum, setTotalQNum] = useState('');
  const [sections, setSections] = useState([1, 2, 3, 4, 5]); //ใส่ sec ที่จะเอา
  const [scores, setScores] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [checkedSections, setCheckedSections] = useState([]);
  const currentDate = new Date().toISOString().slice(0, 16);
  const [submittedDates, setSubmittedDates] = useState({});

  const handlePublishDateChange = (e, section) => {
    const selectedPublishDate = new Date(e.target.value);
    const currentDate = new Date();
    const selectedDueDate = new Date(submittedDates[section]?.dueDate); // ใช้ข้อมูล dueDate ของ section เดียวกัน
  
    if (selectedPublishDate < currentDate) {
      alert('Publish Date cannot be in the past.');
      e.target.value = '';
    } else if (selectedPublishDate > selectedDueDate) {
      alert('Publish Date cannot be after Due Date.');
      e.target.value = '';
    } else {
      setSubmittedDates(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          publishDate: e.target.value,
        }
      }));
    }
  };
  
  const handleDueDateChange = (e, section) => {
    const selectedDueDate = new Date(e.target.value);
    const selectedPublishDate = new Date(submittedDates[section]?.publishDate); // ใช้ข้อมูล publishDate ของ section เดียวกัน
    const currentDate = new Date();
  
    if (selectedDueDate < selectedPublishDate || selectedDueDate < currentDate) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
      setSubmittedDates(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          dueDate: e.target.value,
        }
      }));
    }
  };
  
  const handleCheckboxChange = (section) => {
    if (checkedSections.includes(section)) {
      setCheckedSections(checkedSections.filter((item) => item !== section));
    } else {
      setCheckedSections([...checkedSections, section]);
    }
    
    // Sort sections
    setSections([...sections].sort((a, b) => a - b));
  };

  const handleTotalQNumChange = (e) => {
    const numQuestions = parseInt(e.target.value, 10);
    setTotalQNum(numQuestions);

    const newScores = Array.from({ length: numQuestions }, (_, index) => ({
      id: index + 1,
      score: 1,
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
  
  const handleButtonClick = () => {
    if (isFormValid()) {
      const data = {
        labNum,
        labName,
        sections,
        scores,
        submittedDates // ส่งข้อมูลที่เกี่ยวข้องกับแต่ละ section
      };
      setSubmittedData(data);
  
      setLabNum('');
      setLabName('');
      setSections([1, 2, 3, 4, 5]); // รีเซ็ต sections เป็นค่าเริ่มต้น
      setPublishDate('');
      setDueDate('');
      setTotalQNum('');
      setScores([]);
  
      setShowAlert(true);
      console.log('Form submitted!',data);
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
      <div className="media d-flex align-items-center">
      <span style={{ margin: '0 10px' }}></span>
        <img
          className="mr-3"
          src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png"
          style={{ width: '40px', height: '40px' }}
        />
        <span style={{ margin: '0 10px' }}></span>
        <div className="card" style={{ width: '30rem', padding: '10px' }}>
          <h5>210xxx comp prog 2566/2 sec1</h5>
          <h6>Instructor: Name Surname</h6>
        </div>
      </div>
      <br />
      <div className="card" style={{ marginLeft: '10em', marginRight: '10em' }}>
        <div className="card-header">
          <h5>Create assignment</h5>
        </div>
        <div className="card-body">
          <form className="row g-3">
            <div className="col-md-6">
              <label htmlFor="LabNum" className="form-label">Lab Number*</label>
              <input type="number" min="1" className="form-control" id="LabNum" onChange={(e) => setLabNum(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label htmlFor="LabName" className="form-label">Lab Name*</label>
              <input type="name" className="form-control" id="LabName" onChange={(e) => setLabName(e.target.value)} />
            </div>

            <div className="col-6">
              <label htmlFor="inputlink" className="form-label">Attach Link</label>
              <input type="text" className="form-control" id="inputlink" placeholder="link1, link2 or -" />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputQnum" className="form-label">Total Question Number*</label>
              <input type="number" min="1" className="form-control" id="inputQnum" onChange={handleTotalQNumChange} />
            </div>

            {scores.map((scoreItem) => (
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
          value={submittedDates[section]?.publishDate || ''}
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
          value={submittedDates[section]?.dueDate || ''}
          onChange={(e) => handleDueDateChange(e, section)}
          min={submittedDates[section]?.publishDate || currentDate}
        />
      </div>
    </div>
  ))}


            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Link to="/AssignList">
                <button type="button" className="btn btn-primary">Back</button>
              </Link>
              <button type="button" className="btn btn-primary" id="liveToastBtn" onClick={handleButtonClick} disabled={!isFormValid()}>Submit</button>
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
  );
}

export default AssignCreate;
