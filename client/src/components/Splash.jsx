import { motion } from 'framer-motion';
import LudoSphereLogo from './LudoSphereLogo';

export default function Splash({ onFinish }) {
  return (
    <div className="splash-screen rush-splash">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <motion.div
        className="splash-logo-hero-wrap"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.05 }}
      >
        <LudoSphereLogo size="lg" animated className="splash-logo-hero" />
      </motion.div>

      <motion.div
        className="splash-credit"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <span className="splash-credit-line" aria-hidden />
        <span className="splash-credit-label">Crafted by</span>
        <strong className="splash-credit-brand">Anilax Software</strong>
        <span className="splash-credit-ltd">Privated Limited</span>
      </motion.div>

      <motion.div
        className="splash-loader-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        onAnimationComplete={() => setTimeout(onFinish, 1600)}
      >
        <div className="splash-loader splash-loader-sphere" aria-label="Loading">
          <span className="splash-loader-glow" />
          <span className="splash-loader-ring splash-loader-ring-outer" />
          <span className="splash-loader-ring splash-loader-ring-inner" />
          <span className="splash-loader-core">
            <LudoSphereLogo size="sm" animated showText={false} />
          </span>
        </div>
        <p className="splash-loader-text">
          Entering Sphere
          <span className="splash-loader-dots">
            <span />
            <span />
            <span />
          </span>
        </p>
      </motion.div>
    </div>
  );
}
