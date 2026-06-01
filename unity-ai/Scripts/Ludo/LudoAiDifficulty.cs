using System;
using UnityEngine;

namespace LudoSphere.AI
{
    public enum AiDifficulty
    {
        Easy,
        Medium,
        Hard,
        Expert
    }

    [Serializable]
    public struct DifficultyConfig
    {
        public string Label;
        public int ThinkMinMs;
        public int ThinkMaxMs;
        public int MoveMinMs;
        public int MoveMaxMs;
        public float MistakeRate;
        public float SuboptimalRate;
        public int DicePauseMinMs;
        public int DicePauseMaxMs;
    }

    public static class LudoAiDifficulty
    {
        public static AiDifficulty Normalize(string raw)
        {
            if (string.IsNullOrEmpty(raw)) return AiDifficulty.Medium;
            return raw.ToLowerInvariant() switch
            {
                "easy" => AiDifficulty.Easy,
                "hard" => AiDifficulty.Hard,
                "expert" => AiDifficulty.Expert,
                _ => AiDifficulty.Medium
            };
        }

        public static DifficultyConfig GetConfig(AiDifficulty difficulty) => difficulty switch
        {
            AiDifficulty.Easy => new DifficultyConfig
            {
                Label = "Easy",
                ThinkMinMs = 1300, ThinkMaxMs = 2400,
                MoveMinMs = 950, MoveMaxMs = 1700,
                MistakeRate = 0.38f, SuboptimalRate = 0.55f,
                DicePauseMinMs = 400, DicePauseMaxMs = 900
            },
            AiDifficulty.Hard => new DifficultyConfig
            {
                Label = "Hard",
                ThinkMinMs = 550, ThinkMaxMs = 1100,
                MoveMinMs = 420, MoveMaxMs = 820,
                MistakeRate = 0.06f, SuboptimalRate = 0.12f,
                DicePauseMinMs = 200, DicePauseMaxMs = 480
            },
            AiDifficulty.Expert => new DifficultyConfig
            {
                Label = "Expert",
                ThinkMinMs = 380, ThinkMaxMs = 780,
                MoveMinMs = 320, MoveMaxMs = 620,
                MistakeRate = 0f, SuboptimalRate = 0f,
                DicePauseMinMs = 150, DicePauseMaxMs = 380
            },
            _ => new DifficultyConfig
            {
                Label = "Medium",
                ThinkMinMs = 850, ThinkMaxMs = 1600,
                MoveMinMs = 650, MoveMaxMs = 1150,
                MistakeRate = 0.16f, SuboptimalRate = 0.28f,
                DicePauseMinMs = 280, DicePauseMaxMs = 650
            }
        };

        public static int RandomDelay(int minMs, int maxMs)
        {
            return minMs + UnityEngine.Random.Range(0, maxMs - minMs + 1);
        }
    }
}
