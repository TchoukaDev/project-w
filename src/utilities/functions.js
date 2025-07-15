export const dateToFr = (wavedate) => {
  const date = new Date(wavedate); //Conversion en objet date

  const dateFr = date.toLocaleString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return dateFr;
};
