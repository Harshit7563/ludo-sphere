import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      setConnecting(false);
      setSocketError(null);
      setGameState(null);
      setRoomData(null);
      return undefined;
    }

    setConnecting(true);
    setSocketError(null);

    const s = io(SOCKET_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 1000,
      timeout: 15000,
    });

    socketRef.current = s;
    setSocket(s);

    const onConnect = () => {
      setConnected(true);
      setConnecting(false);
      setSocketError(null);
    };

    const onDisconnect = (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') {
        s.connect();
      }
    };

    const onConnectError = (err) => {
      setConnecting(false);
      setConnected(false);
      setSocketError(
        err?.message?.includes('Authentication')
          ? 'Session expired. Please login again.'
          : import.meta.env.DEV
            ? 'Cannot reach game server. Run: npm run dev'
            : 'Cannot connect to game server. Check your connection or try again.'
      );
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onConnectError);
    s.on('game:state', setGameState);
    s.on('room:updated', setRoomData);
    s.on('game:started', (data) => {
      setRoomData(data);
      setGameState(null);
    });
    s.on('error', ({ message }) => {
      setSocketError(message || 'Game server error');
    });
    s.on('socket:ready', () => {
      setSocketError(null);
    });

    if (s.connected) onConnect();

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onConnectError);
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setConnecting(false);
    };
  }, [user?.id]);

  const joinRoom = useCallback((roomCode) => {
    socketRef.current?.emit('room:join', { roomCode });
  }, []);

  const setReady = useCallback((roomCode) => {
    socketRef.current?.emit('room:ready', { roomCode });
  }, []);

  const rollDice = useCallback((roomCode) => {
    socketRef.current?.emit('game:roll', { roomCode });
  }, []);

  const moveToken = useCallback((roomCode, tokenIndex) => {
    socketRef.current?.emit('game:move', { roomCode, tokenIndex });
  }, []);

  const sendChat = useCallback((roomCode, message, emoji) => {
    socketRef.current?.emit('chat:message', { roomCode, message, emoji });
  }, []);

  const sendEmoji = useCallback((roomCode, emoji) => {
    socketRef.current?.emit('emoji:send', { roomCode, emoji });
  }, []);

  const joinMatchmaking = useCallback((mode, entryFee) => {
    socketRef.current?.emit('matchmaking:join', { mode, entryFee });
  }, []);

  const leaveMatchmaking = useCallback(() => {
    socketRef.current?.emit('matchmaking:leave');
  }, []);

  const startAiGame = useCallback((mode = '2p', difficulty = 'medium') => {
    const s = socketRef.current;
    if (!s?.connected) {
      throw new Error('Socket not connected. Wait a moment or refresh after npm run dev.');
    }
    setGameState(null);
    setRoomData(null);
    setSocketError(null);
    s.emit('ai:start', { mode, difficulty });
  }, []);

  const reconnectSocket = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      connecting,
      socketError,
      gameState,
      roomData,
      setGameState,
      setRoomData,
      setSocketError,
      joinRoom,
      setReady,
      rollDice,
      moveToken,
      sendChat,
      sendEmoji,
      joinMatchmaking,
      leaveMatchmaking,
      startAiGame,
      reconnectSocket,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
