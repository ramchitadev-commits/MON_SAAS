# Guide d'Utilisation du Système de Variables d'Environnement

## 📌 Vue d'Ensemble

Le projet utilise un **système centralisé** de gestion des variables d'environnement dans `src/lib/env.ts`.

### Avantages:
✅ Validation automatique au démarrage  
✅ Erreurs claires en console si variables manquent  
✅ Export centralisé = facile à auditer  
✅ Séparation public/privé = pas de fuite de secrets  
✅ Pas besoin de `process.env` partout dans le code  

---

## 🔴 CE QU'IL NE FAUT PAS FAIRE

```typescript
// ❌ MAUVAIS - Accès direct à process.env
const apiKey = process.env.BREVO_API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

---

## 🟢 CE QU'IL FAUT FAIRE

### 1. Pour les Variables PUBLIQUES (côté client)

```typescript
// ✅ BON - Importer depuis env.ts
import { publicEnv } from '@/lib/env';

const supabaseUrl = publicEnv.SUPABASE_URL;
const appUrl = publicEnv.APP_URL;

// Vérifier qu'une variable existe avant de l'utiliser
import { hasPublicEnv } from '@/lib/env';

if (hasPublicEnv('SUPABASE_URL')) {
  // Variable OK, on peut l'utiliser
}
```

### 2. Pour les Variables PRIVÉES (côté serveur)

```typescript
// ✅ BON - Importer depuis env.ts
import { getPrivateEnv, privateEnv } from '@/lib/env';
import 'server-only'; // Garde côté serveur

// Accès direct pour toutes les variables
const brevoKey = getPrivateEnv('BREVO_API_KEY');
const monerooKey = getPrivateEnv('MONEROO_API_KEY');
const smssender = privateEnv.BREVO_SMS_SENDER;

// ❌ NE PAS APPELER getPrivateEnv() côté client
// Cela lèvera une erreur: "Impossible d'accéder à des variables privées côté client"
```

---

## 📋 Exemple Complet

### Scenario: Créer une Server Action qui envoie un SMS

```typescript
// src/app/actions/sendWelcomeSms.ts
'use server';

import { getPrivateEnv } from '@/lib/env';
import { publicEnv } from '@/lib/env';
import 'server-only';

export async function sendWelcomeSms(phone: string) {
  // Variables privées - OK côté serveur
  const brevoApiKey = getPrivateEnv('BREVO_API_KEY');
  const appUrl = publicEnv.APP_URL; // OK aussi
  
  const smsText = `Bienvenue! Visite ${appUrl}`;
  
  const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: phone,
      content: smsText,
      sender: 'Doole',
    }),
  });
  
  return response.ok;
}
```

### Scenario: Afficher l'URL de la boutique côté client

```typescript
// src/components/ShopLink.tsx
'use client';

import { publicEnv } from '@/lib/env';

export function ShopLink({ slug }: { slug: string }) {
  const shopUrl = `${publicEnv.APP_URL}/${slug}`;
  
  return (
    <a href={shopUrl} target="_blank">
      Visiter ma boutique
    </a>
  );
}
```

---

## 🚀 Validation au Démarrage

Quand l'app démarre, `validateEnv()` est appelée dans `middleware.ts`:

```
✅ Configuration environnement validée avec succès.
```

Si une variable manque, tu verras:

```
🚨 ERREUR DE CONFIGURATION ENVIRONNEMENT:
❌ NEXT_PUBLIC_SUPABASE_URL manquante ou vide
❌ BREVO_API_KEY manquante ou vide (serveur seulement)

Vérifiez votre fichier .env.local ou configurez les variables sur Vercel.
```

---

## 📝 Ajouter une Nouvelle Variable

Si tu dois ajouter une nouvelle variable d'environnement:

### Étape 1: Édite `src/lib/env.ts`

```typescript
// Ajoute à publicEnv ou privateEnv
export const publicEnv = {
  // ... existantes ...
  MA_NOUVELLE_VAR: process.env.NEXT_PUBLIC_MA_NOUVELLE_VAR || '',
} as const;

// Ajoute à la liste des variables requises
const REQUIRED_PUBLIC_VARS = [
  // ... existantes ...
  'NEXT_PUBLIC_MA_NOUVELLE_VAR',
] as const;
```

### Étape 2: Ajoute au fichier `.env.local`

```
NEXT_PUBLIC_MA_NOUVELLE_VAR=ma_valeur
```

### Étape 3: Ajoute à Vercel

Settings > Environment Variables > Add New
- Name: `NEXT_PUBLIC_MA_NOUVELLE_VAR` (ou `MA_NOUVELLE_VAR` si privée)
- Value: ta_valeur
- Scope: Production, Preview, Development

### Étape 4: Utilise-la dans le code

```typescript
import { publicEnv } from '@/lib/env';
const value = publicEnv.MA_NOUVELLE_VAR;
```

---

## 🔐 Sécurité

- **Variables NEXT_PUBLIC_*** : Exposées au client (safe - pas d'infos sensibles)
- **Autres variables** : Côté serveur uniquement (secret)
- **Ne commit JAMAIS** .env.local ou les clés
- **Vercel** chiffre les variables privées automatiquement

---

## ✅ Checklist pour Tous les Développeurs

- [ ] J'importe depuis `src/lib/env` au lieu de `process.env`
- [ ] J'utilise `publicEnv` côté client
- [ ] J'utilise `getPrivateEnv()` côté serveur (avec `'server-only'`)
- [ ] Je n'expose JAMAIS les clés privées au client
- [ ] Je configure les variables sur Vercel avant de déployer
- [ ] Je redéploie après avoir changé les variables

---

## 📞 Support

Si tu as une erreur "Failed to fetch" ou "Server Components render error":
1. Vérifie que tous les variables sont dans `src/lib/env.ts`
2. Regarde les logs en console (tu verras `🚨 ERREUR DE CONFIGURATION ENVIRONNEMENT` si quelque chose manque)
3. Assure-toi que les variables sont sur Vercel dans les 3 environnements
4. Redéploie (`git push`)
