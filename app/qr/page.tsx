"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import MainNavigationBar from "@/components/MainNavigationBar";
import { theme, cn } from "@/theme";

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
        const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('qr_url, restaurant_code, name')
        .eq('user_id', user.id)
        .single();
        
        if (restaurantError || !restaurantData) {
          router.push("/onboarding");
          return;
        }
        if (restaurantData.qr_url) {
          setQrCode(restaurantData.qr_url);
        }

        if (restaurantData.restaurant_code) {
          setRestaurantCode(restaurantData.restaurant_code);
        }

        if (restaurantData.name) {
          setRestaurantName(restaurantData.name);
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
      <div className={cn("min-h-screen flex flex-col")}> 
        <MainNavigationBar />
        <div className={cn(
          "flex-1 flex items-center justify-center p-8",
          theme.colors.background.gradient
        )}>
          <div className={cn("text-red-600")}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col")}> 
      <MainNavigationBar />
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center p-8",
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
            theme.colors.primary.to,
            "mb-4 text-center"
          )}>
            {restaurantName}
          </h1>
          <p className={cn(
            theme.typography.fontSize.base,
            theme.colors.text.secondary,
            "mb-6 text-center"
          )}>
            Your restaurant&apos;s QR code for customer feedback
          </p>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-64 h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode || undefined} alt="Restaurant QR Code" className="w-full h-full" />
            </div>
            {restaurantCode && (
              <p className={cn(
                theme.typography.fontSize.sm,
                theme.colors.text.secondary
              )}>Restaurant Code: {restaurantCode}</p>
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
              }} className={cn(theme.effects.gradient.primary, theme.colors.text.white, theme.typography.fontWeight.semibold, theme.typography.fontSize.base)}>
                Print QR Code
              </Button>
              <Button onClick={handleContinue} variant="outline" className={cn(theme.typography.fontWeight.semibold, theme.typography.fontSize.base)}>
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
