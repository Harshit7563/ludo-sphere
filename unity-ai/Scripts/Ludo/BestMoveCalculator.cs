using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace LudoSphere.AI
{
    /// <summary>
    /// Priority: Reach Home → Cut → Escape Danger → Safe Zone →
    /// Advance Closest → Create Block → Open on 6 → Normal move.
    /// </summary>
    public static class BestMoveCalculator
    {
        static class Priority
        {
            public const float ReachHome = 100000f;
            public const float CutOpponent = 50000f;
            public const float EscapeDanger = 32000f;
            public const float MoveToSafe = 22000f;
            public const float AdvanceClosest = 18000f;
            public const float CreateBlock = 14000f;
            public const float OpenToken = 9000f;
            public const float Normal = 1f;
        }

        static int ClosestToHomeTokenIndex(LudoPlayer player)
        {
            var best = -1;
            var bestSteps = -1;
            for (var i = 0; i < 4; i++)
            {
                var pos = player.Tokens[i];
                if (pos == 0 || pos == 59) continue;
                var steps = TokenMovement.GetStepsFromStart(player.Color, pos);
                if (steps > bestSteps)
                {
                    bestSteps = steps;
                    best = i;
                }
            }
            return best;
        }

        static (int total, int sameColor) CountAtPosition(LudoGameState state, int position, PlayerColor color)
        {
            var total = 0;
            var sameColor = 0;
            foreach (var p in state.Players)
            {
                foreach (var t in p.Tokens)
                {
                    if (t != position) continue;
                    total++;
                    if (p.Color == color) sameColor++;
                }
            }
            return (total, sameColor);
        }

        public static float ScoreMove(LudoGameState state, int tokenIndex, AiDifficulty difficulty)
        {
            var player = state.Players[state.CurrentTurn];
            var dice = state.DiceValue ?? 0;
            var oldPos = player.Tokens[tokenIndex];
            var newPos = TokenMovement.CalculateNewPosition(player.Color, oldPos, dice);
            if (newPos == null) return float.NegativeInfinity;

            var cfg = LudoAiDifficulty.GetConfig(difficulty);
            var score = 0f;
            var np = newPos.Value;

            if (np == 59) score += Priority.ReachHome;

            var cuts = OpponentCutLogic.CountCapturesOnLand(state, player.Color, np);
            if (cuts > 0)
            {
                score += Priority.CutOpponent * cuts;
                if (oldPos == 0) score += 2000f;
            }

            var wasInDanger = oldPos > 0 && oldPos <= 52 &&
                              OpponentCutLogic.IsReachableByOpponent(state, oldPos, player.Color);
            var stillInDanger = np > 0 && np <= 52 &&
                                OpponentCutLogic.IsReachableByOpponent(state, np, player.Color);

            if (wasInDanger && !stillInDanger) score += Priority.EscapeDanger;
            else if (stillInDanger && !wasInDanger) score -= Priority.EscapeDanger * 0.6f;

            if (np > 0 && np <= 52 && SafeZoneDetection.IsSafePosition(np))
            {
                score += Priority.MoveToSafe;
                if (wasInDanger) score += 4000f;
            }

            var leaderIdx = ClosestToHomeTokenIndex(player);
            if (leaderIdx == tokenIndex && np > oldPos)
            {
                score += Priority.AdvanceClosest;
                score += TokenMovement.GetStepsFromStart(player.Color, np) * 40f;
            }

            if (oldPos > 0 && np > oldPos)
            {
                var delta = TokenMovement.GetStepsFromStart(player.Color, np) -
                            TokenMovement.GetStepsFromStart(player.Color, oldPos);
                score += delta * 25f;
            }

            if (np > 0 && np <= 52)
            {
                var (_, sameColor) = CountAtPosition(state, np, player.Color);
                if (sameColor >= 1 && oldPos != np) score += Priority.CreateBlock;
            }

            if (oldPos == 0 && dice == 6)
            {
                score += Priority.OpenToken;
                var onBoard = player.Tokens.Count(t => t > 0 && t < 59);
                if (onBoard == 0) score += 5000f;
            }

            score += TokenMovement.GetStepsFromStart(player.Color, np) * Priority.Normal;

            if (np >= 53 && np <= 58) score += 8000f + np * 100f;

            if (difficulty == AiDifficulty.Expert && stillInDanger) score -= 8000f;

            if (cfg.MistakeRate > 0f)
                score += (Random.value - 0.5f) * 12000f * cfg.MistakeRate;

            return score;
        }

        public static int? PickBestMove(LudoGameState state, AiDifficulty difficulty)
        {
            var movable = state.MovableTokens?.Count > 0
                ? state.MovableTokens
                : TokenMovement.GetMovableTokens(state);

            if (movable.Count == 0) return null;

            var cfg = LudoAiDifficulty.GetConfig(difficulty);
            var ranked = movable
                .Select(idx => (idx, score: ScoreMove(state, idx, difficulty)))
                .OrderByDescending(x => x.score)
                .ToList();

            if (cfg.MistakeRate > 0f && Random.value < cfg.MistakeRate)
                return movable[Random.Range(0, movable.Count)];

            if (cfg.SuboptimalRate > 0f && Random.value < cfg.SuboptimalRate && ranked.Count > 1)
            {
                var poolSize = Mathf.Min(3, ranked.Count);
                return ranked[Random.Range(0, poolSize)].idx;
            }

            return ranked[0].idx;
        }
    }
}
