import { Outlet } from "react-router";

export default function SettingsLayout() {
  return (
    <>
      <div className="font-semibold text-xl">Paramètres</div>
      <Outlet />
    </>
  );
}
