import { ReactNode, useState, useEffect } from "react";
import { ShieldCheck, Smartphone, Users } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

const carouselSlides = [
  {
    title: "MFA for all accounts",
    description: "Secure online accounts with OneAuth 2FA. Back up OTP secrets and never lose access to your accounts.",
    image: "/illustrations/mfa.jpg"
  },
  {
    title: "Passwordless Sign-in",
    description: "Experience seamless authentication. Say goodbye to complex passwords and use your trusted devices instead.",
    image: "/illustrations/passwordless.jpg"
  },
  {
    title: "Enterprise Grade Security",
    description: "Built with industry-leading security standards to keep your customer data and business operations completely safe.",
    image: "/illustrations/security.jpg"
  }
];

export function AuthLayout({ children }: AuthLayoutProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Subtle geometric background pattern (CSS-based) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: `linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), 
                               linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0)`,
             backgroundSize: '100px 100px',
             backgroundPosition: '0 0, 50px 50px'
           }} 
      />
      
      {/* Central Split Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Side: Dynamic Form Area */}
        <div className="w-full md:w-[55%] p-6 sm:p-8 lg:p-12 flex flex-col">
          {/* Logo / Header Area */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="DSSFlow Logo" className="h-10 w-auto object-contain" />
            </div>
            <button className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-700 transition-colors">
              <SparklesIcon className="w-3 h-3" /> <span className="hidden sm:inline">Try smart sign-in</span><span className="sm:hidden">Smart</span>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {children}
          </div>
        </div>
        
        {/* Right Side: Informational / Graphic Area */}
        <div className="w-full md:w-[45%] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center text-center relative order-first md:order-last">
          
          {/* Illustration Graphic */}
          <div className="relative mb-6 md:mb-8 flex flex-col items-center justify-center w-full">
            <img 
              src={carouselSlides[currentSlide].image} 
              alt={carouselSlides[currentSlide].title}
              className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-cover rounded-3xl shadow-sm mix-blend-multiply transition-opacity duration-300"
            />
          </div>
          
          <div className="min-h-[80px] md:min-h-[100px] flex flex-col items-center justify-center transition-opacity duration-300">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{carouselSlides[currentSlide].title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              {carouselSlides[currentSlide].description}
            </p>
          </div>
          
          <button className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-5 py-2 rounded-full hover:bg-blue-100 transition-colors mt-4 sm:mt-6 hidden md:block">
            Learn more
          </button>
          
          {/* Animated Carousel Dots */}
          <div className="mt-4 sm:mt-6 md:mt-8 flex gap-2 items-center justify-center">
            {carouselSlides.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-300 cursor-pointer'
                }`}
                onClick={() => setCurrentSlide(index)}
              ></div>
            ))}
          </div>
        </div>
        
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-2 md:bottom-4 text-center w-full text-[10px] sm:text-xs text-slate-400">
        © 2026, Digital Success Solutions. All Rights Reserved.
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  )
}
