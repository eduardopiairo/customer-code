import { useEffect, useState } from "react";
import { LogOut, Store, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/api/auth";
import { UNAUTHORIZED_EVENT, getToken } from "@/api/client";
import LoginPage from "@/pages/Login";
import StoresPage from "@/pages/Stores";
import StoreManagersPage from "@/pages/StoreManagers";

const PAGES = [
  { key: "stores",   label: "Stores",   icon: Store },
  { key: "managers", label: "Managers", icon: Users },
];

export default function App() {
  const [page, setPage] = useState("stores");
  const [authed, setAuthed] = useState(() => Boolean(getToken()));

  // an expired/invalid token anywhere in the app sends the user to login
  useEffect(() => {
    const onUnauthorized = () => setAuthed(false);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  if (!authed) return <LoginPage onLoggedIn={() => setAuthed(true)} />;

  function handleLogout() {
    logout();
    setAuthed(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold leading-none">Customer Code</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">Pharma Stores</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {PAGES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={[
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
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
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      {page === "stores"   && <StoresPage />}
      {page === "managers" && <StoreManagersPage />}
    </div>
  );
}
