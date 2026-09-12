import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "../store/store";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
