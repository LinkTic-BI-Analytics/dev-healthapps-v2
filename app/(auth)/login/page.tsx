import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";
import { getCurrentUser } from "@/features/auth/server/request";
import { safeCallbackUrl } from "@/features/auth/utils/callback-url";

export const metadata = { title: "Iniciar sesión · Health Apps" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(typeof params.callbackUrl === "string" ? params.callbackUrl : null);
  // Quien ya tiene una sesión válida (comprobada en base de datos) no necesita el formulario.
  if (await getCurrentUser()) redirect(callbackUrl);
  return <LoginForm callbackUrl={callbackUrl} expired={params.expired === "1"} />;
}
