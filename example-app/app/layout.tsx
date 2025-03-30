// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "My Firebase App",
  description: "Next.js Firebase Authentication & Firestore Example",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "1rem", background: "#fff", borderBottom: "1px solid #ccc" }}>
          <h1>My Firebase App</h1>
        </header>
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
