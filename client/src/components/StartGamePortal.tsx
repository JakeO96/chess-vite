import { FC, useContext, useEffect, useState } from "react"
import ExpressAPI from "../api/express-api";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GameContext, StartGameMessageObject } from "../context/GameContext";
import { ReadyState } from "react-use-websocket";
import { Player } from "../utils/game-utils";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {

  const [navigateReady, setNavigateReady] = useState<boolean>(false);
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentClientUsername } = useContext(AuthContext)
  const { challenger, opponent, gameId, setGameId, setChallenger, setOpponent, sendMessage, lastMessage, readyState, initiatePlayers } = useContext(GameContext)

  useEffect(() => {
    expressApi.getLoggedInUsers()
      .then((res) =>  res.json() )
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [expressApi]);

  useEffect(() => {
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

  const handleUsernameClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const opponentUsername = evt.currentTarget.dataset.username;
    const [initializedChallenger, initializedOpponent] = opponentUsername ? initiatePlayers(currentClientUsername, opponentUsername) : [null, null]
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
      navigateReady ? (
        <Navigate to={`/game/${gameId}`} />
      ) :  isLoading ? (
          <p>Loading...</p>
        ) : users.length > 0 ? (
          <ul>
            {users.map((username, index) => (
              <li key={index}>
                <button 
                  disabled={readyState !== ReadyState.OPEN} 
                  data-username={username} 
                  onClick={handleUsernameClick}>
                  {username}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users are currently logged in.</p>
        )
      }
    </>
  )
}