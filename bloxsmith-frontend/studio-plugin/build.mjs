#!/usr/bin/env node

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { homedir, platform } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(__dirname, "plugin.luau");
const outputPath = join(__dirname, "BloxsmithPlugin.rbxmx");

if (!existsSync(sourcePath)) {
  console.error(`Source not found: ${sourcePath}`);
  process.exit(1);
}

const source = readFileSync(sourcePath, "utf8");
const escaped = source.replace(/\]\]>/g, "]]]]><![CDATA[>");

const rbxmx = `<?xml version="1.0" encoding="utf-8"?>
<roblox version="4">
  <Item class="Script" referent="0">
    <Properties>
      <string name="Name">BloxsmithPlugin</string>
      <token name="RunContext">0</token>
      <string name="Source"><![CDATA[${escaped}]]></string>
    </Properties>
  </Item>
</roblox>
`;

writeFileSync(outputPath, rbxmx, "utf8");
console.log(`Built ${outputPath}`);

if (process.argv.includes("--install")) {
  const pluginsFolder =
    platform() === "win32"
      ? join(
          process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"),
          "Roblox",
          "Plugins",
        )
      : join(homedir(), "Documents", "Roblox", "Plugins");

  if (!existsSync(pluginsFolder)) {
    console.error(`Plugins folder not found: ${pluginsFolder}`);
    process.exit(1);
  }

  const dest = join(pluginsFolder, "BloxsmithPlugin.rbxmx");
  copyFileSync(outputPath, dest);
  console.log(`Installed to ${dest}`);
}
