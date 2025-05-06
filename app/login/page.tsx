"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import MainNavigationBar from "@/components/MainNavigationBar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { theme, cn } from "@/theme";

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
    <div className={cn("min-h-screen flex flex-col", theme.colors.background.gradient)}>
      <MainNavigationBar />
      <main className={cn(
        "flex-1 flex items-start justify-center pt-16",
        "bg-gradient-to-b from-gray-50 to-white"
      )}>
        <div className={cn(
          "w-full max-w-xl mx-auto px-4 py-8 sm:px-6"
        )}>
          <div className="text-center mb-10">
            <h1 className={cn(
              theme.typography.fontFamily.display,
              theme.typography.fontWeight.bold,
              theme.typography.fontSize["4xl"],
              "tracking-tight mb-4",
              theme.colors.text.gradient
            )}>
              Sign up or Log in to HFS
            </h1>
            <p className={cn(
              theme.typography.fontSize.lg,
              theme.colors.text.secondary,
              "max-w-md mx-auto"
            )}>
              Transform customer opinions into actionable insights with
              our hyper-personalized feedback system.
            </p>
          </div>
          
          <div className={cn(
            theme.colors.background.light,
            theme.borderRadius.default,
            theme.effects.shadow.sm,
            "p-8 border border-gray-200"
          )}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                "w-full flex items-center justify-center gap-3 py-6",
                theme.typography.fontSize.lg,
                theme.typography.fontWeight.semibold
              )}
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
            
            <p className={cn(
              "mt-8 text-center",
              theme.typography.fontSize.sm,
              theme.colors.text.secondary
            )}>
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