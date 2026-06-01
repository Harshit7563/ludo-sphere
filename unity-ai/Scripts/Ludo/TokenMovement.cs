using System.Collections.Generic;

namespace LudoSphere.AI
{
    /// <summary>
    /// Position math and movable-token resolution (blocks, yard exit on 6).
    /// </summary>
    public static class TokenMovement
    {
        public static int GetStepsFromStart(PlayerColor color, int position)
        {
            var start = SafeZoneDetection.GetColorStart(color);
            if (position == 0) return -1;
            if (position == 59) return 58;
            if (position >= 53 && position <= 58) return 51 + (position - 52);
            if (position >= 1 && position <= 52)
            {
                var steps = position - start;
                if (steps <= 0) steps += 52;
                return steps;
            }
            return -1;
        }

        public static int? PositionFromSteps(PlayerColor color, int steps)
        {
            var start = SafeZoneDetection.GetColorStart(color);
            if (steps < 1 || steps > 58) return null;
            if (steps <= 51)
            {
                var p = start + steps;
                if (p > 52) p -= 52;
                return p;
            }
            if (steps <= 57) return 52 + (steps - 51);
            return 59;
        }

        public static int? CalculateNewPosition(PlayerColor color, int currentPos, int dice)
        {
            if (currentPos == 0) return dice == 6 ? SafeZoneDetection.GetColorStart(color) + 1 : null;
            if (currentPos == 59) return null;

            var steps = GetStepsFromStart(color, currentPos);
            if (steps < 0) return null;

            var newSteps = steps + dice;
            if (newSteps > 58) return null;
            return PositionFromSteps(color, newSteps);
        }

        static Dictionary<PlayerColor, int> TokenCountsAt(LudoGameState state, int position)
        {
            var counts = new Dictionary<PlayerColor, int>();
            foreach (var p in state.Players)
            {
                foreach (var t in p.Tokens)
                {
                    if (t != position) continue;
                    counts.TryGetValue(p.Color, out var n);
                    counts[p.Color] = n + 1;
                }
            }
            return counts;
        }

        public static bool IsBlockForMover(LudoGameState state, int position, PlayerColor moverColor)
        {
            if (position <= 0 || position > 52 || SafeZoneDetection.IsSafePosition(position))
                return false;

            var counts = TokenCountsAt(state, position);
            foreach (var kv in counts)
            {
                if (kv.Value >= 2 && kv.Key != moverColor) return true;
            }
            return false;
        }

        static bool IsPathBlocked(LudoGameState state, PlayerColor color, int fromPos, int dice)
        {
            var fromSteps = GetStepsFromStart(color, fromPos);
            if (fromSteps < 0) return true;

            for (var s = fromSteps + 1; s <= fromSteps + dice; s++)
            {
                var cell = PositionFromSteps(color, s);
                if (cell != null && cell.Value <= 52 && IsBlockForMover(state, cell.Value, color))
                    return true;
            }
            return false;
        }

        public static List<int> GetMovableTokens(LudoGameState state)
        {
            var player = state.Players[state.CurrentTurn];
            var dice = state.DiceValue ?? 0;
            var movable = new List<int>();

            for (var i = 0; i < 4; i++)
            {
                var pos = player.Tokens[i];
                if (pos == 59) continue;

                if (pos == 0)
                {
                    if (dice == 6) movable.Add(i);
                    continue;
                }

                var newPos = CalculateNewPosition(player.Color, pos, dice);
                if (newPos == null) continue;
                if (IsPathBlocked(state, player.Color, pos, dice)) continue;
                movable.Add(i);
            }
            return movable;
        }
    }
}
