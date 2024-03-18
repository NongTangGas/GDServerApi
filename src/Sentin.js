import React from 'react'
import Navbarprof from './Navbarprof'
import { Link } from 'react-router-dom'
import { useState } from 'react';

function Sentin() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverContent, setPopoverContent] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [newScore, setNewScore] = useState('');

  const togglePopover = (content) => {
    setPopoverContent(content);
    setPopoverOpen(!popoverOpen);
  };
  const handleClick = (item) => {
    const scoreType = typeof item.score;
    if (scoreType === 'string' && item.score.includes(',')) {
      setSelectedRow(item);
      togglePopover(<strong>History</strong>);
    }
  };
  const data = [
    { id: 6334412323, name: 'Kanok Rungrassameesab ', score: 90 },
    { id: 6334421232, name: 'Pasit Pongpattana ', score: '85,16/03/2024' },
    { id: 6334421223, name: 'Surapong Jarassopon', score: 95 },
    // เพิ่มข้อมูลคนอื่นๆ ตามต้องการ
  ];
  const handleSubmit = () => {
    // Logic to submit new score
    console.log('New score submitted:', newScore);
    // Reset input field and popover content
    setNewScore('');
    setPopoverOpen(false);
  };

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
                        <Link to="/AssignEdit">
                        <button className="nav-link link" >Edit</button>
                        </Link>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link active" href="#">Sent in</a>
                    </li>
                </ul>
            </div>
            <br></br>
            <div class="card-body">
                  <form class="d-flex">
                    <input class="form-control me-2" type="search" placeholder="id or name" aria-label="Search"/>
                    <button class="btn btn-outline-primary" type="submit">Search</button>
                  </form>
                  <br></br>
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">No.</th>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index} onClick={() => handleClick(item)} style={{ backgroundColor: (typeof item.score === 'string' && item.score.includes(',')) ? '#ff0000' : '' }}>
                          <th scope="row">{index + 1}</th>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.score}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                    {popoverOpen && selectedRow && (
                      <div className="popover" style={{ display: 'block', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div className="popover-body">
                          {popoverContent}
                          <br></br>
                          Last Submitted:
                          <br></br>
                          Score:
                          <br></br>
                          Last edited:
                          <br></br>
                          New Score:
                          <input type="number" min="0" value={newScore} onChange={(e) => setNewScore(e.target.value)} />
                          <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                          <button type="button" className="btn-close" aria-label="Close" onClick={() => setPopoverOpen(false)}  style={{ position: 'absolute', top: '0', right: '0' }}></button>
                        </div>
                      </div>
                    )}

                        <br></br>
            </div>
          </div>



    </div>
  )
}

export default Sentin