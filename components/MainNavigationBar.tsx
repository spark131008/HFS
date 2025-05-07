"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { theme, cn, componentStyles } from "@/theme";

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
    <header className={cn(
      "sticky top-0",
      theme.zIndex.header,
      theme.colors.background.light,
      theme.effects.shadow.sm
    )}>
      <div className={cn(
        theme.spacing.container,
        "py-4",
        theme.layout.flex.between
      )}>
        <div className={theme.layout.flex.center}>
          <Link href="/" className={cn(
            theme.typography.fontSize.xl,
            theme.typography.fontWeight.bold,
            theme.typography.fontFamily.display,
            theme.colors.text.gradient
          )}>
            HFS
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {isHomePage && !isLoggedIn && (
            <>
              <Link href="#benefits" className={cn(
                theme.typography.fontFamily.display,
                theme.typography.fontWeight.semibold,
                theme.typography.fontSize.base,
                "hover:text-indigo-600",
                theme.transitions.colors
              )}>
                Benefits
              </Link>
              <Link href="#how-it-works" className={cn(
                theme.typography.fontFamily.display,
                theme.typography.fontWeight.semibold,
                theme.typography.fontSize.base,
                "hover:text-indigo-600",
                theme.transitions.colors
              )}>
                How It Works
              </Link>
            </>
          )}
          
          {isLoggedIn ? (
            <div className={cn(theme.layout.flex.center, "space-x-4")}>
              <Link href="/my-surveys" className={cn(
                theme.typography.fontFamily.display,
                theme.typography.fontWeight.semibold,
                theme.typography.fontSize.base,
                theme.colors.text.secondary,
                "hover:text-blue-600",
                theme.transitions.colors
              )}>
                My Surveys
              </Link>
              <div className={cn(theme.layout.flex.center, "space-x-2")}>
                <div className={cn(
                  "h-8 w-8",
                  theme.borderRadius.full,
                  theme.effects.gradient.primary,
                  theme.colors.text.white,
                  theme.layout.flex.center
                )}>
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      width={32} 
                      height={32} 
                      className={theme.borderRadius.full}
                    />
                  ) : (
                    <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className={cn(
                  theme.typography.fontFamily.display,
                  theme.typography.fontWeight.medium,
                  theme.typography.fontSize.sm
                )}>{user?.name || user?.email?.split('@')[0]}</span>
              </div>
              <Button variant="ghost" className={cn(
                theme.typography.fontFamily.display,
                theme.typography.fontWeight.semibold,
                theme.typography.fontSize.base,
                "hover:text-indigo-600"
              )} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className={cn(theme.layout.flex.center, "space-x-4")}>
              {!isLoginPage && (
                <Button variant="ghost" className={cn(
                  theme.typography.fontFamily.display,
                  theme.typography.fontWeight.semibold,
                  theme.typography.fontSize.base
                )}>
                  <Link href="/login">
                    Sign up/Log in
                  </Link>
                </Button>
              )}
              {pathname !== '/login' && (
                <Button className={cn(
                  componentStyles.button.primary,
                  theme.typography.fontFamily.display,
                  theme.typography.fontWeight.semibold,
                  theme.typography.fontSize.base
                )}>
                  <Link href="/login">
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className={cn(
            "md:hidden p-2",
            "text-indigo-600",
            "focus:outline-none"
          )}
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
        <div className={cn(
          "md:hidden",
          theme.colors.background.light,
          "border-t",
          "border-gray-100",
          theme.effects.shadow.lg,
          "animate-fadeIn"
        )}>
          <div className={cn(
            theme.spacing.container,
            "py-3 space-y-4"
          )}>
            {isHomePage && !isLoggedIn && (
              <div className="space-y-3">
                <Link 
                  href="#benefits" 
                  className={cn(
                    "block",
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontSize.base,
                    theme.colors.text.secondary,
                    "hover:text-indigo-600",
                    theme.transitions.colors,
                    "py-2"
                  )}
                  onClick={toggleMobileMenu}
                >
                  Benefits
                </Link>
                <Link 
                  href="#how-it-works" 
                  className={cn(
                    "block",
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontSize.base,
                    theme.colors.text.secondary,
                    "hover:text-indigo-600",
                    theme.transitions.colors,
                    "py-2"
                  )}
                  onClick={toggleMobileMenu}
                >
                  How It Works
                </Link>
              </div>
            )}
            
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className={cn(theme.layout.flex.center, "space-x-2 py-2")}>
                  <div className={cn(
                    "h-8 w-8",
                    theme.borderRadius.full,
                    theme.effects.gradient.primary,
                    theme.colors.text.white,
                    theme.layout.flex.center
                  )}>
                    {user?.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={user.name || 'User'} 
                        width={32} 
                        height={32} 
                        className={theme.borderRadius.full}
                      />
                    ) : (
                      <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className={cn(
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.medium,
                    theme.typography.fontSize.sm
                  )}>{user?.name || user?.email?.split('@')[0]}</span>
                </div>
                <Link 
                  href="/my-surveys" 
                  className={cn(
                    "block",
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontSize.base,
                    theme.colors.text.secondary,
                    "hover:text-blue-600",
                    theme.transitions.colors,
                    "py-2"
                  )}
                  onClick={toggleMobileMenu}
                >
                  My Surveys
                </Link>
                <button 
                  className={cn(
                    "w-full text-left",
                    theme.typography.fontFamily.display,
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontSize.base,
                    theme.colors.text.secondary,
                    "hover:text-indigo-600",
                    theme.transitions.colors,
                    "py-2"
                  )}
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
                  <Link 
                    href="/" 
                    className={cn(
                      "block",
                      theme.typography.fontFamily.display,
                      theme.typography.fontWeight.semibold,
                      theme.typography.fontSize.base,
                      theme.colors.text.secondary,
                      "hover:text-indigo-600",
                      theme.transitions.colors,
                      "py-2"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    Back to Home
                  </Link>
                ) : (
                  <>
                    {!isLoginPage && (
                      <Link 
                        href="/login" 
                        className={cn(
                          "block",
                          theme.typography.fontFamily.display,
                          theme.typography.fontWeight.semibold,
                          theme.typography.fontSize.base,
                          theme.colors.text.secondary,
                          "hover:text-indigo-600",
                          theme.transitions.colors,
                          "py-2"
                        )}
                        onClick={toggleMobileMenu}
                      >
                        Sign up/Log in
                      </Link>
                    )}
                    {pathname !== '/login' && (
                      <Link 
                        href="/login" 
                        className={cn(
                          "block",
                          componentStyles.button.primary,
                          theme.typography.fontFamily.display,
                          theme.typography.fontWeight.semibold,
                          theme.typography.fontSize.base,
                          "text-center"
                        )}
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