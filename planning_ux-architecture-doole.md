# 🧭 Architecture UX — Doolé

> Document de conception. Couvre : principes directeurs, architecture de l'information (sitemap), navigation, liste exhaustive des écrans, parcours acheteur & vendeuse, adaptations terrain Sénégal. Aligné sur le PRD, le design brief et la discovery (business model + paiement Option A + livreur propre).

---

## 0. Les deux questions qui gouvernent tout

Chaque écran sert **une seule** de ces questions. Si un écran ne répond clairement à aucune, il ne doit pas exister.

- **Acheteur** → « Qu'est-ce que j'achète, et comment je paie vite ? »
- **Vendeuse** → « Qu'est-ce qui a été vendu, et qu'est-ce qui doit partir ? »

---

## 1. Principes directeurs UX

| Principe | Conséquence concrète |
|---|---|
| **Une main, un pouce** | Actions principales en bas d'écran (thumb zone). Jamais de CTA critique en haut. |
| **Lisible en 3 secondes** | 1 info dominante par écran, gros chiffre / gros statut. Le reste est secondaire. |
| **Faible connexion = first-class** | Skeleton states, optimistic UI, retry auto silencieux, payload léger, images compressées + lazy. L'app reste utilisable hors-ligne en lecture. |
| **Zéro friction inscription** | OTP téléphone uniquement. Pas d'email, pas de mot de passe, pas de formulaire long. |
| **Confiance = reçu Wave** | Statuts explicites, montants en gros, horodatage, couleurs sémantiques claires (payé / en attente / parti / livré). |
| **Pas de jargon SaaS** | « Commandes », « Payé », « À envoyer », « Livré ». Jamais « dashboard », « pipeline », « KPI ». |
| **Le système agit, pas la vendeuse** | Paiement validé par webhook → dispatch auto. Elle ne tape rien. |

---

## 2. Deux applications, un même domaine

Doolé = **2 surfaces distinctes** sous le même produit :

- **Surface ACHETEUR** — publique, sans compte, sans login. URL = lien boutique partageable (`doole.sn/maison-fatou`). Optimisée conversion + vitesse. L'acheteur ne sait même pas qu'il utilise « Doolé ».
- **Surface VENDEUSE** — privée, derrière OTP. C'est le SaaS. Optimisée gestion + clarté.

> Règle : l'acheteur ne voit **jamais** d'élément de marque Doolé qui le distrait de l'achat. La boutique appartient visuellement à la vendeuse (nom, logo, couleur).

---

## 3. Architecture de l'information (Sitemap)

### 3.1 — Surface ACHETEUR (publique, no-auth)

```
doole.sn/{slug-boutique}              → Boutique publique (catalogue)
  └── /{slug-boutique}/p/{produit}    → Page produit
  └── /panier                         → Panier
        └── /livraison                → Formulaire livraison (adresse + tel)
              └── /paiement           → Choix Wave / Orange Money → redirection provider
                    └── /confirmation → Commande confirmée (n° + récap + lien suivi)
  └── /suivi/{token-commande}         → Suivi commande (statut temps réel, sans compte)
```

### 3.2 — Surface VENDEUSE (privée, OTP)

```
/                                     → Redirection : si non connectée → /entrer
/entrer                               → Saisie n° téléphone
  └── /entrer/code                    → Saisie OTP (4-6 chiffres)
        └── (si 1ʳᵉ fois) → Onboarding express
              1. Nom boutique + slug
              2. Numéro Wave/OM de réception (paiement direct)
              3. 1ᵉʳ produit (optionnel — skippable)
              → Boutique prête + lien à partager

/accueil                              → Tableau de bord (CA jour + commandes à traiter)
/commandes                            → Liste commandes (filtres par statut)
  └── /commandes/{id}                 → Détail commande + actions statut + dispatch
/produits                             → Liste produits
  └── /produits/nouveau               → Ajout produit
  └── /produits/{id}                  → Édition produit
/livreurs                             → Liste livreurs + dispatch
  └── /livreurs/nouveau               → Ajout livreur (nom + tel + canal SMS/WhatsApp)
/boutique                             → Paramètres boutique (nom, slug, logo, n° paiement, zones)
/abonnement                           → Plan actuel + upgrade (Freemium / Starter / Pro)
/compte                               → Profil, déconnexion, aide
```

---

