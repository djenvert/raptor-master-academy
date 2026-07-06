# Prompt de génération des personnages — Raptor Master Academy

Prompt utilisé pour transformer une **photo réelle** en sticker chibi, à joindre avec la photo
de la personne dans un générateur d'images (ChatGPT/DALL·E, Gemini « Nano Banana », etc.).

> ⚠️ Garder le **prompt de base identique** pour tous les personnages → c'est ce qui assure un
> rendu cohérent d'un sticker à l'autre. On n'ajuste que le petit bloc « tenue / pose ».

## Prompt de base

```
Transform the person in the attached photo into a die-cut cartoon sticker, in the exact style
of a chibi mascot: oversized head, small stylized body, bold black outlines, clean cel-shaded
coloring (2–3 tones per area, no photo gradients). Keep the person's recognizable face,
hairstyle, hair color and facial hair, but exaggerate into a cute caricature with a strong
expression. Full body, wearing a swim suit, standing, front three-quarter view, centered, with
navy cap with CNE written in bold white letters. Add a thick white sticker die-cut border
(glossy sticker look) around the whole character. Isolated on a fully transparent background —
no scene, no ground shadow. Square 1:1 composition, high resolution. True transparent PNG.
Alpha channel only outside the sticker. No checkerboard, no white background, no canvas. Only
the character with the thick white die-cut border. Fully transparent pixels outside the border.
```

## Variantes par personnage (à ajouter au prompt de base)

| Fichier | Perso | À ajouter |
|---|---|---|
| `arnaud.png` | Arnaud | `bright orange swimsuit, flexing one biceps, confident grin` |
| `leo.png` | Leo | `teal wetsuit, diving mask and snorkel on the head, fins, relaxed easy-going look` |
| `leo-dive.png` | Leo (plongée) | `underwater, seen from behind, surrounded by air bubbles` |
| `raph.png` | Raph | `bare muscular chest, red trunks, fierce war-cry face, one hand raised in a karate chop` |
| `camille.png` | Camille | `red swim trunks, holding a beer can, cheeky look` |
| `mafe.png` | Mafe | `long hair, breaststroke swimmer, dynamic pose, winking` |
| `zoe.png` | Zoé | `teal one-piece swimsuit, confident GOAT pose` |
| `theo.png` | Theo (coach) | `red lifeguard shorts and t-shirt, whistle around the neck, stopwatch in hand, strict face pointing a finger` |
| `hippo.png` | L'hippo | *(pas de photo)* `chubby purple-grey cartoon hippopotamus, big head, mouth open, goofy-mean expression` |

## Contraintes techniques
- Format **PNG-24 avec vraie transparence** (canal alpha), fond 100 % transparent.
- **512 × 512** ou **1024 × 1024** px (les portraits peuvent être plus hauts, ex. 1024 × 1536).
- Sujet centré, liseré blanc de sticker conservé (sert aussi au détourage).
- Nommer les fichiers **exactement** comme dans le tableau ci-dessus, dans `assets/`.

## Si le fond ressort en damier / non transparent
C'est souvent une **capture d'écran** au lieu du **téléchargement** du PNG. Re-télécharger le vrai
fichier, ou détourer (les régions claires reliées au bord = fond, puis reconstruire le liseré blanc).
