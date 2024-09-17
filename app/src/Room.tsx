import { useParams } from "react-router-dom";
import { APP_ID, Schema } from "./db";
import { useEffect } from "react";
import { init } from "@instantdb/react";

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
  // useEffect(() => {
  //   console.log(data, '<< data');
  // }, [data]);
  // useEffect(() => {

  // }, []);


  return (<>
    <p> Room: { roomId } </p>
  </>)
}

export default Room;