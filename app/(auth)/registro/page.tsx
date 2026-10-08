import { redirect } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { getCurrentUser } from "@/features/auth/server/request";

export const metadata = { title: "Crear cuenta · Health Apps" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");
  return <RegisterForm />;
}
