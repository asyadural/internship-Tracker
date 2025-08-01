'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const expiringDateParam = searchParams.get('expiring_date');

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (expiringDateParam) {
      const expiry = new Date(expiringDateParam).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = expiry - now;
        if (diff <= 0) {
          clearInterval(interval);
          setRemainingTime(0);
        } else {
          setRemainingTime(Math.floor(diff / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiringDateParam]);

  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleVerifyCode = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !token) {
      setError('Missing email or token.');
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError('Verification code must be 6 digits.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/auth/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: Number(code),
            token,
            email,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Verification failed');
      }

      if (data.success) {
        setSuccess('Code verified. Redirecting to reset password...');
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(
              email
            )}&token=${encodeURIComponent(token)}`
          );
        }, 1500);
      } else {
        throw new Error('Invalid or expired code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-orange-300 via-rose-300 to-amber-300 font-comfortaa">
    <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-[3rem] p-8 shadow-xl border-4 border-white/60">
      {/* Header */}
      <div className="pb-2 text-center">
        <h2 className="text-2xl font-bold">Verify Code</h2>
      </div>

      {/* Body */}
      <div className="grid gap-4">
        {/* Countdown */}
        {remainingTime !== null && remainingTime > 0 && (
          <p className="text-sm text-gray-600">
            Code expires in:{" "}
            <strong className="font-semibold">{formatSeconds(remainingTime)}</strong>
          </p>
        )}
        {remainingTime === 0 && (
          <p className="text-sm text-red-600">
            Code has expired. Please restart the process.
          </p>
        )}

        {/* Input */}
        <div className="grid gap-2">
          <label htmlFor="code" className="text-gray-700">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
            className="
              w-full p-4 border-2 border-orange-300 rounded-xl
              focus:ring-4 focus:ring-rose-400 focus:border-rose-500
              outline-none transition-all duration-200 ease-in-out
              text-lg placeholder-gray-400 text-center tracking-widest
              hover:border-orange-400
            "
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          onClick={handleVerifyCode}
          disabled={loading || code.length !== 6 || remainingTime === 0}
          className="
            w-full py-3 rounded-full text-white text-xl font-extrabold
            bg-gradient-to-r from-orange-500 to-rose-500
            hover:from-orange-600 hover:to-rose-600
            focus:outline-none focus:ring-4 focus:ring-rose-300
            transition-all duration-300 ease-in-out transform hover:scale-105
            active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed
          "
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Didn’t receive the code?{" "}
        <Link
          href="/forgot-password"
          className="text-orange-500 hover:underline font-bold"
        >
          Resend or try again!
        </Link>
      </p>
    </div>
  </div>
)};