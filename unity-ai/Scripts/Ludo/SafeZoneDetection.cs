using System.Collections.Generic;

namespace LudoSphere.AI
{
    /// <summary>
    /// Safe zone detection for the 52-cell ring (color starts + star cells).
    /// Positions 0 (yard), 53–59 (home stretch / finish) are always safe.
    /// </summary>
    public static class SafeZoneDetection
    {
        public static readonly int[] SafeRingIndices = { 0, 8, 13, 21, 26, 34, 39, 47 };

        static readonly Dictionary<PlayerColor, int> ColorStart = new()
        {
            { PlayerColor.Red, 0 },
            { PlayerColor.Green, 13 },
            { PlayerColor.Yellow, 26 },
            { PlayerColor.Blue, 39 }
        };

        public static int GetColorStart(PlayerColor color) => ColorStart[color];

        public static int? GetRingIndex(int position)
        {
            if (position < 1 || position > 52) return null;
            return (position - 1) % 52;
        }

        public static bool IsSafePosition(int position)
        {
            if (position <= 0 || position > 52) return true;
            var idx = GetRingIndex(position);
            if (idx == null) return true;
            foreach (var safe in SafeRingIndices)
                if (safe == idx.Value) return true;
            return false;
        }
    }
}
