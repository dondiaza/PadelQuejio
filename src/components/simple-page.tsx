import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type SimplePageProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export async function SimplePage({ title, subtitle, children }: SimplePageProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <section className="card p-8">
          <h1 className="text-5xl">{title}</h1>
          <p className="mt-3 text-muted">{subtitle}</p>
          {children ? <div className="mt-6">{children}</div> : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
