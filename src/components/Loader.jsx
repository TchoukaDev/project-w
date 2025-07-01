import { RiseLoader } from "react-spinners";

export default function Loader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <RiseLoader color="blue" margin={5} speedMultiplier={0.9} />
    </div>
  );
}
