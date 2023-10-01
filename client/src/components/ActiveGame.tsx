import React, { useEffect, useContext, useCallback } from 'react';
import { Player, Piece, Pawn, Rook, Bishop, Knight, Queen, King, grid } from '../utils/game-utils'
import type { GameState } from '../context/GameContext'
import { GameContext } from "../context/GameContext";
import { useDrag, useDrop } from 'react-dnd';
import { svgIcons } from '../utils/svg-icons';
import { AuthContext } from '../context/AuthContext';

interface MoveResult {
  isValid: boolean;
  newState: GameState;
  newChallenger: Player | null | undefined;
  newOpponent: Player | null | undefined;
}

type MoveMadeResponse = {
  type: string;
  newGameState: GameState;
  newChallenger: Player;
  newOpponent: Player;
}

function deserializeMoveMadeResponse(data: MoveMadeResponse): [GameState, Player, Player] {
  const deserializedNewGameState = data.newGameState;
    
  for (const position in deserializedNewGameState.board) {
    const square = deserializedNewGameState.board[position];
    // If the square contains a piece, convert it back to a Piece object
    if (square[0] !== null) {
      deserializedNewGameState.board[position][0] = Piece.fromJSON(square[0]);
    }
  }
  const deserializedNewChallenger = Player.fromJSON(data.newChallenger);
  const deserializedNewOpponent = Player.fromJSON(data.newOpponent);

  return [deserializedNewGameState, deserializedNewChallenger, deserializedNewOpponent]
}

