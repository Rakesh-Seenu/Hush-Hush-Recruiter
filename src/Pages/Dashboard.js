import AppNavBar from "../Layouts/app-nav-bar";
import '../CSS/dashboard.css'
import '../Assets/OIP.jpg'
// import React, { useState } from 'react';
// import Webcam from "react-webcam";

const DashBoard = () => {

  // const [showAlert, setShowAlert] = useState(false);
  // const [accessStatus, setAccessStatus] = useState(null);
  // const [popAlert, setPopAlert] = useState(false);

  // const handleStartClick = () => {
  //   setShowAlert(true);
  // };

  // const handleAllowAccess = async () => {
  //   try {
  //     // Display loading indicator
  //     setAccessStatus('loading');

  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  //     console.log('Camera and microphone access granted!');

  //     // Display success status icon
  //     setAccessStatus('success');
  //   } catch (error) {
  //     console.error('Error accessing camera and microphone:', error);
  //     // Display error status icon
  //     setAccessStatus('error');
  //   }
  // };

  // const handleDenyAccess = () => {
  //   // Handle logic when user denies access to camera and microphone
  //   console.log('Camera and microphone access denied!');

  //   // Display a message for denied access
  //   alert('Camera and microphone access denied. You may not be able to attend the interview.');

  //   //setShowAlert(false);
  //   setAccessStatus('error');
  // };

  // const handleStartInterview = () =>{
  //    setPopAlert(true);
  // }

  // const handleStartYes = () => {
  //   window.location.href = '/LogicalRound';
  // }

  // const handleStartNo = () => {
  //   setPopAlert(false);
  // }

  return (
    <div className="dashboard">
      <div className="row">
        <div className="col-5">
          <img className="coder" src="https://prepinstadotcom.s3.ap-south-1.amazonaws.com/wp-content/uploads/2022/02/infosys-specialist-programmer-coding-questions.webp" />
        </div>
        <div className="col-7 mt-5 pt-4 mb-5">
          <p className="welcome  pb-5"><p>Welcome To Doodle</p></p>
          {/* <span className="group">
            <p className="congrats">Congratulations!</p>
            <img src="https://tse3.mm.bing.net/th/id/OIP.ByfT75YJj7rq6HL5PaS55AHaHa?w=188&h=188&c=7&r=0&o=5&dpr=1.5&pid=1.7" />
          </span>
          <div className="interview">
            <p>You have been selected for the interview process.
              <p>To start the interview, kindly click on the below link!</p></p>
          </div> */}
          <a className="link" href="https://quilgo.com/t/79wvG8xTkBfvCoIc">Click here to initiate the coding round</a>
          {/* {showAlert && (
            <div className="popup">
              <div className="popup-content">
                <ul className="popup-content1">
                  <li>Allow Camera and Microphone Access      
                  {accessStatus === 'loading' ? (<i className="fas fa-spinner fa-spin ms-2 text-secondary"></i>) : 
                  accessStatus === 'success' ? (<i className="fas fa-check-circle ms-2 text-success"></i>) : 
                  accessStatus === 'error' ? (<i className="fas fa-times-circle ms-2 text-danger">  This website requires access to your camera and microphone.</i>) : 
                  (<>
                      <button onClick={handleAllowAccess}>Allow</button>
                      <button onClick={handleDenyAccess}>Deny</button>
                    </>)}</li>
                  <li>Interview process contains one round with three different phases of questions
                    <ul>
                      <li>Logical Round</li>
                      <li>Coding Round 1</li>
                      <li>Coding Round 2</li>
                      <li>Coding Round 3</li>
                    </ul>
                  </li>
                </ul> 
                {accessStatus === 'success' ? ( <a>
                  {popAlert &&(
                    <div className="popup2">
                      <div className="popup2-content">
                        <p>Are you sure you want to start the interview?</p>
                        <button onClick={handleStartYes}>Yes</button>
                      <button onClick={handleStartNo}>No</button>
                      </div>

                    </div>
                  )}
                  <button className="start" onClick={handleStartInterview}>Start</button></a>):(<button className="disable" disabled>Start</button>)}
               
              </div>
            </div>
          )} */}
        </div>
      </div>
    {/* {accessStatus == 'success'&& <Webcam />} */}
    </div>
  )
}
export default DashBoard;