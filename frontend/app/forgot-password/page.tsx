// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setError(data.message || "User with that email cannot be found.");
        } else {
          setError("Failed to send verification code. Please try again.");
        }
        return;  
      }

      // ④ On success pull token & redirect
      const { token, expiring_date } = data;
      router.push(
        `/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
          token
        )}&expiring_date=${encodeURIComponent(expiring_date)}`
      );
    } catch (err: any) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-300 via-sky-300 to-teal-300 font-comfortaa">
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-[3rem] p-8 shadow-xl border-4 border-white/60">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-teal-600 mb-2">
              Lost Your Key?
            </h2>
            <p className="text-gray-600 text-lg">
              Enter your email to get a verification code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-lg mb-2">
                Your Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="your-email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-4 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-sky-400 focus:border-sky-500 outline-none transition-all duration-200 text-lg placeholder-gray-400 hover:border-indigo-400"
              />
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full text-white text-xl font-extrabold bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-70 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="absolute inset-0 bg-repeat opacity-10 pointer-events-none"/>
    </div>
  );
}