"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password")
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    setIsLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "Login failed. Please try again.");
      return;
    }

    window.location.href = next;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-5 text-neutral-950">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border-4 border-neutral-950 bg-[#fbfaf6] p-7 shadow-[8px_8px_0_#171717]"
      >
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-800">
          Publisher Access
        </p>
        <h1 className="mt-2 font-serif text-4xl font-black">Admin Login</h1>
        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-bold">Username</span>
            <input
              name="username"
              required
              className="mt-2 w-full border-2 border-neutral-950 bg-white px-3 py-3 outline-none focus:ring-4 focus:ring-red-800/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">Password</span>
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full border-2 border-neutral-950 bg-white px-3 py-3 outline-none focus:ring-4 focus:ring-red-800/20"
            />
          </label>
        </div>
        {message ? (
          <p className="mt-5 border-2 border-red-800 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full border-2 border-neutral-950 bg-neutral-950 px-4 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}

function LoginShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-5 text-neutral-950">
      <div className="w-full max-w-md border-4 border-neutral-950 bg-[#fbfaf6] p-7 shadow-[8px_8px_0_#171717]">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-800">
          Publisher Access
        </p>
        <h1 className="mt-2 font-serif text-4xl font-black">Admin Login</h1>
      </div>
    </main>
  );
}
