namespace LudoSphere.AI
{
    /// <summary>
    /// Extra turn on rolling 6, cutting an opponent, or reaching home.
    /// </summary>
    public static class ExtraTurnHandler
    {
        public struct MoveResult
        {
            public bool Success;
            public bool GameOver;
            public int CaptureCount;
            public bool ReachedHome;
            public bool UsedSix;
            public int SixCountAtMove;
        }

        public static MoveResult ExecuteMove(LudoGameState state, int tokenIndex)
        {
            var result = new MoveResult();
            if (state.Phase != "moving") return result;
            if (!state.MovableTokens.Contains(tokenIndex)) return result;

            var player = state.Players[state.CurrentTurn];
            var oldPos = player.Tokens[tokenIndex];
            var diceUsed = state.DiceValue ?? 0;
            result.UsedSix = diceUsed == 6;
            result.SixCountAtMove = state.ConsecutiveSixes;

            var newPos = TokenMovement.CalculateNewPosition(player.Color, oldPos, diceUsed);
            if (newPos == null) return result;

            var np = newPos.Value;
            player.Tokens[tokenIndex] = np;

            if (np == 59)
            {
                player.FinishedTokens++;
                result.ReachedHome = true;
            }

            var capturesBefore = CountOpponentsOn(state, player.Color, np);
            OpponentCutLogic.ApplyCaptures(state, player.Color, np);
            result.CaptureCount = capturesBefore;
            result.Success = true;

            state.DiceRolled = false;
            state.DiceValue = null;
            state.MovableTokens.Clear();

            var extraFromSix = result.UsedSix && result.SixCountAtMove < 3;
            var extraFromCapture = result.CaptureCount > 0;
            var extraFromHome = result.ReachedHome;

            if (extraFromSix || extraFromCapture || extraFromHome)
            {
                state.CanRoll = true;
                state.Phase = "rolling";
                if (!extraFromSix) state.ConsecutiveSixes = 0;
            }
            else
            {
                state.ConsecutiveSixes = 0;
                AdvanceTurn(state);
            }

            state.LastActionType = "token_move";
            return result;
        }

        static int CountOpponentsOn(LudoGameState state, PlayerColor moverColor, int pos)
        {
            var n = 0;
            foreach (var opp in state.Players)
            {
                if (opp.Color == moverColor) continue;
                foreach (var t in opp.Tokens)
                    if (t == pos) n++;
            }
            return n;
        }

        public static void AdvanceTurn(LudoGameState state)
        {
            var count = state.Players.Count;
            var next = (state.CurrentTurn + 1) % count;
            var attempts = 0;

            while (state.Players[next].FinishedTokens >= 4 && attempts < count)
            {
                next = (next + 1) % count;
                attempts++;
            }

            state.CurrentTurn = next;
            state.CanRoll = true;
            state.DiceRolled = false;
            state.DiceValue = null;
            state.MovableTokens.Clear();
            state.Phase = "rolling";
        }

        public static void HandleTurnTimeout(LudoGameState state)
        {
            if (state.Phase == "moving" && state.MovableTokens.Count > 0)
                ExecuteMove(state, state.MovableTokens[0]);
            else
                AdvanceTurn(state);
        }
    }
}
