<?php
// --- Proxy PHP pour forcer le téléchargement d'une image distante ---
// Le script récupère une URL en GET, télécharge le fichier, et le renvoie au navigateur
// avec les bons headers pour forcer le téléchargement.

// Récupération de l'URL du fichier distant via la query string (exemple : proxy.php?url=...)
// Si aucune URL n'est fournie, on renvoie une erreur 400 (Bad Request)
$url = $_GET['url'] ?? null;
if (!$url) {
    http_response_code(400); // Code HTTP 400 : requête invalide
    echo "URL manquante"; // Message d'erreur
    exit; // On arrête le script ici car on a pas d'URL à traiter
}

// On récupère les headers HTTP du fichier distant, pour extraire ses infos (dont le type MIME)
// get_headers() retourne un tableau avec les headers de la requête HTTP
// Le deuxième paramètre "1" demande de retourner les headers sous forme associative
$headers = get_headers($url, 1);
if ($headers === false) {
    // Si on ne peut pas récupérer les headers (ex: URL inaccessible), on renvoie une erreur 404 (Not Found)
    http_response_code(404);
    echo "Fichier non trouvé";
    exit;
}

// Récupération du header 'Content-Type' dans les headers du fichier distant
// Cela nous permet de connaître le type MIME exact du fichier (ex: image/jpeg, image/png, etc.)
// Si jamais il n'y a pas ce header, on utilise 'application/octet-stream' (type générique binaire)
$contentType = $headers['Content-Type'] ?? 'application/octet-stream';

// On envoie ce header au navigateur : il lui dit quel type de contenu on envoie
// C'est très important pour que le navigateur sache comment gérer le fichier (afficher, télécharger...)
header("Content-Type: $contentType");

// Ensuite, on ajoute un header qui indique au navigateur qu'il faut **forcer le téléchargement**
// 'Content-Disposition: attachment' signifie qu'il faut proposer d'enregistrer le fichier plutôt que de l'afficher
// Le 'filename="image.jpg"' suggère un nom de fichier pour l'enregistrement (tu peux modifier ce nom)
header('Content-Disposition: attachment; filename="image.jpg"');

// On récupère le contenu du fichier distant en utilisant file_get_contents (téléchargement du fichier)
$content = file_get_contents($url);
if ($content === false) {
    // Si on ne peut pas lire le contenu (ex: problème réseau), on renvoie une erreur 500 (Internal Server Error)
    http_response_code(500);
    echo "Erreur lors de la récupération du fichier";
    exit;
}

// Enfin, on affiche le contenu du fichier. Grâce aux headers envoyés avant,
// le navigateur proposera de télécharger le fichier avec le nom indiqué.
echo $content;
