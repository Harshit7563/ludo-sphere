import { useEffect, useRef } from 'react';
import { useSound } from '../context/SoundContext';

/**
 * Wires socket + game state events to premium SFX.
 */
export function useGameSounds({ socket, gameState, winner, userId }) {
  const { play, enabled } = useSound();
  const prevTurnRef = useRef(null);
  const prevChatLenRef = useRef(0);
  const diceLandPlayedRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const onStarted = () => play('gameStart');
    const onDice = ({ value }) => {
      play('diceRoll');
      diceLandPlayedRef.current = false;
      setTimeout(() => {
        if (!diceLandPlayedRef.current) {
          diceLandPlayedRef.current = true;
          play('diceLand', { value });
        }
      }, 900);
    };
    const onMoveResult = ({ captures }) => {
      if (captures?.length) play('capture');
    };

    socket.on('game:started', onStarted);
    socket.on('game:dice', onDice);
    socket.on('game:move_result', onMoveResult);

    return () => {
      socket.off('game:started', onStarted);
      socket.off('game:dice', onDice);
      socket.off('game:move_result', onMoveResult);
    };
  }, [socket, play]);

  useEffect(() => {
    if (!gameState || winner) return;
    const turn = gameState.currentTurn;
    if (prevTurnRef.current === null) {
      prevTurnRef.current = turn;
      return;
    }
    if (prevTurnRef.current !== turn) {
      const current = gameState.players?.[turn];
      if (String(current?.id) === String(userId)) play('turnMine');
      else play('turnOther');
      prevTurnRef.current = turn;
    }
  }, [gameState?.currentTurn, gameState?.players, userId, winner, play]);

  useEffect(() => {
    if (!gameState?.chat) return;
    const len = gameState.chat.length;
    if (len > prevChatLenRef.current) {
      const last = gameState.chat[len - 1];
      if (last?.emoji) play('emoji');
      else if (last?.message) play('chat');
    }
    prevChatLenRef.current = len;
  }, [gameState?.chat, play]);

  useEffect(() => {
    if (!winner || !enabled) return;
    const isWinner = winner.winnerId === userId;
    play(isWinner ? 'win' : 'lose');
  }, [winner, userId, play, enabled]);
}
