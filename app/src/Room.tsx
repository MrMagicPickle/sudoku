import { useParams } from "react-router-dom";
import { APP_ID, Schema } from "./db";
import { useEffect, useRef } from "react";
import { init, tx } from "@instantdb/react";
import './Sudoku.css';
import { debounce } from "./debounce";

// const db = getDb();
const db = init<Schema>({ appId: APP_ID });

/* used for debouncing update game state calls */
let timeoutId: any = undefined;

function Room() {
  const { roomId } = useParams();
  const targetCell = useRef<HTMLElement | null>(null);
  /* Key format is 'x,y' */
  const targetCellCoordKey = useRef<string | null>(null);

  const { isLoading, error, data } = db.useQuery({
    sudokuRoom: {
      $: {
        where: {
          id: roomId || 'test',
        }
      },
      sudokuGameState: {}
    },
  });

  /* Key event listeners for updating cell. */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!targetCell.current) {
      return;
    }
    event.preventDefault();
  }
  const handleKeyUp = (event: KeyboardEvent) => {
    console.log(targetCell.current, '<< curent');
    if (!targetCell.current) {
      return;
    }
    event.preventDefault();
    let targetValue: number | null | undefined = undefined;
    switch (event.key) {
      case 'Backspace':
        targetValue = null;
        break;
      case '1':
        targetValue = 1;
        break;
      case '2':
        targetValue = 2;
        break;
      case '3':
        targetValue = 3;
        break;
      case '4':
        targetValue = 4;
        break;
      case '5':
        targetValue = 5;
        break;
      case '6':
        targetValue = 6;
        break;
      case '7':
        targetValue = 7;
        break;
      case '8':
        targetValue = 8;
        break;
      case '9':
        targetValue = 9;
        break;
    }
    if (targetValue === undefined) {
      return;
    }
    console.log('setting inner texxt');
    targetCell.current.innerText = targetValue ? targetValue.toString() : '';

    /* Update game state */
    window.clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateGameState(targetCellCoordKey.current!, targetValue!);
    }, 1000);
  }

  const setTargetCell = (x: number, y: number) => {
    targetCellCoordKey.current = `${x},${y}`;

    targetCell.current = document.getElementById(`cell-${x}-${y}`)!;
    targetCell.current.addEventListener('keyup', handleKeyUp);
    targetCell.current.addEventListener('keydown', handleKeyDown);
  }

  const clearTargetCell = () => {
    targetCellCoordKey.current = null;

    if (!targetCell.current) {
      return;
    }
    targetCell.current.removeEventListener('keyup', handleKeyUp);
    targetCell.current.removeEventListener('keydown', handleKeyDown);
    targetCell.current = null;
  }

  const updateGameState = (coordKey: string, value: number | null) => {
    if (!data) {
      return;
    }

    const { sudokuRoom } = data;
    const { sudokuGameState } = sudokuRoom[0];
    const { id, boardState } = sudokuGameState[0];

    db.transact([
      tx.sudokuGameState[id].merge({
        boardState: {
          [coordKey]: value,
        }
      })
    ]);
  }

  const renderGrid = () => {
    if (!data) {
      return;
    }

    const { sudokuRoom } = data;
    const { sudokuGameState } = sudokuRoom[0];
    const { boardState } = sudokuGameState[0];


    /* Convert to quadrants */
    const quadrantsToCells: Record<string, (number | null)[][]> = {};
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        // Ranges from [0..2]
        const quadRow = Math.floor(i / 3);
        const quadCol = Math.floor(j / 3);
        const cellsInQuad = quadrantsToCells[`${quadRow}-${quadCol}`];

        const cellNumber = boardState[`${i},${j}`];
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
            return <div
              contentEditable
              onBlur={clearTargetCell}
              onClick={() => setTargetCell(cell[1]!, cell[2]!)}
              id={`cell-${cell[1]}-${cell[2]}`}
              className="cell"
              key={`cell-${index}`}
            >
              { cell[0] }
            </div>
          })
        }
      </div>
    });
    return divQuads;
  }


  return (<>
    <p> Room: { roomId } </p>
    <div className='grid-container'>
      { renderGrid() }
    </div>
  </>)
}

export default Room;