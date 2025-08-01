'use client';

import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { isValidEmail } from "@/utils/validation";
import { useRouter } from "next/navigation";

type Props = {
  type: "login" | "signup";
};

export default function AuthForm({ type }: Props) {
  const router = useRouter();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const payload =
        type === "signup"
          ? { firstname: firstName, lastname: lastName, email, password }
          : { email, password };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${type}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // On success, cookie is set; just redirect
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-[3rem] p-8 shadow-xl border-4 border-white border-opacity-60 transition-all duration-300 ease-in-out">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-blue-600 tracking-wide mb-2">
          {type === "login" ? "Welcome Back!" : "Join the Adventure!"}
        </h2>
        <p className="text-gray-600 text-lg">
          {type === "login"
            ? "Log in to track your progress."
            : "Start your internship journey."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {type === "signup" && (
          <>
            <div>
              <label htmlFor="firstName" className="block text-gray-700 text-lg mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="w-full p-4 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all duration-200 text-lg text-gray-800 bg-white placeholder-gray-400 hover:border-blue-400"
                placeholder="Your first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-gray-700 text-lg mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className="w-full p-4 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all duration-200 text-lg text-gray-800 bg-white placeholder-gray-400 hover:border-blue-400"
                placeholder="Your last name"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-gray-700 text-lg mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-4 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all duration-200 text-lg text-gray-800 bg-white placeholder-gray-400 hover:border-blue-400"
            placeholder="your-email@example.com"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-gray-700 text-lg mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-4 pr-12 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all duration-200 text-lg text-gray-800 bg-white placeholder-gray-400 hover:border-blue-400"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute top-17 right-4 transform -translate-y-1/2 text-gray-600 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={28} /> : <FaEye size={28} />}
          </button>
        </div>

        {type === "login" && (
          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-full text-white text-xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                />
              </svg>
              <span>Loading...</span>
            </div>
          ) : (
            <span>{type === "signup" ? "Sign Up" : "Login"}</span>
          )}
        </button>

        {type === "login" && (
          <p className="text-center text-sm mt-4 text-gray-600">
            If you don't have an account,&nbsp;
            <Link href="/signup" className="text-blue-500 hover:underline font-medium">
              click here to sign up!
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}