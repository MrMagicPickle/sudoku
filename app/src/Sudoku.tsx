import { useEffect } from "react";
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

  const renderGrid = () => {
    /* Convert to quadrants */
    const quadrantsToCells: Record<string, number[][]> = {};
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        // Ranges from [0..2]
        const quadRow = Math.floor(i / 3);
        const quadCol = Math.floor(j / 3);
        const cellsInQuad = quadrantsToCells[`${quadRow}-${quadCol}`];

        const cellNumber = grid[i][j];
        const cellX = i;
        const cellY = j;
        quadrantsToCells[`${quadRow}-${quadCol}`] = cellsInQuad ?
          [...cellsInQuad, [cellNumber, cellX, cellY]] :
          [[cellNumber, cellX, cellY]];
      }
    }

    const divQuads = Object.entries(quadrantsToCells).map(([key, value], index) => {
      return <div className="quadrant" key={`quad-${index}`}>
        {
          value.map((cell, index) => {
            return <div id={`cell-${cell[1]}-${cell[2]}`} className="cell" key={`cell-${index}`}>{ cell[0] }</div>
          })
        }
      </div>
    });
    return divQuads;
  }

  /* Sample of creating a single hint box. */
  const renderHints = () => {
    return <div id="hint-1" className="hint"></div>
  }

  /* We need to move the hint into the correct position AFTER the grid is rendered. */
  useEffect(() => {
    const hintKey = Object.keys(hintGroups)[0];
    const hintValues = hintValuesPerGroup[hintKey];
    const hintGroup = hintGroups[hintKey];
    console.log(hintValues, hintGroup, '<< hintValues, hintGroup');

    const [x, y] = hintGroup[0];
    const id = `cell-${x}-${y}`;
    const cell = document.getElementById(id);
    const rect = cell?.getBoundingClientRect();
    console.log(id, x,y, '<< x,y');
    console.log(cell, '<< cell');
    console.log(rect, '<< rect ---');

    const hint = document.getElementById('hint-1');
    hint?.style.setProperty('top', `${rect?.top}px`);
    hint?.style.setProperty('left', `${rect?.left}px`);
  }, []);

  renderHints();
  return (
    <>
      <div className='grid-container'>
        { renderGrid() }
        { renderHints() }
      </div>
    </>

  )
}

export default Sudoku;
