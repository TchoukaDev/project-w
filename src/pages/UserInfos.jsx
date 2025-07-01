import { Link } from "react-router";

export default function UserInfos() {
  return (
    <>
      <div>Saisissez vos informations personnelles</div>
      <Link to="/settings">Retour</Link>
    </>
  );
}
