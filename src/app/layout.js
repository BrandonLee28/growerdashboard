import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Grower Visualization",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
