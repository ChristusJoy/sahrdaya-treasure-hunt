import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user's session data from Firestore
      const sessionRef = doc(db, "sessions", user.uid);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        // If session exists, force logout previous session
        await signOut(auth);
        return setError("You are logged in on another device.");
      }

      // Save new session in Firestore
      await setDoc(sessionRef, { active: true, timestamp: Date.now() });
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        navigate(userData.role === "admin" ? "/admin" : "/user");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded-lg w-64"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded-lg w-64"
          required
        />
        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
