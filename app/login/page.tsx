"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import MainNavigationBar from "@/components/MainNavigationBar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  // Check if user is already logged in and redirect to user page
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/my-surveys');
      }
    };
    
    checkUser();
  }, [router, supabase.auth]);

  async function signInWithGoogle() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigationBar />
      <main className="flex-1 flex items-start justify-center bg-gray-50 pt-16">
        <div className="w-full max-w-xl mx-auto px-4 py-8 sm:px-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-blue-600 mb-4">
              Sign up or Log in to HFS
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Transform customer opinions into actionable insights with
              our hyper-personalized feedback system.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3 py-6 text-lg"
              onClick={signInWithGoogle}
            >
              <Image
                src="/icons/google-icon.svg"
                alt="Google Logo"
                width={24}
                height={24}
              />
              <span>Continue with Google</span>
            </Button>
            
            <p className="mt-8 text-center text-sm text-gray-500">
              By clicking &quot;Continue with Google&quot;, you acknowledge
              that you have read and understood, and agree to HFS&apos;s
              Terms &amp; Conditions, Privacy Policy, and Content Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}