// Sudoku Generator and Solver for node.js
// Copyright (c) 2011 Blagovest Dachev.  All rights reserved.
//
// This is a port of David Bau's python  implementation:
// http://davidbau.com/archives/2006/09/04/sudoku_generator.html
function makepuzzle(board) {
  var puzzle = [];
  var deduced = Array(81).fill(null);
  var order = [...Array(81).keys()];
  shuffleArray(order);

  for (var i = 0; i < order.length; i++) {
    var pos = order[i];

    if (deduced[pos] === null) {
      puzzle.push({
        pos: pos,
        num: board[pos]
      });
      deduced[pos] = board[pos];
      deduce(deduced);
    }
  }

  shuffleArray(puzzle);

  for (var i = puzzle.length - 1; i >= 0; i--) {
    var e = puzzle[i];
    removeElement(puzzle, i);
    var rating = checkpuzzle(boardforentries(puzzle), board);

    if (rating === -1) {
      puzzle.push(e);
    }
  }

  return boardforentries(puzzle);
}

function ratepuzzle(puzzle, samples) {
  var total = 0;

  for (var i = 0; i < samples; i++) {
    var tuple = solveboard(puzzle);

    if (tuple.answer === null) {
      return -1;
    }

    total += tuple.state.length;
  }

  return total / samples;
}

function checkpuzzle(puzzle, board) {
  if (board === undefined) {
    board = null;
  }

  var tuple1 = solveboard(puzzle);

  if (tuple1.answer === null) {
    return -1;
  }

  if (board != null && !boardmatches(board, tuple1.answer)) {
    return -1;
  }

  var difficulty = tuple1.state.length;
  var tuple2 = solvenext(tuple1.state);

  if (tuple2.answer != null) {
    return -1;
  }

  return difficulty;
}

function solvepuzzle(board) {
  return solveboard(board).answer;
}

function solveboard(original) {
  var board = [].concat(original);
  var guesses = deduce(board);

  if (guesses === null) {
    return {
      state: [],
      answer: board
    };
  }

  var track = [{
    guesses: guesses,
    count: 0,
    board: board
  }];
  return solvenext(track);
}

function solvenext(remembered) {
  while (remembered.length > 0) {
    var tuple1 = remembered.pop();

    if (tuple1.count >= tuple1.guesses.length) {
      continue;
    }

    remembered.push({
      guesses: tuple1.guesses,
      count: tuple1.count + 1,
      board: tuple1.board
    });
    var workspace = [].concat(tuple1.board);
    var tuple2 = tuple1.guesses[tuple1.count];
    workspace[tuple2.pos] = tuple2.num;
    var guesses = deduce(workspace);

    if (guesses === null) {
      return {
        state: remembered,
        answer: workspace
      };
    }

    remembered.push({
      guesses: guesses,
      count: 0,
      board: workspace
    });
  }

  return {
    state: [],
    answer: null
  };
}

function deduce(board) {
  while (true) {
    var stuck = true;
    var guess = null;
    var count = 0; // fill in any spots determined by direct conflicts

    var tuple1 = figurebits(board);
    var allowed = tuple1.allowed;
    var needed = tuple1.needed;

    for (var pos = 0; pos < 81; pos++) {
      if (board[pos] === null) {
        var numbers = listbits(allowed[pos]);

        if (numbers.length === 0) {
          return [];
        } else if (numbers.length === 1) {
          board[pos] = numbers[0];
          stuck = false;
        } else if (stuck) {
          var t = numbers.map(function (val, key) {
            return {
              pos: pos,
              num: val
            };
          });
          var tuple2 = pickbetter(guess, count, t);
          guess = tuple2.guess;
          count = tuple2.count;
        }
      }
    }

    if (!stuck) {
      var tuple3 = figurebits(board);
      allowed = tuple3.allowed;
      needed = tuple3.needed;
    } // fill in any spots determined by elimination of other locations


    for (var axis = 0; axis < 3; axis++) {
      for (var x = 0; x < 9; x++) {
        var numbers = listbits(needed[axis * 9 + x]);

        for (var i = 0; i < numbers.length; i++) {
          var n = numbers[i];
          var bit = 1 << n;
          var spots = [];

          for (var y = 0; y < 9; y++) {
            var pos = posfor(x, y, axis);

            if (allowed[pos] & bit) {
              spots.push(pos);
            }
          }

          if (spots.length === 0) {
            return [];
          } else if (spots.length === 1) {
            board[spots[0]] = n;
            stuck = false;
          } else if (stuck) {
            var t = spots.map(function (val, key) {
              return {
                pos: val,
                num: n
              };
            });
            var tuple4 = pickbetter(guess, count, t);
            guess = tuple4.guess;
            count = tuple4.count;
          }
        }
      }
    }

    if (stuck) {
      if (guess != null) {
        shuffleArray(guess);
      }

      return guess;
    }
  }
}

