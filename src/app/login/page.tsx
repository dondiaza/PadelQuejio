import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthConfigured } from "@/lib/env";

export default async function LoginPage() {
  const googleEnabled = isGoogleOAuthConfigured();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Suspense>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
