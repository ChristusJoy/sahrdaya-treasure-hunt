import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { browserSessionPersistence, onAuthStateChanged, setPersistence, signOut } from "firebase/auth";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Properly defined logout function
  const logout = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Remove session from Firestore
        await deleteDoc(doc(db, "sessions", currentUser.uid));
      }

      await signOut(auth);
      // Note: We can't use useNavigate here directly as this isn't a component
      return true; // Return success flag
    } catch (err) {
      let errorMsg = "Unable to log you out. Please try again.";
      if (err.code === 'auth/network-request-failed') {
        errorMsg = "Network error during logout. Please check your connection and try again.";
      }
      console.error("Logout Error:", err.message, err.code);
      setAuthError(errorMsg);
      return false;
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  useEffect(() => {
    const setupAuth = async () => {
      await setPersistence(auth, browserSessionPersistence); // Enables persistence

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Check if email is verified
          if (!firebaseUser.emailVerified) {
            // If email is not verified, sign out and don't set user
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }

          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            // If user exists in Firestore but emailVerified is false, update it
            if (userDoc.data().emailVerified === false) {
              await updateDoc(doc(db, "users", firebaseUser.uid), {
                emailVerified: true
              });
            }
            
            setUser({ 
              uid: firebaseUser.uid, 
              role: userDoc.data().role,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    setupAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom logout button component that can be used in any component
export const LogoutButton = () => {
  const { logout, authError } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleLogout} 
        className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-mono text-sm transition-colors"
      >
        LOGOUT
      </button>
      {authError && (
        <div className="absolute top-full mt-2 right-0 bg-gray-800 text-red-400 p-2 font-mono text-xs border-l-2 border-red-400">
          {authError}
        </div>
      )}
    </div>
  );
};

export const useAuth = () => useContext(AuthContext);
