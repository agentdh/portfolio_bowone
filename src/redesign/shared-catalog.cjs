"use strict";

const keyOf = row => String(row?.src || row?.url || "").trim().replace(/^\.\//, "").normalize("NFC");
const validGrid = /^[a-zA-Z0-9_-]+$/;
const mediaFolders = /^(?:thumbnail|illustration|3d|live2d|pixelart|minecraft|animation-video|branding)\//;

function applyOrder(rows, order) {
  const byKey = new Map(rows.map(row => [keyOf(row), row]));
  const kept = [...new Set(Array.isArray(order) ? order : [])].map(key => byKey.get(key)).filter(Boolean);
  const ordered = new Set(kept);
  // Explicit order only affects cards the user arranged. New additions keep their slots.
  let i = 0;
  return rows.map(row => ordered.has(row) ? kept[i++] : row);
}

function readSharedSnapshot(current, fallback) {
  const portfolio = current?.portfolio;
  if (!portfolio || typeof portfolio !== "object" || Array.isArray(portfolio)) return null;
  const grids = Object.entries(portfolio);
  if (!grids.length || !grids.every(([grid, rows]) => validGrid.test(grid) && Array.isArray(rows))) return null;
  if (!grids.some(([,rows]) => rows.some(row => keyOf(row)))) return null;
  const overrides = current.bowoneEditor?.version === 1 ? current.bowoneEditor : {};
  const merged = {};
  for (const [grid, rows] of grids) {
    const before = new Map((fallback?.portfolio?.[grid] || []).map(row => [keyOf(row), row]));
    const seen = new Set();
    const valid = rows.flatMap(row => {
      const key = keyOf(row);
      if (!key || seen.has(key)) return [];
      seen.add(key);
      const saved = before.get(key);
      const result = {...saved, ...row};
      if (typeof result.showTitle !== "boolean") result.showTitle = true;
      if (mediaFolders.test(key) && result.sharedMedia!==true) {
        result.sharedMedia = true;
        delete result.sharedRef;
      }
      return [result];
    });
    merged[grid] = applyOrder(valid, overrides.orders?.[grid]);
  }
  return {profile: {...fallback?.profile, ...current.profile}, portfolio: merged, editorSettings: overrides.settings};
}

async function fetchSharedSnapshot(url, fallback) {
  const response = await fetch(url, {credentials:"omit", cache:"no-cache", signal:AbortSignal.timeout(6000)});
  if (!response.ok) throw new Error("Shared portfolio request failed: " + response.status);
  return readSharedSnapshot(await response.json(), fallback);
}

module.exports = { readSharedSnapshot, fetchSharedSnapshot };
