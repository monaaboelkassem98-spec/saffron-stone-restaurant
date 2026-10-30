import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const db = JSON.parse(readFileSync(resolve(root, 'db.json'), 'utf8'));
const errors = [];
const required = ['categories', 'menu', 'orders', 'cart', 'customers', 'reviews'];
for (const key of required) {
  if (!Array.isArray(db[key])) errors.push(`${key} must be an array`);
}
if (!db.restaurant || typeof db.restaurant !== 'object') errors.push('restaurant must be an object');
for (const key of required) {
  if (!Array.isArray(db[key])) continue;
  const ids = new Set();
  for (const row of db[key]) {
    if (!row || typeof row.id !== 'string' || !row.id) errors.push(`${key}: id must be a nonempty string`);
    if (ids.has(row?.id)) errors.push(`${key}: duplicate id ${row.id}`);
    ids.add(row?.id);
  }
}
const menuIds = new Set((db.menu || []).map(x => x.id));
const categoryIds = new Set((db.categories || []).map(x => x.id));
const customerIds = new Set((db.customers || []).map(x => x.id));
for (const p of db.menu || []) {
  if (!categoryIds.has(p.categoryId)) errors.push(`Menu ${p.id}: unknown categoryId`);
  if (!Number.isFinite(p.price) || p.price < 0) errors.push(`Menu ${p.id}: invalid price`);
}
for (const c of db.cart || []) {
  if (!menuIds.has(c.menuItemId)) errors.push(`Cart ${c.id}: unknown menuItemId`);
  if (!Number.isInteger(c.quantity) || c.quantity < 1) errors.push(`Cart ${c.id}: invalid quantity`);
}
for (const o of db.orders || []) {
  if (!customerIds.has(o.customerId)) errors.push(`Order ${o.id}: unknown customerId`);
  const subtotal = o.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  if (subtotal !== o.subtotal) errors.push(`Order ${o.id}: wrong subtotal`);
  if (o.subtotal + o.deliveryFee !== o.total) errors.push(`Order ${o.id}: wrong total`);
  for (const item of o.items) if (!menuIds.has(item.menuItemId)) errors.push(`Order ${o.id}: unknown menuItemId`);
}
for (const r of db.reviews || []) if (!menuIds.has(r.menuItemId)) errors.push(`Review ${r.id}: unknown menuItemId`);
if (errors.length) {
  console.error('Database validation failed:\n' + errors.map(x => '- ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Database valid:', Object.fromEntries(required.map(k => [k, db[k].length])));
}
