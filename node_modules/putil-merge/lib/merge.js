/* putil-merge
 ------------------------
 (c) 2017-present Panates
 This file may be freely distributed under the MIT license.
 */

/**
 *
 * @param {Object} target
 * @param {Object} source
 * @param {Object} options
 * @param {boolean|Function} [options.deep]
 * @param {boolean} [options.clone]
 * @param {boolean} [options.combine]
 * @param {boolean} [options.descriptor]
 * @param {Function} [options.filter]
 * @param {Boolean|Function} [options.arrayMerge]
 * @param {Function} [options.copyUndefined]
 * @return {Object}
 */
function merge(target, source, options = {}) {
  if (!(isObject(target) || typeof target === 'function'))
    throw new TypeError('Property "target" requires object or function type');
  if (typeof target === 'function' && options.clone)
    throw new TypeError('Can not clone a function');
  if (!source)
    return target;
  if (!(isObject(source) || typeof source === 'function'))
    throw new TypeError('Property "source" requires object or function type');
  const optionDeep = options.deep;
  const optionDescriptor = options.descriptor;
  const optionClone = options.clone;
  const optionFilter = options.filter;
  const optionCombine = options.combine;
  const optionCopyUndefined = options.copyUndefined;
  const optionArrayMerge = options.arrayMerge;

  if (source === target) return target;
  const keys = Object.getOwnPropertyNames(source);
  keys.push(...Object.getOwnPropertySymbols(source));
  for (const key of keys) {
    if (key === '__proto__' || key === 'constructor')
      continue;
    if (optionFilter && !optionFilter(source, key))
      continue;
    if (optionCombine && target.hasOwnProperty(key))
      continue;

    const descriptor = Object.getOwnPropertyDescriptor(source, key);

    if (optionDescriptor && (descriptor.get || descriptor.set)) {
      Object.defineProperty(target, key, descriptor);
      continue;
    }
    let srcVal = source[key];
    if (srcVal === undefined && !optionCopyUndefined)
      continue;

    delete descriptor.get;
    delete descriptor.set;
    if (!optionDescriptor) {
      descriptor.enumerable = true;
      descriptor.configurable = true;
      descriptor.writable = true;
    }

    let trgVal = target[key];
    if (isPlainObject(srcVal)) {
      if (optionDeep === true ||
          (typeof optionDeep === 'function' && optionDeep(srcVal))) {
        if (!isObject(trgVal)) {
          descriptor.value = trgVal = {};
          Object.defineProperty(target, key, descriptor);
        }
        merge(trgVal, srcVal, options);
        continue;
      }
      if (optionClone)
        srcVal = merge({}, srcVal, options);
    } else if (Array.isArray(srcVal)) {
      if (optionArrayMerge && Array.isArray(trgVal)) {
        if (typeof optionArrayMerge === 'function')
          srcVal = optionArrayMerge(trgVal, srcVal);
        else
          srcVal = merge.arrayCombine(trgVal, srcVal);
      } else if (optionClone)
        srcVal = srcVal.slice();
    }
    descriptor.value = srcVal;
    Object.defineProperty(target, key, descriptor);
  }
  return target;
}

merge.all = function all(objects, options = {}) {
  const target = objects[0];
  for (const [i, o] of objects.entries()) {
    if (i > 0)
      merge(target, o, options);
  }
  return target;
};

merge.arrayCombine = function(target, source) {
  return target.concat(source.filter((v) => !target.includes(v)));
};

const isObject = (v) => v && (
    (typeof v === 'object' && !Array.isArray(v)));

const objCtorStr = Function.prototype.toString.call(Object);

const isPlainObject = (obj) => {
  if (typeof obj === 'object' && Object.prototype.toString.call(obj) ===
      '[object Object]') {
    const proto = Object.getPrototypeOf(obj);
    if (proto) {
      const ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
          proto.constructor;
      return typeof ctor === 'function' && (ctor instanceof ctor) &&
          Function.prototype.toString.call(ctor) === objCtorStr;
    } else return true;
  }
  return false;
};

module.exports = merge;
