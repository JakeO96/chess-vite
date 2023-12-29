import { FC, useContext, useEffect, useState } from "react"
import ExpressAPI from "../api/express-api";
import { AuthContext } from "../context/AuthContext";
import { GameContext, StartGameMessageObject } from "../context/GameContext";
import { Player, Piece, Pawn, Knight, Rook, Bishop, Queen, King, grid} from "../utils/game-utils";
import { UserList } from './UserList'
import { Navigate } from "react-router";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {

  const [users, setUsers] = useState<string[]>([]);
  const [usernameSendInviteTo, setUsernameSendInviteTo] = useState<string>('')
  const [selectUsernameMessage, setSelectUsernameMessage] = useState<boolean>(false)
  const [disableInvite, setDisableInvite] = useState<boolean>(true)
  const [navigateReady, setNavigateReady] = useState<boolean>(false)
  const [playerListOpen, setPlayerListOpen] = useState<boolean>(false)
  const { currentClientUsername } = useContext(AuthContext)
  const { challenger, opponent, gameId, gameState, setGameState, setGameId, setChallenger, setOpponent, sendMessage, lastMessage, initiatePlayers } = useContext(GameContext)

  useEffect(() => {
    function handleIncomingData(data: StartGameMessageObject) {
      if (data.type === 'game-invite') {
        const deserializedChallenger = Player.fromJSON(data.challenger);
        const accepted = window.confirm(`You have been invited to a game by ${deserializedChallenger.name}. Do you accept?`);
        const responseMessage = JSON.stringify({ type: 'game-invite-response', accepted, challenger: data.challenger, opponent: data.opponent });
        sendMessage(responseMessage);
      } else if (data.type === 'create-game') {
        expressApi.createGame(data, ((gameId) => {
          const responseMessage = JSON.stringify({ type: 'game-created', challenger: data.challenger, opponent: data.opponent, gameId: gameId})
          sendMessage(responseMessage);
        }))
      } else if (data.type === 'start-game') {
        const deserializedOpponent = Player.fromJSON(data.opponent);
        const deserializedChallenger = Player.fromJSON(data.challenger);

        if (gameState) {
          let newGameState = {...gameState}

          //set all the pieces in their initial positions on the board
          const allPieces = deserializedChallenger.alive.concat(deserializedOpponent.alive)
          const allPositions = allPieces.map((p: Piece) => p.position)
          for (const spot in newGameState.board) {
            if (allPositions.includes(spot)) {
              for (const p of allPieces) {
                if (p.position === spot) {
                  if (newGameState.board) {
                    newGameState.board[spot][0] = p;
                  }
                }
              }
            }
          }
          //get all valid moves for all pieces on the board5
          const board = newGameState.board
          for (const piece of allPieces) {
            let validPieceMoves: string[] = []
            const position = piece.position
            const startCol = board[position][1]
            const startRow = 7 - parseInt(position[1]);
            if (piece instanceof Pawn) {
              validPieceMoves = piece.validPawnMoves(grid, board, startCol, startRow);
            } else if (piece instanceof Knight) {
                validPieceMoves = piece.validKnightMoves(grid, board, startCol, startRow);
            } else if (piece instanceof Rook) {
                validPieceMoves = piece.validRookMoves(grid, board, startCol, startRow);
            } else if (piece instanceof Bishop) {
                validPieceMoves = piece.validBishopMoves(grid, board, startCol, startRow);
            } else if (piece instanceof Queen) {
                validPieceMoves = piece.validQueenMoves(grid, board, startCol, startRow)
            } else if (piece instanceof King) {
                validPieceMoves = piece.validKingMoves(grid, board, startCol, startRow);
            }
            if (piece.playerColor === 'black') {
              newGameState.allValidBlackMoves[position] = validPieceMoves
            } else {
              newGameState.allValidWhiteMoves[position] = validPieceMoves
            }
          }
          //console.log(newGameState.allValidBlackMoves)
          //console.log('black moves above white moves below ----------------------------------')
          //console.log(newGameState.allValidWhiteMoves)
          setGameState(newGameState) 
        }
        setChallenger(deserializedChallenger);
        setOpponent(deserializedOpponent);
        if (data.gameId) {
          setGameId(data.gameId);
        }
        setNavigateReady(true);
      } else if (data.type === 'game-decline') {
        alert(`${data.initiatingUser} declined to start a game.`);
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
  }, [lastMessage, expressApi, sendMessage, setGameId, setChallenger, setOpponent, currentClientUsername, challenger, opponent]);

  const handleFindGameClick = () => {
    expressApi.getLoggedInUsers()
    .then((res: Response) =>  res.json() )
    .then((data) => {
      setUsers(data);
      setPlayerListOpen(true)
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const handleUsernameClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const opponentUsername = evt.currentTarget.dataset.username;
    if (opponentUsername) {
      setSelectUsernameMessage(false)
      setUsernameSendInviteTo(opponentUsername)
    }
    setDisableInvite(false)
  }

  const handleSendInviteClick = () => {
    if (usernameSendInviteTo === '') {
      setSelectUsernameMessage(true)
      return
    }
    const [initializedChallenger, initializedOpponent] = usernameSendInviteTo ? initiatePlayers(currentClientUsername, usernameSendInviteTo) : [null, null]
    if (initializedChallenger && initializedOpponent) {
      const jsonChallenger = initializedChallenger.toJSON();
      const jsonOpponent = initializedOpponent.toJSON();
      const message = JSON.stringify({ type: 'game-invite', challenger: jsonChallenger, opponent: jsonOpponent });
      sendMessage(message);
    }
  }

  return (
    <>
      {
        navigateReady ?  (
          <Navigate to={`/game/${gameId}`} />
        ) :
          playerListOpen ? (
            <div className="flex flex-col justify-center items-center">
              <UserList users={users} handleUsernameClick={handleUsernameClick} selectedUsername={usernameSendInviteTo} />
              <button 
                onClick={handleSendInviteClick}
                className={`w-32 mt-2 py-1 px-2 rounded font-semibold transition duration-150 ease-in-out 
                          ${disableInvite ? 'bg-noct-gray-100 opacity-80 text-noct-gray-600 border' : 'bg-noct-gray-500 text-noct-black hover:bg-noct-gray-600 border-2 border-noct-white'}`}
              >
                Send Invite
              </button>
              {selectUsernameMessage ? (
                <p className="text-noct-orange">Select a username from the list above</p>
              ) : null}
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button onClick={handleFindGameClick} className="bg-noct-gray-500 py-1 px-2 rounded font-semibold transition duration-150 ease-in-out hover:scale-95" >
                Find a game 
              </button>
            </div>
          )
      }
    </>
  )
}