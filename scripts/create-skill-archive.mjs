import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const archivePath = resolve("dist/public/SKILL.zip");

await rm(archivePath, { force: true });

await new Promise((resolveProcess, rejectProcess) => {
  const zip = spawn("zip", [
    "-r",
    archivePath,
    "dragonwisdom-html",
    "-x",
    "*/.DS_Store"
  ], {
    cwd: resolve(".agents/skills"),
    stdio: "inherit"
  });

  zip.on("error", rejectProcess);
  zip.on("close", (code) => {
    if (code === 0) {
      resolveProcess();
      return;
    }

    rejectProcess(new Error(`zip exited with code ${code}`));
  });
});

console.log(`Created DragonWisdom skill archive at ${archivePath}`);
