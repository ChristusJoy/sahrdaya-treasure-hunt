import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayPassword, setDisplayPassword] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Password encryption animation
  useEffect(() => {
    if (password) {
      const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      let encrypted = "";
      
      // Initial encryption
      for (let i = 0; i < password.length; i++) {
        encrypted += chars[Math.floor(Math.random() * chars.length)];
      }
      setDisplayPassword(encrypted);
      
      // Animated encryption
      const interval = setInterval(() => {
        let newEncrypted = "";
        for (let i = 0; i < password.length; i++) {
          newEncrypted += chars[Math.floor(Math.random() * chars.length)];
        }
        setDisplayPassword(newEncrypted);
      }, 100);
      
      // Convert to bullets after animation
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayPassword("•".repeat(password.length));
      }, 500);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayPassword("");
    }
  }, [password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        // Set state to show verification needed
        setNeedsVerification(true);
        setUserEmail(user.email);
        
        // Sign out the user immediately
        await signOut(auth);
        setIsLoading(false);
        return;
      }

      // Update user's emailVerified status in Firestore if needed
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().emailVerified === false) {
        await updateDoc(doc(db, "users", user.uid), {
          emailVerified: true
        });
      }

      // Continue with normal login flow for verified users
      const sessionRef = doc(db, "sessions", user.uid);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        // If session exists, force logout previous session
        await signOut(auth);
        await deleteDoc(doc(db, "sessions", user.uid));
        return setError("Error with existing session. Please try again.");
      }

      // Save new session in Firestore
      await setDoc(sessionRef, { active: true, timestamp: Date.now() });
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        navigate(userData.role === "admin" ? "/admin" : "/user");
      }
    } catch (err) {
      // Translate Firebase errors to user-friendly messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many unsuccessful login attempts. Please wait a moment before trying again.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection and try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("The email address format is not valid. Please enter a valid email.");
      } else {
        setError("Login failed. Please try again later.");
      }
      console.error("Login error code:", err.code);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      // Sign in temporarily to get auth user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      alert("Verification email has been resent!");
      await signOut(auth);
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError("Too many verification emails requested. Please wait a moment before trying again.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection and try again."); 
      } else {
        setError("Couldn't send verification email. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-300 bg-gray-800 p-3 mb-4 text-center font-mono text-xs sm:text-sm border-l-4 border-red-400 overflow-hidden"
        >
          <div className="flex items-center mb-1">
            <span className="text-red-400 mr-2">!</span>
            <span className="font-bold">ERROR</span>
          </div>
          <p>{error}</p>
        </motion.div>
      )}

      {needsVerification ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 border-2 border-gray-700 p-4 font-mono text-sm"
        >
          <h3 className="text-yellow-400 font-bold mb-2 flex items-center">
            <span className="inline-block h-2 w-2 bg-yellow-400 mr-2 animate-pulse"></span>
            EMAIL VERIFICATION REQUIRED
          </h3>
          <p className="mb-3 text-white">
            Your email ({userEmail}) has not been verified. Please check your inbox and click the verification link.
          </p>
          <p className="text-gray-400 text-xs mb-4">
            * If you don't see the email, check your spam folder.
          </p>
          <div className="flex justify-between">
            <motion.button
              onClick={() => setNeedsVerification(false)}
              className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 font-mono text-xs"
              whileTap={{ scale: 0.97 }}
            >
              BACK TO LOGIN
            </motion.button>
            <motion.button
              onClick={resendVerificationEmail}
              className="px-4 py-2 bg-white text-black hover:bg-gray-300 font-mono text-xs flex items-center"
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div 
                    className="h-3 w-3 bg-black mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  SENDING...
                </>
              ) : (
                "RESEND EMAIL"
              )}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
          <div className="relative">
            <label className="text-xs font-mono text-gray-400 mb-1 block">EMAIL:</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-700 bg-gray-900 rounded-none w-full text-white placeholder-gray-600 focus:outline-none focus:border-white font-mono text-sm"
              required
            />
          </div>
          
          <div className="relative">
            <label className="text-xs font-mono text-gray-400 mb-1 block">PASSWORD:</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-700 bg-gray-900 rounded-none w-full text-white placeholder-gray-600 focus:outline-none focus:border-white font-mono text-sm"
                required
              />
              {password && (
                <div className="absolute inset-0 flex items-center px-3 py-2 sm:px-4 sm:py-3 pointer-events-none font-mono text-white text-sm overflow-hidden">
                  {displayPassword}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="ml-1 inline-block w-2 h-4 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
          
          <motion.button 
            type="submit" 
            className="w-full py-2 sm:py-3 bg-white text-black font-mono font-bold hover:bg-gray-300 transition-colors flex items-center justify-center"
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div 
                  className="h-4 w-4 bg-black mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                LOADING...
              </>
            ) : (
              "LOGIN →"
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default Login;
