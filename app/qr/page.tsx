import { createClient } from "@/utils/supabase/server";
import QRCodeClient from "./client";
import { redirect } from "next/navigation";

export default async function QRCodePage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login page if not authenticated
  if (!session) {
    redirect('/login');
  }
  
  // Get verified user data from Auth server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check if user has restaurant info
  const { data: restaurantData, error: restaurantError } = await supabase
    .from('restaurants')
    .select('qr_url, restaurant_code, name, id')
    .eq('user_id', user.id)
    .single();
  
  // Redirect to onboarding if no restaurant data
  if (restaurantError || !restaurantData || !restaurantData.id) {
    redirect('/onboarding');
  }

  return <QRCodeClient restaurantData={restaurantData} />;
}
