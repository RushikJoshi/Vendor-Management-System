const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const ignoredDirs = new Set(["node_modules", "logs", "public", "scratch", "uploads"]);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(path.join(dir, entry.name));
    }
  }
}

walk(rootDir);

const failures = [];
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    failures.push({ file: path.relative(rootDir, file), output: result.stderr || result.stdout });
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`\n${failure.file}`);
    console.error(failure.output.trim());
  }
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} server JavaScript files.`);
