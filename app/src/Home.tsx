import { init, tx, id } from "@instantdb/react"
import { useNavigate } from "react-router-dom";
import { isCommaListExpression } from "typescript";
import getDb from "./db";
import { buildHints, makepuzzle, solvepuzzle } from "./sudoku-logic";
import { createInitialPuzzleDictFromArr, mapPuzzleArrayToPuzzleDict } from "./mapper";
import { FormEvent, useState } from "react";

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
  const [isSelectedJoinRoom, setIsSelectedJoinRoom] = useState(false);

  const createRoom = async () => {
    const roomId = id();
    /* Create puzzle and hints */
    const completedPuzzle = solvepuzzle(Array(81).fill(null))!;
    const initialPuzzleState = makepuzzle(completedPuzzle);

    /* Map array puzzle to 81 entries dictionary. */
    const completedPuzzleDict = mapPuzzleArrayToPuzzleDict(completedPuzzle);
    const initialPuzzleStateDict = createInitialPuzzleDictFromArr(initialPuzzleState);

    const {
      hintGroups,
      hintValuesPerGroup,
    } = buildHints(completedPuzzle, initialPuzzleStateDict);

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

  const joinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement)
    const formJson = Object.fromEntries(formData.entries());
    const roomId = formJson['roomId'];
    navigate(`/room/${roomId}`);
  }

  const selectJoinRoom = () => {
    setIsSelectedJoinRoom(true);
  }

  const renderJoinRoom = () => {

    return <div className="join-Room-container">
        <button onClick={() => setIsSelectedJoinRoom(false)}> Back </button>

        <form onSubmit={joinRoom}>
          <label> Join Room
            <input name="roomId" placeholder="Enter Room ID"></input>
          </label>
          <button type="submit"> Join </button>
        </form>
      </div>
  }

  return (
    <>
      <div className={'center-container'}>
        <h1>
          Multiplayer <br></br> Sudoku
        </h1>
        <div className={'input-container'}>
          <button onClick={createRoom}> Create Room</button>

          <button onClick={selectJoinRoom}> Join Room</button>
          {
            isSelectedJoinRoom ? renderJoinRoom() : null
          }
        </div>
      </div>

    </>
  )
}

export default Home;