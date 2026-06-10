import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import JSZip from "jszip";

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, "package.json");
const packageLockPath = path.join(rootDir, "package-lock.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const packageName = packageJson.name;
const packageVersion = packageJson.version;
const releaseDir = path.join(rootDir, "release");
const stagingParent = fs.mkdtempSync(path.join(os.tmpdir(), `${packageName}-release-`));
const stagingDir = path.join(stagingParent, packageName);
const outputPath = path.join(releaseDir, `${packageName}-${packageVersion}.zip`);

const releaseEntries = [
  "dist",
  "i18n",
  "static",
  "package.json",
  "readme.md",
];

function copyEntry(relativePath) {
  const sourcePath = path.join(rootDir, relativePath);
  const targetPath = path.join(stagingDir, relativePath);
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  const stat = fs.statSync(sourcePath);
  if (stat.isDirectory()) {
    fs.cpSync(sourcePath, targetPath, {
      recursive: true,
      filter: (source) => path.basename(source) !== ".DS_Store",
    });
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function writeReleasePackageJson() {
  const releasePackageJson = {
    ...packageJson,
  };
  delete releasePackageJson.devDependencies;
  releasePackageJson.scripts = {};
  fs.writeFileSync(
    path.join(stagingDir, "package.json"),
    `${JSON.stringify(releasePackageJson, null, 4)}\n`
  );
}

function installProductionDependencies() {
  if (!fs.existsSync(packageLockPath)) {
    execFileSync("npm", ["install", "--omit=dev", "--ignore-scripts"], {
      cwd: stagingDir,
      stdio: "inherit",
    });
    return;
  }

  fs.copyFileSync(packageLockPath, path.join(stagingDir, "package-lock.json"));
  execFileSync("npm", ["ci", "--omit=dev", "--ignore-scripts"], {
    cwd: stagingDir,
    stdio: "inherit",
  });
  fs.rmSync(path.join(stagingDir, "package-lock.json"));
}

async function addDirectoryToZip(zip, directory, zipRoot = "") {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    const zipPath = zipRoot ? `${zipRoot}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await addDirectoryToZip(zip, absolutePath, zipPath);
    } else {
      zip.file(zipPath, fs.readFileSync(absolutePath));
    }
  }
}

async function main() {
  fs.mkdirSync(stagingDir, { recursive: true });
  for (const entry of releaseEntries) {
    copyEntry(entry);
  }
  writeReleasePackageJson();
  installProductionDependencies();

  fs.mkdirSync(releaseDir, { recursive: true });
  const zip = new JSZip();
  await addDirectoryToZip(zip, stagingDir, packageName);
  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });
  fs.writeFileSync(outputPath, content);
  fs.rmSync(stagingParent, { recursive: true, force: true });
  console.log(`Created ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  fs.rmSync(stagingParent, { recursive: true, force: true });
  console.error(error);
  process.exit(1);
});
