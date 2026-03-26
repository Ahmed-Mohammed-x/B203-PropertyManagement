import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Property MVP",
  description: "Property management MVP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}