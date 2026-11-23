/* Offline prayer-time calculations and validated local timetable parsing. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NuriPrayerTimes = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CITIES = Object.freeze({
    sul: { id: "sul", name: "سلێمانی", lat: 35.5613, lon: 45.4305, timezone: "Asia/Baghdad" },
    erb: { id: "erb", name: "هەولێر", lat: 36.1911, lon: 44.0092, timezone: "Asia/Baghdad" },
    hal: { id: "hal", name: "هەڵەبجە", lat: 35.1796, lon: 45.9863, timezone: "Asia/Baghdad" }
  });
  const ORDER = Object.freeze(["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]);
  const OBLIGATORY = Object.freeze(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
  const SOURCE_LABEL = Object.freeze({ timetable: "خشتەی بانگی پشتڕاستکراو",
    bang_community: "بانگی کوردستان — خشتەی کۆمەڵگایی (پشتڕاست نەکراو)",
    bang_community_recurring: "بانگی کوردستان — خشتەی دووبارەبووەوەی کۆمەڵگایی (پشتڕاست نەکراو)",
    api: "ژمێرەی AlAdhan (خشتەی مزگەوت نییە)",
    cached_api: "ژمێرەی پاشەکەوتکراوی AlAdhan (خشتەی مزگەوت نییە)",
    astronomy: "ژمێرەی ئەستێرەناسی (١٨°/١٧°؛ خشتەی مزگەوت نییە)",
    unavailable: "کات بەردەست نییە" });
  const arabicDigits = value => String(value).replace(/\d/g, digit => "٠١٢٣٤٥٦٧٨٩"[digit]);
  const pad = value => String(value).padStart(2, "0");
  const radians = value => value * Math.PI / 180;
  const degrees = value => value * 180 / Math.PI;
  const sin = value => Math.sin(radians(value));
  const cos = value => Math.cos(radians(value));
  const tan = value => Math.tan(radians(value));
  const fix = (value, period) => value - period * Math.floor(value / period);
  const cityOf = city => typeof city === "string" ? CITIES[city] : city;
  function validCity(city) {
    return !!city && typeof city.id === "string" && /^[-A-Za-z0-9_./:]{1,100}$/.test(city.id) &&
      typeof city.name === "string" && !!city.name.trim() &&
      Number.isFinite(city.lat) && Math.abs(city.lat) <= 90 &&
      Number.isFinite(city.lon) && Math.abs(city.lon) <= 180 && typeof city.timezone === "string" &&
      !!city.timezone && isValidTimezone(city.timezone);
  }
  function isValidTimezone(timezone) {
    try { new Intl.DateTimeFormat("en", { timeZone: timezone }); return true; }
    catch { return false; }
  }

  function validDate(year, month, day) {
    if (![year, month, day].every(Number.isInteger) || year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const check = new Date(Date.UTC(year, month - 1, day));
    return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
  }

  function shiftDate(date, days) {
    const shifted = new Date(Date.UTC(date.y, date.m - 1, date.d + days));
    return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
  }

  function sunPos(daysFromJ2000) {
    const g = fix(357.529 + 0.98560028 * daysFromJ2000, 360);
    const q = fix(280.459 + 0.98564736 * daysFromJ2000, 360);
    const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * daysFromJ2000;
    const ra = fix(degrees(Math.atan2(cos(e) * sin(L), cos(L))) / 15, 24);
    // q and RA can straddle zero on different dates. Their difference is small,
    // so select its signed representative instead of introducing a 24h jump.
    const eqt = fix(q / 15 - ra + 12, 24) - 12;
    return { decl: degrees(Math.asin(sin(e) * sin(L))), eqt };
  }

  function validTimes(times) {
    let previous = -1;
    for (const key of ORDER) {
      const value = times && times[key];
      if (!Number.isInteger(value) || value < 0 || value >= (key === "isha" ? 1800 : 1440) || value <= previous) return false;
      previous = value;
    }
    return true;
  }

  function astronomicalTimes(date, cityRef, school = 0) {
    const city = cityOf(cityRef);
    if (!validCity(city) || !validDate(date.y, date.m, date.d)) return null;
    const jd = Date.UTC(date.y, date.m - 1, date.d, 12) / 86400000 + 2440587.5;
    const days = jd - 2451545 - city.lon / 360;
    const { decl, eqt } = sunPos(days);
    const utcNoon = 12 - city.lon / 15 - eqt;
    const interval = angle => {
      const x = (-sin(angle) - sin(decl) * sin(city.lat)) / (cos(decl) * cos(city.lat));
      if (!Number.isFinite(x) || x < -1 - 1e-12 || x > 1 + 1e-12) return NaN;
      return degrees(Math.acos(Math.max(-1, Math.min(1, x)))) / 15;
    };
    const asrAngle = -degrees(Math.atan(1 / ((school === 1 ? 2 : 1) + tan(Math.abs(city.lat - decl)))));
    const sunInterval = interval(0.833);
    const nightLength = 24 - 2 * sunInterval;
    const fajrInterval = interval(18);
    const ishaInterval = interval(17);
    const fajrCap = utcNoon - sunInterval - nightLength * 18 / 60;
    const ishaCap = utcNoon + sunInterval + nightLength * 17 / 60;
    const utcHours = {
      fajr: Number.isFinite(fajrInterval) ? Math.max(utcNoon - fajrInterval, fajrCap) : fajrCap,
      sunrise: utcNoon - sunInterval,
      dhuhr: utcNoon + 1 / 60,
      asr: utcNoon + interval(asrAngle),
      maghrib: utcNoon + sunInterval + 1 / 60,
      isha: Number.isFinite(ishaInterval) ? Math.min(utcNoon + ishaInterval, ishaCap) : ishaCap
    };
    if (ORDER.some(key => !Number.isFinite(utcHours[key]))) return null;
    const times = {};
    for (const key of ORDER) {
      const instant = new Date(Date.UTC(date.y, date.m - 1, date.d) + Math.round(utcHours[key] * 3600000));
      const local = zonedParts(instant, city.timezone);
      const eventDate = key === "isha" && (local.y !== date.y || local.m !== date.m || local.d !== date.d)
        ? shiftDate(date, 1) : date;
      if (local.y !== eventDate.y || local.m !== eventDate.m || local.d !== eventDate.d) return null;
      times[key] = local.h * 60 + local.mi + (local.s >= 30 ? 1 : 0) + (eventDate === date ? 0 : 1440);
    }
    return validTimes(times) ? times : null;
  }

  // The candidate Bang data uses 12-hour values without AM/PM. A known prayer
  // field supplies the period when absent; explicit AM/PM always takes priority.
  function parseClock(value, key) {
    if (typeof value !== "string" || !ORDER.includes(key)) return null;
    const match = /^(\d{1,2}):([0-5]\d)(?:\s*(AM|PM))?$/i.exec(value.trim());
    if (!match) return null;
    const hour = Number(match[1]), minute = Number(match[2]);
    if (hour < 1 || hour > 12) return null;
    // Dhuhr can be 11:xx or 12:xx. Its 11 o'clock rows are before noon;
    // treating them as PM would turn a valid 11:59 into 23:59.
    const inferredPeriod = key === "fajr" || key === "sunrise" || (key === "dhuhr" && hour === 11)
      ? "AM" : "PM";
    const period = (match[3] || inferredPeriod).toUpperCase();
    return (hour % 12 + (period === "PM" ? 12 : 0)) * 60 + minute;
  }

  function createTimetableIndex(document) {
    const index = new Map();
    if (!document || document.version !== 1 || !Array.isArray(document.datasets)) return index;
    for (const dataset of document.datasets) {
      // Publishing a dataset requires an explicit source and completed rights review.
      if (!dataset || dataset.status !== "verified" || dataset.rights !== "cleared" ||
          typeof dataset.source !== "string" || !dataset.source.trim() ||
          !Array.isArray(dataset.years) || !dataset.years.length) continue;
      const years = dataset.years.filter(year => Number.isInteger(year) && year >= 2000 && year <= 2100);
      const rows = Array.isArray(dataset.rows) ? dataset.rows :
        dataset.days && typeof dataset.days === "object" ? Object.entries(dataset.days).map(([Date, times]) => ({ Date, ...times })) : [];
      const counts = new Map();
      for (const row of rows) if (typeof row?.Date === "string") {
        counts.set(row.Date, (counts.get(row.Date) || 0) + 1);
      }
      for (const row of rows) {
        // Two rows for one date are ambiguous even when they happen to agree.
        if (!row || counts.get(row.Date) !== 1 || !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(row.Date)) continue;
        const [month, day] = row.Date.split("-").map(Number);
        const times = Object.fromEntries(ORDER.map(key => [key, parseClock(row[key[0].toUpperCase() + key.slice(1)], key)]));
        if (times.isha !== null && times.maghrib !== null && times.isha <= times.maghrib) times.isha += 1440;
        if (!validTimes(times)) continue;
        for (const year of years) {
          if (validDate(year, month, day)) index.set(`${dataset.city}|${year}|${row.Date}`,
            { times, sourceName: dataset.source.trim() });
        }
      }
    }
    return index;
  }

  function getPrayerTimes(date, cityRef, index = new Map(), school = 0) {
    const city = cityOf(cityRef);
    if (!validCity(city) || !validDate(date.y, date.m, date.d)) return { times: null, source: "unavailable" };
    const key = `${city.id}|${date.y}|${pad(date.m)}-${pad(date.d)}`;
    const published = index.get(key);
    if (validTimes(published?.times)) return { times: published.times, source: "timetable", sourceName: published.sourceName };
    const calculated = astronomicalTimes(date, city, school);
    return calculated ? { times: calculated, source: "astronomy" } : { times: null, source: "unavailable" };
  }

  function formatTime(minutes, use24 = false, parts = false) {
    if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 1800) return parts ? { t: "--:--", ap: "" } : "--:--";
    const nextDay = minutes >= 1440;
    const hour = Math.floor(minutes % 1440 / 60), minute = minutes % 60;
    if (use24) {
      const t = arabicDigits(`${pad(hour)}:${pad(minute)}${nextDay ? " (+1)" : ""}`);
      return parts ? { t, ap: "" } : t;
    }
    const ap = hour >= 12 ? "ئێوارە" : "بەیانی";
    const t = arabicDigits(`${hour % 12 || 12}:${pad(minute)}${nextDay ? " (+1)" : ""}`);
    return parts ? { t, ap } : `${t} ${ap}`;
  }

  function formatHijriDate(date, timezone = "Asia/Baghdad") {
    if (!validDate(date.y, date.m, date.d)) return "—";
    // Anchor the calendar to noon in the selected city, not noon UTC. UTC
    // noon is already tomorrow in some eastern timezones.
    const localNoon = zonedEventMs(date, 12 * 60, timezone);
    if (!Number.isFinite(localNoon)) return "—";
    const formatter = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura-nu-arab", {
      timeZone: timezone, day: "numeric", month: "long", year: "numeric"
    });
    const parts = formatter.formatToParts(new Date(localNoon));
    const formatted = formatter.format(new Date(localNoon));
    return parts.some(part => part.type === "era") ? formatted : formatted + " هـ";
  }

  const zoneFormatters = new Map();
  function zonedParts(instant, timezone) {
    let formatter = zoneFormatters.get(timezone);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hourCycle: "h23",
        year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
      zoneFormatters.set(timezone, formatter);
    }
    const parts = Object.fromEntries(formatter.formatToParts(instant).map(part => [part.type, part.value]));
    return { y: +parts.year, m: +parts.month, d: +parts.day, h: +parts.hour, mi: +parts.minute, s: +parts.second };
  }
  const baghdadParts = instant => zonedParts(instant, "Asia/Baghdad");

  function zonedEventMs(date, minutes, timezone) {
    if (!validDate(date.y, date.m, date.d) || !Number.isInteger(minutes) || minutes < 0 || minutes >= 1800) return NaN;
    const desired = Date.UTC(date.y, date.m - 1, date.d, 0, minutes);
    let instant = desired - 3 * 3600000;
    // Derive the offset from IANA rules, including any future rule change.
    for (let attempt = 0; attempt < 2; attempt++) {
      const local = zonedParts(new Date(instant), timezone);
      const actual = Date.UTC(local.y, local.m - 1, local.d, local.h, local.mi, local.s);
      instant += desired - actual;
    }
    const local = zonedParts(new Date(instant), timezone);
    const expectedDate = minutes >= 1440 ? shiftDate(date, 1) : date;
    return local.y === expectedDate.y && local.m === expectedDate.m && local.d === expectedDate.d &&
      local.h * 60 + local.mi === minutes % 1440 ? instant : NaN;
  }
  const baghdadEventMs = (date, minutes) => zonedEventMs(date, minutes, "Asia/Baghdad");

  function nextPrayer(nowMs, cityRef, index = new Map(), resolver = getPrayerTimes) {
    const city = cityOf(cityRef);
    if (!validCity(city)) return null;
    const now = zonedParts(new Date(nowMs), city.timezone);
    const today = { y: now.y, m: now.m, d: now.d };
    const events = [];
    for (let offset = -1; offset <= 2; offset++) {
      const date = shiftDate(today, offset);
      const result = resolver(date, city, index);
      if (!result.times) continue;
      for (const key of OBLIGATORY) {
        const at = zonedEventMs(date, result.times[key], city.timezone);
        if (Number.isFinite(at)) events.push({ key, date, source: result.source,
          sourceName: result.sourceName, minutes: result.times[key], at });
      }
    }
    events.sort((a, b) => a.at - b.at);
    const nextIndex = events.findIndex(event => event.at > nowMs);
    if (nextIndex < 0) return null;
    const next = events[nextIndex], previous = events[nextIndex - 1] || null;
    return { next, previous, leftSeconds: Math.max(0, Math.ceil((next.at - nowMs) / 1000)),
      progress: previous ? Math.min(1, Math.max(0, (nowMs - previous.at) / (next.at - previous.at))) : 0 };
  }

  return { CITIES, ORDER, OBLIGATORY, SOURCE_LABEL, arabicDigits, pad, validDate, shiftDate,
    sunPos, validTimes, astronomicalTimes, parseClock, createTimetableIndex,
    getPrayerTimes, formatTime, formatHijriDate, validCity, zonedParts, zonedEventMs,
    baghdadParts, baghdadEventMs, nextPrayer };
});
