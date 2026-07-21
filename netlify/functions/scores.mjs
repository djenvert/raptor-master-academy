import { getStore } from "@netlify/blobs";

// Classements — stockés dans Netlify Blobs.
//   clé "top"  -> classement all-time (100 meilleurs conservés)
//   clé "week" -> { periodId, list } : classement de la semaine en cours
// La semaine repart de zéro chaque dimanche 20h (Europe/Paris) : pas de
// tâche planifiée, la bascule est détectée en comparant l'identifiant de
// période stocké à celui calculé au moment de la requête.
// GET  -> { all: [top10], week: [top10] }
// POST -> {name, score, char} : enregistre puis renvoie { all, week }

const KEY_ALL = "top";
const KEY_WEEK = "week";
const RETURN_N = 10;    // scores renvoyés au jeu
const MAX_STORED = 100; // scores conservés côté serveur (par classement)

// Identifiant de la semaine en cours : date (Europe/Paris) du dernier
// dimanche 20h, au format YYYY-MM-DD. Change à chaque dimanche 20h.
function currentPeriodId(now) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", hour12: false,
  });
  const parts = {};
  for (const p of fmt.formatToParts(now)) parts[p.type] = p.value;
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const d = wd[parts.weekday];
  const h = parseInt(parts.hour, 10);
  // Combien de jours reculer pour retomber sur le dimanche 20h de reset.
  let daysBack;
  if (d === 0) daysBack = h >= 20 ? 0 : 7; // dimanche : avant/après 20h
  else daysBack = d;                        // lun..sam : reculer jusqu'à dimanche
  const base = Date.UTC(+parts.year, +parts.month - 1, +parts.day);
  return new Date(base - daysBack * 86400000).toISOString().slice(0, 10);
}

// Liste hebdo courante ([] si la période stockée est périmée).
async function readWeek(store, periodId) {
  const w = (await store.get(KEY_WEEK, { type: "json" })) || {};
  return w.periodId === periodId && Array.isArray(w.list) ? w.list : [];
}

export default async (req) => {
  const store = getStore({ name: "leaderboard", consistency: "strong" });
  const periodId = currentPeriodId(new Date());

  if (req.method === "GET") {
    const all = (await store.get(KEY_ALL, { type: "json" })) || [];
    const week = await readWeek(store, periodId);
    return Response.json({
      all: all.slice(0, RETURN_N),
      week: week.slice(0, RETURN_N),
    });
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
    const entry = { name, char, score };

    // All-time
    const all = (await store.get(KEY_ALL, { type: "json" })) || [];
    all.push(entry);
    all.sort((a, b) => b.score - a.score);
    const topAll = all.slice(0, MAX_STORED);
    await store.setJSON(KEY_ALL, topAll);

    // Semaine en cours (repart de zéro si la période a changé)
    const week = await readWeek(store, periodId);
    week.push(entry);
    week.sort((a, b) => b.score - a.score);
    const topWeek = week.slice(0, MAX_STORED);
    await store.setJSON(KEY_WEEK, { periodId, list: topWeek });

    return Response.json({
      all: topAll.slice(0, RETURN_N),
      week: topWeek.slice(0, RETURN_N),
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
