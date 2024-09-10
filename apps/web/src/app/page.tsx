"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Log in to your account
          </h2>
        </div>
        <form
          className="mt-8 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitting(true);

            const formData = new FormData(event.currentTarget);
            formData.append("flow", "signIn");

            signIn("password", formData)
              .then(() => {
                router.push("/dashboard");
              })
              .catch((error) => {
                console.error(error);
                const title = "Datos incorrectos";
                toast({ title, variant: "destructive" });
                setSubmitting(false);
              });
          }}
        >
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
                autoComplete="current-password"
                required
                className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-gray-600 focus:ring-gray-600"
              />
            </div>
          </div>

          {/* {error && <p className="text-red-400 text-sm">{error}</p>} */}

          <Button
            type="submit"
            className="w-full bg-white hover:bg-gray-200 text-gray-900 font-semibold"
          >
            Log in
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-white hover:text-gray-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
