"use client";

import "./globals.css";
import AuthProvider from "@/context/auth/AuthProvider";
import { HospitalProvider } from "@/context/setting/HospitalInformation";

import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


export default function RootLayout({ children }) {
  const queryClient = new QueryClient();

  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" reverseOrder={false} />
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <HospitalProvider>
              {children}
            </HospitalProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
