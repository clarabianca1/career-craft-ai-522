import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Encontrar vagas", icon: Briefcase },
  { to: "/applications", label: "Minhas candidaturas", icon: Kanban },
  { to: "/resumes", label: "Meus currículos", icon: FileText },
  { to: "/profile", label: "Meu perfil", icon: User },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon
              className={cn("size-4", active ? "text-[var(--gold)]" : "text-sidebar-foreground/60")}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1">
      <span className="flex size-8 items-center justify-center rounded-md bg-[var(--gold)] text-[color:var(--accent-foreground)]">
        <Sparkles className="size-4" />
      </span>
      <span className="font-display text-lg font-semibold text-sidebar-foreground">MatchCV</span>
    </Link>
  );
}

export function AppShell({
  title,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (profile?.name ?? user?.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-burgundy-gradient px-3 py-5 lg:flex">
        <Brand />
        <div className="mt-6 flex-1">
          <NavLinks />
        </div>
        <p className="px-3 text-xs text-sidebar-foreground/50">
          Estimativas de compatibilidade, nunca garantia de contratação.
        </p>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-burgundy-gradient px-3 py-5">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Brand />
              <div className="mt-6">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            {breadcrumb?.length ? (
              <p className="truncate text-xs text-muted-foreground">
                {breadcrumb.map((item, index) => (
                  <span key={item.label}>
                    {index > 0 ? <span className="mx-1.5">/</span> : null}
                    {item.to ? (
                      <Link to={item.to} className="hover:text-foreground">
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                  </span>
                ))}
              </p>
            ) : null}
            <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            {actions}
            <Button variant="ghost" size="icon" aria-label="Notificações">
              <Bell className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border px-1.5 py-1 hover:bg-muted">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-[var(--primary)] text-xs text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate pr-1 text-sm sm:block">
                    {profile?.name ?? user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <User className="mr-2 size-4" /> Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                  <Settings className="mr-2 size-4" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 size-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
