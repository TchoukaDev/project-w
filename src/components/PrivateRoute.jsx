import { Navigate, Outlet } from "react-router";

export default function PrivateRoute({ user }) {
  if (!user) {
    return <Navigate to="/signIn" />;
  } else {
    return <Outlet />;
  }
}
