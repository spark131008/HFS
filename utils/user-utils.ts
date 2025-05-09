import { createClient } from './supabase/client';


export async function getUserRestaurantInfo(): Promise<{ id: number | null, name: string | null }> {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return { id: null, name: null };
    }

    // Get restaurant data in a single query
    const { data: restaurantData, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('user_id', user.id)
    .single();

    if (!restaurantData || restaurantError) {
      console.error('No restaurant data found for user');
      return { id: null, name: null };
    }

    return { 
      id: restaurantData.id || null, 
      name: restaurantData.name || null 
    };
  } catch (error) {
    console.error('Error getting user restaurant info:', error);
    return { id: null, name: null };
  }
} 