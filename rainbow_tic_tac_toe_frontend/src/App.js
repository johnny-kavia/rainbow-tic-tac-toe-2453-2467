import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const PLAYER_X = "X";
const PLAYER_O = "O";

/**
 * All possible winning lines for a 3x3 tic-tac-toe board.
 * Index mapping:
 *  0 1 2
 *  3 4 5
 *  6 7 8
 */
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Determine whether the board has a winner.
 * @param {(null|"X"|"O")[]} squares
 * @returns {{winner: (null|"X"|"O"), line: (null|number[])}} winner and the winning line indices (if any)
 */
function calculateWinner(squares) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}

/**
 * Checks if the board is full (i.e., draw if no winner).
 * @param {(null|"X"|"O")[]} squares
 * @returns {boolean}
 */
function isBoardFull(squares) {
  return squares.every((v) => v !== null);
}

/**
 * Returns a deterministic rainbow color for a given index.
 * @param {number} idx
 * @returns {string}
 */
function rainbowColorForIndex(idx) {
  // Golden angle to spread hues evenly. Keep saturation/value high for punchy UI.
  const hue = (idx * 137.508) % 360;
  return `hsl(${hue} 90% 55%)`;
}

/**
 * A single square (cell) in the tic-tac-toe grid.
 * Uses CSS variables to get a unique rainbow accent per cell.
 */
function Square({ index, value, onSelect, disabled, isWinning }) {
  const accent = useMemo(() => rainbowColorForIndex(index), [index]);

  const aria = value
    ? `Square ${index + 1}, ${value}`
    : `Square ${index + 1}, empty`;

  return (
    <button
      type="button"
      className={[
        "rttt-square",
        value ? "is-filled" : "",
        value === PLAYER_X ? "is-x" : "",
        value === PLAYER_O ? "is-o" : "",
        isWinning ? "is-winning" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--accent": accent }}
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-label={aria}
    >
      <span className="rttt-square-inner" aria-hidden="true">
        {value ?? ""}
      </span>
    </button>
  );
}

/**
 * Board rendering (3x3).
 */
function Board({ squares, onPlayAt, disabled, winningLine }) {
  const winningSet = useMemo(() => new Set(winningLine ?? []), [winningLine]);

  return (
    <div className="rttt-board" role="grid" aria-label="Tic tac toe board">
      {squares.map((value, idx) => (
        <Square
          key={idx}
          index={idx}
          value={value}
          onSelect={onPlayAt}
          disabled={disabled || Boolean(value)}
          isWinning={winningSet.has(idx)}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Game state:
   * - squares: current board
   * - xIsNext: whose turn it is
   * - lastMoveIndex: used to animate the last move subtly
   */
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [lastMoveIndex, setLastMoveIndex] = useState(null);

  const { winner, line: winningLine } = useMemo(
    () => calculateWinner(squares),
    [squares]
  );
  const draw = useMemo(
    () => !winner && isBoardFull(squares),
    [winner, squares]
  );

  const currentPlayer = xIsNext ? PLAYER_X : PLAYER_O;
  const gameOver = Boolean(winner) || draw;

  // Keyboard shortcut: press "r" to reset (nice for quick replays).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === "r") {
        handleReset();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squares, xIsNext]);

  // PUBLIC_INTERFACE
  const handlePlayAt = (idx) => {
    if (gameOver) return;
    if (squares[idx]) return;

    const next = squares.slice();
    next[idx] = currentPlayer;
    setSquares(next);
    setXIsNext((v) => !v);
    setLastMoveIndex(idx);
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setLastMoveIndex(null);
  };

  const statusLabel = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (draw) return "It's a draw!";
    return `Current player: ${currentPlayer}`;
  }, [winner, draw, currentPlayer]);

  const subStatus = useMemo(() => {
    if (winner) return "Rainbow victory unlocked. Press Reset to play again.";
    if (draw) return "No more moves. Press Reset for a rematch.";
    return "Tap a square to place your mark.";
  }, [winner, draw]);

  return (
    <div className="App">
      <main className="rttt-page">
        <header className="rttt-header">
          <div className="rttt-title-wrap">
            <h1 className="rttt-title">Rainbow Tic‑Tac‑Toe</h1>
            <p className="rttt-subtitle">
              A classic 3×3 game with a colorful, animated twist.
            </p>
          </div>
        </header>

        <section className="rttt-surface" aria-label="Game">
          <div className="rttt-status" aria-live="polite" aria-atomic="true">
            <div className="rttt-status-main">
              <span
                className={[
                  "rttt-pill",
                  winner ? "is-winner" : "",
                  draw ? "is-draw" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {statusLabel}
              </span>

              {!gameOver && (
                <span className="rttt-turn-indicator" aria-hidden="true">
                  <span
                    className={[
                      "rttt-turn-dot",
                      currentPlayer === PLAYER_X ? "is-x" : "is-o",
                    ].join(" ")}
                  />
                </span>
              )}
            </div>
            <div className="rttt-status-sub">{subStatus}</div>
          </div>

          <div
            className={[
              "rttt-board-wrap",
              gameOver ? "is-locked" : "",
              lastMoveIndex !== null ? `last-${lastMoveIndex}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Board
              squares={squares}
              onPlayAt={handlePlayAt}
              disabled={gameOver}
              winningLine={winningLine}
            />
          </div>

          <div className="rttt-actions">
            <button
              type="button"
              className="rttt-reset"
              onClick={handleReset}
            >
              Reset
            </button>
            <div className="rttt-hint">
              Tip: press <kbd>R</kbd> to reset.
            </div>
          </div>
        </section>

        <footer className="rttt-footer">
          <span className="rttt-footer-text">
            Smooth animations, responsive grid, and winning-line highlights.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
