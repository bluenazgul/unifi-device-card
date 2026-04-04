import { execSync } from "node:child_process";
import esbuild from "esbuild";

function getVersion() {
  try {
    const eventName = process.env.GITHUB_EVENT_NAME || "";
    const refName = process.env.GITHUB_REF_NAME || "";

    if (eventName === "release" && refName) {
      return refName.replace(/^v/, "");
    }

    const commit = execSync("git rev-parse --short HEAD")
      .toString()
      .trim();

    return `0.0.0-dev.${commit}`;
  } catch (err) {
    console.warn("[build] Failed to determine git version:", err);
    return "0.0.0-dev";
  }
}

const version = getVersion();

console.log(`[build] Building UniFi Device Card version: ${version}`);

await esbuild.build({
  entryPoints: ["src/unifi-device-card.js"],
  bundle: true,
  format: "esm",
  target: "es2020",
  outfile: "dist/unifi-device-card.js",
  define: {
    __VERSION__: JSON.stringify(version),
  },
  banner: {
    js: `/* UniFi Device Card ${version} */`,
  },
});
