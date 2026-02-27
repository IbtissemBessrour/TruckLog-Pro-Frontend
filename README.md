#Frontend - TruckLog Pro Interface
L'interface utilisateur est une application React moderne, performante et entièrement responsive. Elle a été conçue pour offrir aux chauffeurs routiers une expérience fluide, similaire à un véritable boîtier ELD physique, avec une visualisation de données en temps réel.

🛠 Technologies utilisées
Framework : React 18 (Vite.js)

Langage : TypeScript (pour une robustesse maximale)

Styling : Tailwind CSS & Framer Motion (animations fluides)

Composants UI : Shadcn/UI & Lucide Icons

Cartographie : Leaflet / React-Leaflet (avec décodage de polyline)

🌟 Fonctionnalités Clés
1. Interactive ELD Graph (Grille Log)
Le cœur de l'application. Une grille dynamique qui dessine automatiquement la courbe de service du chauffeur.

Visualisation 24h : Affiche les transitions entre OFF DUTY, SLEEPER, DRIVING et ON DUTY.

Calcul des totaux : Récapitule instantanément les heures passées dans chaque statut.

2. Planificateur de trajet intelligent
Une interface intuitive pour générer des itinéraires complexes.

Preview sur carte : Visualisation immédiate du trajet grâce à l'intégration de MapBox/Polyline.

Gestion des escales : Prise en compte du point de départ, de la collecte (Pickup) et de la livraison (Dropoff).

3. Dashboard & Export
Statistiques HOS : Indicateurs visuels sur le cycle restant et les heures de conduite disponibles.

Export PDF : (À venir/Optionnel) Génération de rapports conformes pour les inspections routières.

📂 Structure du Projet Frontend
/src/components/eld : Logique de la grille et du rendu graphique des logs.

/src/components/map : Gestion de l'affichage cartographique et des tracés.

/src/pages : Vues principales (Dashboard, New Trip, Log Sheet).

/src/services : Communications avec l'API Django via Axios.

🚦 Installation Rapide
Accéder au dossier : cd frontend

Installer les dépendances : npm install

Lancer le projet en mode dev : npm run dev

Accéder à l'application : http://localhost:8088
