import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return children;
}
