/* User-authorized 2026 baseline reused by month/day after 2026; separate from verified approvals. */
(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports ? require("./prayer-time-core.js") : root.NuriPrayerTimes,
    typeof module === "object" && module.exports ? require("./bang-kurdistan-adapter.js") : root.NuriBangAdapter
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NuriBangCommunity2026 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core, bang) {
  "use strict";
  const YEAR = 2026;
  const EXCLUDED = Object.freeze(["arbat", "qasre", "tuz_khurmatu"]);
  const ELIGIBLE = Object.freeze(Object.keys(bang.FILES).filter(id => !EXCLUDED.includes(id)));
  const SOURCE = "Bang Kurdistan — Community timetable (unverified)";
  const RECURRENCE = "month-day from 2026 onward; February 29 excluded";
  const key = (id, date) => `${id}|${YEAR}|${date}`;

  function createIndex(document, catalog) {
    if (document?.version !== 1 || document.year !== YEAR || document.source !== SOURCE ||
        document.recurrence !== RECURRENCE ||
        !/^[a-f0-9]{40}$/.test(document.upstreamCommit || "") ||
        !Array.isArray(document.datasets) || document.datasets.length !== ELIGIBLE.length ||
        !Array.isArray(catalog?.cities)) throw new Error("Invalid Bang community document");
    const cities = new Map(catalog.cities.map(city => [city.id, city]));
    const seenCities = new Set(), index = new Map();
    for (const dataset of document.datasets) {
      const id = dataset?.city, city = cities.get(id);
      if (!ELIGIBLE.includes(id) || seenCities.has(id) ||
          !core.validCity(city) || city.timezone !== "Asia/Baghdad" ||
          city.bangFile !== bang.FILES[id] || dataset.file !== bang.FILES[id] ||
          !/^[a-f0-9]{64}$/.test(dataset.originalSha256 || "") ||
          !Array.isArray(dataset.rows) || dataset.rows.length !== 365)
        throw new Error(`Invalid Bang community city: ${id}`);
      seenCities.add(id);
      const seenDates = new Set();
      for (const row of dataset.rows) {
        if (!Array.isArray(row) || row.length !== 7 ||
            typeof row[0] !== "string" || !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(row[0]) ||
            seenDates.has(row[0])) throw new Error(`Invalid Bang community row: ${id}`);
        const [month, day] = row[0].split("-").map(Number);
        if (!core.validDate(YEAR, month, day)) throw new Error(`Invalid Bang community date: ${id} ${row[0]}`);
        const times = Object.fromEntries(core.ORDER.map((prayer, i) => [prayer, row[i + 1]]));
        if (!core.validTimes(times))
          throw new Error(`Invalid Bang community times: ${id} ${row[0]}`);
        seenDates.add(row[0]);
        index.set(key(id, row[0]), { times });
      }
      for (let month = 1; month <= 12; month++) {
        const last = new Date(Date.UTC(YEAR, month, 0)).getUTCDate();
        for (let day = 1; day <= last; day++)
          if (!seenDates.has(`${core.pad(month)}-${core.pad(day)}`))
            throw new Error(`Missing Bang community date: ${id}`);
      }
    }
    if (seenCities.size !== ELIGIBLE.length) throw new Error("Missing Bang community city");
    return index;
  }

  return { YEAR, EXCLUDED, ELIGIBLE, SOURCE, RECURRENCE, createIndex };
});
