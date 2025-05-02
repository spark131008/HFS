import { createClient } from './supabase/client';

export async function getUserRestaurantId(): Promise<number | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return null;
    }

    // Get restaurant_id from user metadata
    const { data: restaurantData, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('user_id', user.id)
    .single();

    if (!restaurantData || !restaurantData.id || restaurantError) {
      console.error('No restaurant_id found in user metadata');
      return null;
    }

    return restaurantData.id;
  } catch (error) {
    console.error('Error getting user restaurant ID:', error);
    return null;
  }
} 