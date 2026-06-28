# PRD — Doolé

## 1. Vision produit

**Pitch en une phrase**
Doolé transforme un DM Instagram ou TikTok en commande payée par mobile money et dispatchée à un livreur — en moins de 5 minutes, sans que la vendeuse ne tape un seul message.

**Problème résolu**
Aujourd'hui, une vendeuse TikTok/Instagram à Dakar gère ses ventes dans un chaos artisanal : elle reçoit des DM, négocie par vocal WhatsApp, note les commandes sur papier, attend un virement Wave sans savoir quel client a payé, puis appelle son livreur "Tiak-Tiak" pour organiser la livraison à la volée. Chaque vente lui coûte 15-30 minutes de gestion manuelle. Elle perd des commandes le soir parce qu'elle dort. Elle ne sait pas combien elle a vendu ce mois-ci. Elle n'a aucune boutique en ligne — juste un feed et un numéro WhatsApp.

**Pourquoi maintenant**
- Le social commerce en Afrique francophone entre dans sa phase de croissance explosive (TechCabal 2026). Instagram SN = 1,8M users (+25%), TikTok SN = 1,3M (65% < 25 ans).
- Wave a atteint 7M+ utilisateurs actifs au Sénégal — le paiement mobile est devenu un réflexe, pas une friction.
- 70%+ des commandes e-commerce au Sénégal se font encore en Cash on Delivery — preuve que le paiement pré-commande en ligne est un problème non résolu.
- Aucun concurrent ne combine boutique express + paiement mobile money direct vendeuse + dispatch automatique livreur sur ce marché.
- Paps vient de lever 4,5M$ (Série A, sept. 2025) — l'infrastructure livraison last-mile se professionnalise, ce qui crée un écosystème sur lequel Doolé peut s'appuyer en V2.

**Ce que le produit règle concrètement**

