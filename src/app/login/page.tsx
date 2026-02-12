import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
