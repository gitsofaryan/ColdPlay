import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Coldplay - AI Cold Mailer",
  description: "Automate cold outreach with Puter.js AI personalization and bulk Gmail SMTP queues.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
          precedence="default"
        />
        {/* FontAwesome CDN */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          precedence="default"
        />
      </head>
      <body>
        <div className="page-texture"></div>
        {children}
        
        {/* Puter SDK */}
        <Script 
          src="https://js.puter.com/v2/" 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
