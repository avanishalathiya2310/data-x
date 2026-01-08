import "./globals.css";

export const metadata = {
  title: "DataX",
  description: "DataX-Nuvinno",
};

// use roboto font
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={roboto.className}>
          {children}
      </body>
    </html>
  );
}
