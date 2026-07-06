import { getStore } from "@netlify/blobs";

// Classement mondial — stocké dans Netlify Blobs (clé unique "top").
// GET  -> renvoie les 10 meilleurs scores
// POST -> {name, score, char} : enregistre puis renvoie les 10 meilleurs

const KEY = "top";
const RETURN_N = 10;   // scores renvoyés au jeu
const MAX_STORED = 100; // scores conservés côté serveur

export default async (req) => {
  const store = getStore({ name: "leaderboard", consistency: "strong" });

  if (req.method === "GET") {
    const list = (await store.get(KEY, { type: "json" })) || [];
    return Response.json(list.slice(0, RETURN_N));
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("bad json", { status: 400 });
    }

    // Validation / garde-fous anti-valeurs aberrantes
    const name = String(body?.name ?? "Nageur loisir").trim().slice(0, 16) || "Nageur loisir";
    const char = String(body?.char ?? "—").trim().slice(0, 16) || "—";
    const score = Math.floor(Number(body?.score));
    if (!Number.isFinite(score) || score < 0 || score > 100000) {
      return new Response("bad score", { status: 400 });
    }

    const list = (await store.get(KEY, { type: "json" })) || [];
    list.push({ name, char, score });
    list.sort((a, b) => b.score - a.score);
    const top = list.slice(0, MAX_STORED);
    await store.setJSON(KEY, top);
    return Response.json(top.slice(0, RETURN_N));
  }

  return new Response("Method not allowed", { status: 405 });
};
