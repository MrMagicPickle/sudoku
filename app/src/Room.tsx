import { useParams } from "react-router-dom";
import { APP_ID, Schema } from "./db";
import { useEffect } from "react";
import { init } from "@instantdb/react";
import './Sudoku.css';

// const db = getDb();
const db = init<Schema>({ appId: APP_ID });

function Room() {
  const { roomId } = useParams();
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

  console.log(data, '<< data');

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
            return <div id={`cell-${cell[1]}-${cell[2]}`} className="cell" key={`cell-${index}`}>{ cell[0] }</div>
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