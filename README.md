# **Projet Waves**

## Langages utilisés :

§ HTML

§ CSS

§ Javascript

§ PHP

## Dépendances :

§ React

§ React-dom

§ React-router

§ React-hook-form

§ React-icons

§ React-medium-image-zoom

§ React-modal

§ React-responsive

§ React-spinners

§ React-toastify

§ tailwindCSS,

§ tanstack-query

§ firebase

§ framer-motion

§ lucide-react

§ emoji-picker-react

## Introduction:

Le site Waves est inspiré de « X » ; il s’agit d’un prototype de réseau social qui permet de publier des « waves », de s’abonner à d’autres utilisateurs, de discuter avec eux, de personnaliser son profil etc…Il a été développé avec React, et le design est défini presque exclusivement à l’aide de TailwindCSS. Ce projet est entièrement responsive et adapté pour le format mobile. La navigation se fait à l’aide d’un router et le cache est géré à l’aide de Tanstack-Query pour une meilleure expérience utilisateur. Les données sont stockées sur une RealTime-Database de Firebase. Les messages d’erreur ou de succès sont majoritairement affichés à l’aide de toast apparaissant à l’écran (React-Toastify)

## Inscription/ Connexion :

L’accès au contenu interne du site est uniquement accessible par un utilisateur connecté. Un nouvel utilisateur sera réorienté par défaut sur la page de Connexion, ou la page d’inscription.

L’inscription se fait en saisissant une adresse email valide, et un mot de passe à 2 reprises. Si le mot de passe ne contient pas au moins 8 caractères, ou si les 2 mots de passe ne sont pas identiques, une alerte s’affiche pour l’utilisateur. En cas de succès de l’inscription, l’utilisateur est immédiatement connecté. Ces identifiants sont ceux à utiliser sur l’écran de connexion, pour accéder au site.

L’utilisateur a également la possibilité de s’inscrire directement en utilisant ses identifiant Google, en cliquant sur le bouton approprié. Il pourra également se connecter via Google en cliquant sur le bouton « Se connecter avec Google » sur l’écran de connexion. Une même adresse email ne peut posséder qu’un seul compte. Le compte Google est toujours prioritaire ; si un utilisateur s’inscrit avec une adresse-mail et un mot de passe et qu’il se connecte par la suite via un compte Google utilisant la même adresse mail, l’authentification par mot de passe sera écrasée, et l’utilisateur devra utiliser Google pour chaque connexion. Les données de son compte Waves sont conservées, seule la méthode d’authentification change.

## Informations personnelles:

Lors de la première connexion sur la page d’accueil, si aucun pseudo n’est défini, une fenêtre modale s’affiche demandant à l’utilisateur de saisir un pseudo. Le pseudo est la seule information obligatoire à renseigner au lors de la première connexion. L’utilisateur est libre de renseigner ou non d’autres informations le concernant.

Le cas échéant il doit se rendre sur la partie « Préférences » accessible via le menu déroulant qui s'ouvre en cliquant sur la photo de profil de l'en-tête, puis cliquer sur « Informations personnelles ». Dans cette partie il peut modifier son pseudo, saisir son prénom, nom, date de naissance, sa ville et son pays. Il peut également modifier sa photo de profil sur cette même page. L’adresse email utilisée pour l’inscription et la connexion apparait également, mais ne peut être modifiée.

Si l’utilisateur souhait modifier sa photo de profil, une prévisualisation de l’image téléchargée est visible immédiatement, avant validation. Les images sont téléchargées sur le serveur, puis supprimées à chaque changement de photo de profil. Si aucune photo de profil n’est sélectionnée, l’utilisateur aura une image de profil par défaut.

En revenant sur l’écran précédent en cliquant sur le bouton « Retour » puis en sélectionnant « Modifier le mot de passe », l’utilisateur a la possibilité de modifier son mot de passe.

## Page d’accueil et publications:

La page d’accueil du site est composée de deux parties. A gauche une partie de publication, où l’utilisateur peut publier une Wave en saisissant le texte dans le champ dédié puis en cliquant sur « Publier ». Il est possible d’ajouter des emojis dans le message, ou bien d’y ajouter une image, en cliquant sur l’un des deux icones en bas du champ de texte.

