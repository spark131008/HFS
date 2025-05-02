"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { createRestaurant } from "@/utils/restaurant-utils";

export default function OnboardingPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check for existing restaurant and redirect if found
  useEffect(() => {
    const checkExistingRestaurant = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Check if user already has restaurant info
        const restaurantId = user.user_metadata?.restaurant_id;
        const restaurantName = user.user_metadata?.restaurant_name;
        
        if (restaurantId && restaurantName) {
          router.push("/qr");
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

      // Create restaurant entry
      const { success, error: restaurantError, restaurantId } = await createRestaurant(restaurantName.trim());
      
      if (!success || !restaurantId) {
        throw new Error(restaurantError || "Failed to create restaurant");
      }

      // Update user_metadata with restaurant name and ID
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata, 
          restaurant_name: restaurantName,
          restaurant_id: restaurantId
        }
      });

      if (updateError) {
        throw new Error("Failed to save restaurant information");
      }

      // Redirect to QR code page
      router.push("/qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">Welcome to HFS!</h1>
        <p className="mb-6 text-gray-600 text-center">Let&apos;s get started by telling us about your restaurant.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="restaurantName" className="block text-gray-700 font-medium mb-2">Restaurant Name</label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              placeholder="e.g. Empire Diner"
              disabled={loading}
              className="mt-1"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
