function Sudoku({
  puzzle
}: {
  puzzle: number[][]
}) {

  const render = () => {
    return puzzle.map((row, index) => {
      return <p key={index}>{row.join(',')}</p>;
    });
  }

  return (
    <>
      { render() }
    </>

  )
}

export default Sudoku;
