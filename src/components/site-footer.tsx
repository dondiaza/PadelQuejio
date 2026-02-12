import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Padel Quejio {new Date().getFullYear()}.</span>
        <div className="flex gap-4">
          <Link href="/legal/terminos">Terminos</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/cancelaciones">Cancelaciones</Link>
        </div>
      </div>
    </footer>
  );
}
