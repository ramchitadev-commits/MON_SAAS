<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🤖 Règles de Code de l'Agent — Doolé

Ces règles s'appliquent à tous les agents IA intervenant sur le projet Doolé. Elles doivent être respectées de manière stricte pour maintenir la cohérence visuelle et technique.

## 1. Respect du Système de Design (Flat & Notion)
*   Consultez et appliquez rigoureusement la charte graphique définie dans [planning_design-doole.md](file:///c:/Users/hp/Desktop/Mon_projet_saas_doolee/planning_design-doole.md).
*   **Interdiction d'utiliser des dégradés (`bg-gradient-to-...`)** ou des ombres floues (`shadow-lg`, `shadow-xl`) pour faire moderne/tech générique.
*   Utilisez des **bordures plates** (`border border-slate-200` ou `border-2 border-black`) et des **ombres décalées plates** (`shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`).
*   Privilégiez les aplats de couleurs pures (Emerald Green, Wave Blue, Orange Money, Noir, Blanc chaud `#FCFCFB`).

## 2. Approche Mobile-First & Performance 3G
*   Toute nouvelle interface doit être conçue en **mobile-first** avant d'être adaptée aux tablettes et ordinateurs.
*   Assurez-vous que toutes les cibles tactiles (boutons, liens) mesurent au moins **`48px`** de hauteur sur mobile.
*   N'importez pas de polices web tierces (Google Fonts). Utilisez la pile de polices système de Notion définie dans la charte.
*   Optimisez le chargement des images via `next/image` et lazy loading.

## 3. Architecture & Librairies
*   **Pas de librairies de composants lourdes** (pas de Radix UI complet, pas de DaisyUI, etc.). Coder des composants Tailwind personnalisés simples et propres.
*   **Zod** doit être utilisé pour valider systématiquement toutes les données entrantes (Server Actions, formulaires, payloads de webhooks).
*   Conservez la logique de stockage local dans `localStorage` via `src/lib/mockData.ts` pour les démonstrations de prototype, sauf si l'étape d'intégration Supabase est explicitement lancée.
*   Ne modifiez pas l'arborescence des dossiers ou l'architecture de routage sans plan validé au préalable par l'utilisateur.
