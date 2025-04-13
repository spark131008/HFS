"use client"

import { useState, useEffect } from "react"

interface FortuneCookieProps {
  scrollProgress: number
}

interface CrackStyle {
  rotation: number;
}

interface CrumbStyle {
  size: number;
  leftPos: number;
  topOffset: number;
  direction: number;
  delay: number;
}

export default function FortuneCookie({ scrollProgress }: FortuneCookieProps) {
  // State for random values to prevent hydration errors
  const [crackStyles, setCrackStyles] = useState<CrackStyle[]>([]);
  const [crumbStyles, setCrumbStyles] = useState<CrumbStyle[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Generate random values only on the client side
  useEffect(() => {
    // Set up random crack styles
    const topCracks = [
      { rotation: Math.random() * 10 - 5 },
      { rotation: Math.random() * 10 - 5 }
    ];
    
    // Set up random crumb styles
    const crumbs = Array(8).fill(0).map((_, i) => ({
      size: 1.5 + Math.random() * 3,
      leftPos: 50 + (Math.random() * 40 - 20),
      topOffset: 20 + (Math.random() * 40 - 20),
      direction: i % 2 === 0 ? -1 : 1,
      delay: i * 0.08
    }));
    
    setCrackStyles(topCracks);
    setCrumbStyles(crumbs);
    setIsClient(true);
  }, []);

  // Calculate rotation and position based on scroll progress with improved animation curve
  const easeInOutCubic = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const animProgress = easeInOutCubic(scrollProgress);
  
  // Enhanced 3D transformations
  const mainRotation = 130; // Max rotation angle
  const topRotation = -animProgress * mainRotation; 
  const bottomRotation = animProgress * mainRotation;
  
  // Translation values (more natural movement)
  const topTranslateY = animProgress * -70;
  const bottomTranslateY = animProgress * 70;
  const topTranslateX = animProgress * -15; // Add slight horizontal shift
  const bottomTranslateX = animProgress * 15;
  
  // Z-axis and X-axis rotation for more realistic 3D effect
  const zRotation = 18; // Base Z rotation to create the folded appearance
  const topZRotation = zRotation + animProgress * 10;
  const bottomZRotation = -zRotation - animProgress * 10;
  
  // X-axis rotation for curved shape
  const xRotationBase = 25; // Base curve of the cookie (folded over middle)
  const topXRotation = xRotationBase - animProgress * 15;
  const bottomXRotation = -xRotationBase + animProgress * 15;
  
  // Fortune paper animation
  const fortuneOpacity = scrollProgress > 0.35 ? Math.min(1, (scrollProgress - 0.35) * 3) : 0;
  const fortuneScale = Math.min(1, (scrollProgress - 0.25) * 1.8);
  const fortuneTranslateY = animProgress * -10; // Slight upward movement
  const fortuneTranslateZ = scrollProgress > 0.35 ? (scrollProgress - 0.35) * 50 : 0;
  
  // Subtle wobble effect when opening
  const wobbleEffect = scrollProgress > 0.6 ? Math.sin(scrollProgress * 12) * (1 - scrollProgress) * 3 : 0;

  return (
    <div className="relative w-80 h-80 perspective-[900px] transform-gpu">
      {/* Main cookie container with initial 3D positioning */}
      <div 
        className="absolute w-full h-full"
        style={{
          transform: `rotateX(${15 + scrollProgress * 5}deg) rotateY(${wobbleEffect * 1.2}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Top half of cookie */}
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 transition-transform duration-100"
          style={{
            transform: `translate(-50%, -50%) 
                       rotateX(${topXRotation}deg) 
                       rotateY(${topRotation + wobbleEffect}deg) 
                       rotateZ(${topZRotation}deg) 
                       translateY(${topTranslateY}px)
                       translateX(${topTranslateX}px)
                       translateZ(8px)`,
            transformOrigin: "center 60%",
            transformStyle: 'preserve-3d',
            zIndex: 10,
          }}
        >
          {/* Outer surface of top cookie half - with realistic folded edge */}
          <div
            className="absolute w-full h-full overflow-hidden"
            style={{
              transform: 'scaleY(0.38) rotateX(5deg)',
              transformOrigin: 'center bottom',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Main cookie surface with authentic shape */}
            <div 
              className="absolute w-full h-full"
              style={{
                borderTopLeftRadius: '120% 100%',
                borderTopRightRadius: '120% 100%',
                borderBottomLeftRadius: '30% 60%',
                borderBottomRightRadius: '30% 60%',
                background: "linear-gradient(135deg, #f5e2bc 0%, #e8cb94 30%, #dba14d 75%, #c99959 100%)",
                boxShadow: `
                  inset 0 5px 15px -5px rgba(255,255,255,0.7), 
                  inset 0 -10px 15px -5px rgba(0,0,0,0.4), 
                  0 5px 10px rgba(0,0,0,0.2)
                `,
                overflow: "hidden",
              }}
            >
              {/* Cookie texture */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Lighting effects */}
              <div className="absolute inset-0 opacity-60 bg-gradient-to-br from-white via-transparent to-transparent"></div>
              
              {/* Darker edges where the cookie is folded/pressed */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-800/50 to-transparent"></div>
              <div className="absolute top-1/2 bottom-0 left-0 w-8 bg-gradient-to-r from-amber-800/30 to-transparent"></div>
              <div className="absolute top-1/2 bottom-0 right-0 w-8 bg-gradient-to-l from-amber-800/30 to-transparent"></div>
              
              {/* Subtle darker center line where cookie folds */}
              <div className="absolute top-1/2 inset-x-0 h-6 bg-gradient-radial from-amber-900/20 to-transparent"></div>
              
              {/* Tiny imperfections to mimic real cookie surface */}
              {isClient && crackStyles.length > 0 && (
                <>
                  <div className="absolute top-[20%] left-[30%] w-8 h-0.5 bg-amber-50/40 rounded-full opacity-50"></div>
                  <div className="absolute top-[35%] right-[25%] w-6 h-0.5 bg-amber-50/30 rounded-full opacity-40"></div>
                  <div 
                    className="absolute bottom-[20%] left-1/4 w-1/2 h-0.5 bg-amber-900/20" 
                    style={{ transform: `rotate(${crackStyles[0].rotation}deg)` }}
                  ></div>
                </>
              )}
              
              {/* Baked golden pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.7) 0%, transparent 20%), 
                                   radial-gradient(circle at 70% 65%, rgba(251, 191, 36, 0.7) 0%, transparent 20%)`
                }}
              ></div>
            </div>
          </div>
          
          {/* Inner surface of top cookie half */}
          <div
            className="absolute w-full h-full overflow-hidden"
            style={{
              transform: 'scaleY(0.38) rotateX(185deg) translateZ(-1px)',
              transformOrigin: 'center bottom',
              backfaceVisibility: 'hidden'
            }}
          >
            <div 
              className="absolute w-full h-full"
              style={{
                borderTopLeftRadius: '120% 100%',
                borderTopRightRadius: '120% 100%',
                borderBottomLeftRadius: '30% 60%',
                borderBottomRightRadius: '30% 60%',
                background: "linear-gradient(135deg, #f0d7a8 0%, #e5c68e 40%, #d19a45 80%, #b37e31 100%)",
                boxShadow: `
                  inset 0 10px 15px -5px rgba(0,0,0,0.4), 
                  inset 0 -5px 15px -5px rgba(255,255,255,0.6)
                `,
                overflow: "hidden",
              }}
            >
              {/* Inner texture is smoother */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Inner lighting */}
              <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-white via-transparent to-transparent"></div>
              
              {/* Cookie edge where it was folded */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-amber-800/40 to-transparent"></div>
            </div>
          </div>
          
          {/* Thin edge of cookie */}
          <div 
            className="absolute bottom-[64%] left-0 w-full h-1"
            style={{
              background: 'linear-gradient(to top, #d19a45, #b37e31)',
              transform: 'rotateX(90deg) translateZ(0px)',
              backfaceVisibility: 'hidden',
              transformOrigin: 'bottom'
            }}
          ></div>
          
          {/* Folded edge detail */}
          <div
            className="absolute bottom-[20%] w-full h-12"
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(183, 126, 49, 0.7) 0%, transparent 70%)',
              transform: 'rotateX(40deg) scale(0.9, 0.2)',
              opacity: 0.5
            }}
          ></div>
        </div>

        {/* Bottom half of cookie */}
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 transition-transform duration-100"
          style={{
            transform: `translate(-50%, -50%) 
                        rotateX(${bottomXRotation}deg) 
                        rotateY(${bottomRotation - wobbleEffect}deg) 
                        rotateZ(${bottomZRotation}deg) 
                        translateY(${bottomTranslateY}px)
                        translateX(${bottomTranslateX}px)
                        translateZ(-8px)`,
            transformOrigin: "center 40%",
            transformStyle: 'preserve-3d',
            zIndex: 5,
          }}
        >
          {/* Outer surface of bottom cookie half */}
          <div
            className="absolute w-full h-full overflow-hidden"
            style={{
              transform: 'scaleY(0.38) rotateX(-5deg)',
              transformOrigin: 'center top',
              backfaceVisibility: 'hidden'
            }}
          >
            <div 
              className="absolute w-full h-full"
              style={{
                borderBottomLeftRadius: '120% 100%',
                borderBottomRightRadius: '120% 100%',
                borderTopLeftRadius: '30% 60%',
                borderTopRightRadius: '30% 60%',
                background: "linear-gradient(135deg, #e8cb94 0%, #dba14d 40%, #c99959 70%, #b37e31 90%)",
                boxShadow: `
                  inset 0 10px 15px -5px rgba(0,0,0,0.4), 
                  inset 0 -5px 15px -5px rgba(255,255,255,0.7), 
                  0 -5px 10px rgba(0,0,0,0.2)
                `,
                overflow: "hidden",
              }}
            >
              {/* Cookie texture */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Lighting effects */}
              <div className="absolute inset-0 opacity-60 bg-gradient-to-tr from-transparent via-transparent to-white"></div>
              
              {/* Darker edges where the cookie is folded/pressed */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800/50 to-transparent"></div>
              <div className="absolute bottom-1/2 top-0 left-0 w-8 bg-gradient-to-r from-amber-800/30 to-transparent"></div>
              <div className="absolute bottom-1/2 top-0 right-0 w-8 bg-gradient-to-l from-amber-800/30 to-transparent"></div>
              
              {/* Subtle darker center line where cookie folds */}
              <div className="absolute bottom-1/2 inset-x-0 h-6 bg-gradient-radial from-amber-900/20 to-transparent"></div>
              
              {/* Tiny imperfections */}
              {isClient && crackStyles.length > 0 && (
                <>
                  <div className="absolute bottom-[20%] right-[30%] w-8 h-0.5 bg-amber-50/40 rounded-full opacity-50"></div>
                  <div className="absolute bottom-[35%] left-[25%] w-6 h-0.5 bg-amber-50/30 rounded-full opacity-40"></div>
                  <div 
                    className="absolute top-[20%] right-1/4 w-1/3 h-0.5 bg-amber-900/20"
                    style={{ transform: `rotate(${-crackStyles[0].rotation}deg)` }}
                  ></div>
                </>
              )}
              
              {/* Baked golden pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 70% 30%, rgba(251, 191, 36, 0.7) 0%, transparent 20%), 
                                   radial-gradient(circle at 30% 65%, rgba(251, 191, 36, 0.7) 0%, transparent 20%)`
                }}
              ></div>
            </div>
          </div>
          
          {/* Inner surface of bottom cookie half */}
          <div
            className="absolute w-full h-full overflow-hidden"
            style={{
              transform: 'scaleY(0.38) rotateX(175deg) translateZ(-1px)',
              transformOrigin: 'center top',
              backfaceVisibility: 'hidden'
            }}
          >
            <div 
              className="absolute w-full h-full"
              style={{
                borderBottomLeftRadius: '120% 100%',
                borderBottomRightRadius: '120% 100%',
                borderTopLeftRadius: '30% 60%',
                borderTopRightRadius: '30% 60%',
                background: "linear-gradient(135deg, #f0d7a8 0%, #e5c68e 40%, #d19a45 80%, #b37e31 100%)",
                boxShadow: `
                  inset 0 -10px 15px -5px rgba(0,0,0,0.4), 
                  inset 0 5px 15px -5px rgba(255,255,255,0.6)
                `,
                overflow: "hidden",
              }}
            >
              {/* Inner texture */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Inner lighting */}
              <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              
              {/* Cookie edge where it was folded */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-amber-800/40 to-transparent"></div>
            </div>
          </div>
          
          {/* Thin edge of cookie */}
          <div 
            className="absolute top-[64%] left-0 w-full h-1"
            style={{
              background: 'linear-gradient(to bottom, #d19a45, #b37e31)',
              transform: 'rotateX(90deg) translateZ(0px)',
              backfaceVisibility: 'hidden',
              transformOrigin: 'top'
            }}
          ></div>
          
          {/* Folded edge detail */}
          <div
            className="absolute top-[20%] w-full h-12"
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(183, 126, 49, 0.7) 0%, transparent 70%)',
              transform: 'rotateX(-40deg) scale(0.9, 0.2)',
              opacity: 0.5
            }}
          ></div>
        </div>

        {/* Fortune paper - with authentic look and positioning */}
        <div
          className="absolute top-1/2 left-1/2 w-40 h-auto rounded-sm flex items-center justify-center p-3 text-center"
          style={{
            transform: `translate(-50%, -50%) 
                       translateY(${fortuneTranslateY}px) 
                       scale(${fortuneScale}) 
                       translateZ(${fortuneTranslateZ}px)
                       rotateX(${animProgress * 5}deg)`,
            opacity: fortuneOpacity,
            background: 'linear-gradient(to right, #fff5e6, #fffaf0, #fff5e6)',
            boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
            zIndex: 1,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {/* Paper texture and fold effects */}
          <div className="absolute inset-0">
            {/* Fold lines */}
            <div className="absolute top-0 left-1/2 w-px h-full bg-gray-400 opacity-30"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-400 opacity-25"></div>
            
            {/* Additional subtle fold lines */}
            <div className="absolute top-1/4 left-0 w-full h-px bg-gray-400 opacity-15"></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gray-400 opacity-15"></div>
            
            {/* Paper texture */}
            <div className="absolute inset-0 opacity-12"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            ></div>
            
            {/* Slight discoloration on edges */}
            <div className="absolute inset-x-0 top-0 h-1 bg-amber-100/50"></div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-100/50"></div>
            <div className="absolute inset-y-0 left-0 w-1 bg-amber-100/50"></div>
            <div className="absolute inset-y-0 right-0 w-1 bg-amber-100/50"></div>
          </div>
          
          <p className="font-serif text-gray-800 text-sm relative z-10 min-h-[40px]">
            &quot;Your patience will be rewarded with good fortune. The path to success requires dedication and perseverance.&quot;
          </p>
        </div>
      </div>

      {/* Enhanced shadow beneath the cookie with dynamic size based on opening */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full bg-black transition-all duration-200"
        style={{
          width: `${60 + animProgress * 40}px`,
          height: `${8 + animProgress * 4}px`,
          transform: `translate(-50%, ${60 + animProgress * 20}px) rotateX(75deg)`,
          opacity: 0.12 + animProgress * 0.05,
          filter: `blur(${6 + animProgress * 4}px)`,
          zIndex: 0,
        }}
      ></div>
      
      {/* Crumb particles - enhanced with realistic appearance */}
      {scrollProgress > 0.5 && isClient && crumbStyles.length > 0 && (
        <>
          {crumbStyles.map((style, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${style.size}px`,
                height: `${style.size}px`,
                left: `${style.leftPos}%`,
                top: `${style.direction > 0 ? `calc(50% - ${style.topOffset}px)` : `calc(50% + ${style.topOffset}px)`}`,
                opacity: Math.max(0, 0.8 - (scrollProgress - 0.5) * 2),
                transform: `translateY(${(scrollProgress - 0.5) * 100 * style.direction}px) 
                           translateX(${(scrollProgress - 0.5) * (i % 2 ? 20 : -20)}px) 
                           translateZ(${i * 2}px) 
                           scale(${1 - (scrollProgress - 0.5) * 0.3})
                           rotate(${i * 45}deg)`,
                background: i % 3 === 0 ? '#e5c68e' : (i % 3 === 1 ? '#d19a45' : '#e8cb94'),
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transition: `all 0.4s ${style.delay}s ease-out`,
              }}
            >
              {/* Inner details for realistic crumbs */}
              <div className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)',
                }}
              ></div>
              
              {/* Tiny edge details */}
              {i % 2 === 0 && (
                <div className="absolute inset-1 rounded-sm opacity-50"
                  style={{
                    background: 'linear-gradient(45deg, rgba(183, 126, 49, 0.7) 0%, transparent 100%)',
                  }}
                ></div>
              )}
            </div>
          ))}
        </>
      )}
      
      {/* Subtle ambient light effect */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 35%)',
          opacity: 0.35 - scrollProgress * 0.15,
          mixBlendMode: 'overlay'
        }}
      ></div>
    </div>
  )
}
