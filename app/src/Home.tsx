import { init, tx, id } from "@instantdb/react"
import { isCommaListExpression } from "typescript";

/**
 * Have a UI to create sudoku room.
 */

interface GameState {
  id: string;
  boardState: Record<string, number | null>;
  failCount: number;
  sudokuRoom: Room;
}

interface Room {
  id: string;
  completedPuzzle: Record<string, number>; /* 81 entries */
  hintGroups: Record<string, number[][]>;
  hintValuesPerGroup: Record<string, number>;
  initialState: Record<string, number | null>;
  isCompleted: boolean;
  sudokuGameState: GameState;
}

const APP_ID = 'f46224b7-2490-4f0c-beed-e735f9adfe10'
// Optional: Declare your schema for intellisense!
type Schema = {
  sudokuRoom: Room,
  sudokuGameState: GameState,
}

const db = init<Schema>({ appId: APP_ID });

function Home() {

  const createRoom = () => {
    console.log('Create room');
    const roomId = id();
    db.transact(
      [
        tx.sudokuRoom[roomId].update({
          completedPuzzle: {x: 1},
          hintGroups: {x: [[1,2]]},
          hintValuesPerGroup: {x: 1},
          initialState: {x: null},
          isCompleted: false,
        }),
        tx.sudokuGameState[id()].update({
          boardState: {x: null},
          failCount: 0,
        }).link({sudokuRoom: roomId}),
      ]
    );
  }

  return (
    <>
      <button onClick={createRoom}> Create Room</button>
    </>
  )
}

export default Home;