| Douleur actuelle | Solution Doolé |
|---|---|
| La vendeuse passe 15-30 min par commande à gérer DM, confirmer le paiement, appeler le livreur | Un lien unique dans sa bio → l'acheteur commande et paie en autonomie → le livreur est notifié automatiquement |
| Elle ne sait jamais qui a vraiment payé (capture d'écran Wave falsifiable) | Le webhook de paiement Moneroo confirme le paiement en temps réel — zéro ambiguïté |
| Elle perd des ventes la nuit et le week-end quand elle ne répond pas aux DM | La boutique est accessible 24h/24, les commandes tombent même quand elle dort |
| Elle n'a aucune visibilité sur son chiffre d'affaires, ses produits stars, ses commandes en cours | Un tableau de bord simple lui donne ses ventes, son CA, et le statut de chaque commande |
| Elle appelle ou envoie un vocal à son livreur pour chaque livraison | Doolé envoie automatiquement un SMS/WhatsApp au livreur avec l'adresse et le détail de la commande |

---

## 2. Personas cibles

### Persona 1 — Fatou, 24 ans, vendeuse mode sur TikTok, Dakar (Parcelles Assainies)

- **Profil** : Vend des robes, sacs et accessoires importés depuis la Turquie. 800 followers TikTok, 1 200 sur Instagram. Fait 3-8 ventes par jour, surtout après ses lives TikTok du soir.
- **Pain points** :
  - Reçoit 30+ DM après chaque live, n'arrive pas à tous les traiter → perd 40% de ses ventes potentielles.
  - Note les commandes dans un cahier, confond régulièrement les adresses.
  - A été arnaquée 3 fois avec des fausses captures d'écran Wave.
  - Appelle son livreur Modou pour chaque commande — il ne décroche pas toujours.
- **Outils actuels** : WhatsApp (discussion commande), cahier papier (suivi), Wave personnel (encaissement), appel téléphonique au livreur.
- **Pouvoir d'achat** : Marge nette ~2 000-5 000 FCFA par vente. Peut investir 3 000 FCFA/mois si la valeur est immédiate et prouvée. Refuse tout engagement annuel.

### Persona 2 — Awa, 31 ans, vendeuse accessoires sur Instagram, Dakar (Almadies)

- **Profil** : Plus établie, 4 500 followers Instagram. Vend des bijoux artisanaux et du wax. 8-15 ventes par jour. A une "équipe" d'une assistante et deux livreurs réguliers.
- **Pain points** :
  - A essayé de créer un site Shopify, abandonné au bout de 2 jours (trop complexe, paiement Wave impossible nativement).
  - Son assistante gère les DM mais fait des erreurs de saisie d'adresse → livraisons ratées.
  - Veut analyser quels produits se vendent le mieux pour ajuster ses achats Turquie, mais n'a aucune donnée.
  - Gère deux livreurs différents selon les quartiers — aucune automatisation.
- **Outils actuels** : Instagram DM, WhatsApp Business, tableur Google Sheets (parfois), Wave personnel.
- **Pouvoir d'achat** : CA mensuel ~500 000-1 500 000 FCFA. Prête à payer 7 000 FCFA/mois pour un outil qui lui fait gagner 2h par jour.

### Persona 3 — Mariama, 19 ans, acheteuse, Dakar (Guédiawaye)

- **Profil** : Étudiante. Découvre des produits sur TikTok, achète 1-2 fois par mois. Budget mode ~10 000-25 000 FCFA/mois.
- **Pain points** :
  - Envoie un DM à la vendeuse, attend parfois 6h pour une réponse.
  - A déjà payé par Wave sans jamais recevoir le produit (pas de reçu, pas de suivi).
  - Ne sait jamais quand le livreur va arriver.
- **Outils actuels** : TikTok/Instagram pour découvrir, WhatsApp pour commander, Wave pour payer.
- **Pouvoir d'achat** : ~15 000 FCFA par achat moyen. Sensible au prix de livraison.

---

## 3. Pages & écrans

### Parcours Acheteur (vitrine publique)

**3.1 — Boutique de la vendeuse**
- **Rôle** : Afficher le catalogue produits de la vendeuse avec sa marque, ses photos et ses prix. C'est la page que l'acheteur voit quand il clique sur le lien dans la bio TikTok/Instagram.
- **Qui y accède** : Mariama (acheteuse), à tout moment depuis un lien partagé sur les réseaux sociaux.
- **Actions clés** : Parcourir les produits / Voir le détail d'un produit (photo, prix, description, variantes) / Ajouter au panier.

**3.2 — Panier & formulaire de commande**
- **Rôle** : Récapituler la commande et collecter les informations de livraison (nom, téléphone, adresse, quartier).
- **Qui y accède** : Mariama, après avoir ajouté un ou plusieurs produits au panier.
- **Actions clés** : Modifier les quantités / Saisir l'adresse de livraison / Choisir le mode de paiement (Wave ou Orange Money) / Lancer le paiement.

**3.3 — Page de paiement mobile money**
- **Rôle** : Rediriger l'acheteur vers le flux de paiement Wave ou Orange Money (page hébergée par le prestataire de paiement). L'argent va directement sur le compte de la vendeuse.
- **Qui y accède** : Mariama, immédiatement après la validation du panier.
- **Actions clés** : Confirmer le paiement sur l'app Wave/OM.

**3.4 — Page de confirmation de commande**
- **Rôle** : Confirmer à l'acheteur que le paiement est reçu et que la commande est en cours de traitement. Afficher un numéro de commande et un récapitulatif.
- **Qui y accède** : Mariama, après le paiement validé.
- **Actions clés** : Voir le récapitulatif / Copier le numéro de commande / Recevoir la confirmation par SMS.

**3.5 — Page de suivi de commande**
- **Rôle** : Permettre à l'acheteur de vérifier le statut de sa commande (en préparation → en livraison → livrée) via le numéro de commande.
- **Qui y accède** : Mariama, à tout moment après la commande (via un lien reçu par SMS).
- **Actions clés** : Consulter le statut de la commande / Voir l'adresse de livraison confirmée.

---

### Parcours Vendeuse (Dashboard)

**3.6 — Page d'inscription / connexion vendeuse**
- **Rôle** : Créer un compte vendeuse ou se connecter. Inscription ultra-rapide : numéro de téléphone + OTP SMS.
- **Qui y accède** : Fatou ou Awa, à la première visite ou au retour.
- **Actions clés** : S'inscrire via numéro de téléphone / Se connecter via OTP / Récupérer son accès.

**3.7 — Onboarding vendeuse (3 étapes max)**
- **Rôle** : Configurer sa boutique pour la première fois : nom de boutique, logo/photo, lien Wave/Orange Money, infos de contact.
- **Qui y accède** : Fatou ou Awa, une seule fois après l'inscription.
- **Actions clés** : Nommer sa boutique / Uploader une photo de profil / Connecter son compte de paiement mobile money (numéro Wave et/ou OM).

**3.8 — Tableau de bord principal**
- **Rôle** : Vue d'ensemble de l'activité de la vendeuse. Voir en un coup d'œil les nouvelles commandes, le CA du jour/semaine/mois, le nombre de commandes par statut.
- **Qui y accède** : Fatou ou Awa, à chaque ouverture de l'app.
- **Actions clés** : Voir les commandes récentes / Consulter le CA / Accéder rapidement à la gestion des commandes ou des produits.

**3.9 — Gestion des produits**
- **Rôle** : Créer, modifier, activer/désactiver les produits du catalogue. Chaque produit = photo + nom + prix + description + variantes (taille, couleur).
- **Qui y accède** : Fatou ou Awa, pour alimenter ou mettre à jour leur boutique.
- **Actions clés** : Ajouter un produit (photo depuis la galerie du téléphone) / Modifier prix/description / Marquer un produit comme "en rupture" / Supprimer un produit.

**3.10 — Gestion des commandes**
- **Rôle** : Voir toutes les commandes reçues avec leur statut (payée → en préparation → livreur notifié → livrée). Permettre à la vendeuse d'agir sur chaque commande.
- **Qui y accède** : Fatou ou Awa, plusieurs fois par jour.
- **Actions clés** : Voir le détail d'une commande (produit, adresse, téléphone acheteur) / Marquer comme "en préparation" / Confirmer que le livreur a récupéré le colis / Marquer comme "livrée".

**3.11 — Configuration livreur**
- **Rôle** : Permettre à la vendeuse d'enregistrer son ou ses livreurs personnels (nom, numéro WhatsApp/téléphone). Quand une commande est payée, Doolé envoie automatiquement un message au livreur configuré.
- **Qui y accède** : Fatou ou Awa, lors du setup initial puis pour modifier/ajouter des livreurs.
- **Actions clés** : Ajouter un livreur (nom + numéro) / Modifier un livreur / Choisir le livreur par défaut / Supprimer un livreur.

**3.12 — Paramètres boutique**
- **Rôle** : Modifier les informations de la boutique (nom, logo, lien personnalisé, compte mobile money, zones de livraison, tarifs de livraison par zone).
- **Qui y accède** : Fatou ou Awa, occasionnellement.
- **Actions clés** : Modifier le nom/logo de la boutique / Changer le numéro Wave/OM / Configurer les zones de livraison et leurs tarifs / Copier le lien de la boutique pour le mettre dans sa bio.

**3.13 — Page "Mon abonnement"**
- **Rôle** : Voir le plan actuel (Gratuit, Starter, Pro), les limites restantes, et passer à un plan supérieur.
- **Qui y accède** : Fatou ou Awa, quand elles atteignent une limite du plan gratuit ou veulent accéder à plus de fonctionnalités.
- **Actions clés** : Voir son plan actuel et les limites / Comparer les plans / S'abonner ou changer de plan via Wave/OM.

---

### Pages transversales

**3.14 — Landing page publique Doolé**
- **Rôle** : Expliquer Doolé aux vendeuses qui ne connaissent pas encore le produit. Convaincre en 30 secondes. Montrer le parcours en 3 étapes, les témoignages, le pricing.
- **Qui y accède** : Vendeuses potentielles venant de publicités, bouche-à-oreille, réseaux sociaux.
- **Actions clés** : Comprendre ce que fait Doolé / Voir les plans et tarifs / S'inscrire.

**3.15 — Page Pricing**
- **Rôle** : Comparer les 3 plans (Gratuit, Starter, Pro) avec le détail de ce qui est inclus dans chacun.
- **Qui y accède** : Vendeuses en phase de décision.
- **Actions clés** : Comparer les plans / Choisir un plan / Lancer le paiement de l'abonnement.

---

## 4. Fonctionnalités MVP (V1)

### Boutique publique (acheteur)

| Feature | Description | Priorité |
|---|---|---|
| Boutique mobile personnalisée | Chaque vendeuse dispose d'un lien unique (doole.sn/maboutique) affichant son catalogue produits avec sa photo, son nom de boutique et ses produits. | P0 |
| Fiche produit | Photo, nom, prix, description, variantes (taille/couleur). L'acheteur peut sélectionner une variante et une quantité. | P0 |
| Panier simple | L'acheteur ajoute un ou plusieurs produits, voit le récapitulatif avec le total + frais de livraison selon son quartier. | P0 |
| Formulaire de commande | Collecte nom, numéro de téléphone, adresse de livraison (champ texte + sélection du quartier parmi les zones configurées par la vendeuse). | P0 |
| Paiement mobile money | Redirection vers Wave ou Orange Money. L'argent va directement sur le compte de la vendeuse. Doolé reçoit uniquement la confirmation de paiement (webhook). | P0 |
| Confirmation de commande + SMS | Après paiement, l'acheteur voit une page de confirmation avec un numéro de commande et reçoit un SMS récapitulatif. | P0 |
| Suivi de commande | L'acheteur peut consulter le statut de sa commande via un lien reçu par SMS (payée → en préparation → en livraison → livrée). | P1 |

### Dashboard vendeuse

| Feature | Description | Priorité |
|---|---|---|
| Inscription par téléphone + OTP | Création de compte en moins de 60 secondes avec juste un numéro de téléphone. Pas d'email requis. | P0 |
| Onboarding 3 étapes | Nom de boutique → Photo/logo → Numéro Wave/OM. La vendeuse a une boutique fonctionnelle en moins de 3 minutes. | P0 |
| Création de produit | Ajouter un produit en uploadant une photo depuis la galerie, saisir nom/prix/description/variantes. Optimisé pour être fait entièrement sur mobile. | P0 |
| Gestion du catalogue | Modifier, désactiver (rupture de stock) ou supprimer un produit existant. | P0 |
| Liste des commandes | Vue chronologique de toutes les commandes avec statut visuel (badge couleur). Filtrage par statut. | P0 |
| Détail d'une commande | Voir le produit commandé, la quantité, le prix, le nom/téléphone/adresse de l'acheteur, le statut du paiement. | P0 |
| Mise à jour du statut | La vendeuse peut manuellement passer une commande de "payée" à "en préparation" puis "livrée". | P0 |
| Configuration livreur personnel | Enregistrer un ou plusieurs livreurs (nom + numéro WhatsApp/téléphone). Définir un livreur par défaut. | P0 |
| Notification auto au livreur | Quand un paiement est confirmé, un SMS/WhatsApp est automatiquement envoyé au livreur configuré avec : nom acheteur, adresse, détail de la commande, numéro acheteur. | P0 |
| Tableau de bord CA | Affichage du nombre de commandes et du CA total (jour / semaine / mois). | P1 |
| Configuration zones de livraison | La vendeuse définit les zones où elle livre (liste de quartiers) et le tarif de livraison pour chaque zone. | P1 |
| Lien boutique partageable | Bouton "Copier le lien" pour coller dans la bio TikTok/Instagram. Format court et mémorable. | P0 |
| Page "Mon abonnement" | Voir son plan actuel, les limites atteintes, et passer à un plan supérieur via paiement mobile money. | P1 |

### Notifications

| Feature | Description | Priorité |
|---|---|---|
| SMS acheteur — confirmation | SMS automatique à l'acheteur après paiement confirmé avec récapitulatif + numéro de commande + lien de suivi. | P0 |
| SMS/WhatsApp livreur — dispatch | Message automatique au livreur avec détail commande + adresse + téléphone acheteur dès que le paiement est confirmé. | P0 |
| SMS/WhatsApp vendeuse — nouvelle commande | Notification à la vendeuse quand une nouvelle commande payée arrive, même si elle n'a pas l'app ouverte. | P0 |
| SMS acheteur — statut livraison | SMS quand le statut passe à "en livraison" (livreur a récupéré le colis). | P2 |

---

## 5. User Stories principales

### US-01 — Créer ma boutique en 3 minutes
**En tant que** Fatou (vendeuse TikTok), **je veux** créer ma boutique en ligne en moins de 3 minutes avec juste mon téléphone, **afin de** pouvoir mettre un lien dans ma bio TikTok ce soir avant mon live.

**Critères d'acceptation :**
- L'inscription ne demande qu'un numéro de téléphone sénégalais + code OTP reçu par SMS.
- L'onboarding comprend exactement 3 étapes : nom de boutique, photo/logo, numéro Wave ou OM.
- À la fin de l'onboarding, la vendeuse obtient un lien partageable (doole.sn/maboutique) fonctionnel même sans produit ajouté (affiche un message "Boutique en construction").
- L'ensemble du processus (inscription + onboarding) prend moins de 3 minutes chrono sur un smartphone d'entrée de gamme.

### US-02 — Ajouter un produit facilement
**En tant que** Fatou, **je veux** ajouter un produit avec juste une photo de ma galerie, un nom et un prix, **afin de** pouvoir remplir ma boutique entre deux clients.

**Critères d'acceptation :**
- Seuls la photo, le nom et le prix sont obligatoires. La description et les variantes sont facultatives.
- La photo est uploadée depuis la galerie du téléphone en un seul tap.
- Le produit est visible dans la boutique immédiatement après sauvegarde.
- La vendeuse peut ajouter des variantes (taille, couleur) avec un prix différent par variante si elle le souhaite.

### US-03 — Recevoir une commande payée sans intervention
**En tant que** Fatou, **je veux** que mes clientes puissent commander et payer par Wave directement depuis mon lien boutique, **afin de** ne plus avoir à gérer des DM et vérifier des captures d'écran.

**Critères d'acceptation :**
- L'acheteuse peut sélectionner un produit, remplir ses infos de livraison, et payer par Wave ou Orange Money sans créer de compte.
- Le paiement arrive directement sur le compte Wave/OM de la vendeuse (pas de transit par Doolé).
- La vendeuse reçoit un SMS/WhatsApp dès que le paiement est confirmé avec le détail de la commande.
- La commande apparaît automatiquement dans sa liste de commandes avec le statut "Payée".

### US-04 — Dispatcher mon livreur automatiquement
**En tant que** Awa (vendeuse Instagram établie), **je veux** que mon livreur Modou reçoive automatiquement un message avec l'adresse de livraison dès qu'une commande est payée, **afin de** ne plus avoir à l'appeler pour chaque commande.

**Critères d'acceptation :**
- La vendeuse a configuré au moins un livreur (nom + numéro).
- Dès qu'un paiement est confirmé par le webhook, un SMS ou WhatsApp est envoyé au livreur par défaut.
- Le message contient : nom de l'acheteur, adresse complète, numéro de téléphone de l'acheteur, détail des produits commandés.
- La vendeuse peut choisir un autre livreur que celui par défaut pour une commande spécifique.

### US-05 — Suivre ma commande en tant qu'acheteuse
**En tant que** Mariama (acheteuse), **je veux** recevoir un SMS de confirmation avec un lien de suivi après avoir payé, **afin de** savoir que mon argent n'est pas perdu et que mon colis est en route.

**Critères d'acceptation :**
- Un SMS est envoyé à l'acheteuse dans les 30 secondes après la confirmation de paiement.
- Le SMS contient un numéro de commande et un lien vers une page de suivi.
- La page de suivi affiche le statut actuel de la commande (payée / en préparation / en livraison / livrée) sans nécessiter de connexion.

### US-06 — Voir mon chiffre d'affaires
**En tant que** Awa, **je veux** voir combien j'ai vendu aujourd'hui, cette semaine et ce mois, **afin de** savoir si je gagne assez pour justifier mon prochain achat de stock en Turquie.

**Critères d'acceptation :**
- Le tableau de bord affiche le nombre de commandes et le CA total pour 3 périodes : aujourd'hui, cette semaine, ce mois.
- Les données se mettent à jour en temps réel quand une nouvelle commande payée arrive.
- Le CA est affiché en FCFA.

### US-07 — Passer au plan Starter
**En tant que** Fatou, **je veux** passer du plan Gratuit au plan Starter quand j'atteins la limite de 10 produits, **afin de** pouvoir ajouter tout mon catalogue sans être bloquée.

**Critères d'acceptation :**
- Quand la vendeuse atteint une limite de son plan gratuit, un message clair l'en informe et lui propose de passer au plan supérieur.
- Le paiement de l'abonnement se fait par Wave ou Orange Money.
- L'accès aux fonctionnalités du plan supérieur est immédiat après confirmation du paiement.
- Pas d'engagement : l'abonnement est mensuel, résiliable à tout moment.

---

## 6. Business Model & Monétisation

### Modèle : Freemium + abonnement mensuel

Le paiement de l'abonnement se fait via Wave ou Orange Money (mobile money). Cartes bancaires en complément.

### Grille tarifaire

| | **Gratuit** | **Starter** — ~~5 000~~ **3 000 FCFA/mois** | **Pro** — ~~10 000~~ **7 000 FCFA/mois** |
|---|---|---|---|
| Boutique en ligne personnalisée | ✅ | ✅ | ✅ |
| Lien partageable (bio TikTok/Insta) | ✅ | ✅ | ✅ |
| Nombre de produits | 10 max | 50 max | Illimité |
| Paiement Wave/OM direct | ✅ | ✅ | ✅ |
| Notification vendeuse (nouvelle commande) | ✅ | ✅ | ✅ |
| Dispatch livreur automatique | ❌ | ✅ (1 livreur) | ✅ (livreurs illimités) |
| Suivi commande acheteur (SMS) | ❌ | ✅ | ✅ |
| Tableau de bord CA | Basique (aujourd'hui) | Jour / Semaine / Mois | Jour / Semaine / Mois + top produits |
| Zones de livraison configurables | 3 zones max | 10 zones | Illimité |
| Nombre de commandes/mois | 30 max | 200 max | Illimité |
| Support | Communauté WhatsApp | WhatsApp prioritaire | WhatsApp prioritaire + appel |

### Ce que le plan gratuit permet de faire

Le plan gratuit n'est pas une démo — c'est un vrai outil fonctionnel. Une vendeuse qui débute avec 5-10 produits et quelques commandes par semaine peut utiliser Doolé gratuitement de manière durable. Le dispatch livreur automatique est le déclencheur de conversion principal vers le plan Starter : c'est le moment où la vendeuse réalise que Doolé lui fait gagner du temps.

### Moyens de paiement acceptés pour l'abonnement

- **Wave** (prioritaire — 7M+ users au Sénégal)
- **Orange Money**
- **Free Money**
- Carte bancaire (complément)

### Projection de revenu

Avec 500 vendeuses inscrites dont 15% converties en Starter et 5% en Pro :
- 75 × 3 000 + 25 × 7 000 = **400 000 FCFA/mois** (~610 €)
- Objectif 12 mois : 3 000 vendeuses → **2,4M FCFA/mois** (~3 660 €)

---

## 7. Métriques de succès

### Acquisition (30 premiers jours)

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Vendeuses inscrites | 200 | Nombre de comptes créés |
| Vendeuses ayant complété l'onboarding | 140 (70%) | Nombre de boutiques avec au moins 1 produit |
| Boutiques avec au moins 1 vente payée | 40 (20%) | Nombre de vendeuses ayant reçu au moins 1 commande payée |

### Activation (J+7)

| KPI | Cible | Justification |
|---|---|---|
| Taux d'activation J+1 (= a ajouté au moins 1 produit dans les 24h) | > 50% | L'onboarding est conçu pour être fini en 3 min |
| Taux de conversion panier → paiement (côté acheteur) | > 40% | Le parcours est en 2 étapes max |
| Nombre moyen de produits par boutique active | > 5 | Seuil de crédibilité d'une boutique |

### Engagement (Mois 1-3)

| KPI | Cible |
|---|---|
| Commandes payées par vendeuse active par semaine | > 3 |
| Taux de rétention vendeuse M1 (revient au moins 1 fois en semaine 5) | > 40% |
| NPS vendeuses | > 40 |

### Monétisation (Mois 2-6)

| KPI | Cible |
|---|---|
| Conversion Gratuit → Starter | 10-15% |
| Conversion Starter → Pro | 15-20% des Starter |
| Churn mensuel payant | < 10% |
| MRR mois 6 | > 1 000 000 FCFA |

---

## 8. Ce qui est HORS SCOPE V1

| Feature exclue | Pourquoi |
|---|---|
| Intégration API Paps / Yobanté | Le mode "livreur propre" suffit pour le MVP. L'intégration dispatch professionnel sera une feature Pro V2, une fois la base de vendeuses établie et le partenariat négocié. |
| Gestion de stock automatisée | En V1, la vendeuse gère manuellement la disponibilité (activer/désactiver un produit). Le suivi de stock avec alerte de rupture viendra en V2. |
| Multi-boutiques par vendeuse | Une vendeuse = une boutique. Les vendeuses ayant plusieurs marques devront créer plusieurs comptes en V1. |
| App native iOS/Android | Doolé est une application web responsive. Le marché cible utilise des navigateurs mobiles sur smartphones d'entrée de gamme. Une PWA peut être envisagée en V2. |
| Système de notation / avis | Pas de système d'avis acheteur en V1. La confiance passe par le réseau social de la vendeuse (elle est déjà connue de ses followers). |
| Chat intégré acheteur ↔ vendeuse | L'acheteur utilise WhatsApp/DM pour communiquer. Doolé n'a pas vocation à remplacer la messagerie. |
| Gestion multi-devises | V1 = FCFA uniquement (marché sénégalais). L'extension vers d'autres pays UEMOA et le Nigeria viendra avec la traction. |
| Programme de parrainage / affiliation | Prévu pour la V2 quand le produit aura prouvé sa rétention. |
| Dashboard analytics avancé (courbes, exports, top clients) | V1 = chiffres simples (CA, nombre de commandes). Les analytics détaillés sont une feature Pro V2. |
| Paiement à la livraison (Cash on Delivery) | Complexité opérationnelle trop élevée pour le MVP (collecte cash, réconciliation). Le paiement pré-commande mobile money EST la proposition de valeur de Doolé. |

---

## 9. Risques et mitigation

### Risque 1 — Résistance des acheteuses au paiement en ligne pré-livraison
**Impact** : Élevé. 70% des commandes e-commerce au Sénégal se font encore en Cash on Delivery. Les acheteuses peuvent refuser de payer avant de voir le produit.
**Mitigation** :
- Le fait que la vendeuse soit connue de l'acheteuse (follower TikTok/Instagram) crée un niveau de confiance supérieur au e-commerce anonyme.
- Le SMS de confirmation avec numéro de commande et suivi crée de la réassurance.
- Communiquer des chiffres clés côté vendeuse : "95% des commandes pré-payées arrivent à bon port" (à construire dès les premières semaines).
- Envisager un mécanisme de remboursement simplifié via la vendeuse si le produit n'arrive pas (pas de remboursement automatique en V1, mais une politique claire affichée).

### Risque 2 — Adoption lente : les vendeuses restent sur WhatsApp
**Impact** : Élevé. L'habitude WhatsApp est profondément ancrée. Changer de workflow est difficile.
**Mitigation** :
- Doolé ne remplace PAS WhatsApp — il le complète. La vendeuse continue de poster sur TikTok/Instagram et de discuter sur WhatsApp. Doolé gère uniquement la partie "commande + paiement + dispatch" qui est la plus chronophage.
- Cibler les vendeuses qui font des lives TikTok le soir et sont submergées de DM → douleur maximale, motivation maximale.
- Onboarding en moins de 3 minutes → la vendeuse peut tester sans investissement de temps.
- Recruter 10-15 vendeuses "ambassadrices" à Dakar, les accompagner manuellement, puis utiliser leurs résultats comme preuve sociale.

### Risque 3 — Fiabilité des SMS/WhatsApp pour le dispatch livreur
**Impact** : Moyen. Si le livreur ne reçoit pas le message, la commande est bloquée et la vendeuse perd confiance.
**Mitigation** :
- Double canal : envoyer à la fois un SMS et un WhatsApp au livreur.
- Notification à la vendeuse si le message au livreur échoue (numéro invalide, WhatsApp non joignable) → elle peut appeler manuellement en fallback.
- Permettre à la vendeuse de renvoyer manuellement le message au livreur depuis le détail de la commande.

### Risque 4 — Conversion freemium → payant trop faible
**Impact** : Moyen. Si le plan gratuit est trop généreux, personne ne paye. S'il est trop limité, personne ne reste.
**Mitigation** :
- Le dispatch livreur automatique (feature la plus différenciante) est réservé aux plans payants → c'est le déclencheur de conversion naturel.
- La limite de 30 commandes/mois en plan gratuit est calibrée pour qu'une vendeuse qui commence à avoir de la traction (2+ commandes/jour) atteigne le plafond en 2-3 semaines → moment idéal pour proposer l'upgrade.
- Le prix barré (~~5 000~~ 3 000 FCFA) crée un sentiment d'opportunité.
- Pas d'engagement annuel : zéro friction psychologique.

### Risque 5 — Fraude au paiement (fausses confirmations)
**Impact** : Moyen. Des acheteurs pourraient tenter de simuler un paiement (faux SMS Wave, capture d'écran trafiquée).
**Mitigation** :
- Doolé ne se fie JAMAIS à un SMS ou une capture. Seul le webhook du prestataire de paiement (confirmation serveur-à-serveur) déclenche la validation de commande. C'est un avantage fondamental par rapport au système artisanal actuel.
- Communiquer clairement aux vendeuses que Doolé élimine le risque de fausse preuve de paiement — c'est un argument de vente majeur.