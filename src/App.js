import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Chess from 'chess.js';
import './App.css';

// Import your 2D images for chess pieces
import kingImg from './assets/king.png';
import queenImg from './assets/queen.png';
import rookImg from './assets/rook.png';
import bishopImg from './assets/bishop.png';
import knightImg from './assets/knight.png';
import pawnImg from './assets/pawn.png';

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    if (!player1 || !player2) {
      alert('Please enter player names!');
      return;
    }

    // Send player names to backend to start the game
    fetch('http://localhost:5000/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1, player2 })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Game started:', data);
        setGameStarted(true);
      })
      .catch(err => console.error('Error starting game:', err));
  };

  // Render chess pieces on the board
  const renderPieces = () => {
    return game.board().map((row, rowIndex) =>
      row.map((square, colIndex) => {
        if (square) {
          const pieceType = square.type;
          const isWhite = square.color === 'w';
          const pieceImage = getPieceImage(pieceType, isWhite);

          return (
            <mesh position={[colIndex, rowIndex, 0]} key={`${rowIndex}-${colIndex}`}>
              <sprite>
                <spriteMaterial attach="material" map={pieceImage} />
              </sprite>
            </mesh>
          );
        }
        return null;
      })
    );
  };

  const getPieceImage = (type, isWhite) => {
    switch (type) {
      case 'k': return kingImg;
      case 'q': return queenImg;
      case 'r': return rookImg;
      case 'b': return bishopImg;
      case 'n': return knightImg;
      case 'p': return pawnImg;
      default: return null;
    }
  };

  const onDrop = (source, target) => {
    const gameCopy = { ...game };
    const move = gameCopy.move({ from: source, to: target, promotion: 'q' });
    if (move) {
      setGame(gameCopy);

      // Send move to backend to log the game
      fetch('http://localhost:5000/log-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 1, // Replace with actual game ID from DB
          move: move.san,
          player: 'player1' // Replace with actual player info
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Move logged:', data);
        })
        .catch(err => console.error('Error logging move:', err));
    }
  };

  return (
    <div>
      {!gameStarted ? (
        <div>
          <h1>Enter Player Names</h1>
          <input 
            type="text" 
            placeholder="Player 1 Name" 
            value={player1} 
            onChange={e => setPlayer1(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Player 2 Name" 
            value={player2} 
            onChange={e => setPlayer2(e.target.value)} 
          />
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      ) : (
        <div className="chessboard-container">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
            <OrbitControls />
            {renderPieces()}
          </Canvas>
        </div>
      )}
    </div>
  );
};

export default App;
