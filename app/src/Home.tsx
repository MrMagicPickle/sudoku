import { init, tx, id } from "@instantdb/react"
import { useNavigate } from "react-router-dom";
import { isCommaListExpression } from "typescript";
import getDb from "./db";
import { buildHints, makepuzzle, solvepuzzle } from "./sudoku-logic";
import { createInitialPuzzleDictFromArr, mapPuzzleArrayToPuzzleDict } from "./mapper";

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
  const navigate = useNavigate();

  const createRoom = async () => {
    console.log('Create room');
    const roomId = id();
    /* Create puzzle and hints */
    const completedPuzzle = solvepuzzle(Array(81).fill(null))!;
    const initialPuzzleState = makepuzzle(completedPuzzle);
    const {
      hintGroups,
      hintValuesPerGroup,
    } = buildHints(completedPuzzle);

    /* Map array puzzle to 81 entries dictionary. */
    const completedPuzzleDict = mapPuzzleArrayToPuzzleDict(completedPuzzle);
    const initialPuzzleStateDict = createInitialPuzzleDictFromArr(initialPuzzleState);

    await db.transact(
      [
        tx.sudokuRoom[roomId].update({
          completedPuzzle: completedPuzzleDict,
          hintGroups: hintGroups,
          hintValuesPerGroup: hintValuesPerGroup,
          initialState: initialPuzzleStateDict,
          isCompleted: false,
        }),
        tx.sudokuGameState[id()].update({
          boardState: initialPuzzleStateDict,
          failCount: 0,
        }).link({sudokuRoom: roomId}),
      ]
    );
    navigate(`/room/${roomId}`);

  }

  return (
    <>
      <button onClick={createRoom}> Create Room</button>
    </>
  )
}

export default Home;