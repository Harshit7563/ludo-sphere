using System;
using System.Collections;
using UnityEngine;

namespace LudoSphere.AI
{
    /// <summary>
    /// AI Turn Manager — orchestrates auto dice, auto move, human-like delays,
    /// extra turns, and anti-stuck recovery. Attach to a GameObject and wire callbacks.
    /// </summary>
    public class AITurnManager : MonoBehaviour
    {
        [SerializeField] AiDifficulty difficulty = AiDifficulty.Medium;
        [SerializeField] bool isBotPlayer = true;

        public LudoGameState State { get; private set; }
        public AiDifficulty Difficulty
        {
            get => difficulty;
            set => difficulty = value;
        }

        public event Action<int> OnDiceRolled;
        public event Action<int, ExtraTurnHandler.MoveResult> OnTokenMoved;
        public event Action<LudoGameState> OnStateChanged;
        public event Action OnGameOver;

        readonly AntiStuckTimeout _antiStuck = new();
        Coroutine _stepCoroutine;

        public void Initialize(LudoGameState state, AiDifficulty aiDifficulty)
        {
            State = state;
            difficulty = aiDifficulty;
        }

        public void NotifyTurnChanged()
        {
            if (State == null || !IsCurrentPlayerBot()) return;
            _antiStuck.ResetForSeat(State.CurrentTurn);
            ScheduleStep();
        }

        bool IsCurrentPlayerBot()
        {
            if (State?.Players == null || State.Players.Count == 0) return false;
            return isBotPlayer;
        }

        void ScheduleStep()
        {
            if (_stepCoroutine != null) StopCoroutine(_stepCoroutine);
            var cfg = LudoAiDifficulty.GetConfig(difficulty);
            var delayMs = LudoAiDifficulty.RandomDelay(cfg.ThinkMinMs, cfg.ThinkMaxMs);
            _stepCoroutine = StartCoroutine(DelayedStep(delayMs / 1000f));
        }

        IEnumerator DelayedStep(float seconds)
        {
            yield return new WaitForSeconds(seconds);
            RunStep();
        }

        void RunStep()
        {
            if (State == null || State.Phase == "finished") return;
            if (!IsCurrentPlayerBot()) return;

            _antiStuck.RecordAction();

            if (_antiStuck.IsTriggered(State.CurrentTurn))
            {
                AntiStuckTimeout.ForceUnstick(State, s => OnStateChanged?.Invoke(s));
                _antiStuck.ResetForSeat(State.CurrentTurn);
                if (State.Phase != "finished") ScheduleStep();
                return;
            }

            var cfg = LudoAiDifficulty.GetConfig(difficulty);

            if (State.CanRoll && State.Phase == "rolling")
            {
                var diceDelay = LudoAiDifficulty.RandomDelay(cfg.DicePauseMinMs, cfg.DicePauseMaxMs);
                StartCoroutine(DelayedRoll(diceDelay / 1000f));
                return;
            }

            if (State.Phase == "moving" && State.MovableTokens.Count > 0)
            {
                var moveDelay = LudoAiDifficulty.RandomDelay(cfg.MoveMinMs, cfg.MoveMaxMs);
                StartCoroutine(DelayedMove(moveDelay / 1000f));
            }
        }

        IEnumerator DelayedRoll(float seconds)
        {
            yield return new WaitForSeconds(seconds);
            ExecuteRoll();
        }

        IEnumerator DelayedMove(float seconds)
        {
            yield return new WaitForSeconds(seconds);
            ExecuteMove();
        }

        void ExecuteRoll()
        {
            if (State == null || State.Phase == "finished") return;
            if (!State.CanRoll) return;

            var value = DiceAutoRoll.Roll(State);
            if (value == null) return;

            OnDiceRolled?.Invoke(value.Value);
            OnStateChanged?.Invoke(State);

            if (State.LastActionType == "three_sixes")
            {
                _antiStuck.ResetForSeat(State.CurrentTurn);
                ScheduleStep();
                return;
            }

            if (State.Phase == "moving" || (State.CanRoll && State.Phase == "rolling"))
            {
                RunStep();
                return;
            }

            _antiStuck.ResetForSeat(State.CurrentTurn);
            ScheduleStep();
        }

        void ExecuteMove()
        {
            if (State == null || State.Phase == "finished") return;

            var tokenIndex = BestMoveCalculator.PickBestMove(State, difficulty);
            if (tokenIndex == null)
            {
                ScheduleStep();
                return;
            }

            var result = ExtraTurnHandler.ExecuteMove(State, tokenIndex.Value);
            if (!result.Success)
            {
                AntiStuckTimeout.ForceUnstick(State, s => OnStateChanged?.Invoke(s));
                _antiStuck.ResetForSeat(State.CurrentTurn);
                ScheduleStep();
                return;
            }

            OnTokenMoved?.Invoke(tokenIndex.Value, result);
            OnStateChanged?.Invoke(State);

            if (result.GameOver)
            {
                OnGameOver?.Invoke();
                return;
            }

            if (State.CanRoll && State.Phase == "rolling")
            {
                RunStep();
                return;
            }

            _antiStuck.ResetForSeat(State.CurrentTurn);
            ScheduleStep();
        }

        void OnDestroy()
        {
            if (_stepCoroutine != null) StopCoroutine(_stepCoroutine);
        }
    }
}
