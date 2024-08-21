Object.defineProperty(exports, '__esModule', {
  value: true
});

const DATE_FORMAT_PATTERN = /^(\d{4})-?(0[1-9]|1[012])?-?([123]0|[012][1-9]|31)?(?:[T ]?([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])?(?:\.(\d+))?(?:(Z)|(?:([+-])([01]?[0-9]|2[0-3]):?([0-5][0-9])?))?)?$/;
const BOOLEAN_PATTERN = /^true|t|1|yes|y$/i;

function coalesce(...args) {
  const l = args.length;
  let v;
  for (let i = 0; i < l; i++) {
    v = args[i];
    if (v != null)
      return v;
  }
}

function toString(v) {
  return v != null ? '' + v : undefined;
}

function toStringDef(v, d) {
  return v != null ? '' + v : toString(d);
}

function toBoolean(v) {
  if (v == null)
    return;
  if (typeof v === 'string')
    return BOOLEAN_PATTERN.test(v);
  return !!v;
}

function toBooleanDef(v, d) {
  return v != null ? toBoolean(v) : toBoolean(d);
}

function toNumber(v) {
  if (v == null)
    return;
  const x = parseFloat(v);
  if (x || x === 0)
    return x;
  throw new TypeError(`"${v}" is not a valid number value.`);
}

function toNumberDef(v, d) {
  return v != null ? toNumber(v) : toNumber(d);
}

function toInt(v) {
  if (v == null)
    return;
  const x = parseInt(v, 10);
  if (x || x === 0)
    return x;
  throw new TypeError(`"${v}" is not a valid integer value.`);
}

function toIntDef(v, d) {
  return v != null ? toInt(v) : toInt(d);
}

function toDate(v) {
  if (v == null)
    return;
  if (v instanceof Date)
    return v;
  if (typeof v === 'number')
    return new Date(v);
  if (typeof v === 'string')
    return parseDate(v);
  throw new TypeError(`"${v}" is not a valid date value.`);
}

function toDateDef(v, d) {
  return v != null ? toDate(v) : toDate(d);
}

function toArray(v) {
  return Array.isArray(v) ? v : (v ? [v] : undefined);
}

function toArrayDef(v, d) {
  return v != null ? toArray(v) : toArray(d);
}

function parseDate(v, opts) {
  const m = v.match(DATE_FORMAT_PATTERN);
  if (!m)
    throw new TypeError(`"${v}" is not a valid date value.`);
  let s = m[1] + '-' + (m[2] || '01') + '-' + (m[3] || '01') + 'T';

  if (opts && opts.dateOnly)
    s += '00:00:00';
  else {
    s += (m[4] || '00') + ':' + (m[5] || '00') + ':' + (m[6] || '00') +
        (m[7] ? '.' + m[7] : '');
    if (!(opts && opts.ignoreTimezone))
        // Timezone
      s += m[8] ? 'Z' :
          (m[9] ? (m[9] + (m[10] || '00') + ':' + (m[11] || '00')) : '');
  }
  return new Date(s);
}

function camelCase(v) {
  return v.replace(/[\W_\s]+([^\W_\s])/g, (arg$, c) => {
        return c[0].toUpperCase();
      }
  );
}

function pascalCase(v) {
  const s = camelCase(v);
  return s[0].toUpperCase() + s.substring(1);
}

function upperFirst(v) {
  v = toString(v);
  return v ? v[0].toUpperCase() + v.substring(1) : v;
}

function mapDistinct(arr, cb) {
  return arr.reduce((a, x) => {
    x = cb ? cb(x) : x;
    /* istanbul ignore else */
    if (x != null && !a.includes(x))
      a.push(x);
    return a;
  }, []);
}

module.exports = {
  coalesce,
  toString,
  toStringDef,
  toBoolean,
  toBooleanDef,
  toNumber,
  toNumberDef,
  toInt,
  toIntDef,
  toDate,
  toDateDef,
  toArray,
  toArrayDef,
  parseDate,
  camelCase,
  pascalCase,
  upperFirst,
  mapDistinct,

  // Deprecated
  coerceToArray: toArrayDef,
  coerceToString: toStringDef,
  coerceToBoolean: toBooleanDef,
  coerceToNumber: toNumberDef,
  coerceToInt: toIntDef,
  coerceToDate: toDateDef
};
