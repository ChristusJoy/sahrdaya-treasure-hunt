import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayPassword, setDisplayPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);
      setVerificationSent(true);

      // Add user to Firestore with default role "user" and emailVerified status
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user",
        emailVerified: false,
        createdAt: new Date().toISOString()
      });

      // We don't navigate away - we show verification instructions
    } catch (error) {
      // Translate Firebase errors to user-friendly messages
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please use another email or try logging in.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Signup failed. Please try again with different credentials.");
      }
      console.error("Signup error code:", error.code);
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
      
      {verificationSent ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 border-2 border-gray-700 p-4 font-mono text-sm"
        >
          <h3 className="text-green-400 font-bold mb-2 flex items-center">
            <span className="inline-block h-2 w-2 bg-green-400 mr-2 animate-pulse"></span>
            VERIFICATION EMAIL SENT
          </h3>
          <p className="mb-3 text-white">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <p className="text-gray-400 text-xs">
            * If you don't see the email, check your spam folder.
          </p>
          <div className="mt-4 flex justify-between">
            <motion.button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 font-mono text-xs"
              whileTap={{ scale: 0.97 }}
            >
              RETURN TO LOGIN
            </motion.button>
            <motion.button
              onClick={async () => {
                setIsLoading(true);
                try {
                  if (auth.currentUser) {
                    await sendEmailVerification(auth.currentUser);
                    alert("Verification email resent!");
                  }
                } catch (error) {
                  setError("Failed to resend: " + error.message);
                } finally {
                  setIsLoading(false);
                }
              }}
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
        <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
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
                PROCESSING...
              </>
            ) : (
              "CREATE ACCOUNT →"
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default Signup;
