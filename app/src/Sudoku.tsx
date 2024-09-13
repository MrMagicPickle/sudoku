import { buildGridFromPuzzle, buildHints, makepuzzle, solvepuzzle } from "./sudoku-logic";
import './Sudoku.css';

function Sudoku() {
  const completePuzzle = solvepuzzle(Array(81).fill(null))!;
  const puzzleState = makepuzzle(completePuzzle);
  const grid = buildGridFromPuzzle(completePuzzle);
  const {
    hintGroups,
    hintValuesPerGroup,
  } = buildHints(completePuzzle);
  console.log(JSON.stringify(hintGroups), '<< hg');
  console.log(JSON.stringify(hintValuesPerGroup), '<< hvpg');

  const render = () => {
    return grid.map((row, rowIndex) => {
      return <div className="row" key={rowIndex}>
        {
          row.map((cell, colIndex) => {
            return <div className="cell" key={`cell-${rowIndex}-${colIndex}`}>{ cell }</div>
          })
        }
      </div>
    });
  }

  return (
    <>
      { render() }
    </>

  )
}

export default Sudoku;
