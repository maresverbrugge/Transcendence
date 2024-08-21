/* putil-promisify
 ------------------------
 (c) 2017-present Panates
 https://panates.github.io/putil-promisify/
 */

const promisify = function(fn) {
  if (promisify.isPromise(fn))
    return fn;
  if (typeof fn !== 'function')
    return Promise.resolve(fn);
  return new Promise((resolve, reject) => {
    try {
      const o = fn();
      if (promisify.isPromise(o)) {
        o.then(v => resolve(v))
            .catch((e) => reject(e));
      } else resolve(o);
    } catch (e) {
      reject(e);
    }
  });
};

promisify.fromCallback = function(resolver) {
  return new Promise((resolve, reject) => {
    try {
      resolver((error, value) => {
        if (error)
          reject(error);
        else resolve(value);
      });
    } catch (e) {
      reject(e);
    }
  });
};

promisify.isPromise = function(o) {
  return o &&
      (o instanceof global.Promise || o instanceof Promise ||
          (typeof o === 'object' && typeof o.then === 'function' &&
              typeof o.catch === 'function'));
};

promisify.deepResolve = function(obj) {
  if (obj instanceof Promise)
    return Promise.resolve(obj)
        .then(v => promisify.deepResolve(v));

  const stackSet = new Set();
  const promises = [];

  const visitObj = (v) => {
    if (v && typeof v === 'object') {
      if (stackSet.has(v))
        return;
      stackSet.add(v);
    }

    if (Array.isArray(v)) {
      const len = v.length;
      for (let i = 0; i < len; i++) {
        if (v[i] instanceof Promise) {
          promises.push(v[i].then((x) => v[i] = x));
        } else
          visitObj(v[i]);
      }
    } else if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        if (v[k] instanceof Promise) {
          promises.push(v[k].then((x) => v[k] = x));
        } else
          visitObj(v[k]);
      }
    }
  };

  visitObj(obj);
  return promises.length ?
      Promise.all(promises).then(
          () => promisify.deepResolve(obj)) :
      obj;
};

promisify.wait = function(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

promisify.await = function(x, callback) {
  if (promisify.isPromise(x))
    return x.then((v) => callback && callback(undefined, v))
        .catch((e) => callback && callback(e));
  else callback && callback(undefined, x);
};

module.exports = promisify;
