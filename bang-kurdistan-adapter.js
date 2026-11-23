/* Development-only inspection of Bang Kurdistan's undated candidate tables.
   No table is bundled or eligible for the production resolver through this module. */
(function (root, factory) {
  const api = factory(typeof module === "object" && module.exports ? require("./prayer-time-core.js") : root.NuriPrayerTimes);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NuriBangAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core) {
  "use strict";

  const FILES = Object.freeze({
    sul: "Slemany.json", erb: "Hawler.json", hal: "Halabja.json", duhok: "Duhok.json",
    kirkuk: "Kirkuk.json", mosul: "mosul.json", soran: "Soran.json", koya: "Koya.json",
    akre: "Akre.json", chamchamal: "Chamchamal.json", qaladze: "Qaladze.json",
    ranya: "Ranya.json", kifri: "Kfri.json", kalar: "Kalar.json", zakho: "Zaxo.json",
    darbandikhan: "Darbandixan.json", tuz_khurmatu: "tuzxurmatu.json", amedi: "Amedi.json",
    said_sadiq: "SaidSadiq.json", penjwen: "Penjuin.json", halabja_taza: "HalabjaN.json",
    arbat: "Arbat.json", piramagrun: "Piramagrun.json", tasluja: "Tasluja.json",
    bazyan: "Bazyan.json", dukan: "Dukan.json", takya: "Takya.json",
    haji_awa: "HajiAwa.json", xalakan: "Xalakan.json", taqtaq: "TaqTaq.json",
    barzinja: "Barznja.json", qaradagh: "Qaradax.json", qadir_karam: "QadirKaram.json",
    khanaqin: "Xanaqin.json", chwarta: "Chwarta.json", qasre: "qasre.json"
  });
  const BASE = "https://raw.githubusercontent.com/Bang-Kurdistan/bang-kurdistan.github.io/main/data/";
  const field = key => key[0].toUpperCase() + key.slice(1);
  const dayKey = date => `${core.pad(date.m)}-${core.pad(date.d)}`;
  const issue = (code, date, row) => ({ code, date, row });

  function inspect(cityId, rows) {
    if (!Object.prototype.hasOwnProperty.call(FILES, cityId)) throw new Error("Unknown Bang city");
    const issues = [], validRows = new Map(), counts = new Map();
    if (!Array.isArray(rows)) return { cityId, file: FILES[cityId], rowCount: 0, validRows,
      issues: [issue("invalid_document", null, null)], complete: false, applicableYears: [] };
    rows.forEach((row, index) => {
      if (typeof row?.Date === "string") counts.set(row.Date, (counts.get(row.Date) || 0) + 1);
      else issues.push(issue("invalid_date", row?.Date ?? null, index + 1));
    });
    rows.forEach((row, index) => {
      if (typeof row?.Date !== "string") return;
      const date = row.Date;
      if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date) ||
          !core.validDate(2024, ...date.split("-").map(Number))) {
        issues.push(issue("invalid_date", date, index + 1)); return;
      }
      if (counts.get(date) !== 1) {
        issues.push(issue("duplicate_date", date, index + 1)); return;
      }
      const times = {};
      let bad = false;
      for (const key of core.ORDER) {
        const value = row[field(key)];
        if (typeof value !== "string" || !value.trim()) {
          issues.push(issue("incomplete_row", date, index + 1)); bad = true; break;
        }
        times[key] = core.parseClock(value, key);
        if (times[key] === null) {
          issues.push(issue("invalid_clock", date, index + 1)); bad = true; break;
        }
      }
      if (bad) return;
      if (times.isha <= times.maghrib) times.isha += 1440;
      if (!core.validTimes(times)) {
        issues.push(issue("impossible_order", date, index + 1)); return;
      }
      validRows.set(date, times);
    });
    for (let m = 1; m <= 12; m++) {
      const last = new Date(Date.UTC(2024, m, 0)).getUTCDate();
      for (let d = 1; d <= last; d++) {
        const date = dayKey({ m, d });
        if (!counts.has(date)) issues.push(issue("missing_date", date, null));
      }
    }
    return { cityId, file: FILES[cityId], rowCount: rows.length, validRows, issues,
      complete: issues.length === 0 && validRows.size === 366,
      // The upstream MM-DD files declare no Gregorian year or recurrence rule.
      applicableYears: [] };
  }

  function compareDate(audit, date, calculated) {
    if (!core.validDate(date.y, date.m, date.d)) throw new Error("Invalid comparison date");
    const local = audit?.validRows.get(dayKey(date));
    if (!local) return { status: "missing_bang_row", prayers: null };
    if (!calculated || !["api", "cached_api"].includes(calculated.source) ||
        !core.validTimes(calculated.times)) return { status: "api_unavailable", prayers: null };
    return { status: "comparison_only", applicable: false, source: calculated.source,
      prayers: Object.fromEntries(core.ORDER.map(key => [key,
        { bang: local[key], aladhan: calculated.times[key], differenceMinutes: local[key] - calculated.times[key] }])) };
  }

  function approvedIndex(audit, approval) {
    // Human-reviewed, documented approval is required before a yearless file
    // can enter the same shared resolver used by cards, month, and countdown.
    if (!audit?.complete || !(audit.validRows instanceof Map) || audit.validRows.size !== 366 ||
        [...audit.validRows.values()].some(times => !core.validTimes(times)) ||
        approval?.status !== "verified" || approval?.rights !== "cleared" ||
        !Array.isArray(approval.years) || !approval.years.length ||
        !approval.years.every(year => Number.isInteger(year) && year >= 2000 && year <= 2100) ||
        ![approval.source, approval.rightsEvidence, approval.yearEvidence, approval.authorityEvidence]
          .every(value => typeof value === "string" && value.trim())) {
      throw new Error("Bang timetable lacks complete data, dated authority evidence, or redistribution approval");
    }
    const index = new Map();
    for (const year of approval.years) for (const [date, times] of audit.validRows) {
      const [month, day] = date.split("-").map(Number);
      if (core.validDate(year, month, day)) index.set(`${audit.cityId}|${year}|${date}`,
        { times: { ...times }, sourceName: approval.source.trim() });
    }
    return index;
  }

  function createAdapter({ enabled = false, fetchImpl = globalThis.fetch, timeoutMs = 9000 } = {}) {
    const cache = new Map(), pending = new Map();
    async function fetchCity(cityId) {
      if (!enabled) throw new Error("Bang comparison is development-only");
      if (!Object.prototype.hasOwnProperty.call(FILES, cityId)) throw new Error("Unknown Bang city");
      if (cache.has(cityId)) return { ...cache.get(cityId), cached: true };
      if (pending.has(cityId)) return pending.get(cityId);
      const work = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetchImpl(BASE + FILES[cityId], { signal: controller.signal,
            mode: "cors", cache: "no-store" });
          if (!response.ok) throw new Error(`Bang HTTP ${response.status}`);
          const audit = inspect(cityId, await response.json());
          cache.set(cityId, audit);
          return { ...audit, cached: false };
        } finally { clearTimeout(timer); pending.delete(cityId); }
      })();
      pending.set(cityId, work);
      return work;
    }
    return { fetchCity, inspect, compareDate, approvedIndex, files: FILES };
  }

  return { FILES, BASE, inspect, compareDate, approvedIndex, createAdapter };
});