## 4. Navigation

### 4.1 — Vendeuse : barre d'onglets basse (bottom tab bar)

Toujours visible, 4 onglets max (thumb zone). C'est le cœur de la navigation.

```
┌──────────────────────────────────────────────┐
│                                                │
│                 (contenu écran)                │
│                                                │
├────────┬──────────┬──────────┬────────────────┤
│ Accueil│ Commandes│ Produits │   Plus (⋯)      │
│   🏠   │    📦    │    🏷️    │      ⋯          │
└────────┴──────────┴──────────┴────────────────┘
```

- **Accueil** — CA du jour + commandes à traiter.
- **Commandes** — le centre opérationnel (badge = nb à traiter).
- **Produits** — catalogue.
- **Plus** — Livreurs, Boutique, Abonnement, Compte, Aide.

> Pourquoi « Commandes » au centre et non « Produits » : la vendeuse vient surtout pour **traiter ce qui est tombé**, pas pour gérer son catalogue. La question est « qu'est-ce qui doit partir ? ».

### 4.2 — Acheteur : pas de navigation, un tunnel

L'acheteur n'a pas de menu. Il est dans un **tunnel d'achat linéaire** :

```
Boutique → Produit → Panier → Livraison → Paiement → Confirmation
```

Seuls 2 contrôles persistants : **retour** (haut gauche) et **panier** (badge, haut droite). Le CTA d'avancement est toujours en bas, pleine largeur.

---

## 5. Liste exhaustive des écrans

### 5.1 — ACHETEUR

| # | Écran | Question unique | Éléments clés | Priorité |
|---|---|---|---|---|
| A1 | **Boutique publique** | « Qu'est-ce qu'elle vend ? » | Header boutique (nom + logo), grille produits (photo + prix), recherche optionnelle. Chargement instantané, images lazy. | P0 |
| A2 | **Page produit** | « C'est quoi exactement et combien ? » | Photo(s) plein écran, nom, prix gros, description courte, variantes (taille/couleur), bouton **Ajouter au panier** (bas, pleine largeur). | P0 |
| A3 | **Panier** | « Qu'est-ce que je commande et combien ça fait ? » | Lignes produits éditables (qté ±), total en gros, **Commander** (bas). | P0 |
| A4 | **Formulaire livraison** | « Où je veux être livré ? » | Nom, téléphone (pré-rempli format SN), zone/quartier (liste ou champ), repère/note. Minimum de champs. | P0 |
| A5 | **Paiement** | « Comment je paie vite ? » | Récap montant total (+ livraison), choix **Wave** / **Orange Money** (2 gros boutons logos), → redirection provider. | P0 |
| A6 | **Confirmation** | « C'est bon, c'est payé ? » | ✅ Gros « Commande confirmée », n° commande, récap, **lien de suivi** (copiable / WhatsApp). Rassure comme un reçu Wave. | P0 |
| A7 | **Suivi commande** | « Où en est ma commande ? » | Timeline statuts (Payé → Préparée → En route → Livré), nom + tel livreur quand dispatché. Accessible sans compte (token). | P1 |

### 5.2 — VENDEUSE

