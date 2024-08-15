import { useState } from 'react';

function Square({ value, onSquareClick }) {
    if (value == "Red" || value == "Blue") {
        return (
            <button className={value} onClick={onSquareClick}>
            </button>
        );
    } else {
        return (
            <button className="square" onClick={onSquareClick}>
            </button>
        );
    }
}
  
export default function Board() {
    const [xIsNext, setXIsNext] = useState(true);
    const [squares, setSquares] = useState(Array(42).fill(null));

    function handleClick(i) {
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        else if (!squares[i+35]) {
            i=i+35;
        } else if (!squares[i+28]) {
            i=i+28;
        } else if (!squares[i+21]) {
            i=i+21;
        } else if (!squares[i+14]) {
            i=i+14;
        } else if (!squares[i+7]) {
            i+=7;
        }
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = "Red";
        } else {
            nextSquares[i] = "Blue";
        }
        setSquares(nextSquares);
        setXIsNext(!xIsNext);
    }

    const winner = calculateWinner(squares);
    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else {
        status = 'Next player: ' + (xIsNext ? 'Red' : 'Blue');
    }

    return (
        <>
            <div className="status">{status}</div>
            <div className="board-row">
                <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
                <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
                <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
            </div>
            <div className="board-row">
                <Square value={squares[7]} />
                <Square value={squares[8]} />
                <Square value={squares[9]} />
                <Square value={squares[10]} />
                <Square value={squares[11]} />
                <Square value={squares[12]} />
                <Square value={squares[13]} />
            </div>
            <div className="board-row">
                <Square value={squares[14]} />
                <Square value={squares[15]} />
                <Square value={squares[16]} />
                <Square value={squares[17]} />
                <Square value={squares[18]} />
                <Square value={squares[19]} />
                <Square value={squares[20]} />
            </div>
            <div className="board-row">
                <Square value={squares[21]} />
                <Square value={squares[22]} />
                <Square value={squares[23]} />
                <Square value={squares[24]} />
                <Square value={squares[25]} />
                <Square value={squares[26]} />
                <Square value={squares[27]} />
            </div>
            <div className="board-row">
                <Square value={squares[28]} />
                <Square value={squares[29]} />
                <Square value={squares[30]} />
                <Square value={squares[31]} />
                <Square value={squares[32]} />
                <Square value={squares[33]} />
                <Square value={squares[34]} />
            </div>
            <div className="board-row">
                <Square value={squares[35]} />
                <Square value={squares[36]} />
                <Square value={squares[37]} />
                <Square value={squares[38]} />
                <Square value={squares[39]} />
                <Square value={squares[40]} />
                <Square value={squares[41]} />
            </div>
        </>
    );
}


function calculateWinner(squares) {
    const lines = [
        [0, 1, 2, 3],
        [41, 40, 39, 38],
        [7, 8, 9, 10],
        [34, 33, 32, 31],
        [14, 15, 16, 17],
        [27, 26, 25, 24],
        [21, 22, 23, 24],
        [20, 19, 18, 17],
        [28, 29, 30, 31],
        [13, 12, 11, 10],
        [35, 36, 37, 38],
        [6, 5, 4, 3],
        [0, 7, 14, 21],
        [41, 34, 27, 20],
        [1, 8, 15, 22],
        [40, 33, 26, 19],
        [2, 9, 16, 23],
        [39, 32, 25, 18],
        [3, 10, 17, 24],
        [38, 31, 24, 17],
        [4, 11, 18, 25],
        [37, 30, 23, 16],
        [5, 12, 19, 26],
        [36, 29, 22, 15],
        [6, 13, 20, 27],
        [35, 28, 21, 14],
        [0, 8, 16, 24],
        [41, 33, 25, 17],
        [7, 15, 23, 31],
        [34, 26, 18, 10],
        [14, 22, 30, 38],
        [27, 19, 11, 3],
        [35, 29, 23, 17],
        [6, 12, 18, 24],
        [28, 22, 16, 10],
        [13, 19, 25, 31],
        [21, 15, 9, 3],
        [20, 26, 32, 38],
        [36, 30, 24, 18],
        [5, 11, 17, 23],
        [37, 31, 25, 19],
        [4, 10, 16, 22],
        [2, 10, 18, 26],
        [39, 31, 23, 15],
        [1, 9, 17, 25],
        [40, 32, 24, 16],
        [9, 17, 25, 33],
        [8, 16, 24, 32],
        [11, 17, 23, 29],
        [12, 18, 24, 30],
        [1, 2, 3, 4],
        [5, 4, 3, 2],
        [8, 9, 10, 11],
        [12, 11, 10, 9],
        [15, 16, 17, 18],
        [19, 18, 17, 16],
        [22, 23, 24, 25],
        [26, 25, 24, 23],
        [29, 30, 31, 32],
        [33, 32, 31, 30],
        [36, 37, 38, 39],
        [40, 39, 38, 37],
        [7, 14, 21, 28],
        [8, 15, 22, 29],
        [9, 16, 23, 30],
        [10, 17, 24, 31],
        [11, 18, 25, 32],
        [12, 19, 26, 33],
        [13, 20, 27, 34],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c, d] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d]) {
            return squares[a];
        }
    }
    return null;
}
    