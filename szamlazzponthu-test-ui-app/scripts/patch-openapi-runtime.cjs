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
let txt = fs.readFileSync(file, "utf8");

// RequiredError patch – param prop -> override cause + normál ctor
txt = txt.replace(
  /class\s+RequiredError\s+extends\s+Error\s*\{[\s\S]*?constructor\(public\s+cause:\s*Error,\s*msg\?:\s*string\)\s*\{[\s\S]*?super\(msg\);\s*[\s\S]*?\}[\s\S]*?\}/m,
  `class RequiredError extends Error {
  override cause?: unknown;
  constructor(cause?: unknown, msg?: string) {
    super(msg);
    this.cause = cause;
    Object.setPrototypeOf(this, RequiredError.prototype);
    this.name = "RequiredError";
  }
}`
);

// FetchError patch – ugyanaz a minta
txt = txt.replace(
  /export\s+class\s+FetchError\s+extends\s+Error\s*\{[\s\S]*?constructor\(public\s+cause:\s*Error,\s*msg\?:\s*string\)\s*\{[\s\S]*?super\(msg\);\s*[\s\S]*?\}[\s\S]*?\}/m,
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

fs.writeFileSync(file, txt, "utf8");
console.log("✔ Patched runtime.ts (RequiredError & FetchError)");
