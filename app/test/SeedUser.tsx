"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, UserPlus, XCircle } from "lucide-react";

export default function SeedUser() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const seedUser = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Pedro Duarte",
          username: "Pedro44",
          email: "pedro44@test.com",
          password: "Pedro44@123",
          btcWallet: "",
          ethWallet: "",
          usdtWallet: "",
          referralCode: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to seed test user.");
      }

      setMessage(
        `Test user "${data.user?.username || "Pedro44"}" created successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to seed test user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Seed Test User
              </h3>

              <p className="text-xs text-slate-400">
                Create a default test account
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            <p>
              <span className="font-semibold text-slate-500">Name:</span>{" "}
              <span className="text-slate-700">Pedro Duarte</span>
            </p>

            <p>
              <span className="font-semibold text-slate-500">Username:</span>{" "}
              <span className="text-slate-700">Pedro44</span>
            </p>

            <p>
              <span className="font-semibold text-slate-500">Email:</span>{" "}
              <span className="text-slate-700">pedro44@test.com</span>
            </p>

            <p>
              <span className="font-semibold text-slate-500">Password:</span>{" "}
              <span className="font-mono text-slate-700">Pedro44@123</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={seedUser}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Seed User
            </>
          )}
        </button>
      </div>

      {/* Success */}
      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}