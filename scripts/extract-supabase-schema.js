#!/usr/bin/env node
/**
 * Supabase Schema Extractor
 * Extracts database schema, RLS policies, functions, triggers, and more
 * Outputs to supabase_schema.txt
 */

import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const OUTPUT_FILE = path.join(__dirname, '..', 'supabase_schema.txt');

let output = [];

function log(message) {
  output.push(message);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`);
  log(title);
  log('='.repeat(60));
  log('');
}

function extractFromMigrations() {
  log('SUPABASE DATABASE SCHEMA DOCUMENTATION');
  log(`Generated: ${new Date().toISOString()}`);
  log('Source: Migration files');
  log('='.repeat(60));

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    log('Error: Migrations directory not found');
    return;
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  logSection('MIGRATION FILES');
  for (const file of files) {
    log(`\n--- ${file} ---`);
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    log(content);
  }

  // Extract schema summary
  logSection('SCHEMA SUMMARY');

  const allContent = files.map(f => 
    fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf-8')
  ).join('\n\n');

  // Extract ENUM types
  const enumMatches = allContent.match(/CREATE TYPE.*?AS ENUM\s*\([^)]+\)/gi) || [];
  log('ENUM Types:');
  if (enumMatches.length > 0) {
    for (const e of enumMatches) {
      log(`  ${e.trim()}`);
    }
  } else {
    log('  (None found in migrations)');
  }

  // Extract Tables
  const tableMatches = allContent.match(/CREATE TABLE[^;]+/gi) || [];
  log('\nTables:');
  if (tableMatches.length > 0) {
    for (const t of tableMatches) {
      log(`  ${t.trim()}`);
    }
  } else {
    log('  (None found in migrations)');
  }

  // Extract Functions
  const funcMatches = allContent.match(/CREATE (OR REPLACE )?FUNCTION[^;]+/gi) || [];
  log('\nFunctions:');
  if (funcMatches.length > 0) {
    for (const f of funcMatches) {
      const nameMatch = f.match(/FUNCTION\s+(\w+\.?\w*)/i);
      log(`  ${nameMatch ? nameMatch[1] : f.substring(0, 50)}...`);
    }
  } else {
    log('  (None found in migrations)');
  }

  // Extract Triggers
  const triggerMatches = allContent.match(/CREATE TRIGGER[^;]+/gi) || [];
  log('\nTriggers:');
  if (triggerMatches.length > 0) {
    for (const t of triggerMatches) {
      log(`  ${t.trim()}`);
    }
  } else {
    log('  (None found in migrations)');
  }

  // Extract RLS Policies
  const policyMatches = allContent.match(/CREATE POLICY[^;]+/gi) || [];
  log('\nRLS Policies:');
  if (policyMatches.length > 0) {
    for (const p of policyMatches) {
      log(`  ${p.trim()}`);
    }
  } else {
    log('  (None found in migrations)');
  }

  // Extract Storage Buckets
  const storageMatches = allContent.match(/INSERT INTO storage\.buckets[^;]+/gi) || [];
  log('\nStorage Buckets:');
  if (storageMatches.length > 0) {
    for (const s of storageMatches) {
      log(`  ${s.trim()}`);
    }
  } else {
    log('  (None found in migrations)');
  }

  // Extract RPC Functions
  const rpcMatches = allContent.match(/CREATE (OR REPLACE )?FUNCTION\s+.*?RPC[^;]+/gi) || [];
  log('\nRPC Functions:');
  if (rpcMatches.length > 0) {
    for (const r of rpcMatches) {
      log(`  ${r.trim()}`);
    }
  } else {
    log('  (None found in migrations)');
  }
}

function main() {
  console.log('Extracting Supabase schema information...\n');

  extractFromMigrations();

  fs.writeFileSync(OUTPUT_FILE, output.join('\n'), 'utf-8');

  console.log(`Schema documentation written to: ${OUTPUT_FILE}`);
  console.log(`Total lines: ${output.length}`);
}

main();
