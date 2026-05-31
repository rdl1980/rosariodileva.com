#!/usr/bin/env node
/**
 * Valida tutti i blocchi JSON-LD in ogni file HTML del progetto.
 * Esce con codice 1 se trova JSON non valido o tipi @type mancanti.
 */
const fs   = require('fs');
const path = require('path');
const glob = require('fs');

const ROOT = path.join(__dirname, '..', '..');
const HTML_RE = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

let errors = 0;

function checkFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  let match;
  HTML_RE.lastIndex = 0;
  while ((match = HTML_RE.exec(src)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      // Controlla che ogni nodo abbia @type
      const nodes = parsed['@graph'] || [parsed];
      nodes.forEach((node, i) => {
        if (!node['@type']) {
          console.error(`❌  ${filePath}: nodo [${i}] senza @type`);
          errors++;
        }
      });
    } catch (e) {
      console.error(`❌  ${filePath}: JSON non valido — ${e.message}`);
      errors++;
    }
  }
}

// Trova tutti gli HTML nella root del progetto (non in node_modules)
fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html'))
  .forEach(f => checkFile(path.join(ROOT, f)));

if (errors === 0) {
  console.log(`✅  Tutti i JSON-LD validi.`);
} else {
  console.error(`\n${errors} errore/i trovato/i.`);
  process.exit(1);
}
