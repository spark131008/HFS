'use client';

import { Button } from "@/components/ui/button";

interface PrintQRCodeProps {
  qrCodeUrl: string;
  title?: string;
  className?: string;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "secondary2";
}

export default function PrintQRCode({ 
  qrCodeUrl, 
  title = "Restaurant QR Code",
  className = "",
  buttonText = "Print QR Code",
  variant = "default"
}: PrintQRCodeProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                background-color: #f5f1e6;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              }
              .container {
                text-align: center;
                max-width: 550px;
                padding: 30px 40px 60px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                position: relative;
                overflow: hidden;
              }
              .fortune-cookie-bg {
                position: absolute;
                bottom: -20px;
                right: 20px;
                width: 90px;
                height: 90px;
                opacity: 1;
                z-index: 0;
                transform: rotate(15deg);
              }
              h1 {
                font-weight: 700;
                color: #111;
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 38px;
                letter-spacing: -0.5px;
                line-height: 1.1;
                position: relative;
                z-index: 1;
              }
              .subtitle {
                font-weight: 600;
                color: #333;
                margin-bottom: 35px;
                font-size: 22px;
                letter-spacing: -0.3px;
                line-height: 1.3;
                position: relative;
                z-index: 1;
              }
              .qr-wrapper {
                background: white;
                padding: 0;
                border-radius: 12px;
                display: inline-block;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
                box-shadow: 0 4px 20px rgba(0,0,0,0.04);
              }
              .qr-border {
                padding: 18px;
                border: 1px solid rgba(255, 215, 0, 0.4);
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,255,255,1) 100%);
              }
              img {
                max-width: 320px;
                width: 100%;
                height: auto;
                display: block;
              }
              .promo-text {
                margin-top: -5px;
                color: #333;
                font-size: 16px;
                max-width: 400px;
                margin: -5px auto 0;
                text-align: center;
                line-height: 1.5;
              }
              .main-cta {
                font-weight: 600;
                font-size: 18px;
                color: #111;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .tag-line {
                font-style: italic;
                font-size: 15px;
                color: #666;
                margin-top: 14px;
                opacity: 0.9;
              }
              .fortune-icon {
                font-size: 22px;
                margin: 0 8px;
                color: #FFD700;
              }
              .instructions {
                font-size: 15px;
                color: #444;
                margin: 0;
                line-height: 1.6;
              }
              @media print {
                body {
                  background-color: white;
                }
                .container {
                  box-shadow: none;
                  padding: 20px;
                }
                .qr-wrapper {
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="/survey/fortune_cookie_1.png" alt="Fortune Cookie" class="fortune-cookie-bg" />
              <h1>Crack Open</h1>
              <div class="subtitle">Your Digital Fortune Cookie</div>
              <div class="qr-wrapper">
                <div class="qr-border">
                  <img src="${qrCodeUrl}" alt="${title}" />
                </div>
              </div>
              <div class="promo-text">
                <p class="main-cta"><span class="fortune-icon">🥠</span> SCAN THE CODE <span class="fortune-icon">🥠</span></p>
                <p class="tag-line">What secrets will your fortune hold today?</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <Button 
      onClick={handlePrint}
      className={className}
      variant={variant}
    >
      {buttonText}
    </Button>
  );
} 