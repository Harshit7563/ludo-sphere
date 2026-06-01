using System;
using UnityEngine;

namespace LudoSphere.AI
{
    /// <summary>
    /// Prevents AI from hanging — force a move or skip after max actions / elapsed time.
    /// </summary>
    public class AntiStuckTimeout
    {
        public const int MaxActions = 24;
        public const int MaxElapsedMs = 22000;

        int _actionCount;
        long _turnStartedAtMs;
        int _turnSeat = -1;

        public void ResetForSeat(int seatIndex)
        {
            _turnSeat = seatIndex;
            _actionCount = 0;
            _turnStartedAtMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        public void RecordAction()
        {
            _actionCount++;
        }

        public bool IsTriggered(int currentSeat)
        {
            if (_turnSeat != currentSeat) return false;
            var elapsed = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - _turnStartedAtMs;
            return _actionCount >= MaxActions || elapsed >= MaxElapsedMs;
        }

        /// <summary>Force first legal move or advance turn via timeout handler.</summary>
        public static bool ForceUnstick(LudoGameState state, Action<LudoGameState> onStateChanged = null)
        {
            Debug.LogWarning("[AI] Anti-stuck triggered");

            if (state.Phase == "moving" && state.MovableTokens.Count > 0)
            {
                var idx = state.MovableTokens[0];
                var result = ExtraTurnHandler.ExecuteMove(state, idx);
                if (result.Success)
                {
                    onStateChanged?.Invoke(state);
                    return true;
                }
            }

            state.ConsecutiveSixes = 0;
            ExtraTurnHandler.HandleTurnTimeout(state);
            onStateChanged?.Invoke(state);
            return false;
        }
    }
}
