/**
 * Patch script for OpenAPI Generator's runtime.ts
 * Fixes TS4115 ("parameter property must have an 'override' modifier")
 * and normalizes Error subclasses for Angular 17–19 + TS 5.6+
 */

const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "core",
  "services",
  "api",
  "runtime.ts"
);

if (!fs.existsSync(file)) {
  console.error("❌ runtime.ts not found at expected location:", file);
  process.exit(1);
}

let txt = fs.readFileSync(file, "utf8");
let changed = false;

// --- 1) RequiredError osztály robusztus újraírása (ha létezik) ---
const reqErrBefore = txt;
txt = txt.replace(
  /class\s+RequiredError\s+extends\s+Error\s*\{[\s\S]*?constructor\(.*?\)\s*\{[\s\S]*?\}[\s\S]*?\}/m,
  `class RequiredError extends Error {
  override name = "RequiredError";
  override cause?: unknown;

  constructor(cause?: unknown, msg?: string) {
    super(msg);
    this.cause = cause;
    Object.setPrototypeOf(this, RequiredError.prototype);
  }
}`
);
changed = changed || txt !== reqErrBefore;

// --- 2) FetchError osztály robusztus újraírása (ha létezik) ---
const fetchErrBefore = txt;
txt = txt.replace(
  /export\s+class\s+FetchError\s+extends\s+Error\s*\{[\s\S]*?constructor\(.*?\)\s*\{[\s\S]*?\}[\s\S]*?\}/m,
  `export class FetchError extends Error {
  override name = "FetchError";
  override cause?: unknown;

  constructor(cause?: unknown, msg?: string) {
    super(msg);
    this.cause = cause;
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}`
);
changed = changed || txt !== fetchErrBefore;

// --- 3) Precíz override-beinjektálás a konstruktor paraméterlistájában ---
// Node 18+ támogatja a lookbehindot. Ha nem, fallback-et is adok lejjebb.
let overrideInjected = 0;
try {
  // readonly eset
  const r1 = new RegExp(
    String.raw`(?<=constructor\([^)]*)\bpublic\s+readonly\s+cause\s*:`,
    "g"
  );
  txt = txt.replace(r1, (m) => {
    overrideInjected++;
    return m.replace("public readonly cause", "public override readonly cause");
  });

  // nem-readonly eset
  const r2 = new RegExp(
    String.raw`(?<=constructor\([^)]*)\bpublic\s+cause\s*:`,
    "g"
  );
  txt = txt.replace(r2, (m) => {
    overrideInjected++;
    return m.replace("public cause", "public override cause");
  });

  if (overrideInjected > 0) changed = true;
} catch (e) {
  // --- 3/b Fallback: ha a futó Node nem támogat lookbehindot ---
  // Itt primitívebben, de biztonságosan cserélünk: feldaraboljuk a fájlt constructor()-onként,
  // és a záró )-ig a param-listában cseréljük a "public cause" mintát.
  const CONSTRUCTOR = /constructor\s*\(/g;
  let idx = 0;
  let out = "";
  let last = 0;

  while (true) {
    const m = CONSTRUCTOR.exec(txt);
    if (!m) break;

    // konstruktortörzs eleje: m.index + "constructor("
    const start = m.index + m[0].length;
    // keressük meg a paraméterlista záró ) pozícióját (naiv, de működő parser)
    let depth = 1;
    let i = start;
    for (; i < txt.length && depth > 0; i++) {
      const ch = txt[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
    }
    if (depth !== 0) continue; // hibás szintaxis, hagyjuk

    const paramsEnd = i - 1; // a ')' indexe
    const before = txt.slice(last, start);
    let params = txt.slice(start, paramsEnd);
    const after = txt.slice(paramsEnd, CONSTRUCTOR.lastIndex); // ')' + további rész a következő találatig

    const beforeParams = params;
    // readonly és nem-readonly csere a param LISTÁN BELÜL
    params = params.replace(
      /\bpublic\s+readonly\s+cause\s*:/g,
      "public override readonly cause:"
    );
    params = params.replace(/\bpublic\s+cause\s*:/g, "public override cause:");

    if (params !== beforeParams) {
      changed = true;
      overrideInjected++;
    }

    out += before + params + after;
    last = CONSTRUCTOR.lastIndex;
    idx++;
  }

  if (idx > 0) {
    out += txt.slice(last);
    txt = out;
  }
}

// --- 4) Opcionális: normalizált CRLF -> LF ---
const normBefore = txt;
txt = txt.replace(/\r\n/g, "\n");
changed = changed || txt !== normBefore;

// --- 5) Mentés + log ---
if (changed) {
  fs.writeFileSync(file, txt, "utf8");
  console.log(
    `✔ Patched runtime.ts (Error subclasses normalized, override injected x${overrideInjected})`
  );
} else {
  console.log("ℹ runtime.ts unchanged (patch not needed / already applied).");
}