| # | Écran | Question unique | Éléments clés | Priorité |
|---|---|---|---|---|
| V1 | **Entrer (téléphone)** | « Quel est ton numéro ? » | 1 champ téléphone, bouton **Recevoir le code**. Rien d'autre. | P0 |
| V2 | **Code OTP** | « Confirme que c'est toi » | 4-6 cases, auto-submit, renvoi du code (compte à rebours). | P0 |
| V3 | **Onboarding — Boutique** | « Comment s'appelle ta boutique ? » | Nom → slug auto (`doole.sn/...`), logo optionnel. | P0 |
| V4 | **Onboarding — Paiement** | « Où tu reçois ton argent ? » | Numéro Wave / OM de réception. Explication : « l'argent arrive direct chez toi ». | P0 |
| V5 | **Onboarding — 1ᵉʳ produit** | « Mets ton premier article (ou plus tard) » | Photo + nom + prix. **Skippable**. Fin → écran « Ta boutique est prête » + lien à copier/partager. | P0 |
| V6 | **Accueil (tableau de bord)** | « Qu'est-ce qui a été vendu aujourd'hui ? » | CA du jour (gros chiffre), nb commandes à traiter (CTA), raccourci « Partager ma boutique ». Pas de graphe complexe au MVP. | P0 |
| V7 | **Commandes (liste)** | « Qu'est-ce qui doit partir ? » | Filtres statut (À traiter / Payées / En route / Livrées). Carte commande = client, montant, statut couleur, heure. Tri : à traiter en haut. | P0 |
| V8 | **Détail commande** | « Que dois-je faire de cette commande ? » | Client + adresse + tel, articles, montant, **statut**, bouton **Dispatcher un livreur** (auto si réglé), bouton appel/WhatsApp client. | P0 |
| V9 | **Produits (liste)** | « Qu'est-ce que j'ai en vente ? » | Grille/liste : photo, nom, prix, stock/dispo. Bouton **+ Ajouter**. | P0 |
| V10 | **Ajout / édition produit** | « Décris l'article » | Photo(s), nom, prix, variantes, stock optionnel, dispo on/off. | P0 |
| V11 | **Livreurs (liste + dispatch)** | « Qui livre ? » | Liste livreurs (nom, tel, canal). Au MVP : livreur propre. Réglage « livreur par défaut » → dispatch auto. | P0 |
| V12 | **Ajout livreur** | « Ajoute ton livreur » | Nom, téléphone, canal de notif (SMS / WhatsApp). | P0 |
| V13 | **Paramètres boutique** | « Règle ma boutique » | Nom, slug, logo, n° paiement, zones de livraison + tarifs (P2), horaires/dispo. | P1 |
| V14 | **Abonnement** | « Quel est mon plan ? » | Plan actuel, limites Freemium, upgrade Starter (3 000) / Pro (7 000), paiement Wave/OM récurrent. | P2 |
| V15 | **Compte** | « Mon profil & aide » | Numéro, déconnexion, aide/support (WhatsApp), CGU. | P1 |

---

## 6. Parcours acheteur (flow détaillé)

> Contexte : l'acheteur arrive depuis un lien en bio TikTok/Instagram ou un DM. Objectif : **commande payée en < 5 min, < 6 écrans**.

```
[Lien bio/DM]
     │
     ▼
A1 Boutique ──► A2 Produit ──► (Ajouter) ──► A3 Panier
                                                 │
                                                 ▼
                                          A4 Livraison
                                                 │
                                                 ▼
                                          A5 Paiement ──► [Wave / OM provider]
                                                                  │
                                          ┌───────────────────────┤
                                          │ succès                 │ échec/abandon
                                          ▼                        ▼
                                   A6 Confirmation          (retour A5, retry)
                                          │
                                          ▼
                                   A7 Suivi (lien)
```

**Règles du tunnel :**
- Pas de création de compte exigée. Le téléphone saisi en A4 sert d'identité légère + suivi.
- Le paiement est **réel** (redirection Wave/OM). Aucune confirmation manuelle.
- **Le webhook provider** (paiement confirmé) → fait passer la commande en « Payée » côté vendeuse **et** déclenche le dispatch livreur. L'acheteur, lui, voit A6 dès le retour provider OK.
- A6 propose immédiatement le **lien de suivi** partageable (rassurance).

---

## 7. Parcours vendeuse (flow détaillé)

### 7.1 — Première fois (inscription → boutique prête)

```
V1 Téléphone ──► V2 OTP ──► V3 Nom boutique ──► V4 N° paiement ──► V5 1ᵉʳ produit (skippable)
                                                                          │
                                                                          ▼
                                                            « Ta boutique est prête »
                                                          + lien à copier / partager bio
                                                                          │
                                                                          ▼
                                                                    V6 Accueil
```

Objectif : **boutique partageable en < 2 min**, même sans produit (elle peut en ajouter après).

### 7.2 — Usage quotidien (le cœur)

```
V6 Accueil
  │  « 3 commandes à traiter »
  ▼
V7 Commandes (filtre : À traiter)
  │
  ▼
V8 Détail commande
  ├─► Paiement déjà confirmé (webhook) → statut « Payée »
  ├─► [Dispatcher livreur]  → notif auto SMS/WhatsApp au livreur
  │        (auto si livreur par défaut réglé : aucune action requise)
  ├─► statut → « En route »
  └─► statut → « Livré »
```

