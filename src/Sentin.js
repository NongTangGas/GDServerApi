import React, { useState, useEffect } from 'react';
import Navbarprof from './Navbarprof'
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Sentin({ Q = 2 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const classData = location.state;
  const Email = classData.Email;
  const classId = classData.classid;
  const oldlab = classData.lab;
  const oldlabname = classData.labname;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverContent, setPopoverContent] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null); // เพิ่มตัวแปร selectedStudentId ห้ามลืมใส่จำนวนข้อที่ Q ด้านบน
  const [newScores, setNewScores] = useState({}); // เก็บค่า New Scores สำหรับแต่ละคอลัมน์ Q
  const [searchQuery, setSearchQuery] = useState('');
  const [lastEditedTimestamp, setLastEditedTimestamp] = useState(null);

  const [assignments, setassignments] = useState({
    "Due": "Tue, 20 Feb 2024 14:45:00 GMT",
    "LabName": "TestLab",
    "Questions": {
      "1": {
        "MaxScore": "125",
        "Scores": {
          "6331234567": {
            "LastEdit": null,
            "Late": false,
            "Name": "Ava Thompson",
            "Score": 7,
            "Section": "1",
            "Timestamp": "Wed, 20 Dec 2023 14:45:00 GMT"
          },
          "6331234568": {
            "LastEdit": null,
            "Late": true,
            "Name": "Ethan Miller",
            "Score": 5,
            "Section": "1",
            "Timestamp": "Fri, 20 Dec 2080 14:45:00 GMT"
          }
        }
      },
      "2": {
        "MaxScore": "70",
        "Scores": {
          "6331234567": {
            "LastEdit": null,
            "Late": false,
            "Name": "Ava Thompson",
            "Score": null,
            "Section": "1",
            "Timestamp": null
          },
          "6331234568": {
            "LastEdit": null,
            "Late": false,
            "Name": "Ethan Miller",
            "Score": 21,
            "Section": "1",
            "Timestamp": "Wed, 20 Dec 2023 14:45:00 GMT"
          }
        }
      }
    }
  });


  useEffect(() => {
    const fetchSection = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/TA/class/score?CSYID=${classId}&Lab=${oldlab}`);
        const data = await response.json();
        console.log('sections:', data);
        setassignments(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchSection()
  }, []);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const togglePopover = (content) => {
    setPopoverContent(content);
    setPopoverOpen(!popoverOpen);
  };

  const handleClick = (cellValue, studentId) => {
    setSelectedCell(cellValue);
    setSelectedStudentId(studentId); // เพิ่มการกำหนดค่า selectedStudentId
    togglePopover(<strong>History for Q{cellValue}</strong>);
  };

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getUTCDay()];
    const month = months[date.getUTCMonth()];
    const dateNumber = date.getUTCDate();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${day}, ${dateNumber} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
  }
  
  const handleSubmit = async () => {
    if (selectedCell !== null && selectedStudentId !== null) {
      const timestamp = new Date().toUTCString(); // Get current timestamp
      const formattedTimestamp = formatTimestamp(timestamp);
      handleScoreChange({ target: { value: timestamp } }, selectedStudentId, `Q${selectedCell}`);
      setassignments(prevAssignments => {
        const updatedAssignments = { ...prevAssignments };
        updatedAssignments.Questions[selectedCell].Scores[selectedStudentId].LastEdit = formattedTimestamp;

        const sendFormData = async () => {
          const formData = new FormData();
          formData.append('Data',JSON.stringify({
            UID: selectedStudentId,
            Lab: oldlab,
            Question: selectedCell,
            updatescore: newScores[`Q${selectedCell}`][selectedStudentId],
            CSYID: classId
          }),)
          console.log(formData)
          try {
            const response = await fetch('http://127.0.0.1:5000/TA/class/SentEdit', {
                  method: 'POST',
                  body: formData,
            });
            console.log(response);
          } catch (error) {
            console.error('Error:', error);
          }
        };
        
        sendFormData();

        return updatedAssignments;
      });
      
      // Can send data to API or save to database here
    } else {
      console.error("selectedCell or selectedStudentId is null");
    }
  };
  
  
  
  // กำหนดตัวแปร assignments ตรงนี้
  

  const handleScoreChange = (e, studentId, questionKey) => {
    const { value } = e.target;
    setNewScores(prevState => ({
      ...prevState,
      [questionKey]: {
        ...prevState[questionKey],
        [studentId]: value,
      },
    }));
    
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
      <div className="card text-left" style={{ marginLeft: '10em', marginRight: '10em' }}>
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
                <button className="nav-link link" onClick={() => navigate("/AssignEdit", { state: { Email: Email,classid:classId,lab:oldlab,labname:oldlabname} })}>Edit</button>
            </li>
            <li className="nav-item">
              <button className="nav-link active" >
                Sent in
              </button>
            </li>
          </ul>
        </div>
        <br />
        <div className="card-body" style={{ overflowX: 'auto', overflowY: 'auto' }}>
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="search id or name" aria-label="Search" onChange={handleSearch}/>
          </form>
          <br />
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                {[...Array(Q)].map((_, index) => (
                  <th key={`Q${index + 1}`} scope="col">{`Q${index + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
            {Object.keys(assignments.Questions["1"].Scores).map((studentId, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row">{rowIndex + 1}</th>
                <td>{String(studentId)}</td> {/* Render student ID */}
                <td>{assignments.Questions["1"].Scores[studentId]?.Name}</td> {/* Render student name */}
                {[...Array(Q)].map((_, colIndex) => {
                  const questionKey = colIndex + 1;
                  const question = assignments.Questions[questionKey];
                  const score = question.Scores[studentId]?.Score || '';
                  const maxScore = question.MaxScore;
                  return (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      onClick={() => handleClick(colIndex + 1, studentId)} // ส่งค่า studentId ไปที่ handleClick
                      style={{
                        cursor: 'pointer',
                      }}
                      className={question.Scores[studentId]?.Late ? 'table-danger' : ''}
                    >
                      {score}/{maxScore}
                    </td>
                  );
                })}
              </tr>
            ))}  
            </tbody>
          </table>
          {popoverOpen && selectedCell !== null && (
  <div className="popover" style={{ display: 'block', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', maxWidth: '500px' }}>
    <div className="popover-body">
      {popoverContent}
      <br />
      {/* แสดงชื่อนักเรียน */}
      {assignments.Questions[selectedCell]?.Scores[selectedStudentId]?.Name && (
        <div>
          {assignments.Questions[selectedCell]?.Scores[selectedStudentId]?.Name}
        </div>
      )}
      {/* แสดงเวลาที่ส่งล่าสุด */}
      Last Submitted: {assignments.Questions[selectedCell]?.Scores?.[selectedStudentId]?.Timestamp || '-'}
      <br />
      {/* แสดงคะแนน */}
      Score: {assignments.Questions[selectedCell]?.Scores?.[selectedStudentId]?.Score || '-'} / {assignments.Questions[selectedCell]?.MaxScore}
      <br />
      {/* แสดงเวลาที่แก้ไขล่าสุด */}
      Lastest edited: {assignments.Questions[selectedCell]?.Scores?.[selectedStudentId]?.LastEdit || lastEditedTimestamp && JSON.stringify(lastEditedTimestamp) || '-'}
      <br />
      {/* แสดง input เพื่อให้กรอกเวลาใหม่ */}
      {selectedStudentId !== null && selectedStudentId !== undefined && assignments.Questions[selectedCell]?.Scores[selectedStudentId]?.Name && (
        <div>
          New Score: 
            <input
              type="number"
              min="0"
              value={selectedStudentId !== null && selectedStudentId !== undefined ? String(newScores[`Q${selectedCell}`]?.[selectedStudentId]) || '' : ''}
              onChange={(e) => handleScoreChange(e, selectedStudentId, `Q${selectedCell}`)}
            />
        </div>
      )}

      <br />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (selectedCell !== null && selectedStudentId !== null) {
            const timestamp = new Date().toUTCString(); // ดึง timestamp ปัจจุบัน
            handleScoreChange({ target: { value: timestamp } }, selectedStudentId, `Q${selectedCell}`);
            handleSubmit();
          } else {
            console.error("selectedCell or selectedStudentId is null");
          }
        }}
      >
        Submit
      </button>
    </div>
    <button
      type="button"
      className="btn-close"
      aria-label="Close"
      onClick={() => setPopoverOpen(false)}
      style={{ position: 'absolute', top: '0', right: '0' }}
    ></button>
  </div>
)}


          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" className="btn btn-primary" onClick={() => navigate("/AssignList", { state: { Email: Email,classid:classId} })}>
                Back
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sentin;