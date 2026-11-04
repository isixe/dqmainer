// Keeps app.json in sync with the git tag that triggered a release.
//
// The tag (e.g. "v0.1.0") becomes the marketing version, while the GitHub run
// number is used as the Android versionCode / iOS buildNumber so that every
// build is monotonically newer than the previous one.
//
// Env:
//   APP_VERSION       - marketing version, without a leading "v" (required)
//   APP_BUILD_NUMBER  - monotonically increasing integer (required)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const appJsonPath = path.resolve(import.meta.dirname, "..", "app.json");

const version = process.env.APP_VERSION;
const buildNumber = process.env.APP_BUILD_NUMBER;

if (!version || !buildNumber) {
  console.error("APP_VERSION and APP_BUILD_NUMBER are required.");
  process.exit(1);
}

const app = JSON.parse(readFileSync(appJsonPath, "utf8"));

app.expo.version = version;
app.expo.ios = { ...app.expo.ios, buildNumber: String(buildNumber) };
app.expo.android = { ...app.expo.android, versionCode: Number(buildNumber) };

writeFileSync(appJsonPath, `${JSON.stringify(app, null, 2)}\n`);

console.log(`Set app version to ${version} (build ${buildNumber}).`);
