"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { createRestaurant } from "@/utils/restaurant-utils";
import { theme, cn } from "@/theme";

export default function OnboardingPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Add effect to check for existing restaurant
  useEffect(() => {
    const checkExistingRestaurant = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error("You must be logged in to view this page.");
        }

        // Check if user already has restaurant info
        const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('qr_url, restaurant_code')
        .eq('user_id', user.id)
        .single();
        
        if (!restaurantError && restaurantData && restaurantData.qr_url && restaurantData.restaurant_code) {
          router.push("/qr");
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    checkExistingRestaurant();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!restaurantName.trim()) {
      setError("Please enter your restaurant name.");
      return;
    }
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("You must be logged in to complete onboarding.");
      }

      // Create restaurant entry - pass both restaurant name and user ID
      const { success, error: restaurantError } = await createRestaurant(
        restaurantName.trim(),
        user.id
      );
      
      if (!success) {
        throw new Error(restaurantError || "Failed to create restaurant");
      }

      // Navigate to QR page after successful creation
      router.push("/qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-8",
      theme.colors.background.gradient
    )}>
      <div className={cn(
        "w-full max-w-md",
        theme.colors.background.light,
        theme.borderRadius.default,
        theme.effects.shadow.lg,
        "p-8 border border-gray-200"
      )}>
        <h1 className={cn(
          theme.typography.fontFamily.display,
          theme.typography.fontWeight.bold,
          theme.typography.fontSize["3xl"],
          theme.colors.accent.blue,
          "mb-4 text-center"
        )}>Welcome to HFS!</h1>
        <p className={cn(
          theme.typography.fontSize.base,
          theme.colors.text.secondary,
          "mb-6 text-center"
        )}>
          Let&apos;s get started by telling us about your restaurant.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="restaurantName" className={cn(
              theme.colors.text.primary,
              theme.typography.fontWeight.medium,
              theme.typography.fontSize.base,
              "block mb-2"
            )}>Restaurant Name</label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              placeholder="e.g. Empire Diner"
              disabled={loading}
              className="mt-1"
            />
          </div>
          {error && <div className={cn("text-red-600 text-sm")}>{error}</div>}
          <Button type="submit" className={cn("w-full", theme.typography.fontWeight.semibold, theme.typography.fontSize.base)} disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
