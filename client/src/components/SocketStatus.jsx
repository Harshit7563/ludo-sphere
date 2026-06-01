import { useSocket } from '../context/SocketContext';

/**
 * Live socket connection pill — show on Home / matchmaking when logged in.
 */
export default function SocketStatus({ className = '' }) {
  const { connected, connecting, socketError, reconnectSocket } = useSocket();

  if (connecting) {
    return (
      <div className={`socket-status socket-status--connecting ${className}`.trim()} role="status">
        <span className="socket-status-dot" aria-hidden />
        Connecting…
      </div>
    );
  }

  if (socketError) {
    return (
      <button
        type="button"
        className={`socket-status socket-status--error ${className}`.trim()}
        onClick={reconnectSocket}
        title="Tap to retry"
      >
        <span className="socket-status-dot" aria-hidden />
        Offline — tap to retry
      </button>
    );
  }

  if (connected) {
    return (
      <div className={`socket-status socket-status--live ${className}`.trim()} role="status">
        <span className="socket-status-dot" aria-hidden />
        Live
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`socket-status socket-status--offline ${className}`.trim()}
      onClick={reconnectSocket}
    >
      <span className="socket-status-dot" aria-hidden />
      Reconnect
    </button>
  );
}
