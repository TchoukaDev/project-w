import { Outlet } from "react-router";
import { UserContext } from "../../contexts/userContext";
import { useContext } from "react";
import Header from "../Header";

export default function Layout({ children }) {
  const { user } = useContext(UserContext);
  return (
    <div className={`min-h-screen flex flex-col`}>
      {user && <Header />}
      <Outlet />
      {children}
    </div>
  );
}
