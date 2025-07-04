"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SignOutButton({ 
  variant = "outline", 
  size = "sm",
  className 
}: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  );
} 