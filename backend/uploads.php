
<?php
header("Access-Control-Allow-Origin: *"); //autorise les requêtes cross-origin. Remplacer * par nom de domaine ou de l'hébergeur pour la production
header("Access-Control-Allow-Methods: POST, OPTIONS");  // Indique les méthodes HTTP autorisées sur cette ressource.
header("Access-Control-Allow-Headers: Content-Type"); //Indique quels en-têtes HTTP personnalisés sont autorisés dans la requête.
header("Content-Type: application/json");

// Si la requête est de type OPTIONS (pré-vol CORS), on répond vide
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Suppression de l'ancienne photo si elle est envoyée
    if (isset($_POST['oldPhotoPath'])) {
        $oldPhotoPath = $_POST['oldPhotoPath'];
        $fileName = basename($oldPhotoPath);



        // Vérifier que l'image précédent n'est pas la photo par défaut
        $defaultPhoto = "anonyme.png";
        if ($fileName !== $defaultPhoto) {
            $fileToDelete = __DIR__ . '/uploads/' . $fileName;
            if (file_exists($fileToDelete)) {
                unlink($fileToDelete);
            }
        }
    }

    // Définir le répertoire de destination
    $upload_dir = __DIR__ . '/uploads/';

    // Créer le répertoire s'il n'existe pas
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Vérifie qu'il y a bien un fichier
    if (!empty($_FILES)) {
        // Récupère la première entrée de $_FILES, peu importe le nom du champ
        $fileField = array_key_first($_FILES);
        $file = $_FILES[$fileField];

        if ($file['error'] === 0) {
            // Vérifie la taille
            if ($file['size'] < 5000000) {
                // Vérifie l'extension
                $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];

                if (in_array($fileExtension, $allowed_ext)) {
                    // Crée un nom unique
                    $new_filename = uniqid() . '.' . $fileExtension;
                    $destination = $upload_dir . $new_filename;

                    // Déplace le fichier
                    if (move_uploaded_file($file['tmp_name'], $destination)) {
                        $base_url = 'http://' . $_SERVER['HTTP_HOST'];
                        $relative_path = '/React/project-w/backend/uploads/' . $new_filename;
                        $file_url = $base_url . $relative_path;

                        // 🔁 On renvoie la clé de champ utilisée, ainsi que l'URL
                        echo json_encode([
                            'url' => $file_url
                        ]);
                        exit;
                    } else {
                        throw new Exception("Le téléchargement de l'image a échoué.");
                    }
                } else {
                    throw new Exception("Ce format d'image n'est pas valide.");
                }
            } else {
                throw new Exception("L'image sélectionnée est trop grande.");
            }
        }
    }
} catch (Exception $e) {
    http_response_code(400);
    echo $e->getMessage();
}
