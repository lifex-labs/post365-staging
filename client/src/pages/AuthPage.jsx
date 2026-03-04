import { SignIn, SignUp } from '@clerk/react';
import mainLogo from '../assets/main-logo-black.svg';
import styles from './AuthPage.module.css';

const clerkAppearance = {
  variables: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '14px',
    colorPrimary: '#2563eb',
    borderRadius: '10px',
  },
  elements: {
    card: {
      boxShadow: 'none',
      border: 'none',
      background: 'transparent',
      padding: '24px',
    },
  },
};

export default function AuthPage({ mode = 'sign-in' }) {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <img
          src={mainLogo}
          alt="Post365"
          className={styles.logo}
          height={18}
        />
      </header>

      <main className={styles.main}>
        {mode === 'sign-in' ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/posts"
            appearance={clerkAppearance}
          />
        ) : (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/posts"
            appearance={clerkAppearance}
          />
        )}
      </main>
    </div>
  );
}
