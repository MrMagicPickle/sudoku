import React from 'react';
import logo from './logo.svg';
import './App.css';
import Sudoku from './Sudoku';
import InstantDB from './InstantDB';
import Home from './Home';
function App() {
  return (
    <div className="App">
      {/* <Sudoku/> */}
      {/* <InstantDB/> */}
      <Home/>

      {/* <div id="canvas-container">
        <Canvas />
      </div> */}
    </div>
  );
}

export default App;
