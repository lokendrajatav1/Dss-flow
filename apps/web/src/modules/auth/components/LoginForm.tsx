import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zodResolver";
import * as z from "zod";
import api from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Swal from 'sweetalert2';

const step1Schema = z.object({
  identifier: z.string().min(1, "Please enter your email or mobile number"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otpCode: z.string().min(6, "OTP must be 6 digits"),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [authType, setAuthType] = useState<'email' | 'phone' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const { register: registerStep1, handleSubmit: handleStep1, formState: { errors: errorsStep1 } } = useForm({ resolver: zodResolver(step1Schema) });
  const { register: registerPassword, handleSubmit: handlePassword, formState: { errors: errorsPassword } } = useForm({ resolver: zodResolver(passwordSchema) });
  const { register: registerOtp, handleSubmit: handleOtp, formState: { errors: errorsOtp } } = useForm({ resolver: zodResolver(otpSchema) });

  const onStep1Submit = async (data: any) => {
    try {
      setIdentifier(data.identifier);
      const response = await api.post("/auth/verify-identifier", { identifier: data.identifier });

      if (response.data.success) {
        setAuthType(response.data.data.type);
        setStep(2);
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.error || "User not found",
        confirmButtonColor: '#0088FF'
      });
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      const response = await api.post("/auth/login", { email: identifier, password: data.password });

      if (response.data.success) {
        const loggedUser = response.data.data.user;
        localStorage.setItem("token", response.data.data.token);
        login(loggedUser);
        if (loggedUser.role === 'superadmin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.error || "Invalid credentials",
        confirmButtonColor: '#0088FF'
      });
    }
  };

  const onOtpSubmit = async (data: any) => {
    try {
      const response = await api.post("/auth/login-otp", { phone: identifier, otpCode: data.otpCode });

      if (response.data.success) {
        const loggedUser = response.data.data.user;
        localStorage.setItem("token", response.data.data.token);
        login(loggedUser);
        if (loggedUser.role === 'superadmin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: error.response?.data?.error || "Invalid OTP",
        confirmButtonColor: '#0088FF'
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-600 mt-1">to access CRM</p>
      </div>

      {step === 1 && (
        <form className="space-y-4" onSubmit={handleStep1(onStep1Submit)}>
          <div>
            <div className="text-sm font-medium text-slate-900 mb-1">Email address or mobile number</div>
            <Input
              id="identifier"
              className={`bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 ${errorsStep1.identifier ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
              placeholder=""
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              {...registerStep1("identifier")}
            />
            {errorsStep1.identifier && <p className="text-[#E31837] text-[12px] mt-1">{errorsStep1.identifier.message as string}</p>}
          </div>

          <button type="submit" className="w-full bg-[#0088FF] hover:bg-[#0077EE] text-white h-11 text-base font-semibold rounded-md shadow-sm transition-colors mt-2">
            Next
          </button>
        </form>
      )}

      {step === 2 && authType === 'email' && (
        <form className="space-y-4" onSubmit={handlePassword(onPasswordSubmit)}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{identifier}</span>
            <button type="button" onClick={() => setStep(1)} className="text-[#0088FF] hover:underline font-medium">Change</button>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-900 mb-1">Password</div>
            <div className="relative">
              <Input
                id="password"
                className={`bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 ${errorsPassword.password ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
                placeholder=""
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...registerPassword("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errorsPassword.password && <p className="text-[#E31837] text-[12px] mt-1">{errorsPassword.password.message as string}</p>}
          </div>

          <button type="submit" className="w-full bg-[#0088FF] hover:bg-[#0077EE] text-white h-11 text-base font-semibold rounded-md shadow-sm transition-colors mt-2">
            Sign In
          </button>
        </form>
      )}

      {step === 2 && authType === 'phone' && (
        <form className="space-y-4" onSubmit={handleOtp(onOtpSubmit)}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{identifier}</span>
            <button type="button" onClick={() => setStep(1)} className="text-[#0088FF] hover:underline font-medium">Change</button>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-900 mb-1">Enter OTP</div>
            <p className="text-xs text-slate-500 mb-2">We sent a 6-digit code to your phone number.</p>
            <Input
              id="otpCode"
              className={`bg-white h-11 border border-slate-300 rounded-md text-center text-lg tracking-widest focus-visible:ring-0 focus-visible:ring-offset-0 ${errorsOtp.otpCode ? 'border-2 border-[#E31837] focus-visible:border-[#E31837]' : 'focus-visible:border-[#0088FF]'}`}
              placeholder="123456"
              type="text"
              autoComplete="one-time-code"
              {...registerOtp("otpCode")}
            />
            {errorsOtp.otpCode && <p className="text-[#E31837] text-[12px] mt-1">{errorsOtp.otpCode.message as string}</p>}
          </div>

          <button type="submit" className="w-full bg-[#0088FF] hover:bg-[#0077EE] text-white h-11 text-base font-semibold rounded-md shadow-sm transition-colors mt-2">
            Verify & Sign In
          </button>
        </form>
      )}

      {step === 1 && (
        <>
          <div className="mt-8">
            <div className="flex items-center text-sm text-[#0088FF] font-medium justify-center space-x-6">
              <Link to="/auth/forgot-password" className="hover:underline">Forgot Password?</Link>
            </div>
          </div>

          <div className="flex items-center mt-8 mb-6">
            <div className="flex-1 border-t border-slate-200"></div>
            <div className="px-4 text-[13px] text-slate-500 font-medium">Sign in using</div>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="flex justify-center gap-4">
            {/* Google */}
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 bg-white shadow-sm">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>

            {/* LinkedIn */}
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg>
            </div>

            {/* Apple */}
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 text-sm text-slate-500 text-center">
        Don't have a Kero account?{" "}
        <Link to="/auth/register" className="font-semibold text-[#0088FF] hover:underline">
          Sign up now
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          Platform Super Admin Portal
        </Link>
      </div>
    </div>
  );
}
