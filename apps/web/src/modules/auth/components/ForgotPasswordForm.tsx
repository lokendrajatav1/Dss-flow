import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Swal from "sweetalert2";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "OTP Sent!",
          text: "Check your email for the password reset OTP.",
          confirmButtonColor: "#0088FF"
        });
        setStep(2);
        setResendTimer(60); // Start 60 seconds timer
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.error || "Failed to send OTP.",
        confirmButtonColor: "#0088FF"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otpCode,
        newPassword
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful!",
          text: "You can now log in with your new password.",
          confirmButtonColor: "#0088FF"
        }).then(() => {
          navigate("/auth/login");
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error.response?.data?.error || "Invalid OTP or failed to reset password.",
        confirmButtonColor: "#0088FF"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {step === 1 ? "Reset Password" : "Create New Password"}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {step === 1
            ? "We'll send you an OTP to your email to reset your password"
            : `Enter the OTP sent to ${email} and your new password`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-900 mb-1">Email address</div>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#0088FF]"
              placeholder="name@company.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0088FF] hover:bg-[#0077EE] text-white h-11 text-base font-semibold rounded-md transition-colors mt-2 disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-900 mb-1">Verification Code</div>
            <Input
              id="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#0088FF]"
              placeholder="123456"
              type="text"
              maxLength={6}
              required
            />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 mb-1">New Password</div>
            <div className="relative">
              <Input
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white h-11 border border-slate-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#0088FF] pr-10"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0088FF] hover:bg-[#0077EE] text-white h-11 text-base font-semibold rounded-md transition-colors mt-2 disabled:opacity-70"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center mt-4 text-sm text-slate-500">
            Didn't receive the OTP?{" "}
            <button
              type="button"
              onClick={() => handleRequestOtp()}
              disabled={isLoading || resendTimer > 0}
              className="font-medium text-[#0088FF] hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 text-sm text-slate-500">
        Remember your password?{" "}
        <Link to="/auth/login" className="font-medium text-[#0088FF] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
