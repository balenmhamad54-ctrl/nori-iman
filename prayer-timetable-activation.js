/* Fail-closed approval check for locally bundled, dated prayer timetables. */
(function (root, factory) {
  const api = factory(typeof module === "object" && module.exports ? require("./prayer-time-core.js") : root.NuriPrayerTimes);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NuriTimetableActivation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core) {
  "use strict";

  const fields = core.ORDER.map(key => key[0].toUpperCase() + key.slice(1));
  const pad = core.pad;

  function canonical(dataset) {
    return JSON.stringify({ city: dataset.city, years: dataset.years,
      source: dataset.source, rows: dataset.rows });
  }

  async function digestDataset(dataset, cryptoImpl = globalThis.crypto) {
    if (!cryptoImpl?.subtle) throw new Error("SHA-256 is unavailable");
    const bytes = new TextEncoder().encode(canonical(dataset));
    const hash = await cryptoImpl.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, "0")).join("");
  }

  function validRows(dataset) {
    if (!Array.isArray(dataset?.rows) || !Array.isArray(dataset.years) || !dataset.years.length ||
        new Set(dataset.years).size !== dataset.years.length ||
        !dataset.years.every(year => Number.isInteger(year) && core.validDate(year, 1, 1))) return false;
    const seen = new Set();
    for (const row of dataset.rows) {
      const date = row?.Date;
      if (typeof date !== "string" || !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date) ||
          seen.has(date)) return false;
      const [month, day] = date.split("-").map(Number);
      if (!core.validDate(2024, month, day)) return false;
      seen.add(date);
      const times = Object.fromEntries(core.ORDER.map((key, index) =>
        [key, core.parseClock(row[fields[index]], key)]));
      if (times.isha !== null && times.maghrib !== null && times.isha <= times.maghrib) times.isha += 1440;
      if (!core.validTimes(times)) return false;
    }
    for (const year of dataset.years) {
      for (let month = 1; month <= 12; month++) {
        const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
        for (let day = 1; day <= last; day++) if (!seen.has(`${pad(month)}-${pad(day)}`)) return false;
      }
    }
    return true;
  }

  function validApproval(dataset, approval) {
    return approval?.city === dataset.city &&
      approval.source === dataset.source &&
      Array.isArray(approval.years) && JSON.stringify(approval.years) === JSON.stringify(dataset.years) &&
      /^[a-f0-9]{64}$/.test(approval.sha256 || "") &&
      [approval.rightsEvidence, approval.yearEvidence, approval.authorityEvidence,
        approval.approvedBy, approval.approvedAt].every(value => typeof value === "string" && value.trim()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(approval.approvedAt) &&
      core.validDate(...approval.approvedAt.split("-").map(Number));
  }

  async function createIndex(document, approvals, cryptoImpl = globalThis.crypto) {
    const empty = new Map();
    if (document?.version !== 1 || !Array.isArray(document.datasets) ||
        approvals?.version !== 1 || !Array.isArray(approvals.entries)) return empty;
    const accepted = [], claims = new Map();
    for (const dataset of document.datasets) if (typeof dataset?.city === "string" && Array.isArray(dataset.years))
      for (const year of dataset.years) {
        const key = `${dataset.city}|${year}`;
        claims.set(key, (claims.get(key) || 0) + 1);
      }
    for (const dataset of document.datasets) {
      if (dataset?.status !== "verified" || dataset.rights !== "cleared" ||
          typeof dataset.city !== "string" || !dataset.city ||
          typeof dataset.source !== "string" || !dataset.source.trim() || !validRows(dataset)) continue;
      const matches = approvals.entries.filter(entry => validApproval(dataset, entry));
      if (matches.length !== 1 || matches[0].sha256 !== await digestDataset(dataset, cryptoImpl)) continue;
      // One approved city/year may have only one schedule.
      const keys = dataset.years.map(year => `${dataset.city}|${year}`);
      if (keys.some(key => claims.get(key) !== 1)) continue;
      accepted.push(dataset);
    }
    return accepted.length ? core.createTimetableIndex({ version: 1, datasets: accepted }) : empty;
  }

  return { canonical, digestDataset, validRows, createIndex };
});
