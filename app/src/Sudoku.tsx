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
    /* Convert to quadrants */
    const quadrantsToCells: Record<string, number[]> = {};
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        // Ranges from [0..2]
        const quadRow = Math.floor(i / 3);
        const quadCol = Math.floor(j / 3);
        const cellsInQuad = quadrantsToCells[`${quadRow}-${quadCol}`];

        quadrantsToCells[`${quadRow}-${quadCol}`] = cellsInQuad ?
          [...cellsInQuad, grid[i][j]] :
          [grid[i][j]];
      }
    }

    const divQuads = Object.entries(quadrantsToCells).map(([key, value], index) => {
      return <div className="quadrant" key={`quad-${index}`}>
        {
          value.map((cell, index) => {
            return <div className="cell" key={`cell-${index}`}>{ cell }</div>
          })
        }
      </div>
    });
    return divQuads;

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
      <div className='grid-container'>
      { render() }
      </div>
    </>

  )
}

export default Sudoku;
