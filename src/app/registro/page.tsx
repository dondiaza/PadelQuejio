import { RegisterForm } from "@/components/auth/register-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isGoogleOAuthConfigured } from "@/lib/env";

export default async function RegisterPage() {
  const googleEnabled = isGoogleOAuthConfigured();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <RegisterForm googleEnabled={googleEnabled} />
      </main>
      <SiteFooter />
    </div>
  );
}
