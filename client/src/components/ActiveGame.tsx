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
          <div className='flex justify-start p-0 m-0 max-w-full' key={index / 2}>
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
          <div className="flex-1 flex space-x-2 flex-wrap bg-noct-black mb-40">
            {challenger.color === 'white' ? challenger.grave.map(renderWhiteGravePiece) : opponent.grave.map(renderWhiteGravePiece)}
          </div>
          <div className="flex-1 flex space-x-2 flex-wrap bg-noct-black mt-40">
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

    <div className="flex items-stretch justify-between">
      <div className="flex-1 flex flex-wrap">
        <div className="flex-1 flex flex-wrap overflow-y-auto h-[500px] ml-4 mr-14">
          <div className="flex space-x-4">
            { gameState ? displayMoves(gameState) : null }
          </div>
        </div>
      </div>

      <div className="flex-1">
        <ChessBoard />
      </div>

      { displayGraveyards() }
    </div>

    <div className='flex justify-center mt-2'>
      { displayWhitePlayerName() }
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
      chessBoard.push(<div key={row_num} className="flex items-center">{row}</div>);
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
    const restoredPiece = Piece.fromJSON(piece)
    if (restoredPiece instanceof Pawn) {
      const move = (capture ? ' x' : ' ') + end;
      return move;
    }
    const firstLetter = piece.pieceName[1].toUpperCase();
    const move = firstLetter + (capture ? ' x' : ' ') + end.toLowerCase();
    return move.trim(); // Ensure no extra whitespace
  }

  const processMove = (startPosition: string, endPosition: string): MoveResult => {
    // create copy board so we are not mutating the original state
    const copyState = {...gameState as GameState};
    if (copyState.board) {
      //get the piece being moved
      const piece = copyState.board[startPosition][0];
      // check if piece belongs to white, check the isWhite property of the piece to make sure it is a white piece white is dragging
      //if it is white's turn to move. 
      if (piece) {
        if (piece.isWhite !== copyState.isWhiteTurn) {
          return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
        }
        if (piece.playerName !== currentClientUsername){
          return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
        }
        if (piece.playerColor === 'white') {
          if (!copyState.allValidWhiteMoves[startPosition].includes(endPosition)) {
            return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent }
          }
        } else if (piece.playerColor === 'black') {
          if (!copyState.allValidBlackMoves[startPosition].includes(endPosition)) {
            return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
          }
        }

        const board = copyState.board;
        let didCapture = false;
        if (board[endPosition][0] !== null) { //there is a piece where the mover is dropping
          didCapture = true;
          const endSpotpiece = board[endPosition][0];
          // update the alive and grave list for player losing a piece
          if (endSpotpiece && challenger && opponent) {
            if (challenger.name === endSpotpiece.playerName) {
              challenger.grave.push(endSpotpiece);
              challenger.alive = challenger.alive.filter(item => item.position !== endSpotpiece.position);
            } else {
              opponent.grave.push(endSpotpiece);
              opponent.alive = opponent.alive.filter(item => item.position !== endSpotpiece.position);
            }
          }
        }
        
        const move = convertMoveToAlgebraic(piece, endPosition, didCapture)
        copyState.moves.push(move)  
    
        // update the positions of the pieces on the board
        board[endPosition][0] = board[startPosition][0];
        board[startPosition][0] = null;
        if (board[endPosition][0] !== null) {
          const piece = board[endPosition][0];
          if (piece && challenger && opponent) {
            //console.log('challenger name', challenger.name)
            //console.log('piece playerName', piece.playerName)
            //console.log('opponent name', opponent.name)
            if (challenger.name === piece.playerName) {
              console.log('before for each')
              challenger.alive.forEach((p) => {
                  //console.log('piece position', p.position)
                  //console.log('startPosition', startPosition)
                  if (p.position === startPosition) {
                      p.position = endPosition;
                      console.log('just before move check')
                      if (!p.moved) {
                        console.log('piece being marked moved')
                        p.moved = true
                      }
                  }
              });
            } else if (opponent.name === piece.playerName) {
              console.log('before for each')
              opponent.alive.forEach((p) => {
                //console.log('piece position', p.position)
                //console.log('startPosition', startPosition)
                if (p.position === startPosition) {
                    p.position = endPosition;
                    console.log('just before move check')
                    if (!p.moved) {
                      console.log('piece being marked moved')
                      p.moved = true
                    }
                }
              });
            }
            piece.position = endPosition;
          }
        }

      }
    }
    const newTurn = copyState.isWhiteTurn ? false : true;
    copyState.isWhiteTurn = newTurn;
    return { isValid: true, newState: copyState, newChallenger: challenger, newOpponent: opponent };
  }

  const [, dropRef] = useDrop({
    accept: 'piece',
    drop: (item: any) => {
      if (item) {
        const start = item.piece.position; 
        const end = position; //position prop of the square being dropped on
        if (challenger && opponent) {
          const moveResult = processMove(start, end);
          if (moveResult.isValid) {
            if (moveResult.newChallenger && moveResult.newOpponent) {
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
  const [, dragRef] = useDrag({
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
