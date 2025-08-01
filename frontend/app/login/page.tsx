"use client";

import AuthForm from "@/components/authForm";

export default function LoginPage() {
  return (
    <div
      className="
        min-h-screen flex items-center justify-center p-4 relative
        bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300
        font-comfortaa
      "
    >
      <div className="relative z-10 w-full max-w-md mx-auto">
        <AuthForm type="login" />
      </div>

      <div
        className="
          absolute inset-0 bg-repeat opacity-10
          pointer-events-none
        "
      ></div>
    </div>
  );
}