import { motion } from 'framer-motion';

export default function RushAvatar({ src, alt, onClick, label = 'Go to account' }) {
  return (
    <motion.button
      type="button"
      className="rush-avatar-btn"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.9 }}
    >
      <span className="rush-avatar-fx" aria-hidden>
        <span className="rush-avatar-ripple" />
        <span className="rush-avatar-ripple rush-avatar-ripple--delay" />
        <span className="rush-avatar-halo" />
        <span className="rush-avatar-chase">
          <i className="rush-avatar-token rush-avatar-token--red" />
          <i className="rush-avatar-token rush-avatar-token--yellow" />
          <i className="rush-avatar-token rush-avatar-token--green" />
          <i className="rush-avatar-token rush-avatar-token--blue" />
        </span>
      </span>

      <span className="rush-avatar-core">
        <img src={src} alt={alt} className="rush-avatar-img" />
        <span className="rush-avatar-core-ring" aria-hidden />
      </span>
    </motion.button>
  );
}