function figurebits(board) {
  var needed = [];
  var allowed = board.map(function (val, key) {
    return val === null ? 511 : 0;
  }, []);

  for (var axis = 0; axis < 3; axis++) {
    for (var x = 0; x < 9; x++) {
      var bits = axismissing(board, x, axis);
      needed.push(bits);

      for (var y = 0; y < 9; y++) {
        var pos = posfor(x, y, axis);
        allowed[pos] = allowed[pos] & bits;
      }
    }
  }

  return {
    allowed: allowed,
    needed: needed
  };
}

function posfor(x, y, axis) {
  if (axis === undefined) {
    axis = 0;
  }

  if (axis === 0) {
    return x * 9 + y;
  } else if (axis === 1) {
    return y * 9 + x;
  }

  return [0, 3, 6, 27, 30, 33, 54, 57, 60][x] + [0, 1, 2, 9, 10, 11, 18, 19, 20][y];
}

function axisfor(pos, axis) {
  if (axis === 0) {
    return Math.floor(pos / 9);
  } else if (axis === 1) {
    return pos % 9;
  }

  return Math.floor(pos / 27) * 3 + Math.floor(pos / 3) % 3;
}

function axismissing(board, x, axis) {
  var bits = 0;

  for (var y = 0; y < 9; y++) {
    var e = board[posfor(x, y, axis)];

    if (e != null) {
      bits |= 1 << e;
    }
  }

  return 511 ^ bits;
}

function listbits(bits) {
  var list = [];

  for (var y = 0; y < 9; y++) {
    if ((bits & 1 << y) != 0) {
      list.push(y);
    }
  }

  return list;
}

function allowed(board, pos) {
  var bits = 511;

  for (var axis = 0; axis < 3; axis++) {
    var x = axisfor(pos, axis);
    bits = bits & axismissing(board, x, axis);
  }

  return bits;
} // TODO: make sure callers utilize the return value correctly


function pickbetter(b, c, t) {
  if (b === null || t.length < b.length) {
    return {
      guess: t,
      count: 1
    };
  } else if (t.length > b.length) {
    return {
      guess: b,
      count: c
    };
  } else if (randomInt(c) === 0) {
    return {
      guess: t,
      count: c + 1
    };
  }

  return {
    guess: b,
    count: c + 1
  };
}

function boardforentries(entries) {
  var board = Array(81).fill(null);

  for (var i = 0; i < entries.length; i++) {
    var item = entries[i];
    var pos = item.pos;
    var num = item.num;
    board[pos] = num;
  }

  return board;
}

