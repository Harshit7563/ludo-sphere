namespace LudoSphere.AI
{
    /// <summary>
    /// Detects capture opportunities and danger from opponent tokens.
    /// </summary>
    public static class OpponentCutLogic
    {
        public static int CountCapturesOnLand(LudoGameState state, PlayerColor moverColor, int newPos)
        {
            if (newPos <= 0 || newPos > 52 || SafeZoneDetection.IsSafePosition(newPos))
                return 0;
            if (TokenMovement.IsBlockForMover(state, newPos, moverColor))
                return 0;

            var n = 0;
            foreach (var opp in state.Players)
            {
                if (opp.Color == moverColor) continue;
                foreach (var t in opp.Tokens)
                    if (t == newPos) n++;
            }
            return n;
        }

        /// <summary>Can any opponent land on targetPos with a single dice roll (1–6)?</summary>
        public static bool IsReachableByOpponent(LudoGameState state, int targetPos, PlayerColor moverColor)
        {
            if (targetPos <= 0 || targetPos > 52 || SafeZoneDetection.IsSafePosition(targetPos))
                return false;

            foreach (var opp in state.Players)
            {
                if (opp.Color == moverColor) continue;
                foreach (var oppPos in opp.Tokens)
                {
                    if (oppPos <= 0 || oppPos >= 53) continue;
                    for (var dice = 1; dice <= 6; dice++)
                    {
                        var land = TokenMovement.CalculateNewPosition(opp.Color, oppPos, dice);
                        if (land == targetPos) return true;
                    }
                }
            }
            return false;
        }

        public static void ApplyCaptures(LudoGameState state, PlayerColor moverColor, int newPos)
        {
            if (newPos <= 0 || newPos > 52) return;
            if (SafeZoneDetection.IsSafePosition(newPos)) return;
            if (TokenMovement.IsBlockForMover(state, newPos, moverColor)) return;

            foreach (var opp in state.Players)
            {
                if (opp.Color == moverColor) continue;
                for (var i = 0; i < 4; i++)
                {
                    if (opp.Tokens[i] == newPos)
                        opp.Tokens[i] = 0;
                }
            }
        }
    }
}