Lors de la publication, la Wave apparait immédiatement sur la partie de droite, appelée « Fil d’actualités ». Ici s’affichent toutes les Waves qui sont publiées par tous les utilisateurs, de la plus ancienne à la plus récente. A l’heure actuelle les utilisateurs ne sont pas filtrés, et toutes les Waves apparaissent, mais il est envisageable par la suite de n’afficher que les Waves des utilisateurs dont la personne connectée est abonnée. Chaque Wave contient le pseudo de l’utilisateur qui l’a publiée, la date et heure de publication, le texte et/ou image du contenu. En dessous de chaque publication, se trouvent 3 boutons. La première est pour liker/unliker une publication, la seconde est pour répondre à une publication, ce qui déroule un champ de formulaire juste en dessous pour saisir le texte, et le 3ème bouton permet de dérouler l’ensemble des réponses déjà écrites à cette publication afin de pouvoir les lire. Il n’est pas possible d’ouvrir les 2 fenêtres déroulantes en même temps : l’ouverture de l’une entraîne systématiquement la fermeture de l’autre. Il n’est pas possible pour un utilisateur de liker une Wave qu’il a lui-même publiée. A la place du bouton Like se trouve alors un compteur de Like, mis à jour en temps réel.

Sur ce même écran, l’utilisateur a également la possibilité de supprimer une de ses publications, en cliquant sur la croix en haut à droite de la Wave, uniquement visible par le publicateur, puis en validant sur la fenêtre modale qui s’ouvre alors.

En cliquant sur le pseudo de l’utilisateur ayant publié la Wave, il est possible d’accéder à sa page de Profil.

## Profil:

Chaque utilisateur possède sa propre page de profil. Pour accéder à la sienne, l’utilisateur peut cliquer sur l’onglet « Profil » dans la barre de navigation.

Le profil de l’utilisateur contient également 2 parties distinctes. A gauche, ses informations personnelles (n’apparaissent que celles qu’il a renseignées) et à droite ses publications classées chronologiquement, comme sur la page d’accueil. La configuration des publications est la même que sur la page d’accueil. L’utilisateur peut liker (ou à défaut, voir le nombre de likes), répondre à la publication ou voir les réponses. Il peut également supprimer ses propres publications.

S’il n’est pas sur son propre profil, l’utilisateur a également la possibilité de s’abonner/se désabonner à un autre utilisateur en cliquant sur le bouton approprié situé sous ses informations personnelles. Il peut également lui envoyer un message en cliquant sur le bouton dédié juste à côté.

## Abonnements:

En cliquant sur Abonnements de la barre de navigation, l’utilisateur arrive sur une page où sont affichés tous les utilisateurs qui le suivent (en haut), ainsi que tous les utilisateurs dont il est lui-même abonné (en bas). Il peut également rejoindre leur page de profil en cliquant sur leur pseudo sur cet écran.

## Messagerie:

L’utilisateur peut accéder à ses conversations avec d’autres utilisateurs dans l’onglet « Messagerie » de la barre de navigation. Ici seront affichés les derniers messages de toutes les conversations qu’il a déjà commencées. En cas de nouveau message non lu, un pont rouge apparait au niveau de l’onglet messagerie, et de la conversation concernée. En cliquant sur la conversation qu’il souhaite, l’utilisateur accède alors à l’écran de conversation avec l’utilisateur. Il peut écrire les messages dans le champ concerné et y joindre également une image. Contrairement aux autres champs de texte de l’application, l’utilisateur peut valider et envoyer son message en appuyant sur la touche « Enter » de son clavier. Il peut également utiliser le bouton de validation en cliquant dessus. Lors de l’envoi ou la réception d’un nouveau message, la fenêtre scroll automatiquement jusqu’en bas pour l’afficher.

## Fonctions annexes:

En cas d’URL invalide, une page d’erreur s’affiche, possédant un bouton permettant à l’utilisateur de retourner à la page d’accueil (ou la page de connexion).

Le logo contenu dans l’en-tête de la page est également un lien qui permet de retourner à la page d’accueil en cliquant dessus.

L’en-tête comporte également une barre de recherche, qui permet de rechercher un utilisateur en saisissant son pseudo. Le nom ou prénom peuvent aussi être utilisés, si l’utilisateur les a renseignés dans son profil. La barre de recherche n’est pas sensible à la casse. Les résultats s’affichent juste en dessous de la barre de recherche, au fur et à mesure de la saisie. Cliquer sur l’utilisateur amène immédiatement sur sa page de profil.

L’application possède également un bouton de changement de thème, pour alterner entre un thème sombre (par défaut) et un thème clair. La préférence de l’utilisateur est stockée sur le navigateur pour ses visites suivantes.

Enfin pour se déconnecter de sa session, l’utilisateur peut cliquer sur le bouton « Se déconnecter » situé dans le menu déroulant accessible en cliquant sur la photo de profil dans l'en-tête de page. Pour la version mobile, la barre de navigation, ainsi que le bouton de changement de thème et de déconnexion son accessibles dans le menu déroulant qui s’affiche en cliquant sur le bouton « hamburger » de l’en tête.
