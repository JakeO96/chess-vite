import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Player, assignBlackPieces, assignWhitePieces } from '../utils/game-utils';
import { Piece, grid } from '../utils/game-utils';
import { JsonObject } from 'react-use-websocket/dist/lib/types';
import { AuthContext } from './AuthContext';

export interface StartGameMessageObject extends JsonObject {
  type: string;
  accepted?: boolean;
  challenger: string;
  opponent: string;
  gameId?: string;
}

export interface GameState {
  board: {
    [key: string]: [Piece | null, number];
  };
  isWhiteTurn: boolean;
  moves: string[];
}

type GameContextType = {
  challenger: Player | undefined;
  opponent: Player | undefined;
  gameId: string;
  gameState: GameState | undefined;
  setGameId: React.Dispatch<React.SetStateAction<string>>;
  setChallenger: React.Dispatch<React.SetStateAction<Player | undefined>>;
  setOpponent: React.Dispatch<React.SetStateAction<Player | undefined>>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: ReadyState;
  initiatePlayers: (challengerUsername: string, opponentUsername: string) => Player[];
};

export const GameContext = createContext<GameContextType>({
  challenger: undefined,
  opponent: undefined,
  gameId: '',
  gameState: undefined,
  setGameId: () => { },
  setChallenger: () => { },
  setOpponent: () => { },
  setGameState: () => { },
  sendMessage: () => {},  // default function
  lastMessage: null,
  readyState: ReadyState.UNINSTANTIATED,
  initiatePlayers: () => [],
});

type GameProviderProps = {
  children: ReactNode;
};

const produceInitialGameState = () => {
  let cordCount = 0;
  const newGameState: GameState = {board: {}, isWhiteTurn: true, moves: []};
  for (const col of grid) {
    for (const cord of col) {
      newGameState.board[cord] = [null, cordCount];
    }
    cordCount += 1;
  }
  return newGameState;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initialState: GameState = produceInitialGameState();

  const [challenger, setChallenger] = useState<Player | undefined>(undefined);
  const [opponent, setOpponent] = useState<Player | undefined>(undefined);
  const [gameId, setGameId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(initialState);
  const { isLoggedIn } = useContext(AuthContext)
  const [socketUrl, setSocketUrl] = useState<string>('');

  const initiatePlayers = (challengerUsername: string, opponentUsername: string): Player[] =>  {
    let player1 = new Player(challengerUsername, '', [], []);
    let player2 = new Player(opponentUsername, '', [], []);
    const r = Math.floor(Math.random() * 2);
    if (r === 0) {
      player1.color = 'white';
      player2.color = 'black';
      assignWhitePieces(player1);
      assignBlackPieces(player2);
    } else {
      player1.color = 'black';
      player2.color = 'white';
      assignWhitePieces(player2);
      assignBlackPieces(player1);
    }
    return [player1, player2];
  }
  
  useEffect(() => {
    if (isLoggedIn) {
      setSocketUrl('ws://localhost:3001');
    }
  }, [isLoggedIn]);

  const {
    sendMessage,
    lastMessage,
    readyState
  } = useWebSocket<StartGameMessageObject>(socketUrl, {
    onOpen: () => console.log('opened'),
    shouldReconnect: (closeEvent) => true,
  }, socketUrl !== '');

  return (
    <GameContext.Provider value={{ challenger, opponent, gameId, gameState, setGameId, setChallenger, setOpponent, setGameState, sendMessage, lastMessage, readyState, initiatePlayers }}>
      {children}
    </GameContext.Provider>
  );
};