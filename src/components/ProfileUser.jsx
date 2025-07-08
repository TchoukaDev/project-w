import { useParams } from "react-router";
import Profile from "../pages/Profile";

export default function ProfilUser() {
  const { uid } = useParams();
  return <Profile uid={uid} />;
}
