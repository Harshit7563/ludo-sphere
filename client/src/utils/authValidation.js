export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) {
    errors.email = 'Enter your email or username to continue';
  }
  if (!password) {
    errors.password = 'Enter your password to sign in';
  }
  return errors;
}

export function validateRegister({ username, email, password }) {
  const errors = {};
  if (!username?.trim()) {
    errors.username = 'Pick a username for your profile';
  } else if (username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }
  if (!email?.trim()) {
    errors.email = 'Enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email like you@email.com';
  }
  if (!password) {
    errors.password = 'Create a password to secure your account';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
}
