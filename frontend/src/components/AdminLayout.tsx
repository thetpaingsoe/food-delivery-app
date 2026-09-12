import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { clearSession } from "../store/auth-slice";
import { Button } from "./ui/button";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/items", label: "Items" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/reports", label: "Reports" },
];

export function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    dispatch(clearSession());
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-lg font-semibold tracking-tight text-stone-900">
              SwiftBite Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-stone-600 hover:text-stone-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-stone-600 hover:text-stone-900">
              Storefront
            </Link>
            <span className="text-stone-400">{user?.name}</span>
            <Button variant="outline" size="md" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
