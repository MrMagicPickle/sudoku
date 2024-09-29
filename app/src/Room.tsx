import { useParams } from "react-router-dom";
import { APP_ID, BoardCellState, BoardStateValue, Schema } from "./db";
import { useEffect, useRef } from "react";
import { init, tx } from "@instantdb/react";
import './Room.css';
import { arrayContainsArray } from "./utils";

// const db = getDb();
const db = init<Schema>({ appId: APP_ID });

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
  const isTriggerValidation = data?.sudokuRoom[0]?.sudokuGameState[0]?.isTriggerValidation;

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    const tooltip = document.getElementById("myTooltip");
    tooltip!.innerHTML = "Copied to clipboard!";
  }

  const resetTooltip = () => {
    const tooltip = document.getElementById("myTooltip");
    tooltip!.innerHTML = "Copy Room ID";
  }

  /* Handle puzzle completed logic */
  const handlePuzzleCompleted = () => {
    alert('Puzzle completed!');
  }

  /* Key event listeners for updating cell. */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!targetCell.current) {
      return;
    }
    // event.preventDefault();
  }
  const handleKeyUp = (event: KeyboardEvent) => {
    if (!targetCell.current) {
      return;
    }
    // event.preventDefault();
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
    /* Set cell value display
     * TODO: this might not be needed?
     * since we update the db, the event will trigger and
     * update the cell value for us anyway.
    */
    // targetCell.current.innerText = targetValue ? targetValue.toString() : '';
    // targetCell.current.style.color = 'black';

    updateGameState(targetCellCoordKey.current!, [targetValue!, 'valid']);
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

  const updateGameState = (coordKey: string, value: BoardStateValue) => {
    if (!data) {
      return;
    }

    const { sudokuRoom } = data;
    const { sudokuGameState } = sudokuRoom[0];
    const { id } = sudokuGameState[0];

    db.transact([
      tx.sudokuGameState[id].merge({
        boardState: {
          [coordKey]: value,
        }
      })
    ]);
  }

  const bulkUpdateGameState = (cellsToUpdate: Record<string, [number|null, 'valid' | 'invalid']>) => {
    if (!data) {
      return;
    }

    const { sudokuRoom } = data;
    const { sudokuGameState } = sudokuRoom[0];
    const { id } = sudokuGameState[0];

    db.transact([
      tx.sudokuGameState[id].merge({
        boardState: {
          ...cellsToUpdate,
        }
      })
    ]);
  }

  const triggerValidation = async () => {
    if (!data) {
      return;
    }

    const { sudokuRoom } = data;
    const { sudokuGameState } = sudokuRoom[0];
    const { id } = sudokuGameState[0];

    await db.transact([
      tx.sudokuGameState[id].update({
        isTriggerValidation: true,
      })
    ]);

    await db.transact([
      tx.sudokuGameState[id].update({
        isTriggerValidation: false,
      })
    ]);
  }

  /* Listen for trigger validation, and perform validation logic */
  useEffect(() => {
    if (!isTriggerValidation) {
      return;
    }

    const sudokuRoom = data?.sudokuRoom[0];
    const sudokuGameState = sudokuRoom.sudokuGameState[0];
    if (!sudokuGameState || !sudokuRoom) {
      return;
    }

    const { boardState } = sudokuGameState;
    const { completedPuzzle } = sudokuRoom;

    let isPuzzleCompleted = true;
    const cellsToUpdate: Record<string, [number|null, 'valid'|'invalid']> = {};
    Object.entries(boardState).forEach(([coordKey, value]) => {
      if (!value[0]) {
        isPuzzleCompleted = false;
        return;
      }

      if (value[0] === completedPuzzle[coordKey]) {
        return;
      }

      const [x, y] = coordKey.split(',').map(Number);

      /* Update game state to mark invalid cells. */
      cellsToUpdate[coordKey] = [value[0], 'invalid'];

      isPuzzleCompleted = false;
    });

    /* Bulk update game state */
    bulkUpdateGameState(cellsToUpdate);

    if (isPuzzleCompleted) {
      handlePuzzleCompleted();
    }
  }, [isTriggerValidation]);

  /* We need to move the hint into the correct position AFTER the grid is rendered. */
  useEffect(() => {
    if (!data) {
      return;
    }

    const { hintGroups, hintValuesPerGroup } = data.sudokuRoom[0] || {};

    for (const hintKey of Object.keys(hintGroups)) {
      const hintGroup = hintGroups[hintKey];

      /* Move each hint cell to the correct position */
      hintGroup.forEach(([x, y], index) => {
        const id = `cell-${x}-${y}`;
        const cell = document.getElementById(id);
        const rect = cell?.getBoundingClientRect();
        const hint = document.getElementById(`hint-${x}-${y}`);
        hint?.style.setProperty('top', `${rect?.top}px`);
        hint?.style.setProperty('left', `${rect?.left}px`);
      });

      /* Move each hint value to the topmost, leftmost position of the hint group*/
      const sortedHintGroup = hintGroup.toSorted();
      const targetHintCell = sortedHintGroup[0];
      const hintValueElement = document.getElementById(`hintVal-${hintKey}`);
      const targetHintCellElement = document.getElementById(`hint-${targetHintCell[0]}-${targetHintCell[1]}`);
      const rect = targetHintCellElement?.getBoundingClientRect();
      hintValueElement?.style.setProperty('top', `${rect?.top}px`);
      hintValueElement?.style.setProperty('left', `${rect?.left}px`);
    }
  }, [data]);

  /* Sample of creating a single hint box. */
  const renderHints = () => {
    if (!data) {
      return;
    }

    const { hintGroups, hintValuesPerGroup } = data.sudokuRoom[0];

    /* Iterates through each hint group */
    const hintCellDivs = Object.keys(hintGroups).flatMap(hintKey => {
      const hintValue = hintValuesPerGroup[hintKey];
      const hintGroup = hintGroups[hintKey];
      /* For each group, iterates through each hint cell and returns a div. */
      return hintGroup.map(([x, y], index) => {
        /* TODO: Add hint group to id? */

        const dirs = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ];

        let borderStyle = {};
        const paddingValue = '3px';
        for (const [dX, dY] of dirs) {
          const [newX, newY] = [x+dX, y+dY];
          if (
            newX < 0 ||
            newX >= 9 ||
            newY < 0 ||
            newY >= 9
          ) {
            continue;
          }

          if (arrayContainsArray(hintGroup, [newX, newY])) {
            if (dX === 0 && dY === 1) {
              borderStyle = {
                ...borderStyle,
                borderRight: 'none',
                paddingRight: paddingValue, // We use padding to compensate for space
              };
            }
            if (dX === 1 && dY === 0) {
              borderStyle = {
                ...borderStyle,
                borderBottom: 'none',
                paddingBottom: paddingValue,
              };
            }
            if (dX === 0 && dY === -1) {
              borderStyle = {
                ...borderStyle,
                borderLeft: 'none',
                paddingLeft: paddingValue,
              };
            }
            if (dX === -1 && dY === 0) {
              borderStyle = {
                ...borderStyle,
                borderTop: 'none',
                paddingTop: paddingValue,
              };
            }
          }
        }

        return <div
            key={`hint-${x}-${y}`}
            id={`hint-${x}-${y}`}
            className="hint"
            style={{
              ...borderStyle,
            }}
          >
          </div>
      });
    });
    return hintCellDivs;
  }

  const renderHintValues = () => {
    if (!data) {
      return;
    }
    const { hintGroups, hintValuesPerGroup } = data.sudokuRoom[0];
    const hintValues = Object.keys(hintGroups).map((hintKey) => {
      const hintValue = hintValuesPerGroup[hintKey];
      return <p
        key={`hintVal-${hintKey}`}
        className="hint-value"
        id={`hintVal-${hintKey}`}
      >
        {hintValue}
      </p>
    });
    return hintValues;
  }

  const renderGrid = () => {
    if (!data) {
      return;
    }

    const { sudokuRoom } = data;
    const { sudokuGameState } = sudokuRoom[0];
    const { boardState } = sudokuGameState[0];

    /* Convert to quadrants */
    const quadrantsToCells: Record<string, [number|null, number, number, BoardCellState][]> = {};
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        // Ranges from [0..2]
        const quadRow = Math.floor(i / 3);
        const quadCol = Math.floor(j / 3);
        const cellsInQuad = quadrantsToCells[`${quadRow}-${quadCol}`];

        const cellNumber = boardState[`${i},${j}`][0];
        const cellValidState = boardState[`${i},${j}`][1];
        const cellX = i;
        const cellY = j;
        quadrantsToCells[`${quadRow}-${quadCol}`] = cellsInQuad ?
          [...cellsInQuad, [cellNumber, cellX, cellY, cellValidState]] :
          [[cellNumber, cellX, cellY, cellValidState]];
      }
    }

    const divQuads = Object.entries(quadrantsToCells).map(([key, value], quadIndex) => {
      return <div className="quadrant" key={`quad-${quadIndex}`}>
        {
          value.map((cell, index) => {
            return <div
              tabIndex={quadIndex * 9 + index}
              onBlur={clearTargetCell}
              onClick={() => setTargetCell(cell[1]!, cell[2]!)}
              id={`cell-${cell[1]}-${cell[2]}`}
              className="cell"
              key={`cell-${index}`}
              style={{
                color: cell[3] === 'invalid' ? "red" : 'black',
                fontWeight: cell[3] === 'initial' ? "bold" : undefined,
                pointerEvents: cell[3] === 'initial' ? 'none' : 'auto',
              }}
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
    <div className="heading-container">
      <h2> Room ID:
        <code id="room-id" onClick={copyRoomId} onMouseOut={resetTooltip}>{ roomId }</code>
        <span className="tooltiptext" id="myTooltip">Copy Room ID</span>
      </h2>
    </div>
    <div className="content-container">
      <div className="controls-container">
        <button onClick={triggerValidation}>Check</button>
      </div>

      <div className='grid-container'>
        { renderGrid() }
        { renderHints() }
        { renderHintValues() }
      </div>
    </div>
  </>)
}

export default Room;