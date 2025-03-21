import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Treasure Hunt</h1>
      <p className="text-lg mb-8">Scan QR codes, earn points, and compete!</p>

      <div className="flex space-x-4">
        <Link to="/login" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Sign In
        </Link>
        <Link to="/signup" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
