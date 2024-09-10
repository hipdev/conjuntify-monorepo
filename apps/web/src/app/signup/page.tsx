"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Component() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
      // Here you would typically handle the sign-up logic
      console.log("Sign up with:", email, password);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-gray-600 focus:ring-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-gray-600 focus:ring-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="repeat-password" className="text-gray-300">
                Repeat password
              </Label>
              <Input
                id="repeat-password"
                name="repeat-password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-gray-600 focus:ring-gray-600"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-white hover:bg-gray-200 text-gray-900 font-semibold"
          >
            Sign up
          </Button>
        </form>

        <div className="flex justify-end gap-2">
          <p className="text-gray-500">Already have an account?</p>
          <Link href="/">
            <span className="text-gray-300 font-semibold hover:underline">
              Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
