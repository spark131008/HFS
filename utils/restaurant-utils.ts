import { createClient } from './supabase/client';

// Function to get the base URL for the application
function getBaseUrl(): string {
  // First try to get from environment variable
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;

  // Fallback: try to get from window location in browser
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.host}`;
  }

  // Final fallback for server-side
  return 'http://localhost:3000';
}

// Function to generate a unique 6-character restaurant code
export async function generateUniqueRestaurantCode(): Promise<string> {
  const supabase = createClient();
  
  while (true) {
    // Generate a random 6-character code (letters and numbers)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Check if the code already exists
    const { data } = await supabase
      .from('restaurants')
      .select('restaurant_code')
      .eq('restaurant_code', code)
      .single();
    
    // If no restaurant found with this code, it's unique
    if (!data) {
      return code;
    }
  }
}

// Function to generate a QR code URL for a restaurant
export async function generateQRCodeUrl(restaurantCode: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  
  // Get base URL and construct feedback URL
  const baseUrl = getBaseUrl();
  const surveyUrl = `${baseUrl}/survey?code=${restaurantCode}`;
  
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(surveyUrl);
  return qrDataUrl;
}

// Function to create a new restaurant
export async function createRestaurant(name: string, userId: string): Promise<{ success: boolean; error?: string; restaurantId?: number; restaurantCode?: string }> {
  try {
    const supabase = createClient();
    
    // Generate unique restaurant code
    const restaurantCode = await generateUniqueRestaurantCode();
    
    // Generate QR code
    const qrUrl = await generateQRCodeUrl(restaurantCode);
    
    // Insert new restaurant
    const { data, error } = await supabase
      .from('restaurants')
      .insert([
        {
          name,
          restaurant_code: restaurantCode,
          qr_url: qrUrl,
          user_id: userId
        }
      ])
      .select('id')
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      restaurantId: data.id,
      restaurantCode: restaurantCode
    };
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return {
      success: false,
      error: 'Failed to create restaurant'
    };
  }
}