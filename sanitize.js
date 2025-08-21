export function toNullableNumber(value) {
if (value === null || value === undefined) return null;
if (typeof value === 'number') {
return Number.isFinite(value) ? value : null;
}
// strings like "NaN", "" or numeric strings
const str = String(value).trim();
if (str.length === 0) return null;
if (str.toLowerCase() === 'nan') return null;
const num = Number(str);
return Number.isFinite(num) ? num : null;
}


// Safely pick nested nutrient strings, keep as-is for JSONB
export function safeNutrients(n) {
if (!n || typeof n !== 'object') return {};
return n;
}
```