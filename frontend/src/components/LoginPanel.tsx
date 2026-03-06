import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { LogIn, Dumbbell, Shield, Users, TrendingUp } from "lucide-react";

const LoginPanel: React.FC = () => {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message === "User is already authenticated") {
        // Handle edge case where user is already authenticated but UI doesn't reflect it
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4">
              <Dumbbell size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Fitness Tracker
          </h1>
          <p className="text-gray-300">
            Track your workouts and build your strength with secure
            authentication
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-300">
              Sign in with Internet Identity to access your fitness dashboard
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-3 px-4 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign in with Internet Identity</span>
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Secure authentication powered by Internet Computer
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800 border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            What you can do
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-green-900 p-2">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <span className="text-gray-300">Track your workout progress</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-900 p-2">
                <Dumbbell size={16} className="text-blue-400" />
              </div>
              <span className="text-gray-300">
                Manage your exercise library
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-900 p-2">
                <Users size={16} className="text-purple-400" />
              </div>
              <span className="text-gray-300">Create custom workouts</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-900 p-2">
                <Shield size={16} className="text-orange-400" />
              </div>
              <span className="text-gray-300">
                Secure data with Internet Identity
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          © 2025. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
