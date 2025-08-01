'use client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-purple-300 text-gray-800 font-comfortaa">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-white/60 backdrop-blur-lg shadow-md">
        <h1 className="text-4xl font-bubblegum font-bold text-purple-800">
          Trackify
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2 rounded-full bg-white text-purple-700 font-bold hover:bg-purple-100 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-5 py-2 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-10 py-20 max-w-5xl mx-auto text-center">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-md mb-6">
          Effortlessly Manage Your Job and Internship Applications
        </h2>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12">
          Trackify helps students manage internship applications by organizing statuses,
          dates, and notes in a clean, colorful dashboard. Stay focused and never miss an opportunity.
        </p>
        <button
          onClick={() => router.push('/signup')}
          className="mt-4 px-8 py-4 bg-white text-purple-600 font-extrabold text-lg rounded-full shadow-xl hover:shadow-2xl hover:bg-purple-50 transition-all"
        >
          Get Started For Free
        </button>
      </main>
    </div>
  );
}