// import React, { useState } from 'react';
// import "../CSS/LogicalRound.css"

// const questionsData = [
//   {
//     question: 'Question 1: What is the unit of electrical resistance?',
//     options: ['Ohm', 'Volt', 'Ampere', 'Watt'],
//     correctAnswer: 'Ohm'
//   },
//   {
//     question: 'Question 2: What is the SI unit of frequency?',
//     options: ['Hertz', 'Watt', 'Newton', 'Joule'],
//     correctAnswer: 'Hertz'
//   },
//   {
//     question: 'Question 3: Which programming language is widely used for web development?',
//     options: ['Java', 'Python', 'JavaScript', 'C++'],
//     correctAnswer: 'JavaScript'
//   },
//   {
//     question: 'Question 4: What is the melting point of steel?',
//     options: ['100°C', '500°C', '1000°C', '1500°C'],
//     correctAnswer: '1500°C'
//   },
//   {
//     question: 'Question 5: What is the main component of a solar cell?',
//     options: ['Silicon', 'Aluminum', 'Copper', 'Gold'],
//     correctAnswer: 'Silicon'
//   }
// ];

// const LogicalRound = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState(Array(questionsData.length).fill(''));
//   const [score, setScore] = useState(0);
//   const [showScore, setShowScore] = useState(false);
//   const [popAlert, setPopAlert] = useState(false);

//   const currentQuestion = questionsData[currentQuestionIndex];
//   const isFirstQuestion = currentQuestionIndex === 0;
//   const isLastQuestion = currentQuestionIndex === questionsData.length - 1;

//   const handleOptionChange = (event) => {
//     const updatedOptions = [...selectedOptions];
//     updatedOptions[currentQuestionIndex] = event.target.value;
//     setSelectedOptions(updatedOptions);
//   };

//   const handleNextClick = () => {
//     const isAnswerCorrect = selectedOptions[currentQuestionIndex] === currentQuestion.correctAnswer;
//     if (isAnswerCorrect) {
//       setScore(score + 1);
//     }

//     if (isLastQuestion) {
//       setShowScore(true);
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevClick = () => {
//     if (!isFirstQuestion) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmitClick = () => {
//     const isAnswerCorrect = selectedOptions[currentQuestionIndex] === currentQuestion.correctAnswer;
//     if (isAnswerCorrect) {
//       setScore(score + 1);
//     }

//     setShowScore(true);
//     setPopAlert(true);
//   };


//  const handleLogicalRoundYes = () => {
//    window.location.href = '/CodingRound1';
//  }

//  const handleLogicalRoundNo = () => {
//    setPopAlert(false);
//  }
//   return (
//     <div className='round1'>
//       <h1>Phase 1: Logical Round</h1>

//       <div>
//         <table>
//           <tr>
//             <th> <h4>{currentQuestion.question}</h4></th>
//           </tr>
//           <tr><th><h5>Options:</h5></th></tr>
//           <tr>
//             <td>
//               {currentQuestion.options.map((option, index) => (
//                 <div key={index}>
//                   <input
//                     type="radio"
//                     id={`option-${index}`} // Unique id for each option
//                     name="option"
//                     value={option}
//                     checked={selectedOptions[currentQuestionIndex] === option}
//                     onChange={handleOptionChange}
//                   />
//                   <label htmlFor={`option-${index}`}>{option}</label>
//                   {index !== currentQuestion.options.length - 1 && <hr />}
//                 </div>
//               ))}
//             </td>
//           </tr>
//         </table>
//       </div>
//       {!isFirstQuestion && (
//         <button className='previous' onClick={handlePrevClick}>Previous</button>)}
//       {!isLastQuestion ? (
//         <button className='next' onClick={handleNextClick}>Next</button>) : (
//       <button className='submit' onClick={handleSubmitClick}>Submit</button>
//       )}
//       {popAlert &&(
//                     <div className="popup2">
//                       <div className="popup2-content">
//                         <p>Are you sure you want to start the interview?</p>
//                         <button onClick={handleLogicalRoundYes}>Yes</button>
//                       <button onClick={handleLogicalRoundNo}>No</button>
//                       </div>

//                     </div>
//                   )}
//     </div>
//   );
// };
// export default LogicalRound;