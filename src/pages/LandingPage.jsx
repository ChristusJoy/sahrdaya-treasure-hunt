import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../components/Login";
import SignupForm from "../components/Signup";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [displayText, setDisplayText] = useState("");
  const fullText = "LOGIN OR SIGNUP";
  
  // Typewriter effect for subtitle
  useEffect(() => {
    if (displayText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [displayText, fullText]);

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 overflow-hidden">
      {/* Background radial gradient */}
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
        {/* Animated grid overlay with pulse effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Scan lines effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2) 1px, transparent 1px, transparent 2px)'}}></div>
      
      {/* Blinking cursor */}
      <motion.div
        className="absolute top-4 right-4 w-3 h-5 bg-white"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="relative w-full max-w-md flex flex-col items-center">
        <motion.h1 
          className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-center tracking-tight"
          animate={{ textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 5px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          WELCOME
        </motion.h1>
        
        {/* Subtitle with typewriter effect */}
        <div className="mb-8 text-base sm:text-lg text-center font-mono tracking-wide opacity-80 h-7 flex items-center justify-center">
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="ml-1 w-2 h-4 bg-white inline-block"
          />
        </div>

        {/* Vintage screen container */}
        <div className="relative w-full border-4 border-gray-700 rounded-lg shadow-lg p-2 bg-black">
          {/* Terminal header bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-30"></div>
          
          {/* Subtle pulsing grid inside container */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '10px 10px'
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
          
          {/* Tabbed interface */}
          <div className="border-b-2 border-gray-700 w-full mb-4">
            <div className="flex w-full">
              <button
                onClick={() => switchTab("login")}
                className={`relative flex-1 py-2 sm:py-3 font-mono text-sm sm:text-base font-semibold transition duration-300 ${
                  activeTab === "login" 
                    ? "text-black bg-white" 
                    : "text-white hover:text-gray-300"
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => switchTab("signup")}
                className={`relative flex-1 py-2 sm:py-3 font-mono text-sm sm:text-base font-semibold transition duration-300 ${
                  activeTab === "signup" 
                    ? "text-black bg-white" 
                    : "text-white hover:text-gray-300"
                }`}
              >
                SIGN UP
              </button>
            </div>
          </div>

          {/* Form container with animations */}
          <div className="w-full p-2">
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignupForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Retro terminal prompt with coordinate display */}
        <div className="mt-6 font-mono text-xs text-gray-500 flex flex-col items-center">
          <div className="flex items-center mb-1">
            <span className="mr-2">$</span>
            <motion.span
              animate={{ opacity: [1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            >
              © RETRO TREASURE HUNT_
            </motion.span>
          </div>
          <motion.div
            className="flex space-x-4 text-gray-600"
            animate={{ opacity: [0.7, 0.4, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>X:320</span>
            <span>Y:240</span>
            <span>SYS:READY</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
