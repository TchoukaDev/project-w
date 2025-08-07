// Conversion de la date en formation fr
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

// Conversion de la date en format français (jj/mm/aaaa) sans l'heure
export const shortDateToFr = (wavedate) => {
  const date = new Date(wavedate); // Conversion en objet Date

  const dateFr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return dateFr;
};

// Récupérer id d'une conversation avec les id utilisateurs
export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

/**
 * Fonction pour insérer un emoji dans le textarea à la position actuelle du curseur
 * Elle utilise waveContentRef pour manipuler la sélection et le focus directement dans le DOM.
 */
export function insertEmoji(emoji, ref, setValue = null, field = null) {
  // On récupère la référence vers le textarea via useRef
  const content = ref.current;

  // Position du curseur ou début de la sélection dans le textarea
  // C'est un nombre entier qui indique l'index du caractère où commence la sélection
  // Si aucun texte n'est sélectionné, start correspond à la position actuelle du curseur
  const start = content.selectionStart;

  // Position de la fin de la sélection dans le textarea
  // C'est un nombre entier indiquant l'index juste après le dernier caractère sélectionné
  // Si aucun texte n'est sélectionné, end est égal à start
  const end = content.selectionEnd;

  // Texte actuel dans le textarea
  const currentText = content.value;

  // Construction du nouveau texte après insertion de l'emoji
  // - On garde la partie avant la sélection/cursor : currentText.slice(0, start)
  // - On ajoute l'emoji sélectionné
  // - On ajoute la partie après la sélection : currentText.slice(end)
  // Cela remplace la sélection par l'emoji, ou insère l'emoji à la position du curseur
  const newText = currentText.slice(0, start) + emoji + currentText.slice(end);

  // Mise à jour de la valeur du champ "message" dans react-hook-form,
  // afin que le formulaire prenne en compte ce nouveau contenu
  setValue(field, newText);

  // Après la mise à jour du DOM (asynchrone),
  // on repositionne le curseur juste après l'emoji inséré
  setTimeout(() => {
    // On remet le focus sur le textarea (utile si on l'a perdu en cliquant sur l'emoji)
    content.focus();

    // On positionne le curseur juste après l'emoji :
    // start correspond à la position où on a inséré l'emoji,
    // emoji.length correspond au nombre de caractères de l'emoji (souvent 2 pour les emojis complexes),
    // donc on place le curseur à start + emoji.length pour que la saisie reprenne après l'emoji
    content.setSelectionRange(start + emoji.length, start + emoji.length);
  }, 0);
}