function boardmatches(b1, b2) {
  for (var i = 0; i < 81; i++) {
    if (b1[i] != b2[i]) {
      return false;
    }
  }

  return true;
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function shuffleArray(original) {
  // Swap each element with another randomly selected one.
  for (var i = 0; i < original.length; i++) {
    var j = i;

    while (j === i) {
      j = Math.floor(Math.random() * original.length);
    }

    var contents = original[i];
    original[i] = original[j];
    original[j] = contents;
  }
}

function removeElement(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
}

// ;
// module.exports = {
//   makepuzzle: function () {
//     return makepuzzle(solvepuzzle(Array(81).fill(null)));
//   },
//   solvepuzzle: solvepuzzle,
//   ratepuzzle: ratepuzzle,
//   posfor: posfor
// };

const puzzleCompleted = solvepuzzle(Array(81).fill(null));
const result = makepuzzle(puzzleCompleted);
console.log(puzzleCompleted, '<< puzzle');
console.log(result, '<< result');

const prettyPrint = (puzzle) => {
  let count = 0;
  for (let i = 0; i<9; i++) {
    const arr = [];
    for (let j = 0; j<9; j++) {
      arr.push(puzzle[count]);
      count += 1;
    }
    console.log(arr.join(','));
  }
}
// prettyPrint(puzzleCompleted, '<< puzzle');

const getRow = (index) => {
  return Math.floor(index / 9);
}

const getCol = (index) => {
  return index % 9;
}

/**
 * min is inclusive
 * max is exclusive
 */
const getRandomInRange = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

const prettyPrintGrid = (grid) => {
  grid.forEach((row) => {
    console.log(row.join(','));
  });
}

const buildHints = (puzzle) => {
  /* Keep track of visited cells for hint generation */
  const visited = [];

  /* 2D Grid creation based on 1-D Puzzle. */
  let count = 0;
  const grid = [];
  for (let i = 0; i<9; i++) {
    const visitedArr = [];
    const gridArr = [];
    for (let j = 0; j<9; j++) {
      visitedArr.push(false);
      /* Have to +1 here bc the puzzle generator generates numbers from [0..8] */
      gridArr.push(puzzle[count] + 1);
      count += 1;
    }
    visited.push(visitedArr);
    grid.push(gridArr);
  }
  prettyPrintGrid(grid);

  let numberOfHints = 16;
  /**
   * [root cell]: [[x,y], [x1, y1], ...]
   * key: root cell coord
   * value: array of coords of the entire hint chain
   */
  const hintGroups = {};

  /**
   * [root cell]: number
   * key: hint group key (which is the root cell coord)
   * value: length of the hint chain for this group.
   */
  const hintChainMin = 1;
  const hintChainMax = 4;
  const hintChainLengthPerGroup = {};
  while (numberOfHints > 0) {
    let randomInt = Math.floor(Math.random() * 81);
    let [x, y] = [getRow(randomInt), getCol(randomInt)];

    while (`${x},${y}` in hintGroups) {
      randomInt = Math.floor(Math.random() * 81);
      [x, y] = [getRow(randomInt), getCol(randomInt)];
    }

    hintGroups[`${x},${y}`] = [[x, y]];
    // Have to +1 on the max because randomInRange is not max inclusive.
    hintChainLengthPerGroup[`${x},${y}`] = getRandomInRange(hintChainMin, hintChainMax+1);

    /* Mark the cell as visited */
    visited[x][y] = true;

    numberOfHints -= 1;
  }

  const gatherPossibleExtensions = (coords) => {
    const dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    const possibleExtensions = [];
    for (const coord of coords) {
      const [x, y] = coord;
      for (const d of dirs) {
        const [dx, dy] = d;
        const [newX, newY] = [x+dx, y+dy];
        if (
          newX < 0 || newX >= 9 ||
          newY < 0 || newY >= 9 ||
          visited[newX][newY]
        ) {
          continue;
        }
        possibleExtensions.push([newX, newY]);
      }
    }
    return possibleExtensions;
  }

  for (let i = 0; i < hintChainMax; i++) {
    Object.entries(hintGroups).forEach(([rootCell, hintChain]) => {
      const chainLengthCap = hintChainLengthPerGroup[rootCell];
      /* Dont extend further for hint chains that have capped out. */
      if (hintChain.length >= chainLengthCap) {
        return;
      }

      /* Grow the hint chain by one. */
      const possibleExtensions = gatherPossibleExtensions(hintChain);

      /* There's a chance that theres no possible cells to grow left,
         so just leave the hint chain not fully grown. */
      if (possibleExtensions.length <= 0) {
        return;
      }
      const randomIndex = getRandomInt(possibleExtensions.length);
      const newChainCellCoord = possibleExtensions[randomIndex];
      const [x, y] = newChainCellCoord;
      hintGroups[rootCell] = [...hintChain, [x, y]];

      /* Mark the visited cell. */
      visited[x][y] = true;
    });
  }

  /* Calculate hint value per hint group */
  const hintValuesPerGroup = {};
  Object.entries(hintGroups).forEach(([key, hintChain]) => {
    hintValuesPerGroup[key] = hintChain.reduce((acc, currCoord) => {
      const [x, y] = currCoord;
      const number = grid[x][y];
      console.log(key, number, x, y);
      return acc + number;
    }, 0);
  });
  console.log(hintValuesPerGroup, '<< hint values');
  return hintGroups;
}
console.log(buildHints(puzzleCompleted));