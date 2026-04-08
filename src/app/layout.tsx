import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitWise - Smart Expense Splitter",
  description:
    "Split group expenses effortlessly. Track who owes whom, settle debts, and get AI-powered spending insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">
        <div className="orb w-96 h-96 bg-emerald-500 top-0 left-1/4" />
        <div
          className="orb w-72 h-72 bg-sky-500 bottom-1/4 right-10"
          style={{ animationDelay: "3s" }}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
