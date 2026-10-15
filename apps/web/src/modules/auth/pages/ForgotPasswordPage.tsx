import { AuthLayout } from "@/components/layout/AuthLayout";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
