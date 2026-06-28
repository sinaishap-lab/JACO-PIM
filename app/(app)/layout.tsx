import type { ReactNode } from "react";
import { AppShell } from "./AppShell";

/* Every screen in the (app) group is wrapped in the shared brand shell. */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
