import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
