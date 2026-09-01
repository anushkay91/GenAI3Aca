import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Auth() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Welcome to ReflectJournal</h1>
      <button 
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
      >
        Sign In with Google
      </button>
    </div>
  );
}
