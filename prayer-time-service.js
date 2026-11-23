/* Online calendar acquisition and source priority. The core remains usable offline. */
(function (root, factory) {
  const api = factory(typeof module === "object" && module.exports ? require("./prayer-time-core.js") : root.NuriPrayerTimes);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NuriPrayerService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core) {
  "use strict";
  const METHOD_IDS = Object.freeze([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  const PREFIX = "niApiMonth:v1:";
  const fields = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  function preferences(city, proposed = {}) {
    const method = Number(proposed.method ?? city.method ?? 3);
    const school = Number(proposed.school ?? city.school ?? 0);
    const cityMethod = Number(city.method);
    return { method: METHOD_IDS.includes(method) ? method : METHOD_IDS.includes(cityMethod) ? cityMethod : 3,
      school: school === 1 ? 1 : school === 0 ? 0 : city.school === 1 ? 1 : 0 };
  }

  function monthKey(city, date, prefs) {
    const p = preferences(city, prefs);
    return PREFIX + [city.id, city.lat.toFixed(6), city.lon.toFixed(6), city.timezone,
      date.y, core.pad(date.m), p.method, p.school].join("|");
  }

  function calendarUrl(city, date, prefs) {
    const p = preferences(city, prefs);
    const query = new URLSearchParams({ latitude: String(city.lat), longitude: String(city.lon),
      method: String(p.method), school: String(p.school), timezonestring: city.timezone,
      latitudeAdjustmentMethod: "3" });
    if (p.method === 15) query.set("shafaq", "general");
    return `https://api.aladhan.com/v1/calendar/${date.y}/${date.m}?${query}`;
  }

  function parseApiClock(value) {
    if (typeof value !== "string") return null;
    const match = /^(\d{1,2}):([0-5]\d)(?:\s*\([^)]*\))?$/.exec(value.trim());
    if (!match) return null;
    const hour = Number(match[1]);
    return hour <= 23 ? hour * 60 + Number(match[2]) : null;
  }
  function validEvents(times, date, city) {
    return core.validTimes(times) && core.ORDER.every(key =>
      Number.isFinite(core.zonedEventMs(date, times[key], city.timezone)));
  }

  function parseMonth(payload, city, date, prefs) {
    if (!core.validCity(city) || !core.validDate(date.y, date.m, 1) || payload?.code !== 200 || !Array.isArray(payload.data)) return null;
    const expectedDays = new Date(Date.UTC(date.y, date.m, 0)).getUTCDate();
    if (payload.data.length !== expectedDays) return null;
    const requested = preferences(city, prefs), days = {};
    for (const entry of payload.data) {
      const parts = /^(\d{2})-(\d{2})-(\d{4})$/.exec(entry?.date?.gregorian?.date || "");
      if (!parts || +parts[2] !== date.m || +parts[3] !== date.y || !core.validDate(date.y, date.m, +parts[1])) return null;
      const day = +parts[1], meta = entry.meta;
      if (!meta || meta.timezone !== city.timezone || +meta.method?.id !== requested.method ||
          (requested.school === 1 ? meta.school !== "HANAFI" : meta.school !== "STANDARD") ||
          !Number.isFinite(+meta.latitude) || !Number.isFinite(+meta.longitude) ||
          Math.abs(+meta.latitude - city.lat) > 0.02 || Math.abs(+meta.longitude - city.lon) > 0.02) return null;
      const times = Object.fromEntries(core.ORDER.map((key, i) => [key, parseApiClock(entry.timings?.[fields[i]])]));
      if (times.isha !== null && times.maghrib !== null && times.isha <= times.maghrib) times.isha += 1440;
      if (!validEvents(times, { y: date.y, m: date.m, d: day }, city) || days[day]) return null;
      days[day] = times;
    }
    return Object.keys(days).length === expectedDays ? days : null;
  }

  function createService({ fetchImpl = globalThis.fetch, storage = globalThis.localStorage,
    timetableIndex = new Map(), communityIndex = new Map(), timeoutMs = 9000 } = {}) {
    const fresh = new Map(), cached = new Map(), pending = new Map(), failedAt = new Map();
    let localTimetable = timetableIndex, communityTimetable = communityIndex;
    const readCache = key => {
      if (cached.has(key)) return cached.get(key);
      let days = null;
      try {
        const record = JSON.parse(storage?.getItem(key) || "null");
        const keyParts = key.slice(PREFIX.length).split("|");
        const expectedDays = new Date(Date.UTC(+keyParts[4], +keyParts[5], 0)).getUTCDate();
        if (record?.key === key && record.days && typeof record.days === "object" &&
            Object.keys(record.days).length === expectedDays &&
            Array.from({ length: expectedDays }, (_, i) => {
              const date = { y: +keyParts[4], m: +keyParts[5], d: i + 1 };
              return validEvents(record.days[i + 1], date, { timezone: keyParts[3] });
            }).every(Boolean)) days = record.days;
      } catch { /* Private mode and full storage fall back safely. */ }
      cached.set(key, days);
      return days;
    };
    const saveCache = (key, days) => {
      cached.set(key, days);
      try {
        storage?.setItem(key, JSON.stringify({ key, savedAt: Date.now(), days }));
        const keys = [];
        for (let i = 0; i < storage.length; i++) {
          const candidate = storage.key(i);
          if (candidate?.startsWith(PREFIX)) keys.push(candidate);
        }
        if (keys.length > 36) {
          keys.sort((a, b) => {
            const time = k => { try { return JSON.parse(storage.getItem(k)).savedAt || 0; } catch { return 0; } };
            return time(a) - time(b);
          });
          keys.slice(0, keys.length - 36).forEach(k => storage.removeItem(k));
        }
      } catch { /* In-memory data still works for this session. */ }
    };
    const resolveCalculated = (date, city, prefs = {}) => {
      if (!core.validCity(city) || !core.validDate(date.y, date.m, date.d)) return { times: null, source: "unavailable" };
      const key = monthKey(city, date, prefs), day = String(date.d);
      const live = fresh.get(key)?.[day];
      if (core.validTimes(live)) return { times: live, source: "api" };
      const saved = readCache(key)?.[day];
      if (core.validTimes(saved)) return { times: saved, source: "cached_api" };
      return core.getPrayerTimes(date, city, new Map(), prefs.school);
    };
    const communityFor = (date, city) => {
      if (date.y < 2026 || date.m === 2 && date.d === 29) return null;
      const key = `${city.id}|2026|${core.pad(date.m)}-${core.pad(date.d)}`;
      const entry = communityTimetable.get(key);
      return validEvents(entry?.times, date, city) ? entry : null;
    };
    const resolve = (date, city, prefs = {}) => {
      if (!core.validCity(city) || !core.validDate(date.y, date.m, date.d)) return { times: null, source: "unavailable" };
      const local = core.getPrayerTimes(date, city, localTimetable, prefs.school);
      if (local.source === "timetable" && validEvents(local.times, date, city)) return local;
      const community = communityFor(date, city);
      if (community) return { times: community.times,
        source: date.y === 2026 ? "bang_community" : "bang_community_recurring" };
      return resolveCalculated(date, city, prefs);
    };
    const ensureMonth = (date, city, prefs = {}) => {
      if (!core.validCity(city) || !core.validDate(date.y, date.m, 1)) return Promise.resolve(false);
      const daysInMonth = new Date(Date.UTC(date.y, date.m, 0)).getUTCDate();
      if (Array.from({ length: daysInMonth }, (_, i) => {
        const day = { y: date.y, m: date.m, d: i + 1 };
        const approved = localTimetable.get(`${city.id}|${date.y}|${core.pad(date.m)}-${core.pad(i + 1)}`);
        return validEvents(approved?.times, day, city) || !!communityFor(day, city);
      }).every(Boolean)) return Promise.resolve(true);
      const key = monthKey(city, date, prefs);
      if (fresh.has(key)) return Promise.resolve(true);
      if (pending.has(key)) return pending.get(key);
      if (Date.now() - (failedAt.get(key) || 0) < 5 * 60000) return Promise.resolve(false);
      const work = (async () => {
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetchImpl(calendarUrl(city, date, prefs), { signal: controller.signal, mode: "cors", cache: "no-store" });
          if (!response.ok) { failedAt.set(key, Date.now()); return false; }
          const days = parseMonth(await response.json(), city, date, prefs);
          if (!days) { failedAt.set(key, Date.now()); return false; }
          fresh.set(key, days);
          failedAt.delete(key);
          saveCache(key, days);
          return true;
        } catch { failedAt.set(key, Date.now()); return false; }
        finally { clearTimeout(timer); pending.delete(key); }
      })();
      pending.set(key, work);
      return work;
    };
    return { resolve, resolveCalculated, ensureMonth, retryFailed: () => failedAt.clear(),
      setTimetableIndex: index => { localTimetable = index instanceof Map ? index : new Map(); },
      setCommunityIndex: index => { communityTimetable = index instanceof Map ? index : new Map(); },
      monthKey, calendarUrl };
  }

  return { METHOD_IDS, preferences, monthKey, calendarUrl, parseApiClock, parseMonth, createService };
});
