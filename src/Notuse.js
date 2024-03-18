import React from 'react'
import Navbar from './Navbar'
import { Link } from 'react-router-dom'

function Portfolio() {
  return (
    <div>
        <Navbar></Navbar>
        <br></br>
          <div className="media d-flex align-items-center">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <img className="mr-3" src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png"  style={{ width: '40px', height: '40px' }} />
             <h5>&nbsp;&nbsp;&nbsp;&nbsp; 210xxx comp prog 2566/2 sec1</h5>
          </div>
        <br></br>
        <div className="card text-left" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <Link to="/">
                        <button className="nav-link link" >Assignments</button>
                        </Link>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link active" href="#">Portfolio</a>
                    </li>
                </ul>
            </div>
        

            <div class="card-body">
                <h5 class="card-title p-3 mb-2 bg-secondary text-white" >Current Total Score: x/Total</h5>
                <br></br>
                <table class="table">
                    <thead>
                        <tr>
                        <th scope="col">LabNumber</th>
                        <th scope="col">LabName</th>
                        <th scope="col">Score</th>
                        <th scope="col">Average</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <th scope="row">1</th>
                        <td>helloworld</td>
                        <td>8</td>
                        <td>7.5</td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>datastructures</td>
                        <td>10</td>
                        <td>10</td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td>algorithmanalysis</td>
                        <td>-</td>
                        <td>-</td>
                        </tr>
                    </tbody>
                    </table>
            </div>
        </div>

    </div>
  )
}

export default Portfolio