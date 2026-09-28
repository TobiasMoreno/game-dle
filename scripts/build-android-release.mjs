import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const androidRoot = join(projectRoot, "android");
const unsignedCheck = process.argv.includes("--unsigned");

const gradle = process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
const gradleArguments = unsignedCheck
  ? ["bundleRelease"]
  : ["-PrequireReleaseSigning=true", "bundleRelease"];
run(gradle, gradleArguments, androidRoot, process.platform === "win32");

const bundlePath = join(
  androidRoot,
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab"
);
if (!existsSync(bundlePath)) {
  throw new Error(`Gradle terminó sin generar ${bundlePath}`);
}

const sizeMiB = (statSync(bundlePath).size / 1024 / 1024).toFixed(2);
if (unsignedCheck) {
  console.log(
    `AAB estructural sin firma generado (${sizeMiB} MiB). No subir a Play Console:`
  );
} else {
  console.log(`AAB release firmado generado (${sizeMiB} MiB):`);
}
console.log(bundlePath);

function run(command, args, cwd = projectRoot, shell = false) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    shell,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
