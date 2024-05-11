import { compareVersions } from "compare-versions";
import fs from "fs";
import path from "path";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import "dotenv/config";
import YAML from "yaml";

import { org, packages } from "../../packages";
import { generateIndexFile, generateReadmeFile } from "./files";

const execPromise = promisify(exec);
const DRY_RUN = process.env.DRY_RUN === "true";

async function main() {
  if (!DRY_RUN && !process.env.NPM_TOKEN) {
    throw new Error("Missing NPM_TOKEN");
  }
  for (const [id, config] of Object.entries(packages)) {
    const packageName = `@${org}/${id}`;
    const latestPublished = await getLatestPublishedVersion(packageName);
    const currentOpenApi = await getCurrentOpenApiVersion(config.openapi);
    console.log(`📦 ${id} - ${currentOpenApi} - ${latestPublished}`);
    if (compareVersions(currentOpenApi, latestPublished) < 1) {
      console.log(`👋 Skipping ${id}...`);
      continue;
    }
    console.log(`🌻 Updating ${id}...`);
    const indexFile = generateIndexFile(id, config);
    const readme = generateReadmeFile(id, config);

    const targetDir = path.resolve(__dirname, `../../packages/${id}`);
    const templateDir = path.resolve(__dirname, `../template`);

    const packageJsonPath = path.resolve(templateDir, `package.json`);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = packageName;
    packageJson.version = currentOpenApi;
    packageJson.keywords = [id, "openapi", "api", "client"];
    packageJson.description = `Generated client for ${id} API`;

    // 1. Remove existing directory
    fs.rmSync(targetDir, { recursive: true, force: true });

    // 2. Create new package
    fs.mkdirSync(path.resolve(targetDir, "src"), { recursive: true });
    fs.writeFileSync(path.resolve(targetDir, "src/index.ts"), indexFile);
    fs.writeFileSync(path.resolve(targetDir, "README.md"), readme);
    fs.writeFileSync(
      path.resolve(targetDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
    fs.copyFileSync(
      path.resolve(templateDir, `tsconfig.json`),
      path.resolve(targetDir, "tsconfig.json")
    );
    fs.copyFileSync(
      path.resolve(templateDir, `.gitignore`),
      path.resolve(targetDir, ".gitignore")
    );

    // 3. Install dependencies
    await run("npm install", targetDir);

    // 4. Generate types
    const generateOutputPath = path.resolve(targetDir, "src/generated.ts");
    await run(
      `npx openapi-typescript ${config.openapi} -o ${generateOutputPath}`,
      targetDir
    );

    // 5. Build package
    await run("npm run build", targetDir);

    if (DRY_RUN) {
      console.log("🔔 Skipping publish...");
      continue;
    }

    // 6. Publish package
    await run(
      `npm set //registry.npmjs.org/:_authToken ${process.env.NPM_TOKEN}`,
      targetDir
    );
    await run("npm publish --access public", targetDir);
  }
}

async function run(cmd: string, cwd: string) {
  const { stdout, stderr } = await execPromise(cmd, {
    cwd,
  });
  if (stderr) {
    console.error(stderr);
    return stderr;
  }
  if (DRY_RUN) {
    const output = path.resolve(cwd, "output.txt");
    fs.appendFileSync(output, stdout);
  }
  return stdout;
}

async function getLatestPublishedVersion(packageName: string) {
  const url = `https://registry.npmjs.org/${packageName}`;
  const res = await fetch(url);
  if (res.status === 404) {
    return "0";
  }
  const data = await res.json();
  const latest = data["dist-tags"].latest;
  if (typeof latest !== "string") {
    throw new Error("Invalid version");
  }
  return latest;
}

async function getCurrentOpenApiVersion(url: string) {
  const res = await fetch(url);
  if (url.endsWith(".json")) {
    const data = await res.json();
    return data.info.version;
  }
  if (url.endsWith(".yaml") || url.endsWith(".yml")) {
    const text = await res.text();
    const json = YAML.parse(text);
    return json.info.version;
  }
  throw new Error("Invalid openapi file");
}

if (require.main === module) {
  void main();
}
