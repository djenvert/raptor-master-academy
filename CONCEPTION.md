# Conception — Raptor Master Academy

Document de référence du jeu (à jour v1.9). Le plan initial (v1.0) est obsolète : ce fichier
fait foi. Le changelog utilisateur est dans [README.md](README.md).

## Vue d'ensemble
Jeu d'arcade façon *Frogger* : un nageur se déplace latéralement entre **5 lignes d'eau** et
esquive les hippos qui descendent vers lui. Il commence avec **3 vies**, le **score** monte avec
le temps (~10 m/s). Tout tient dans un seul fichier **`index.html`** (Canvas + JavaScript vanilla),
plus un backend serverless pour le classement mondial.

## Boucle de jeu
- Écrans : **menu** (saisie du nom, classement, choix du nageur) → **partie** → **game over** (rejouer).
- Déplacement : flèches **← →** (clavier) ou boutons tactiles ; **⚡ / Espace** = pouvoir spécial ; **M** = son.
- Collision avec un hippo = −1 vie + brève invincibilité. 0 vie = game over.
- Rendu : boucle `requestAnimationFrame` avec delta-time → `update(dt)` + `render()`.

## Personnages
Chacun a un pouvoir (atout) et une faiblesse. Sprites stickers avec repli emoji.

| Nageur | Pouvoir | Faiblesse |
|---|---|---|
| **Arnaud** | Saute 2 lignes d'un coup ; ⚡ = petit dash de 2 lignes | Aucune — le GOAT |
| **Leo** | Plongée ~1,5 s : passe sous les hippos | Nage sur le dos → les hippos surgissent tard |
| **Raph** | Découpe l'hippo droit devant lui | Remous : 2 appuis pour changer de ligne |
| **Camille** | Jet de canette qui détruit le 1er hippo devant — **6 canettes/niveau** | De plus en plus lent au fil de la partie |
| **Mafe** | Se déplace très vite (déplacement continu si on maintient) | Brasse : rebondit d'une ligne vers l'intérieur si elle reste >1 s sur une ligne extérieure |
| **Zoé** | Saute 2 lignes d'un coup (clone d'Arnaud) | Aucune — la GOAT |
| **Yannick** | Pas besoin d'entraînement : démarre direct au **niveau 10** | …démarre direct au niveau 10 (difficulté brutale d'entrée) — atout = faiblesse |

## Le coach Theo (pénalité)
- Rester **> 5 s cumulées** dans les **2 lignes de droite** (index 3 et 4) déclenche la pénalité.
- Pénalité : **dos à deux bras pendant 10 s** (déplacements très lents) + bandeau d'alerte.
- Au déclenchement, **Theo apparaît en grand** sur presque tout l'écran (~2,5 s, semi-transparent,
  dessiné derrière les hippos pour rester jouable).

## Médailles (vies bonus)
- Apparition aléatoire (toutes les 4,5–8 s), tombent un peu plus lentement que les hippos.
- Rareté : 🥉 bronze 60 % · 🥈 argent 30 % · 🥇 or 10 %.
- Vie bonus en complétant : **1 or**, **2 argent** ou **3 bronze**. Compteurs affichés dans le HUD.

## Niveaux, difficulté & bonus
- Un niveau toutes les **16 s** ; à chaque palier les hippos vont **plus vite** et **plus souvent**.
- Courbe volontairement raide : la vitesse du **niveau 4 ≈ ancien niveau 10**.
- Bonus **« moins de coups de bras »** : finir un niveau en **< 15 mouvements** (changements de ligne) = **+100 m**.

## Classement
- **Nom du joueur** mémorisé (`localStorage`), défaut « Nageur loisir ».
- **Deux classements en ligne**, avec bascule par **onglets** (menu + game over) et le nageur entre parenthèses :
  - **Cette semaine** — repart de zéro chaque **dimanche 20h (Europe/Paris)** ; **onglet par défaut**.
  - **Top 10 all-time** — cumul de tous les scores depuis toujours.
- Repli **Top 5 local** (hors-ligne) : les onglets se masquent, un seul classement affiché.
- En ligne = fonction Netlify `scores.mjs` + **Netlify Blobs** (clés `top` et `week`). GET/POST
  renvoient `{ all, week }`. Chaque score joué alimente les deux listes.
- Reset hebdo **sans tâche planifiée** : le serveur calcule à chaque requête l'identifiant de la
  semaine (`periodId` = date du dernier dimanche 20h Paris, DST géré via `Intl`) ; si celui stocké
  diffère, la liste `week` est considérée périmée et repart vide.
- Anti-triche léger (bornage des scores) ; les scores viennent du navigateur, donc falsifiables.

## Constantes réglables (haut du `<script>` dans `index.html`)
| Constante | Valeur | Rôle |
|---|---|---|
| `LANES` | 5 | nombre de lignes d'eau |
| `BASE_HIPPO_SPEED` | 190 | vitesse des hippos au niveau 1 (px/s) |
| `LEVEL_TIME` | 16 | secondes par niveau |
| `SPEED_PER_LEVEL` | 72 | vitesse ajoutée par niveau |
| `SPAWN_PER_LEVEL` | 0.39 | réduction de l'intervalle de spawn par niveau |
| `SYLVIE_LIMIT` | 5 | secondes à droite avant la pénalité |
| `PENALTY_TIME` | 10 | durée de la pénalité (dos à deux bras) |
| `COACH_BIG_TIME` | 2.5 | durée d'apparition du coach en grand |
| `FEW_MOVES_THRESHOLD` | 15 | mouvements max pour le bonus |
| `FEW_MOVES_BONUS` | 100 | mètres offerts par le bonus |
| `MEDAL_TYPES` | — | rareté et seuils des médailles |

Réglages par nageur dans l'objet `CHARACTERS` (`jump`, `moveCd`, `diveTime`, `doubleTap`,
`canThrow`, `cansPerLevel`, `slowdown`, `fastMove`, `bounceOuter`, `lateVision`, `startLevel`,
`color`, `img`). `startLevel` (Yannick = 10) cale `level` et `elapsed` au démarrage.

## Graphismes & assets
- Stickers chibi générés à partir de photos réelles — voir [assets/PROMPT.md](assets/PROMPT.md).
- Chargeur d'images : chaque PNG de `assets/` remplace la pastille emoji ; repli automatique sinon.
- Fichiers : `arnaud.png`, `leo.png`, `leo-dive.png`, `raph.png`, `camille.png`, `mafe.png`,
  `zoe.png`, `theo.png`, `hippo.png`, `raptor.png` (logo/favicon).

## Architecture des fichiers
```
index.html              → tout le jeu (Canvas + JS + audio 8-bit inline)
assets/                 → stickers PNG + PROMPT.md
netlify/functions/scores.mjs → classement mondial (GET/POST, Netlify Blobs)
netlify.toml            → publish "." + dossier de fonctions
package.json            → dépendance @netlify/blobs
README.md               → présentation + changelog
CONCEPTION.md           → ce document
```

## Déploiement
Hébergé sur **Netlify**, connecté au dépôt GitHub. Chaque `git push` sur `main` redéploie
(site statique + build de la fonction). URL : https://raptor-master-academy.netlify.app
