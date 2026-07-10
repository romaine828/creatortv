import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_NAME = "CreatorTV";
const SITE_DESCRIPTION = "Your personal TV network — inspiration, education, business, health, and more. Watch free, ad-supported channels 24/7, or go ad-free with a Creator Pass or VIP membership.";
const LOGO_URL = "https://galaxy-prod.tlcdn.com/gen/user_2pjseNE93K3LWvS7IrybDgQX6sJ/259effb3-eaba-469d-b230-c243d54e3090.png";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Your Personal TV Network`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["CreatorTV", "streaming", "inspirational videos", "educational content", "creator network", "online TV channels", "ad-free streaming"],
  openGraph: {
    title: `${SITE_NAME} — Your Personal TV Network`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: LOGO_URL, width: 1024, height: 1024, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Your Personal TV Network`,
    description: SITE_DESCRIPTION,
    images: [LOGO_URL],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: '#070710' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
