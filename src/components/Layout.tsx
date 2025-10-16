import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6 shadow-sm">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Welcome to Your Day</h1>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