export const ActiveGame: React.FC<object> = () => {

  const { 
    challenger, 
    opponent, 
    gameState, 
    setChallenger, 
    setOpponent, 
    setGameState, 
    sendMessage, 
    lastMessage 
  } = useContext(GameContext);

  const setPiecesOnBoard = useCallback(() => {
    if (challenger && opponent && gameState) {
      const allPieces = challenger.alive.concat(opponent.alive);
      const allPositions = allPieces.map(p => p.position);
      const newGameState = {...gameState};
      for (const spot in newGameState.board) {
        if (allPositions.includes(spot)) {
          for (const p of allPieces) {
            if (p.position === spot) {
              if (newGameState.board) newGameState.board[spot][0] = p;
            }
          }
        }
      }
      setGameState(newGameState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenger, opponent]);

  useEffect(() => {
    setPiecesOnBoard();
  }, [setPiecesOnBoard]);

  useEffect(() => {
    function handleIncomingData(data: MoveMadeResponse) {
      if (data.type === 'move-made') {
        const [
          deserializedNewGameState, 
          deserializedNewChallenger, 
          deserializedNewOpponent
        ] = deserializeMoveMadeResponse(data);

        setChallenger(deserializedNewChallenger);
        setOpponent(deserializedNewOpponent);
        setGameState(deserializedNewGameState);
      }
    }

    if (lastMessage !== null) {
      if (lastMessage.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const data = JSON.parse(reader.result);
            handleIncomingData(data);
          }
        };
        reader.readAsText(lastMessage.data);
      } else {
        const data = JSON.parse(lastMessage.data);
        handleIncomingData(data);
      }
    }
  }, [sendMessage, lastMessage, setGameState, setChallenger, setOpponent])

  const renderBlackGravePiece = (piece: Piece, index: number) => (
    <div key={index} className="flex items-end p-0 m-0 h-auto">{svgIcons[piece.pieceName]}</div>
  );

  const renderWhiteGravePiece = (piece: Piece, index: number) => (
    <div key={index} className="flex items-start p-0 m-0 h-6">{svgIcons[piece.pieceName]}</div>
  );

  const displayBlackPlayerName = () => {
    if (challenger && opponent) {
      if (challenger.color === 'black') {
        return <p className="text-noct-blue">{challenger.name}</p>
      } else {
        return <p className="text-noct-blue">{opponent.name}</p>
      }
    } else {
      return null
    }
  };

  const displayWhitePlayerName = () => {
    if (challenger && opponent) {
      if (challenger.color === 'white') {
        return <p className="text-noct-blue">{challenger.name}</p>
      } else {
        return <p className="text-noct-blue">{opponent.name}</p>
      }
    } else {
      return null
    }
  };

  const displayMoves = (gameState: GameState): JSX.Element[] => {
    const movesPerColumn = 10; // Number of moves in each column
    const columns: JSX.Element[] = [];
    let currentColumn: JSX.Element[] = [];

    gameState.moves.forEach((move, index, arr) => {
      if (index % 2 === 0) {
        currentColumn.push(
          <div className='flex justify-start p-0 m-0' key={index / 2}>
            <p className='text-noct-black'> { Math.floor(index / 2) + 1}.{' '} </p>
            <p className='text-noct-blue'>{ move }</p>
            {index < arr.length - 1 ? <p className='text-noct-blue'>,{' '}</p> : ''}
            {arr[index + 1] ? <p className='text-noct-blue'> {arr[index + 1]}</p> : ''}
          </div>
        );

        if (currentColumn.length === movesPerColumn) {
          columns.push(<div className='flex flex-col space-y-4' key={columns.length}>{currentColumn}</div>);
          currentColumn = [];
        }
      }
    });

    if (currentColumn.length > 0) {
      columns.push(<div className='flex flex-col space-y-4' key={columns.length}>{currentColumn}</div>);
    }

    return columns;
  };

  const displayGraveyards = () => {
    if (challenger && opponent) {
      return (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex space-x-2 flex-wrap bg-graveyard mb-40 ml-14">
            {challenger.color === 'white' ? challenger.grave.map(renderWhiteGravePiece) : opponent.grave.map(renderWhiteGravePiece)}
          </div>
          <div className="flex-1 flex space-x-2 flex-wrap bg-graveyard mt-40 ml-14">
            {challenger.color === 'black' ? challenger.grave.map(renderBlackGravePiece) : opponent.grave.map(renderBlackGravePiece)}
          </div>
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <>
    <div className='flex justify-center mb-4'>
      {displayBlackPlayerName()}
    </div>

    <div className="flex">

      <div className='flex-1 flex flex-wrap justify-start'>
        <div className='flex-1 flex flex-wrap justify-start overflow-y-auto h-[500px] ml-4 mr-14'> {/* Adjust the height as needed */}
          <div className='flex space-x-4'> {/* Container for columns */}
            {
              gameState ? displayMoves(gameState) : null
            }
          </div>
        </div>
      </div>

      <ChessBoard />

      {displayGraveyards()}

    </div>

    <div className='flex justify-center mt-2'>
      {displayWhitePlayerName()}
    </div>
    </>
  );
};

const ChessBoard: React.FC<object> = () => {
  const { gameState } = useContext(GameContext);
  
  const createBoard = () => {
    const chessBoard = [];

    for (let row_num = 0; row_num < 8; row_num++) {
      const row = [];
      for (let col_num = 0; col_num < 8; col_num++) {
        if (gameState) {
          const position = grid[col_num][row_num];
          const squareColor = row_num % 2 === 0 
          ? col_num % 2 === 0 ? 'bg-black-square' : 'bg-white-square' 
          : col_num % 2 === 0 ? 'bg-white-square' : 'bg-black-square';
          row.push(
            <Square key={`${row_num}-${col_num}`} position={position} squareColor={squareColor} />
          );
        }
      }
      chessBoard.push(<div key={row_num} className="w-screen flex items-center justify-center">{row}</div>);
    }
    return chessBoard
  }

  return (
    <div className='flex-1'> 
      {createBoard()}
    </div>
  );
}

// Square component
const Square: React.FC<{ position: string, squareColor: string }> = ({ position, squareColor }) => {
  const { challenger, opponent, gameId, gameState, sendMessage } = useContext(GameContext);
  const { currentClientUsername } = useContext(AuthContext);
  const piece = gameState ? gameState.board[position][0] : null;

  const convertMoveToAlgebraic = (piece: Piece, end: string, capture: boolean): string => {
    // Convert the details of the move to algebraic notation
    if (piece instanceof Pawn) {
      const move = (capture ? ' x' : ' ') + end;
      return move;
    }
    const firstLetter = piece.pieceName[1].toUpperCase();
    const move = firstLetter + (capture ? ' x' : ' ') + end.toLowerCase();
    return move.trim(); // Ensure no extra whitespace
  }

  const process_move = (start: string, end: string): MoveResult => {
    const copyState = {...gameState as GameState};
    if (copyState.board) {
      const startPosition = start[0] + start[1];
      const endPosition = end[0] + end[1];
      const startCol = copyState.board[startPosition][1];
      const startRow = 7 - parseInt(startPosition[1]);
    
      const piece = copyState.board[startPosition][0];
      // check if piece belongs to white, check the isWhite property of the piece to make sure it is a white piece white is dragging
      //against if it is white's turn to move. 
      if (piece) {
        if (piece.isWhite !== copyState.isWhiteTurn) {
          return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
        }
        console.log(currentClientUsername)
        if (piece.playerName !== currentClientUsername){
          return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
        }
      }

      const board = copyState.board;
      let allMoves: string[] = [];
      // find what kind of piece we are moving
      if (piece instanceof Pawn) {
          allMoves = piece.validPawnMoves(grid, board, startCol, startRow);
      } else if (piece instanceof Knight) {
          allMoves = piece.validKnightMoves(grid, board, startCol, startRow);
      } else if (piece instanceof Rook) {
          allMoves = piece.get_all_straight(grid, board, startCol, startRow);
      } else if (piece instanceof Bishop) {
          allMoves = piece.get_all_diagonal(grid, board, startCol, startRow);
      } else if (piece instanceof Queen) {
          allMoves = piece.get_all_straight(grid, board, startCol, startRow)
              .concat(piece.get_all_diagonal(grid, board, startCol, startRow));
      } else if (piece instanceof King) {
          allMoves = piece.validKingMoves(grid, board, startCol, startRow);
      }
      
      let didCapture = false;
      if (allMoves.includes(endPosition)) {
        // if the piece moving is taking an opponents piece
        if (board[endPosition][0] !== null) {
          didCapture = true;
          const endSpotpiece = board[endPosition][0];
          // update the alive and grave list for player losing a piece
          if (endSpotpiece && challenger && opponent) {
            if (challenger.alive.includes(endSpotpiece)) {
              challenger.grave.push(endSpotpiece);
              challenger.alive = challenger.alive.filter(item => item !== endSpotpiece);
            } else {
              opponent.grave.push(endSpotpiece);
              opponent.alive = opponent.alive.filter(item => item !== endSpotpiece);
            }
          }
        }


        if (piece) {
          const move = convertMoveToAlgebraic(piece, end, didCapture)
          copyState.moves.push(move)
        }
    
        // update the positions of the pieces on the board
        board[endPosition][0] = board[startPosition][0];
        board[startPosition][0] = null;
        if (board[endPosition][0] !== null) {
          const piece = board[endPosition][0];
          if (piece && challenger && opponent) {
            piece.position = endPosition;
            if (challenger.name === piece.playerName) {
              challenger.alive.forEach((p) => {
                  if (p.position === startPosition) {
                      p.position = endPosition;
                  }
              });
            } else {
              opponent.alive.forEach((p) => {
                if (p.position === startPosition) {
                    p.position = endPosition;
                }
              });
            }
          }
        }
      } else {
        return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
      }
    }
    const newTurn = copyState.isWhiteTurn ? false : true;
    copyState.isWhiteTurn = newTurn;
    return { isValid: true, newState: copyState, newChallenger: challenger, newOpponent: opponent };
  }

  const [, dropRef] = useDrop({
    accept: 'piece',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    drop: (item: any, monitor) => {
      if (item) {
        const start = item.piece.position; 
        const end = position;
        if (challenger && opponent) {
          const moveResult = process_move(start, end);
          if (moveResult.isValid) {
            if (moveResult.newChallenger && moveResult.newOpponent) {
              item.piece.moved = true;
              const jsonNewChallenger = moveResult.newChallenger.toJSON();
              const jsonNewOpponent = moveResult.newOpponent.toJSON();
              const message = JSON.stringify({
                type: 'valid-move', 
                pieceColor: item.piece.isWhite, 
                playerName: item.piece.playerName, 
                gameId: gameId, 
                newGameState: moveResult.newState, 
                newChallenger: jsonNewChallenger, 
                newOpponent: jsonNewOpponent 
              })
              sendMessage(message)
            }
          }
          else {
            alert('inValid Move');
          }
        }
      }
    },
  })

  return (
    <div ref={dropRef} className={`w-square h-square flex items-center justify-center ${squareColor}`}>
      {piece ? <DraggablePiece piece={piece} /> : null}
    </div>
  );
};

const DraggablePiece: React.FC<{ piece: Piece }> = ({ piece }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ isDragging }, dragRef] = useDrag({
    type: 'piece',
    item: { type: 'piece', piece },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  return (
    <div ref={dragRef}>
      {svgIcons[piece.pieceName]}
    </div>
  )
}
