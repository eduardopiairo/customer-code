import { useEffect, useState } from "react";
import { LogOut, Shield, Store, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMe, logout } from "@/api/auth";
import { UNAUTHORIZED_EVENT, getToken } from "@/api/client";
import LoginPage from "@/pages/Login";
import StoresPage from "@/pages/Stores";
import StoreManagersPage from "@/pages/StoreManagers";
import UsersPage from "@/pages/Users";

const PAGES = [
  { key: "stores",   label: "Stores",   icon: Store },
  { key: "managers", label: "Managers", icon: Users },
];

const ADMIN_PAGE = { key: "users", label: "Users", icon: Shield };

export default function App() {
  const [page, setPage] = useState("stores");
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [me, setMe] = useState(null);

  // who is signed in (decides whether the Users tab is shown)
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    getMe()
      .then((u) => { if (!cancelled) setMe(u); })
      .catch(() => { /* a 401 is handled by the unauthorized event */ });
    return () => { cancelled = true; };
  }, [authed]);

  // an expired/invalid token anywhere in the app sends the user to login
  useEffect(() => {
    const onUnauthorized = () => setAuthed(false);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  if (!authed) return <LoginPage onLoggedIn={() => setAuthed(true)} />;

  function handleLogout() {
    logout();
    setMe(null);
    setPage("stores");
    setAuthed(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold leading-none">Customer Code</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">Pharma Stores</p>
            </div>
          </div>
          <nav className="order-last flex w-full gap-1 md:order-none md:w-auto">
            {(me?.is_admin ? [...PAGES, ADMIN_PAGE] : PAGES).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={[
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors md:flex-none md:py-1.5",
                  page === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {page === "stores"   && <StoresPage />}
      {page === "managers" && <StoreManagersPage />}
      {page === "users" && me?.is_admin && <UsersPage currentUserId={me.id} />}
    </div>
  );
}
