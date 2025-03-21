import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { browserSessionPersistence, onAuthStateChanged, setPersistence, signOut} from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
      console.error("Logout Error:", err.message);
      return false; // Return failure flag
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      await setPersistence(auth, browserSessionPersistence); // Enables persistence

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, role: userDoc.data().role });
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
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom logout button component that can be used in any component
export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/");
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
};

export const useAuth = () => useContext(AuthContext);
