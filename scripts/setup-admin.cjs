#!/usr/bin/env node
/**
 * Panda Admin Setup Script
 * Generates a bcrypt hash for the admin password and writes it to .env.local.
 * Run once during initial deployment.
 *
 * Usage:
 *   node scripts/setup-admin.cjs
 *
 * The password you provide is hashed and never stored in plaintext.
 * Only the bcrypt hash is written to .env.local.
 */

"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const EMAIL = "admin@pandamarketing.ps";
const COST_FACTOR = 10;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\nPanda Admin Setup\n" + "─".repeat(32));

  // Optionally prompt for a custom password, or generate one
  const useGenerated = await ask("Generate a random password? (Y/n): ");
  let password;

  if (useGenerated.trim().toLowerCase() !== "n") {
    password = crypto.randomBytes(18).toString("base64url");
    console.log(`\nGenerated password (save this now — not stored anywhere):`);
    console.log(`  ${password}\n`);
  } else {
    password = await ask("Enter password (min 12 chars): ");
    if (password.length < 12) {
      console.error("Password too short. Minimum 12 characters.");
      rl.close();
      process.exit(1);
    }
  }

  rl.close();

  const hash = bcrypt.hashSync(password, COST_FACTOR);
  password = null; // clear from memory immediately

  // Write to .env.local
  const envPath = path.join(__dirname, "..", ".env.local");
  let existing = "";
  try { existing = fs.readFileSync(envPath, "utf8"); } catch { /* new file */ }

  const emailLine = `VITE_ADMIN_EMAIL=${EMAIL}`;
  const hashLine = `VITE_ADMIN_PASSWORD_HASH=${hash}`;

  let output = existing;
  if (existing.includes("VITE_ADMIN_EMAIL=")) {
    output = output.replace(/^VITE_ADMIN_EMAIL=.*$/m, emailLine);
  } else {
    output += (output.endsWith("\n") || !output ? "" : "\n") + emailLine + "\n";
  }
  if (existing.includes("VITE_ADMIN_PASSWORD_HASH=")) {
    output = output.replace(/^VITE_ADMIN_PASSWORD_HASH=.*$/m, hashLine);
  } else {
    output += hashLine + "\n";
  }

  fs.writeFileSync(envPath, output, "utf8");
  console.log("✓ Hash written to .env.local (password not stored)");
  console.log("  Restart the dev server (npm run dev) to apply.\n");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
