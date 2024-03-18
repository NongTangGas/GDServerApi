import React from 'react'
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navbarprof() {
        const handleButtonClick = () => {
          console.log('Button clicked. Preparing to navigate to page...');
        };
      
        const [showModal, setShowModal] = useState(false);
      
        const handleOpenModal = () => {
          setShowModal(true);
        };
      
        const handleCloseModal = () => {
          setShowModal(false);
        };
    

  return (
    <div>
         <nav className="navbar navbar-dark bg-primary justify-content-between ">
          <a className="navbar-brand" href="#"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NameID</a>
          <form className="form-inline">
          <Link to="/Homeprof">
              <button onClick={handleButtonClick} className="btn btn-outline-light" type="button">Home
                </button> 
                </Link>
                <span style={{ margin: '0 10px' }}></span>
          <button type="button" className="btn btn-outline-light" onClick={handleOpenModal}>
        Log out
      </button> &nbsp;&nbsp;&nbsp;
      </form>
        </nav>

        {/* Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Exit</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Do you want to leave this site?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Navbarprof