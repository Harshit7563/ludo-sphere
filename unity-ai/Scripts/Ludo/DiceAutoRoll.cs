using System.Collections.Generic;

namespace LudoSphere.AI
{
    /// <summary>
    /// Dice roll logic including three-sixes rule and re-roll when 6 has no moves.
    /// </summary>
    public static class DiceAutoRoll
    {
        public static int? Roll(LudoGameState state)
        {
            if (!state.CanRoll || state.DiceRolled) return null;

            var value = UnityEngine.Random.Range(1, 7);
            state.DiceValue = value;
            state.DiceRolled = true;
            state.CanRoll = false;

            if (value == 6) state.ConsecutiveSixes++;
            else state.ConsecutiveSixes = 0;

            if (state.ConsecutiveSixes >= 3)
            {
                state.ConsecutiveSixes = 0;
                state.MovableTokens = new List<int>();
                state.LastActionType = "three_sixes";
                ExtraTurnHandler.AdvanceTurn(state);
                return value;
            }

            state.MovableTokens = TokenMovement.GetMovableTokens(state);

            if (state.MovableTokens.Count == 0)
            {
                if (value == 6)
                {
                    state.CanRoll = true;
                    state.DiceRolled = false;
                    state.DiceValue = null;
                    state.Phase = "rolling";
                }
                else
                {
                    ExtraTurnHandler.AdvanceTurn(state);
                }
            }
            else
            {
                state.Phase = "moving";
            }

            if (state.LastActionType != "three_sixes")
                state.LastActionType = "dice_roll";

            return value;
        }
    }
}
