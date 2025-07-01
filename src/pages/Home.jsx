import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import WelcomeModal from "../components/WelcomeModal";

export default function Home() {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    {
      if (user && !user.pseudo) {
        setShowModal(true);
      }
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {showModal && <WelcomeModal onCloseModal={handleCloseModal} />}
      <div>Accueil</div>
    </>
  );
}
