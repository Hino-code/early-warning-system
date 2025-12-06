import { ReactNode } from "react";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { SettingsProvider } from "@/shared/providers/settings-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SettingsProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </SettingsProvider>
  );
}
