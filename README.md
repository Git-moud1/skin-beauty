# Skin Beauty — Boutique Beauté Coréenne 🇰🇷

Boutique e‑commerce complète et professionnelle pour la vente de produits de beauté
et de soins coréens. Design élégant et féminin (blanc / bleu marine / rose), bilingue
**Arabe (RTL)** et **Français (LTR)**, prix en **Ouguiya (MRU / أوقية)**.

Complete, professional e‑commerce store for Korean beauty & skincare. Elegant feminine
design, fully bilingual Arabic/French, prices in Mauritanian Ouguiya.

---

## ⚙️ Prérequis / Requirements

- **Node.js 18+** (testé avec Node 24). Vérifier : `node --version`

## 🚀 Démarrer / Run

Ouvrir un terminal dans ce dossier, puis :

```bash
# 1) Installer les dépendances (une seule fois)
npm install

# 2a) Mode développement (recommandé pour usage local)
npm run dev

# 2b) OU mode production
npm run build
npm run start
```

Puis ouvrir dans le navigateur : **http://localhost:3000**

> Le port par défaut est 3000. Pour un autre port : `PORT=4000 npm run dev`.

---

## 👑 Compte propriétaire (Admin)

Le compte propriétaire est créé par `scripts/init-db.js` à partir de vos variables
d'environnement — aucun identifiant n'est stocké dans ce dépôt.

Dans `.env.local` (voir `.env.example`) :

```bash
ADMIN_PHONE=votre-numero
ADMIN_PASSWORD=un-mot-de-passe-long-et-unique
```

Puis lancez le script d'initialisation. Le mot de passe reste modifiable ensuite
depuis le tableau de bord.

Après connexion, un lien **« Tableau de bord »** apparaît dans le menu.

### Le tableau de bord permet de :
- **Commandes** — voir chaque commande (produit, prix, nom + téléphone du client, date),
  contacter le client sur **WhatsApp** en un clic, et marquer comme *vue* / *terminée*.
  Un **badge rouge** signale les nouvelles commandes (actualisation automatique).
- **Produits** — ajouter / modifier / supprimer un produit (image, nom, prix, description).
- **Paramètres** — modifier les liens de contact et réseaux sociaux (WhatsApp, Snapchat,
  Facebook, TikTok) affichés dans le pied de page.
- **Compte** — changer le nom, le téléphone et le **mot de passe** du propriétaire.

---

## 🛍️ Côté client

- Tous les produits s'affichent immédiatement dans une grille élégante (zoom au survol).
- Bouton **« Acheter »** → l'utilisateur crée un compte ou se connecte
  (**téléphone + mot de passe**, sans e‑mail), puis la commande est envoyée au propriétaire.
- Le client peut voir ses commandes et modifier son compte / mot de passe.
- Bouton **langue FR / ع** en haut à droite — tout bascule en Arabe (RTL) ou Français (LTR),
  sans aucun mélange entre les deux langues.

---

## 📞 Contacts par défaut (modifiables dans le tableau de bord)

- **WhatsApp** : `48011609`
- **Snapchat** : `routin4801`
- **Facebook / TikTok** : à renseigner dans *Paramètres*

---

## 🔒 Sécurité & données

- Mots de passe **hachés** (bcrypt) — jamais stockés en clair.
- Sessions via cookie **httpOnly** signé (JWT).
- Base de données **SQLite** locale : `data/store.db` (créée automatiquement).
- Images des produits : `data/uploads/` (servies via l'application).

> Le dossier `data/` contient toute la base (produits, comptes, commandes) et les images.
> **Faites-en une sauvegarde régulière.** Le supprimer réinitialise la boutique
> (recrée le compte propriétaire et des produits d'exemple).

### Déploiement en HTTPS (optionnel)
Si vous hébergez le site derrière **HTTPS**, définissez ces variables d'environnement :

```
COOKIE_SECURE=1
SESSION_SECRET=une-longue-phrase-secrete-unique
```

---

## 🧱 Stack technique

Next.js 16 (App Router) · React 19 · Tailwind CSS · better‑sqlite3 · bcryptjs · jose (JWT).
