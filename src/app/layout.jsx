import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Skin Beauty — Beauté Coréenne",
  description:
    "Skin Beauty — boutique de beauté coréenne premium. Soins et cosmétiques K-Beauty pour une peau éclatante. الجمال الكوري",
  icons: {
    icon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23e11d6d'/><path d='M16 24s-6-3.8-8-7.6C6.9 13.2 8.5 11 11 11c1.7 0 3.5 1.2 5 3 1.5-1.8 3.3-3 5-3 2.5 0 4.1 2.2 3 5.4-2 3.8-8 7.6-8 7.6Z' fill='white'/></svg>",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f295a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Great+Vibes&family=Tajawal:wght@300;400;500;700&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 overflow-x-clip">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
