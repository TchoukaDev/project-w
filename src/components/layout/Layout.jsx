import { Outlet } from "react-router";
import Nav from "../Nav";
import { AuthContext } from "../../contexts/authContext";
import { useContext } from "react";
import Logo from "./Logo";

export default function Layout({ children }) {
  const { user } = useContext(AuthContext);
  return (
    <div className="flex flex-col min-h-screen">
      {user ? <Nav /> : <Logo />}
      <Outlet />
      {children}
    </div>
  );
}
