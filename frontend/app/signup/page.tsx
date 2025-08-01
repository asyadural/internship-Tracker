"use client";

import AuthForm from "@/components/authForm";
export default function SignupPage() {
  return (

    <div
      className="
        min-h-screen flex items-center justify-center p-4 relative
        bg-gradient-to-br from-red-300 via-yellow-300 to-green-300
        font-comfortaa
      "
    >
      <div className="relative z-10 w-full max-w-md mx-auto">
        <AuthForm type="signup" />
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