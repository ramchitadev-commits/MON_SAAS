# Configuration des Variables d'Environnement sur Vercel

## 📋 Checklist Complète

Tu dois configurer **6 variables d'environnement** sur Vercel dans les **3 environnements**: Production, Preview, Development.

**Total: 18 variables à créer** (6 × 3 environnements)

---

## 🔧 Configuration Vercel

### Étape 1 : Accès au Dashboard Vercel
1. Va à https://vercel.com/dashboard
2. Ouvre ton projet `mon-projet-saas-doolee`
3. Clique sur **Settings** (en haut à droite)
4. Va à **Environment Variables** (dans le menu gauche)

### Étape 2 : Ajouter les 6 Variables

Pour chaque variable ci-dessous, clique sur **"Add New"** et configure-la pour les **3 environnements**:
- ☑️ Production
- ☑️ Preview  
- ☑️ Development

---

## 📝 Variables à Configurer

### 1. SUPABASE - URL (Public)
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```
- Récupère-la depuis: https://app.supabase.com > Project Settings > API > URL

### 2. SUPABASE - Clé Anon (Public)
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Récupère-la depuis: https://app.supabase.com > Project Settings > API > anon key
- ⚠️ Ne confonds pas avec service_role_key

### 3. SUPABASE - Clé Service-Role (Privée - Serveur)
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Récupère-la depuis: https://app.supabase.com > Project Settings > API > service_role key
- ⚠️ JAMAIS exposer au client, reste secret serveur

### 4. APP URL (Public)
```
Name:  NEXT_PUBLIC_APP_URL

Production:  https://doole.sn (ou ton domaine)
Preview:     https://mon-projet-saas-doolee-[preview].vercel.app
Development: http://localhost:3000
```

### 5. BREVO - API Key (Privée - Serveur)
```
Name:  BREVO_API_KEY
Value: xkeysib-...
```
- Récupère-la depuis: https://app.brevo.com > Settings > API Keys > SMTP

### 6. BREVO - Sender (Privée - Serveur)
```
Name:  BREVO_SMS_SENDER
Value: Doole
```

### 7. MONEROO - API Key (Privée - Serveur)
```
Name:  MONEROO_API_KEY
Value: sk_live_...
```
- Récupère-la depuis: https://dashboard.moneroo.io > Settings > API Keys

### 8. MONEROO - Webhook Secret (Privée - Serveur)
```
Name:  MONEROO_WEBHOOK_SECRET
Value: whsec_...
```
- Récupère-la depuis: https://dashboard.moneroo.io > Settings > Webhooks

---

## ✅ Tableau de Vérification

Copie ce tableau et marque les cases au fur et à mesure:

```
NEXT_PUBLIC_SUPABASE_URL
☐ Production  ☐ Preview  ☐ Development

NEXT_PUBLIC_SUPABASE_ANON_KEY
☐ Production  ☐ Preview  ☐ Development

SUPABASE_SERVICE_ROLE_KEY
☐ Production  ☐ Preview  ☐ Development

NEXT_PUBLIC_APP_URL
☐ Production  ☐ Preview  ☐ Development

BREVO_API_KEY
☐ Production  ☐ Preview  ☐ Development

BREVO_SMS_SENDER
☐ Production  ☐ Preview  ☐ Development

MONEROO_API_KEY
☐ Production  ☐ Preview  ☐ Development

MONEROO_WEBHOOK_SECRET
☐ Production  ☐ Preview  ☐ Development
```

---

## 🧪 Vérifier la Configuration

Après avoir configuré les variables sur Vercel:

1. **Redéploie** le projet: `git push` déclenchera un nouveau build
2. **Attends le déploiement** (~3-5 min)
3. **Teste la page d'accueil**: https://mon-projet-saas-doolee-[...].vercel.app
   - ✅ Si la page charge sans erreur → Configuration OK
   - ❌ Si erreur "Failed to fetch" → Vérifie les variables

### Vérifier dans la Console

Ouvre les logs du déploiement Vercel:
1. Va à **Deployments** dans ton projet
2. Clique sur le dernier déploiement
3. Va à **Functions** (si applicable) ou regarde les logs
4. Tu devrais voir: `✅ Configuration environnement validée avec succès.`

---

## 🚨 Troubleshooting

### Erreur "Failed to fetch" ou "Server Components render error"
- ✅ Vérifie que **TOUTES les 8 variables** sont configurées
- ✅ Vérifie qu'elles sont dans les **3 environnements** (Production, Preview, Development)
- ✅ Redéploie après chaque changement: `git push`

### Erreur "Variables Supabase manquantes"
- La clé NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY est vide
- Récupère-la depuis Supabase Dashboard

### Erreur "MONEROO_API_KEY manquante"
- La clé MONEROO_API_KEY est vide
- Récupère-la depuis Moneroo Dashboard
- Assure-toi qu'elle est dans l'environnement serveur

---

## 📌 Important

- **Ne commit JAMAIS** les clés secrètes dans le code
- Les clés privées (SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, etc.) sont protégées par Vercel
- Les variables NEXT_PUBLIC_* sont exposées au client (c'est intentionnel et safe pour Supabase anon key)
- Après chaque changement, **redéploie** pour que les variables soient prises en compte

---

## 🎉 Quand tu as fini

Marque ce fichier comme "DONE" et passe au test fonctionnel!
