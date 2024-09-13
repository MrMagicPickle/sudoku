import React from 'react';
import logo from './logo.svg';
import './App.css';
import Sudoku from './Sudoku';

function App() {
  return (
    <div className="App">
      {/* <Sudoku puzzle={[[1,2,3], [4,5,8]]}/> */}
      <Sudoku/>
    </div>
  );
}

export default App;
