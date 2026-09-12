import { useNavigate } from "react-router-dom";
import { clearSession } from "../store/auth-slice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { Button } from "../components/ui/button";

export function Home() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    dispatch(clearSession());
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4">
      <h1 className="text-2xl font-semibold text-stone-900">
        Hello{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="text-sm text-stone-500">Menu lands here next.</p>
      <Button variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
