"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type User = {
  name?: string;
  email?: string;
  avatar?: string;
};

export default function MainNavigationBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const supabase = createClient();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check auth status using Supabase client
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsLoggedIn(true);
        // Get user details from session
        const { data: { user } } = await supabase.auth.getUser();
        setUser({
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
          email: user?.email,
          avatar: user?.user_metadata?.avatar_url
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkUser();
    
    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url
        });
      } else {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/'); // Redirect to landing page after logout
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            HFS
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {isHomePage && !isLoggedIn && (
            <>
              <Link href="#benefits" className="text-base font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                Benefits
              </Link>
              <Link href="#how-it-works" className="text-base font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                How It Works
              </Link>
            </>
          )}
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link href="/my-surveys" className="text-gray-600 hover:text-blue-600 transition-colors">
                My Surveys
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      width={32} 
                      height={32} 
                      className="rounded-full" 
                    />
                  ) : (
                    <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{user?.name || user?.email?.split('@')[0]}</span>
              </div>
              <Button variant="ghost" className="hover:text-indigo-600" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {!isLoginPage && (
                <Button variant="ghost">
                  <Link href="/login">
                    Sign up/Log in
                  </Link>
                </Button>
              )}
              {pathname !== '/login' && (
                <Button>
                  <Link href="/login">
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          )}
        </nav>
        
        {/* Mobile menu button - now functional */}
        <button 
          className="md:hidden p-2 text-indigo-600 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
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
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
          <div className="container mx-auto px-4 py-3 space-y-4">
            {isHomePage && !isLoggedIn && (
              <div className="space-y-3">
                <Link 
                  href="#benefits" 
                  className="block text-base font-semibold text-gray-600 hover:text-indigo-600 transition-colors py-2"
                  onClick={toggleMobileMenu}
                >
                  Benefits
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="block text-base font-semibold text-gray-600 hover:text-indigo-600 transition-colors py-2"
                  onClick={toggleMobileMenu}
                >
                  How It Works
                </Link>
              </div>
            )}
            
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 py-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                    {user?.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={user.name || 'User'} 
                        width={32} 
                        height={32} 
                        className="rounded-full" 
                      />
                    ) : (
                      <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{user?.name || user?.email?.split('@')[0]}</span>
                </div>
                <Link 
                  href="/my-surveys" 
                  className="block text-gray-600 hover:text-blue-600 transition-colors py-2"
                  onClick={toggleMobileMenu}
                >
                  My Surveys
                </Link>
                <button 
                  className="w-full text-left text-gray-600 hover:text-indigo-600 transition-colors py-2"
                  onClick={() => {
                    toggleMobileMenu();
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {isLoginPage ? (
                  // Add content for login page mobile menu
                  <Link 
                    href="/" 
                    className="block text-gray-600 hover:text-indigo-600 transition-colors py-2"
                    onClick={toggleMobileMenu}
                  >
                    Back to Home
                  </Link>
                ) : (
                  <>
                    {!isLoginPage && (
                      <Link 
                        href="/login" 
                        className="block text-gray-600 hover:text-indigo-600 transition-colors py-2"
                        onClick={toggleMobileMenu}
                      >
                        Sign up/Log in
                      </Link>
                    )}
                    {pathname !== '/login' && (
                      <Link 
                        href="/login" 
                        className="block bg-indigo-600 text-white px-4 py-2 rounded-md text-center"
                        onClick={toggleMobileMenu}
                      >
                        Get Started
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}