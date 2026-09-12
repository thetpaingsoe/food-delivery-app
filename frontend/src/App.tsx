import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { AdminRoute } from "./components/AdminRoute";
import { ClientLayout } from "./components/ClientLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./routes/AdminDashboard";
import { Home } from "./routes/Home";
import { Login } from "./routes/Login";
import { useAppSelector } from "./store/store";

export default function App() {
  const token = useAppSelector((s) => s.auth.token);
  const role = useAppSelector((s) => s.auth.user?.role);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to={role === "admin" ? "/admin" : "/"} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={token ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
