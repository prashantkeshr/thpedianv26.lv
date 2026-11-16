#!/usr/bin/env node
/**
 * Techpedia Data Validation Script
 * Validates datasets/normalized/*.json against expected schemas.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

let errors = 0;
let warnings = 0;

function err(msg) { console.error(`  ✗ ERROR: ${msg}`); errors++; }
function warn(msg) { console.warn(`  ⚠ WARN:  ${msg}`); warnings++; }
function ok(msg) { console.log(`  ✓ ${msg}`); }

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    err(`Cannot parse ${path}: ${e.message}`);
    return null;
  }
}

// ─── Validate brands ─────────────────────────────────────────────────────────
console.log('\n📋 Validating brands...');
const brands = loadJson(resolve(root, 'datasets/normalized/brands.json'));
if (brands) {
  const ids = new Set();
  const slugs = new Set();
  for (const b of brands) {
    if (!b.id) err(`Brand missing id: ${b.name}`);
    else if (ids.has(b.id)) err(`Duplicate brand id: ${b.id}`);
    else ids.add(b.id);
    if (!b.slug) err(`Brand missing slug: ${b.name}`);
    else if (slugs.has(b.slug)) err(`Duplicate brand slug: ${b.slug}`);
    else slugs.add(b.slug);
    if (!b.name) err(`Brand missing name`);
    if (!b.description) warn(`Brand ${b.id} has no description`);
    if (!b.sources?.length) warn(`Brand ${b.id} has no sources`);
  }
  ok(`${brands.length} brands — ${ids.size} unique IDs`);
}

// ─── Validate devices ─────────────────────────────────────────────────────────
console.log('\n📱 Validating devices...');
const devices = loadJson(resolve(root, 'datasets/normalized/devices.json'));
const brandIds = brands ? new Set(brands.map(b => b.id)) : new Set();

if (devices) {
  const ids = new Set();
  const slugs = new Set();
  for (const d of devices) {
    if (!d.id) err(`Device missing id: ${d.name}`);
    else if (ids.has(d.id)) err(`Duplicate device id: ${d.id}`);
    else ids.add(d.id);
    if (!d.slug) err(`Device missing slug: ${d.name}`);
    else if (slugs.has(d.slug)) err(`Duplicate slug: ${d.slug}`);
    else slugs.add(d.slug);
    if (!d.name) err(`Device missing name`);
    if (!d.brand) err(`Device ${d.id} missing brand reference`);
    else if (!brandIds.has(d.brand)) warn(`Device ${d.id} references unknown brand: ${d.brand}`);
    if (!d.category) err(`Device ${d.id} missing category`);
    if (!d.description || d.description.length < 20) warn(`Device ${d.id} has thin description`);
    if (!d.sources?.length) warn(`Device ${d.id} has no sources`);
    if (!d.verificationLevel) err(`Device ${d.id} missing verificationLevel`);
    if (!d.specs || Object.keys(d.specs).length === 0) warn(`Device ${d.id} has no specs`);
  }
  ok(`${devices.length} devices — ${ids.size} unique IDs`);
}

// ─── Validate components ──────────────────────────────────────────────────────
console.log('\n🔌 Validating components...');
const components = loadJson(resolve(root, 'datasets/normalized/components.json'));

if (components) {
  const ids = new Set();
  const slugs = new Set();
  for (const c of components) {
    if (!c.id) err(`Component missing id: ${c.name}`);
    else if (ids.has(c.id)) err(`Duplicate component id: ${c.id}`);
    else ids.add(c.id);
    if (!c.slug) err(`Component missing slug: ${c.name}`);
    else if (slugs.has(c.slug)) err(`Duplicate slug: ${c.slug}`);
    else slugs.add(c.slug);
    if (!c.name) err(`Component missing name`);
    if (!c.partNumber) warn(`Component ${c.id} has no partNumber`);
    if (!c.manufacturerName) err(`Component ${c.id} missing manufacturerName`);
    if (!c.category) err(`Component ${c.id} missing category`);
    if (!c.description || c.description.length < 20) warn(`Component ${c.id} has thin description`);
    if (!c.sources?.length) warn(`Component ${c.id} has no sources`);
    if (!c.verificationLevel) err(`Component ${c.id} missing verificationLevel`);
  }
  ok(`${components.length} components — ${ids.size} unique IDs`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────');
if (errors > 0) {
  console.error(`\n❌ Validation FAILED: ${errors} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n⚠️  Validation passed with ${warnings} warning(s)\n`);
} else {
  console.log(`\n✅ All validations passed\n`);
}
