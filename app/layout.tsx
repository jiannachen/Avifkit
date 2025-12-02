import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://avifkit.com'),
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
