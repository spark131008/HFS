"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type User = {
  name: string;
  avatar?: string;
};

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Simulating auth check - in a real app, this would use a proper auth provider
  useEffect(() => {
    // Check if user is logged in from localStorage or cookies
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (loggedIn) {
      setIsLoggedIn(true);
      // Mock user data
      setUser({
        name: "John Doe",
      });
    }
  }, []);

  const handleLogin = () => {
    // For demo purposes - in a real app, this would redirect to login page
    setIsLoggedIn(true);
    setUser({ name: "John Doe" });
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/landing" className="text-xl font-bold text-blue-600">
            HFS
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">
            Benefits
          </Link>
          <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
            How It Works
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name} 
                      width={32} 
                      height={32} 
                      className="rounded-full" 
                    />
                  ) : (
                    <span>{user?.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin}>
                Login
              </Button>
              <Button>
                Get Started
              </Button>
            </div>
          )}
        </nav>
        
        {/* Mobile menu button - in a real app, this would toggle a mobile menu */}
        <button className="md:hidden p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
} 