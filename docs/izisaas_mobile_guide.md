# iziFacture — Guide de Développement des Pages Suivantes

> **Status**: À utiliser après validation du dashboard  
> **Date**: 2026-07-24  
> **Format**: Markdown → Convertible en PDF

---

## 📋 Table des Matières

1. [Dashboard Validé ✓](#dashboard-validé-)
2. [Pages à Construire](#pages-à-construire)
3. [Landing Page iziFacture](#landing-page-izifacture)
4. [Règles Techniques Globales](#règles-techniques-globales)

---

## Dashboard Validé ✓

Le dashboard est validé. Procédez avec les pages suivantes en gardant **exactement le même style de design**.

---

## Pages à Construire

### 1️⃣ PAGE CRÉER UNE FACTURE

**Objectif** : Formulaire complet pour générer une facture professionnelle.

#### Structure

- **Sélection du client** : Liste déroulante avec tous les clients existants
- **Dates** :
  - Date d'émission (aujourd'hui par défaut)
  - Date d'échéance (configurable)
- **Section Lignes de Facture** :
  - Chaque ligne contient : Description, Quantité, Prix unitaire
  - Total de la ligne calculé automatiquement
  - Bouton "Ajouter une ligne"
  - Bouton "Supprimer une ligne" (par ligne)
- **Récapitulatif en bas** :
  - Sous-total
  - TVA 18% (calculée automatiquement)
  - Total TTC
- **Montants** : En FCFA, arrondis à l'entier
- **Actions** :
  - Bouton "Sauvegarder comme brouillon"
  - Bouton "Envoyer" (email ou PDF)

#### Exemple de données fictives

```json
{
  "client": "Amadou Diallo",
  "dateEmission": "2026-07-24",
  "dateEcheance": "2026-08-24",
  "lignes": [
    {
      "description": "Consultation stratégie marketing",
      "quantite": 2,
      "prixUnitaire": 150000,
      "total": 300000
    },
    {
      "description": "Création logo",
      "quantite": 1,
      "prixUnitaire": 250000,
      "total": 250000
    }
  ],
  "sousTotal": 550000,
  "tva": 99000,
  "totalTTC": 649000
}
```

---

### 2️⃣ PAGE LISTE DES FACTURES

**Objectif** : Affichage complet de toutes les factures avec filtres et recherche.

#### Éléments

- **Tableau** : Toutes les factures avec colonnes
  - Numéro facture
  - Client
  - Date d'émission
  - Montant TTC
  - Statut
- **Filtres par statut** :
  - Tous
  - Brouillon
  - Envoyée
  - Payée
  - En retard
- **Barre de recherche** : Par nom de client (temps réel)
- **Action au clic** : Ouvre le détail de la facture

#### Exemple de données

```json
[
  {
    "id": "FAC-001",
    "client": "Fatou Ndiaye",
    "dateEmission": "2026-07-20",
    "montantTTC": 275000,
    "statut": "payee"
  },
  {
    "id": "FAC-002",
    "client": "Omar Ba",
    "dateEmission": "2026-07-22",
    "montantTTC": 450000,
    "statut": "envoyee"
  },
  {
    "id": "FAC-003",
    "client": "Mame Soda",
    "dateEmission": "2026-07-24",
    "montantTTC": 120000,
    "statut": "brouillon"
  }
]
```

---

### 3️⃣ PAGE DÉTAIL FACTURE

**Objectif** : Affichage complet d'une facture avec actions.

#### Éléments

- **En-tête** : Logo, infos entreprise, numéro facture
- **Bloc client** : Nom, email, téléphone, adresse
- **Tableau détaillé** : Toutes les lignes avec Description, Quantité, Prix unitaire, Total
- **Récapitulatif** :
  - Sous-total
  - TVA 18%
  - Total TTC
- **Actions** :
  - Bouton "Changer le statut" (dropdown)
  - Bouton "Modifier" (pré-remplit le formulaire)
  - Bouton "Supprimer" (avec confirmation modal)
  - Bouton "Télécharger PDF"
  - Bouton "Envoyer par email"

#### Statuts possibles

- ⚪ Brouillon
- 📨 Envoyée
- ✅ Payée
- ⚠️ En retard

---

### 4️⃣ PAGE CLIENTS

**Objectif** : Gestion complète de la base de clients.

#### Éléments

- **Liste de tous les clients** : Tableau avec colonnes
  - Nom
  - Email
  - Téléphone
  - Adresse
  - Nombre de factures
  - Actions (Modifier, Supprimer)
- **Formulaire "Ajouter un client"** :
  - Nom (obligatoire)
  - Email (obligatoire)
  - Téléphone (obligatoire)
  - Adresse (facultatif)
  - Bouton "Créer"
- **Modification** : Pré-remplit le formulaire
- **Suppression** : Confirmation avec nombre de factures associées

#### Exemple de données

```json
[
  {
    "id": "CLI-001",
    "nom": "Fatou Ndiaye",
    "email": "fatou@example.com",
    "telephone": "+221771234567",
    "adresse": "Dakar, Senegal",
    "nombreFactures": 5
  },
  {
    "id": "CLI-002",
    "nom": "Omar Ba",
    "email": "omar@example.com",
    "telephone": "+221772345678",
    "adresse": "Thiès, Senegal",
    "nombreFactures": 3
  }
]
```

---

## Landing Page iziFacture

### 🎯 Objectif

Créer une landing page **haute conversion** pour iziFacture, un SaaS de facturation moderne pour entrepreneurs africains.

**Style** : S'inspirer du style visuel fourni (couleurs, typographie, disposition) sans copier le contenu.

---

### 📐 Structure de la Landing Page

#### 1. HERO SECTION

```
┌─────────────────────────────────────────────┐
│                                               │
│  Titre accrocheur (60px, bold)              │
│  "Fini les factures sur Word et Excel"      │
│                                               │
│  Sous-titre (24px, regular)                 │
│  "Crée des factures pro en 2 clics, paie   │
│   directement par Wave ou Orange Money"     │
│                                               │
│  [Commencer gratuitement]  [Voir la démo]  │
│                                               │
│           [Mockup du Dashboard]              │
│                                               │
└─────────────────────────────────────────────┘
```

**Contenu** :
- Titre principal : "Fini les factures sur Word et Excel"
- Sous-titre : "Crée des factures pro en 2 clics. Suivi des paiements. Gestion de clients intégrée."
- CTA Principal : "Commencer gratuitement" (bouton primaire)
- CTA Secondaire : "Voir la démo" (bouton outline)
- Image/Mockup du dashboard

---

#### 2. SECTION PROBLÈME

Affiche 3 cartes avec problèmes courants.

```
┌─────────────┬─────────────┬─────────────┐
│ Icône       │ Icône       │ Icône       │
│ Problème 1  │ Problème 2  │ Problème 3  │
│ Desc...     │ Desc...     │ Desc...     │
└─────────────┴─────────────┴─────────────┘
```

**Problèmes** :
1. **Factures non professionnelles** : Crées sur Word, sans branding
2. **Calculs manuels de TVA** : Risques d'erreurs, chronophages
3. **Suivi des paiements impossible** : Pas de visibilité sur qui a payé

---

#### 3. SECTION FONCTIONNALITÉS

4 cartes avec icônes et descriptions.

```
┌─────────┬─────────┐
│ Fonc 1  │ Fonc 2  │
├─────────┼─────────┤
│ Fonc 3  │ Fonc 4  │
└─────────┴─────────┘
```

**Fonctionnalités** :
1. ✨ **Factures professionnelles en 2 clics**
   - Template pré-conçu
   - Logo et branding automatiques

2. 🧮 **TVA 18% calculée automatiquement**
   - Plus d'erreurs de calcul
   - Conforme aux normes OHADA

3. 📊 **Suivi des paiements en temps réel**
   - Reçu confirmation instantanée
   - Dashboard avec statistiques

4. 👥 **Gestion de clients intégrée**
   - Base de données centralisée
   - Historique factures par client

---

#### 4. SECTION COMMENT ÇA MARCHE

3 étapes simples avec icônes et descriptions.

```
Step 1          Step 2          Step 3
┌────┐          ┌────┐          ┌────┐
│ 1  │ ────→ │ 2  │ ────→ │ 3  │
└────┘          └────┘          └────┘
Inscription     Créer facture   Envoyer
```

**Étapes** :
1. **Inscris-toi gratuitement** : Email + mot de passe
2. **Crée ta première facture** : Formulaire en 2 minutes
3. **Envoie et suis les paiements** : Notifications instantanées

---

#### 5. SECTION TEMOIGNAGES

3 temoignages fictifs d'entrepreneurs africains.

```
┌──────────────────────────────────────┐
│ "Citation inspirante..."             │
│                                       │
│ - Prenom Nom, Metier/Entreprise     │
│ Localisation (Senegal/Cote d'Ivoire)│
└──────────────────────────────────────┘
```

**Temoignages fictifs** :

1. **Awa Diop** - Styliste (Dakar, Sénégal)
   > "iziFacture m'a sauvé 5 heures par semaine. Je facture maintenant comme une agence pro. Mes clients prennent ça au sérieux."

2. **Kofi Mensah** - Consultant IT (Accra, Ghana)
   > "La TVA se calcule toute seule. Plus de disputes avec mes clients sur les montants. C'est franchement incroyable."

3. **Fatima Tall** - Coach entrepreneuriat (Bamako, Mali)
   > "Je recommande iziFacture à TOUS mes élèves. C'est l'outil qui manquait aux entrepreneurs africains."

---

#### 6. SECTION TARIFICATION

3 plans avec le plan Pro mis en avant.

```
┌─────────────┬──────────────────┬─────────────┐
│ Plan        │ PLAN PRO ⭐      │ Plan        │
│ Gratuit     │ (Mis en avant)   │ Business    │
│             │                  │             │
│ 5 fact/mois │ Illimité         │ Illimité    │
│ 1 user      │ 5000 FCFA/mois   │ 15000 FCFA  │
│             │                  │ Multi-user  │
│ [Essayer]   │ [Démarrer] ★     │ [Contact]   │
└─────────────┴──────────────────┴─────────────┘
```

**Plans** :

| Feature | Gratuit | PRO ⭐ | Business |
|---------|---------|--------|----------|
| Factures/mois | 5 | Illimité | Illimité |
| Utilisateurs | 1 | 1 | 5+ |
| Stockage | 100 MB | 1 GB | 10 GB |
| Support | Email | Prioritaire | Dédié |
| **Prix/mois** | **Gratuit** | **5 000 FCFA** | **15 000 FCFA** |

**Plan Pro** doit être visuellement mis en avant (couleur accent, badge "Populaire", surélévé).

---

#### 7. SECTION CTA FINAL

Appel à action motivant avant le footer.

```
┌────────────────────────────────────────┐
│                                         │
│  "Rejoins les entrepreneurs qui         │
│   facturent comme des pros"            │
│                                         │
│  [Commencer gratuitement]              │
│                                         │
└────────────────────────────────────────┘
```

---

#### 8. FOOTER

```
┌────────────────────────────────────────┐
│ Logo iziFacture                        │
│                                         │
│ Navigation | Légal | Réseaux sociaux   │
│                                         │
│ "Fait avec fierté en Afrique 🌍"      │
│ © 2026 iziFacture. Tous droits réservés│
└────────────────────────────────────────┘
```

**Contenu** :
- Logo iziFacture
- Liens navigation : Accueil, Fonctionnalités, Tarifs, Contact
- Liens légaux : CGU, Politique de confidentialité
- Réseaux sociaux : Twitter, LinkedIn, Instagram
- Message : "Fait avec fierté en Afrique 🌍"

---

## Règles Techniques Globales

### 🎨 Design & Esthétique

1. **Inspiration visuelle** :
   - Analyser la capture d'écran fournie
   - Extraire : couleurs dominantes, typographie, espacement, style des cartes
   - Créer quelque chose d'ORIGINAL, pas une copie

2. **Texture et Profondeur** :
   - ❌ Jamais de fonds plats sans vie
   - ✅ Toujours de la profondeur : ombres, bordures subtiles, glassmorphism
   - Overlay de bruit SVG global (0.03-0.05 opacité)
   - Système de rayons cohérent (rounded-lg, rounded-xl, ou rounded-2xl)

3. **Espaces blancs** :
   - Design qui "respire"
   - Marges et padding généreux
   - Typographie contrastée (gros titres vs petit texte)

4. **Style** :
   - Professionnel et moderne
   - Pas de design générique d'IA
   - Chaque section a de la personnalité

### ⚙️ Spécifications Techniques

- **Format** : Un seul fichier HTML avec CSS et JavaScript intégrés (pour landing page)
- **Responsive** : Mobile-first design
- **Animations** :
  - Fade-in au scroll
  - Slide-up au scroll
  - Hover effects magnetiques sur boutons
- **Fonts** : Google Fonts (à choisir selon l'inspiration)
- **Images** : Placeholders stylisés ou icônes SVG
- **Code** : Propre, bien structuré, commenté

### 🎬 Micro-Interactions

- **Boutons** : 
  - `scale(1.02)` au hover
  - Transition couleur fluide
  - Effet "magnétique" avec span glissante
- **Cartes** :
  - `translateY(-2px)` + ombre renforcée au hover
  - Transition 200ms ease-out
- **Liens** : Underline animate + accent color au hover
- **Inputs** : Border accent au focus + ring subtil
- **Toggles/Switches** : Animation fluide avec spring effect
- **Modals** : Fade-in + scale(0.95 → 1) à l'ouverture + backdrop blur

---

## 📋 Checklist de Validation

Avant de démarrer chaque page, vérifiez :

- [ ] Style design cohérent avec dashboard
- [ ] Tous les éléments requis présents
- [ ] Données fictives réalistes et cohérentes
- [ ] Responsive sur mobile, tablette, desktop
- [ ] Animations douces et pertinentes
- [ ] Accessible (contraste, labels, ARIA)
- [ ] Performance optimale (lazy loading images)
- [ ] Code propre et commenté
- [ ] Pas de console errors/warnings

---

## 📝 Notes Finales

- **Ordre de construction recommandé** :
  1. Page Créer une facture (formulaire complexe)
  2. Page Clients (CRUD simple)
  3. Page Liste des factures (tableau + filtres)
  4. Page Détail facture (affichage)
  5. Landing page iziFacture (marketing)

- **Intégration de données** :
  - Utiliser localStorage ou Supabase selon l'architecture
  - Garder les données fictives pour le prototype
  - Migrations faciles vers backend réel

- **Testing** :
  - Créer une facture complète
  - Modifier et supprimer
  - Filtrer et rechercher
  - Vérifier les calculs TVA

---

**Version**: 1.0  
**Dernière mise à jour**: 2026-07-24  
**Status**: Prêt pour développement
