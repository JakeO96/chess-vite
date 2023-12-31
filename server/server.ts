import {authRouter as authRoutes} from './routes/authRoutes';
import {userRouter as userRoutes} from './routes/userRoutes';
import {gameRouter as gameRoutes} from './routes/gameRoutes';
import { errorHandler } from "./middleware/errorHandler"
import { connectDb } from "./config/dbConnection"
import express from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import WebSocket from 'ws';
import http, { IncomingMessage} from 'http';
import jwt from 'jsonwebtoken';
import { Player, Piece, Pawn, Knight, Rook, Bishop, Queen, King, grid } from '../shared/game-utils';
import dotenv from 'dotenv-safe';
dotenv.config();

interface ExtendedIncomingMessage extends IncomingMessage {
  user?: { 
    username?: string; 
  };
}

interface ExtendedWebSocket extends WebSocket {
  username?: string;
}

interface ActiveConnections {
  [key: string]: ExtendedWebSocket;
}

interface ActiveGames {
  [key: string]: Player[];
}

connectDb();
const app = express();
const port = process.env.PORT || 3001;
const devClientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const prodClientUrl = process.env.PROD_CLIENT_URL || 'https://games.cynkronic.com'
const wwwProdClientUrl = process.env.WWW_PROD_CLIENT_URL || 'https://www.games.cynkronic.com'

const allowedOrigins = [devClientUrl, prodClientUrl, wwwProdClientUrl];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);
app.use(errorHandler);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
})

const wss = new WebSocket.Server({ 
  server, 
  verifyClient: (info, callback) => {
    const cookieString = info.req.headers.cookie || "";
    const cookies = cookieString.split('; ').reduce((acc, current) => {
      const [name, value] = current.split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.token;
    const secret = process.env.JWT_SECRET;
    if (token && secret) {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          callback(false);
        } else {
          if (decoded && typeof decoded !== 'string') {
            (info.req as ExtendedIncomingMessage).user = { username: decoded.user.username };
            callback(true);
          }
        }
      });
    }
  } 
});

let activeConnections: ActiveConnections = {};
console.log('activeConnections', activeConnections)
let activeGames: ActiveGames  = {};
console.log('activeGames', activeGames)

wss.on('connection', (ws: ExtendedWebSocket, req: ExtendedIncomingMessage) => {
  if (req.user && req.user.username) {
    console.log('username sent with connection request', req.user.username)
    ws.username = req.user.username;
    activeConnections[ws.username] = ws;
  }
  console.log('activeConnection username right after connection', ws.username)
  ws.send(JSON.stringify({ message: `Connected to WebSocket server as ${ws.username}` }));

  ws.on('message', (message) => {
    //console.log(`Received message from ${ws.username}: ${message}`);
    const messageStr = typeof message === 'string' ? message : message.toString();
    const data = JSON.parse(messageStr);
    if (data.type === 'game-invite') {
      const opponent = Player.fromJSON(data.opponent)
      const clientGettingTheMessageSocket = activeConnections[opponent.name];
      if (clientGettingTheMessageSocket) {
        if (clientGettingTheMessageSocket.readyState === WebSocket.OPEN) {
          clientGettingTheMessageSocket.send(message);
        }
      }
    } else if (data.type === 'game-invite-response') {
      if (ws.username) {
        const opponent = Player.fromJSON(data.opponent);
        const challenger = Player.fromJSON(data.challenger);
        const clientSendingTheMessageSocket = activeConnections[opponent.name];
        if (clientSendingTheMessageSocket) {
          const clientGettingTheMessageSocket = activeConnections[challenger.name];
          if (clientGettingTheMessageSocket) {
            if (data.accepted) {
              if (clientSendingTheMessageSocket.readyState === WebSocket.OPEN || clientGettingTheMessageSocket.readyState === WebSocket.OPEN) {
                data.type = 'create-game';
                const newMessage = JSON.stringify(data);
                clientGettingTheMessageSocket.send(newMessage);
              }
            } else {
              if (clientGettingTheMessageSocket.readyState === WebSocket.OPEN) {
                data.type = 'game-decline';
                const newMessage = JSON.stringify(data);
                clientGettingTheMessageSocket.send(newMessage);
              }
            }
          }
        }
      } else {
        console.log('failed at ws.username check');
      }
    } else if (data.type === 'game-created') {
      if (ws.username) {
        const opponent = Player.fromJSON(data.opponent);
        const challenger = Player.fromJSON(data.challenger);
        activeGames[data.gameId] = [challenger, opponent];
        const opponentClientSocket = activeConnections[opponent.name];
        const challengerClientSocket = activeConnections[challenger.name];
        if (opponentClientSocket && challengerClientSocket) {
          data.type = 'start-game'
          const newMessage = JSON.stringify(data);
          opponentClientSocket.send(newMessage);
          challengerClientSocket.send(newMessage);
        }
      }     
    } else if (data.type === 'valid-move') {
      if (ws.username) {
        if (activeGames[data.gameId]) {
          const [challenger, opponent] = activeGames[data.gameId];
          let gameState = data.newGameState
          let gameChallenger = data.newChallenger
          let gameOpponent = data.newOpponent
          
          //get all valid moves for all pieces on the board
          const allPieces = gameChallenger.alive.concat(gameOpponent.alive)
          const board = gameState.board
          // console.log(board)
          console.log ('######## valid-move firing ##################################################')
          for (const piece of allPieces) {
            const restoredPiece = Piece.fromJSON(piece)
            let validPieceMoves: string[] = []
            const position = piece.position
            const startCol = board[position][1]
            const startRow = 7 - parseInt(position[1]);
            if (restoredPiece instanceof Pawn) {
              console.log(restoredPiece)
              validPieceMoves = restoredPiece.validPawnMoves(grid, board, startCol, startRow);
            } else if (restoredPiece instanceof Knight) {
                validPieceMoves = restoredPiece.validKnightMoves(grid, board, startCol, startRow);
            } else if (restoredPiece instanceof Rook) {
                validPieceMoves = restoredPiece.validRookMoves(grid, board, startCol, startRow);
            } else if (restoredPiece instanceof Bishop) {
                validPieceMoves = restoredPiece.validBishopMoves(grid, board, startCol, startRow);
            } else if (restoredPiece instanceof Queen) {
                validPieceMoves = restoredPiece.validQueenMoves(grid, board, startCol, startRow)
            } else if (restoredPiece instanceof King) {
                validPieceMoves = restoredPiece.validKingMoves(grid, board, startCol, startRow);
            }
            if (piece.playerColor === 'black') {
              gameState.allValidBlackMoves[position] = validPieceMoves
            } else {
              gameState.allValidWhiteMoves[position] = validPieceMoves
            }
          } 

          const newMessage = JSON.stringify({
            type: 'move-made', 
            newGameState: gameState, 
            newChallenger: gameChallenger, 
            newOpponent: gameOpponent
          })
          const challengerClientSocket = activeConnections[challenger.name];
          const opponenetClientSocket = activeConnections[opponent.name];
          challengerClientSocket.send(newMessage);
          opponenetClientSocket.send(newMessage);
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error with user ${ws.username}:`, error);
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected: ${ws.username}, Code: ${code}, Reason: ${reason}`);
    if (ws.username) {
      delete activeConnections[ws.username];
    }
  });
});
