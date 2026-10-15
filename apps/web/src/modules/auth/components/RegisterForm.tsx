import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Swal from 'sweetalert2';

const registerSchema = z.object({
  companyName: z.string().min(1, "Please enter your company name"),
  name: z.string().min(1, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password cannot be less than 8 characters"),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid mobile number"),
  terms: z.literal(true, {
    error: "You must agree to the Terms of Service",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        phone: data.phone
      });
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        login(response.data.data.user);
        // Replace with actual dashboard route when ready
        navigate("/");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.error || "Please try again.",
        confirmButtonColor: '#E31837'
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        
        <div>
          <div className="text-sm text-slate-900 mb-1">Company Name</div>
          <Input
            id="companyName"
            className={`bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.companyName ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
            placeholder=""
            type="text"
            {...register("companyName")}
          />
          {errors.companyName && <p className="text-[#E31837] text-[12px] mt-1">{errors.companyName.message}</p>}
        </div>

        <div>
          <div className="text-sm text-slate-900 mb-1">Full Name</div>
          <Input
            id="name"
            className={`bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.name ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
            placeholder=""
            type="text"
            {...register("name")}
          />
          {errors.name && <p className="text-[#E31837] text-[12px] mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <div className="text-sm text-slate-900 mb-1">Email</div>
          <Input
            id="email"
            className={`bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.email ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
            placeholder=""
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            {...register("email")}
          />
          {errors.email && <p className="text-[#E31837] text-[12px] mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="text-sm text-slate-900 mb-1">Create Password</div>
          <div className="relative">
            <Input
              id="password"
              className={`bg-white h-11 border border-slate-300 rounded-md pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.password ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
              placeholder=""
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-[#E31837] text-[12px] mt-1">{errors.password.message}</p>}
        </div>
        
        <div>
          <div className="text-sm text-slate-900 mb-1">Phone Number</div>
          <div className={`flex items-center border ${errors.phone ? 'border-2 border-[#E31837]' : 'border-slate-300'} bg-white h-11 rounded-md overflow-hidden focus-within:border-[#0088FF]`}>
            <div className="h-full flex items-center justify-center px-4 border-r border-slate-300 text-slate-700 text-sm bg-slate-50">
              +91
            </div>
            <input
              id="phone"
              type="tel"
              className="flex-1 bg-transparent border-none outline-none px-3 text-slate-900 h-full w-full text-sm"
              autoComplete="tel"
              {...register("phone")}
            />
          </div>
          {errors.phone ? (
            <p className="text-[#E31837] text-[12px] mt-1">{errors.phone.message}</p>
          ) : (
            <p className="text-[10px] text-slate-600 mt-2 font-medium">It looks like you're in INDIA based on your IP.</p>
          )}
        </div>

        <div className="flex flex-col pt-1 pb-1">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              className="w-3.5 h-3.5 border-2 border-slate-700 rounded-none text-slate-900 cursor-pointer"
              {...register("terms")}
            />
            <label
              htmlFor="terms"
              className="text-[13px] text-slate-900 cursor-pointer"
            >
              I agree to the <a href="/terms" className="text-slate-900 underline font-medium">Terms of Service</a> and <a href="/privacy" className="text-slate-900 underline font-medium">Privacy Policy</a>.
            </label>
          </div>
          {errors.terms && <p className="text-[#E31837] text-[12px] mt-1">{errors.terms.message}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-[#E31837] hover:bg-[#d32f2f] text-white h-12 text-[15px] font-bold rounded-none shadow-sm transition-colors mt-2"
        >
          GET STARTED
        </button>
      </form>

      <div className="flex items-center mt-8 mb-6">
        <div className="flex-1 border-t border-slate-300"></div>
        <div className="px-4 text-[13px] text-slate-500">Or, Create a new account now</div>
        <div className="flex-1 border-t border-slate-300"></div>
      </div>

      <div className="flex gap-4">
        <button type="button" className="flex-1 h-10 bg-[#4285F4] hover:bg-[#3367d6] text-white flex items-center shadow-sm transition-colors rounded-sm overflow-hidden">
          <div className="w-9 h-9 bg-white flex items-center justify-center m-[2px] rounded-sm shrink-0">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <span className="flex-1 text-center text-[13px] font-semibold pr-2">Sign in with Google</span>
        </button>
        
        <button type="button" className="flex-1 h-10 bg-[#0A66C2] hover:bg-[#0958A8] text-white flex items-center shadow-sm transition-colors rounded-sm overflow-hidden">
          <div className="w-10 h-full flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
            </svg>
          </div>
          <span className="flex-1 text-left text-[13px] font-semibold border-l border-white/20 pl-3 h-full flex items-center">
            Sign in with LinkedIn
          </span>
        </button>
      </div>
    </div>
  );
}
