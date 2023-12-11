//need to re commit
import { FC, useContext, useEffect, useState } from "react"
import ExpressAPI from "../api/express-api";
import { AuthContext } from "../context/AuthContext";
import { GameContext, StartGameMessageObject } from "../context/GameContext";
import { Player } from "../utils/game-utils";
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
  const { challenger, opponent, gameId, setGameId, setChallenger, setOpponent, sendMessage, lastMessage, initiatePlayers } = useContext(GameContext)

  useEffect(() => {
    console.log('useEffect that handles websocket messages rendering')
    function handleIncomingData(data: StartGameMessageObject) {
      if (data.type === 'game-invite') {
        console.log(data.challenger)
        console.log(data.opponent)
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
        console.log('challenger in StartGamePortal start-game response vvv')
        console.log(deserializedChallenger)
        console.log('opponent in StartGamePortal start-game response vvv')
        console.log(deserializedOpponent)
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