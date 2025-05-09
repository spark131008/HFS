'use client';

import { Button } from "@/components/ui/button";
import MainNavigationBar from "@/components/MainNavigationBar";
import { theme, cn } from "@/theme";
import { useRouter } from "next/navigation";
import PrintQRCode from "@/components/PrintQRCode";

interface RestaurantData {
  qr_url: string;
  restaurant_code: string;
  name: string;
  id: number;
}

interface QRCodeClientProps {
  restaurantData: RestaurantData;
}

export default function QRCodeClient({ restaurantData }: QRCodeClientProps) {
  const router = useRouter();
  const { name: restaurantName, qr_url: qrCode, restaurant_code: restaurantCode } = restaurantData;

  const handleContinue = () => {
    router.push("/my-surveys");
  };

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
            {`${restaurantName} QR Code`}
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
              <PrintQRCode 
                qrCodeUrl={qrCode} 
                title={`${restaurantName} QR Code`} 
                className={cn(theme.effects.gradient.primary, theme.colors.text.white, theme.typography.fontWeight.semibold, theme.typography.fontSize.base)}
              />
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