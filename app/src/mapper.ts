import { BoardState, BoardStateValue } from "./db";

const mapPuzzleArrayToPuzzleDict = (puzzleArray: number[]): Record<string, number|null> => {
  let count = 0;
  const puzzleDict: Record<string, number|null> = {}
  for (let i = 0; i<9; i++) {
    for (let j = 0; j<9; j++) {
      /* Have to +1 here bc the puzzle generator generates numbers from [0..8] */
      const sudokuNumber = (puzzleArray[count] === null) ?  null : puzzleArray[count] + 1;
      puzzleDict[`${i},${j}`] = sudokuNumber;
      count += 1;
    }
  }
  return puzzleDict;
}

const createInitialPuzzleDictFromArr = (puzzleArray: number[]): BoardState => {
  let count = 0;
  const puzzleDict: Record<string, BoardStateValue> = {}
  for (let i = 0; i<9; i++) {
    for (let j = 0; j<9; j++) {
      /* Have to +1 here bc the puzzle generator generates numbers from [0..8] */
      const sudokuNumber = (puzzleArray[count] === null) ?  null : puzzleArray[count] + 1;
      const cellState = sudokuNumber === null ? 'valid' : 'initial';
      puzzleDict[`${i},${j}`] = [sudokuNumber, cellState];
      count += 1;
    }
  }
  return puzzleDict;
}


export {
  mapPuzzleArrayToPuzzleDict,
  createInitialPuzzleDictFromArr,
};