**Le moment magique (zéro toucher) :**
```
Acheteur paie ──► webhook ──► commande « Payée »
                                    │
                                    ▼
                      dispatch auto livreur par défaut
                                    │
                                    ▼
              SMS/WhatsApp livreur : « Nouvelle livraison : [adresse], [tel client] »
```
La vendeuse n'a **rien tapé**. Elle constate, depuis V6, que ça a vendu et que ça part.

---

## 8. Statuts de commande (langage commun)

Un seul vocabulaire, couleurs sémantiques, partagé acheteur (A7) ↔ vendeuse (V7/V8) :

| Statut | Sens | Couleur | Déclencheur |
|---|---|---|---|
| **En attente** | Commande créée, paiement non confirmé | gris/ambre | Acheteur a validé livraison, pas encore payé |
| **Payée** | Argent reçu (webhook) | vert | Webhook provider OK |
| **À envoyer** | Payée, pas encore dispatchée | ambre | Auto après paiement (si pas de dispatch auto) |
| **En route** | Livreur notifié / en chemin | bleu | Dispatch livreur |
| **Livré** | Reçue par le client | vert foncé | Confirmation vendeuse/livreur |
| **Annulée** | Abandonnée / échec paiement | rouge | Échec ou annulation |

---

## 9. Adaptations terrain Sénégal / faible connexion

| Réalité terrain | Réponse UX |
|---|---|
| 3G qui décroche | Optimistic UI (action affichée avant confirmation serveur), retry silencieux, file d'actions offline pour la vendeuse (changement de statut en attente de sync). |
| Téléphones low-end | Pas d'animation lourde, pas de WebGL, listes virtualisées, images `webp` + tailles adaptées. |
| Données chères | Payload minimal, pas de polices lourdes, cache agressif du catalogue, images progressives. |
| Partage en bio | Lien court, propre, mémorisable (`doole.sn/maison-fatou`) + bouton « Partager » natif (Web Share API) vers TikTok/Insta/WhatsApp. |
| Confiance paiement | Écran paiement = look « reçu Wave » : montant énorme, logos officiels Wave/OM, aucun champ carte. |
| Pas d'email | OTP téléphone unique. Suivi acheteur par lien-token, pas par login. |
| Vendeuse en mouvement | Tout en bottom-thumb-zone, gros tap targets (≥ 48px), 1 décision par écran. |
| Notif livreur sans app | SMS / WhatsApp (pas d'app livreur au MVP). Le livreur reçoit un message texte clair, cliquable (tel client + adresse + lien maps si dispo). |

---

## 10. Mapping écrans ↔ priorités MVP

- **P0 (MVP livrable)** : A1–A6, V1–V12. → Boutique → commande → paiement → dashboard → commandes → produits → dispatch livreur propre. C'est le produit complet « je poste mon lien et je vends ».
- **P1** : A7 (suivi), V13 (paramètres), V15 (compte/aide), stats CA enrichies.
- **P2** : V14 (abonnement + upgrade), zones de livraison & tarifs, analytics avancés, intégration Paps/Yobanté (fallback livreur), dispatch multi-livreurs.

---

## 11. Ce que l'architecture exclut volontairement (anti-scope)

- Pas de compte acheteur, pas de login acheteur, pas de wishlist.
- Pas de chat interne (on s'appuie sur appel/WhatsApp natif depuis V8).
- Pas de cash on delivery (paiement webhook uniquement, conformément aux règles produit).
- Pas de multi-boutiques, pas de marketplace globale, pas d'avis produits.
- Pas de dashboard analytique complexe au MVP (V6 = 2 chiffres, pas un cockpit).
- Pas d'app native — web mobile-first uniquement.

---

## 12. Prochaines étapes proposées

1. **Wireframes basse fidélité** des 6 écrans acheteur (tunnel) + 5 écrans vendeuse cœur (V2, V6, V7, V8, V10).
2. **Design system minimal** : palette (1 couleur boutique personnalisable + sémantiques statuts), typo lisible low-end, composants (carte commande, carte produit, statut-pill, bouton plein-largeur, champ OTP).
3. **Modèle de données** Supabase (boutique, produit, commande, livreur, paiement/webhook, abonnement).
4. **Spéc technique paiement** : intégration Moneroo/PayTech (Option A), endpoint webhook, mapping statuts.
5. **Spéc dispatch** : passerelle SMS/WhatsApp (Twilio / Africa's Talking), template message livreur.
</content>
</invoke>
