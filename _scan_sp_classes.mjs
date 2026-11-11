import { readFileSync } from 'node:fs';
const css = readFileSync('assets/globals-C33ZCAck.css', 'utf8');
const classes = [...new Set([...css.matchAll(/\.(skin-[\w-]+|sp-[\w-]+|topbar-sp[\w-]*)/g)].map(m => m[1]))];
console.log(classes.filter(c => /sp|own|price|free|purchase|unowned/i.test(c)).join('\n'));
