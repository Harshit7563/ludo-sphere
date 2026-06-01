using System;
using System.Collections.Generic;

namespace LudoSphere.AI
{
    public enum PlayerColor { Red, Green, Yellow, Blue }

    [Serializable]
    public class LudoPlayer
    {
        public string Id;
        public PlayerColor Color;
        public int[] Tokens = { 0, 0, 0, 0 };
        public int FinishedTokens;
    }

    [Serializable]
    public class LudoGameState
    {
        public List<LudoPlayer> Players = new();
        public int CurrentTurn;
        public int? DiceValue;
        public bool DiceRolled;
        public bool CanRoll = true;
        public List<int> MovableTokens = new();
        public int ConsecutiveSixes;
        public string Phase = "rolling";
        public string LastActionType;
    }
}
