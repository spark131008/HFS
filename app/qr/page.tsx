"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import MainNavigationBar from "@/components/MainNavigationBar";

export default function QRCodePage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [restaurantCode, setRestaurantCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Check if user has restaurant info
        const restaurantId = user.user_metadata?.restaurant_id;
        const restaurantName = user.user_metadata?.restaurant_name;
        
        if (!restaurantId || !restaurantName) {
          router.push("/onboarding");
          return;
        }

        // Get the QR code URL
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('qr_url, restaurant_code')
          .eq('id', restaurantId)
          .single();

        if (restaurant?.qr_url) {
          setRestaurantName(restaurantName);
          setQrCode(restaurant.qr_url);
          setRestaurantCode(restaurant.restaurant_code || null);
        } else {
          setError("Could not find restaurant QR code");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    fetchRestaurantData();
  }, [router]);

  const handleContinue = () => {
    router.push("/my-surveys");
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNavigationBar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 p-8">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigationBar />
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
            {restaurantName}
          </h1>
          <p className="mb-6 text-gray-600 text-center">Your restaurant&apos;s QR code for customer feedback</p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-64 h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode || undefined} alt="Restaurant QR Code" className="w-full h-full" />
            </div>
            
            {restaurantCode && (
              <p className="text-sm text-gray-600">Restaurant Code: {restaurantCode}</p>
            )}
            
            <div className="flex flex-col w-full space-y-3">
              <Button onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>${restaurantName} QR Code</title>
                        <style>
                          body { 
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            padding: 20px;
                          }
                          img {
                            max-width: 500px;
                            width: 100%;
                            height: auto;
                          }
                          .container {
                            text-align: center;
                          }
                          h1 {
                            font-family: system-ui, -apple-system, sans-serif;
                            color: #333;
                            margin-bottom: 20px;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <h1>${restaurantName}</h1>
                          <img src="${qrCode}" alt="Restaurant QR Code" />
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                }
              }} className="bg-blue-600 hover:bg-blue-700">
                Print QR Code
              </Button>
              <Button onClick={handleContinue} variant="outline">
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
