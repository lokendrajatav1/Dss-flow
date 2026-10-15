import { RegisterForm } from "../components/RegisterForm";
import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    quote: "DSSFlow has revolutionized our lead management. With seamless integrations for IndiaMART, Justdial, and Facebook, along with powerful WhatsApp automation, we now close deals faster than ever before.",
    author: "ARPIT SONI",
    role: "Co-founder, Digital Success Solutions"
  },
  {
    quote: "DSSFlow has made our work so much easier. Managing leads and sales is now very simple and fast. It is exactly what our team needed.",
    author: "LOKENDRA JATAV",
    role: "Co-founder, Shreezatech"
  },
  {
    quote: "Since switching to DSSFlow, our sales team's productivity has doubled. The unified inbox and automated pipeline tracking have saved us countless hours every week.",
    author: "RAHUL SHARMA",
    role: "CEO, TechGrow Solutions"
  }
];

export function RegisterPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Sidebar - Dark Pattern */}
      <div className="hidden lg:flex w-[30%] bg-[#1a1235] relative flex-col justify-between p-10 overflow-hidden">
        {/* Subtle mandala/pattern background simulation using CSS */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at center, #ffffff 1px, transparent 1px), radial-gradient(circle at center, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />
        
        <div className="relative z-10 flex items-center gap-2">
          <img src="/logo.png" alt="DSSFlow Logo" className="h-10 w-auto brightness-0 invert" />
        </div>

        <div className="relative z-10 text-center flex flex-col justify-center min-h-[250px]">
          <div className="transition-opacity duration-500 ease-in-out">
            <p className="text-lg text-slate-200 leading-relaxed italic font-serif mb-6 min-h-[140px] flex items-center justify-center">
              "{testimonials[currentSlide].quote}"
            </p>
            <div>
              <p className="text-[#00bcd4] font-bold uppercase text-sm tracking-wider">{testimonials[currentSlide].author}</p>
              <p className="text-[#00bcd4] text-xs">{testimonials[currentSlide].role}</p>
            </div>
          </div>
          
          {/* Carousel Dots */}
          <div className="mt-8 flex gap-2 items-center justify-center">
            {testimonials.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-6 bg-[#00bcd4]' : 'w-1.5 bg-slate-600 cursor-pointer hover:bg-slate-500'
                }`}
                onClick={() => setCurrentSlide(index)}
              ></div>
            ))}
          </div>
        </div>
        
        <div /> {/* Spacer */}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <div className="w-full flex justify-end p-6 border-b border-slate-100 lg:border-none">
          <p className="text-sm text-slate-800">
            Have a DSSFlow Account? <Link to="/auth/login" className="text-red-600 font-bold hover:underline">SIGN IN</Link>
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-10 px-6">
          <div className="w-full max-w-5xl flex gap-12 lg:gap-24">
            
            {/* Form Column */}
            <div className="flex-1 max-w-[450px]">
              <div className="flex items-center mb-8">
                <img src="/logo.png" alt="DSSFlow Logo" className="h-12 w-auto object-contain" />
              </div>
              
              <h1 className="text-[28px] font-bold text-slate-900 mb-8 tracking-tight">
                Get started with your 15-day free trial.
              </h1>
              
              <RegisterForm />
            </div>

            {/* Assistance Column */}
            <div className="hidden md:block w-72 pt-24 space-y-8">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Need assistance?</h3>
                <p className="text-sm text-slate-600 mb-3">Contact our toll free number</p>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#d84315] mt-1" />
                  <div>
                    <p className="text-[15px] font-bold text-slate-900 leading-tight">1800 103 1123</p>
                    <p className="text-[15px] font-bold text-slate-900 leading-tight">1800 572 3535</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-600 mb-3">Reach out to us</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#d84315]" />
                  <a href="mailto:sales@dssflow.com" className="text-[15px] text-slate-900 underline font-medium hover:text-blue-600">
                    sales@dssflow.com
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
}
