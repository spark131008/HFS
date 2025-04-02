"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import MainNavigationBar from "@/components/MainNavigationBar";
import Image from "next/image";

export default function Login() {
  const supabase = createClient();

  async function SignInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.log("Authentication Error", error);
    }
  }

  async function signInWithFacebook() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.log("Authentication Error", error);
    }
  }

  async function signInWithApple() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.log("Authentication Error", error);
    }
  }

  async function signInWithTwitter() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.log("Authentication Error", error);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-50 w-full border-b backdrop-blur">
        <MainNavigationBar />
      </div>
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Sign in to HFS
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Transform customer opinions into actionable insights with
            our hyper-personalized feedback system.
          </p>
        </div>
        
        <div className="w-full max-w-md space-y-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={SignInWithGoogle}
          >
            <Image
              src="/icons/google-icon.svg"
              alt="Google Logo"
              width={20}
              height={20}
            />
            <span>Sign in with Google</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={signInWithFacebook}
          >
            <Image
              src="/icons/fb-icon.svg"
              alt="FB Logo"
              width={20}
              height={20}
            />
            <span>Sign in with Facebook</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={signInWithApple}
          >
            <Image
              src="/icons/apple-icon.svg"
              alt="Apple Logo"
              width={20}
              height={20}
            />
            <span>Sign in with Apple</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={signInWithTwitter}
          >
            <Image
              src="/icons/twitter-icon.svg"
              alt="Twitter Logo"
              width={20}
              height={20}
            />
            <span>Sign in with Twitter</span>
          </Button>
        </div>
        
        <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
          By clicking &quot;Sign in with Apple/Google&quot;, you acknowledge
          that you have read and understood, and agree to HFS&apos;s
          Terms &amp; Conditions, Privacy Policy, and Content Policy.
        </p>
      </div>
    </>
  );
}