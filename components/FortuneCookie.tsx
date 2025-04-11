interface FortuneCookieProps {
    scrollProgress: number
  }
  
  export default function FortuneCookie({ scrollProgress }: FortuneCookieProps) {
    // Calculate rotation and position based on scroll progress
    const topRotation = -scrollProgress * 120 // degrees
    const bottomRotation = scrollProgress * 120 // degrees
    const topTranslateY = scrollProgress * -80 // pixels
    const bottomTranslateY = scrollProgress * 80 // pixels
    const fortuneOpacity = scrollProgress > 0.3 ? 1 : 0
    const fortuneScale = Math.min(1, scrollProgress * 2)
  
    return (
      <div className="relative w-80 h-80">
        {/* Top half of cookie */}
        <div
          className="absolute top-1/2 left-1/2 w-64 h-32 overflow-hidden"
          style={{
            transform: `translate(-50%, -50%) rotate(${topRotation}deg) translateY(${topTranslateY}px)`,
            transformOrigin: "center bottom",
            zIndex: 10,
          }}
        >
          <div
            className="w-full h-full relative"
            style={{
              borderTopLeftRadius: "100%",
              borderTopRightRadius: "100%",
              background: "linear-gradient(to bottom, #e8c98f, #d4a76a)",
              boxShadow: "inset 0 5px 15px -5px rgba(255,255,255,0.7), inset 0 -5px 15px -5px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            {/* Texture and highlights for top half */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
              }}
            />
            {/* Crease in the middle */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-transparent to-amber-800 opacity-30"></div>
          </div>
        </div>
  
        {/* Bottom half of cookie */}
        <div
          className="absolute top-1/2 left-1/2 w-64 h-32 overflow-hidden"
          style={{
            transform: `translate(-50%, -50%) rotate(${bottomRotation}deg) translateY(${bottomTranslateY}px)`,
            transformOrigin: "center top",
            zIndex: 5,
          }}
        >
          <div
            className="w-full h-full relative"
            style={{
              borderBottomLeftRadius: "100%",
              borderBottomRightRadius: "100%",
              background: "linear-gradient(to top, #e8c98f, #d4a76a)",
              boxShadow: "inset 0 5px 15px -5px rgba(0,0,0,0.4), inset 0 -5px 15px -5px rgba(255,255,255,0.7)",
              overflow: "hidden",
            }}
          >
            {/* Texture and highlights for bottom half */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
              }}
            />
            {/* Crease in the middle */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-t from-transparent to-amber-800 opacity-30"></div>
          </div>
        </div>
  
        {/* Fortune paper */}
        <div
          className="absolute top-1/2 left-1/2 w-48 h-20 bg-white rounded-sm flex items-center justify-center p-2 text-center text-sm"
          style={{
            transform: `translate(-50%, -50%) scale(${fortuneScale})`,
            opacity: fortuneOpacity,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        >
          <p className="font-serif text-gray-800">&quot;Your patience will be rewarded with good fortune.&quot;</p>
        </div>
  
        {/* Add shadow beneath the cookie */}
        <div
          className="absolute top-1/2 left-1/2 w-64 h-8 rounded-full bg-black"
          style={{
            transform: "translate(-50%, 60px)",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        ></div>
      </div>
    )
  }
  