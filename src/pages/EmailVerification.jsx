import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { applyActionCode, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get("oobCode");
      if (!oobCode) {
        setStatus("error");
        setError("The verification link is invalid. It may be missing necessary information.");
        return;
      }
      
      try {
        // Apply verification
        await applyActionCode(auth, oobCode);
        
        // If the user is signed in, update Firestore
        if (auth.currentUser) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            await updateDoc(userRef, {
              emailVerified: true
            });
          }
          
          // Sign out to force login with verified account
          await signOut(auth);
        }
        
        setStatus("success");
      } catch (err) {
        setStatus("error");
        
        // Convert technical error messages to user-friendly ones
        if (err.code === 'auth/invalid-action-code') {
          setError("This verification link has expired or already been used. Please request a new verification email.");
        } else if (err.code === 'auth/user-not-found') {
          setError("We couldn't find an account associated with this verification link. The account may have been deleted.");
        } else if (err.code === 'auth/network-request-failed') {
          setError("Network error. Please check your internet connection and try the verification link again.");
        } else {
          setError("We couldn't verify your email. The link may have expired or been used already.");
        }
        console.error("Verification error code:", err.code);
      }
    };
    
    verifyEmail();
  }, [searchParams]);
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 overflow-hidden">
      {/* Background styling elements (grid, etc.) - similar to LandingPage */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.5),rgba(0,0,0,1))]"></div>
      
      {/* Retro grid pattern */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '20px 20px'
           }}>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="relative w-full border-4 border-gray-700 rounded-lg shadow-lg p-6 bg-black">
          <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-30"></div>
          
          {/* Terminal header */}
          <div className="font-mono text-green-400 text-sm mb-4 flex justify-between items-center">
            <span>SYSTEM.VERIFICATION</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-2 h-4 bg-green-400"
            />
          </div>
          
          <div className="font-mono">
            {status === "verifying" && (
              <div className="text-center">
                <motion.div 
                  className="inline-block h-6 w-6 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-3 text-white">VERIFYING EMAIL...</p>
              </div>
            )}
            
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center mb-4">
                  <div className="inline-block h-12 w-12 rounded-full border-2 border-green-400 flex items-center justify-center">
                    <span className="text-green-400 text-2xl">✓</span>
                  </div>
                </div>
                <h3 className="text-green-400 text-center text-lg mb-2">EMAIL VERIFIED SUCCESSFULLY</h3>
                <p className="text-gray-300 text-center mb-6">Your email has been verified. You can now log in to your account.</p>
                <motion.button
                  onClick={() => navigate("/")}
                  className="w-full py-2 sm:py-3 bg-white text-black font-mono font-bold hover:bg-gray-300 transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  PROCEED TO LOGIN →
                </motion.button>
              </motion.div>
            )}
            
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center mb-4">
                  <div className="inline-block h-12 w-12 rounded-full border-2 border-red-400 flex items-center justify-center">
                    <span className="text-red-400 text-2xl">✗</span>
                  </div>
                </div>
                <h3 className="text-red-400 text-center text-lg mb-2">VERIFICATION FAILED</h3>
                <p className="text-gray-300 text-center mb-4">{error || "An unexpected error occurred."}</p>
                <div className="flex flex-col space-y-3">
                  <motion.button
                    onClick={() => navigate("/")}
                    className="w-full py-2 sm:py-3 bg-white text-black font-mono font-bold hover:bg-gray-300 transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    RETURN TO LOGIN →
                  </motion.button>
                  <motion.button
                    onClick={() => navigate("/?tab=signup")}
                    className="w-full py-2 sm:py-3 bg-gray-700 text-white font-mono font-bold hover:bg-gray-600 transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    RESEND VERIFICATION
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Retro terminal prompt */}
        <div className="mt-6 font-mono text-xs text-gray-500 flex items-center justify-center">
          <span className="mr-2">$</span>
          <motion.span
            animate={{ opacity: [1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          >
            EMAIL.VERIFICATION.PROCESS_
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
