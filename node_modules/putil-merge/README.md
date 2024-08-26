# putil-merge

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

A 'swiss army knife' solution for merging two or more objects. It supports deep merge, cloning properties, copying descriptors and filtering.

## Installation

`$ npm install putil-merge --save`

## Table of contents

- [merge()](#merge)
- [merge.all()](#mergeall)


## Merge

`merge(target, source[, options])`

- `target:object`:
- `source:object`:
- `options:object` 
    - `deep:boolean` (optional): If true, it performs deep merge operation. **Default:** `false`
    - `clone:boolean` (optional): If true, clones object properties rather than assigning references.  **Default:** `false`
    - `adjunct:boolean`(optional): If true, it copies only non-existing properties. **Default:** `false`
    - `descriptor:boolean`(optional): If true, copies property descriptors.  **Default:** `false`
    - `filter:function` (optional): A callback function to test if source property will be merged to target.
    - `arrayMerge:boolean|function` (optional): If true, it combines array values. It this is a function, result of call will be assigned to target.

**Copying source properties to target object**

```javascript
const a = {x: 1, y: 2};
const b = {x: {}, z: [1, 2, 3, 4]};
const merged = merge(a, b);
assert(merged.x===b.x); // References copied
assert(merged.z===b.z); // References copied
```

**Cloning source properties to target object**

```js
const a = {x: 1, y: 2};
const b = {x: {}, z: [1, 2, 3, 4]};
const merged = merge(a, b, {clone: true});
assert(merged.x!==b.x); // Object cloned
assert(merged.z!==b.z); // Array cloned
```


**Applying filter while merge**

```js
const a = {x: 1, y: 2};
const b = {x: {}, z: [1, 2, 3, 4]};
const merged = merge(a, b, {filter: (src, key)=>key!=='z'});
assert(!merged.z); // Z will not be merged
```


**Copying descriptors**

```javascript
const b = {};
Object.defineProperty(b, 'foo', {
  enumerable: false
});
const merged = merge({}, b, {descriptor: true});
assert.strictEqual(Object.getOwnPropertyDescriptor(merged, 'foo').enumerable, false);
```

**Copying getters and setters**

```javascript
const b = {
  bar: 1,
  get foo(){
    return this.bar; 
  }
};
const merged = merge({}, b, {descriptor: true});
assert.strictEqual(merged.foo, 1);
```


**Copying function properties**

```javascript
const b = {
  bar: 1,
  getFoo(){
    return this.bar; 
  }
};
const merged = merge({}, b, {descriptor: true});
assert.strictEqual(merged.getFoo(), 1);
```


## Merge.all()

Performs merge with more than two objects.

`merge.all(arrayOfObjects[, options])`

- `arrayOfObjects:Array<object>`:
- `options:object` 
    - `deep:boolean` (optional): If true, it performs deep merge operation. **Default:** `false`
    - `clone:boolean` (optional): If true, clones object properties rather than assigning references.  **Default:** `false`
    - `combine:boolean`(optional): If true, it copies only non-existing properties. **Default:** `false`
    - `descriptor:boolean`(optional): If true, copies property descriptors.  **Default:** `false`
    - `filter:function` (optional): A callback function to test if source property will be merged to target.
    - `arrayMerge:boolean|function` (optional): If true, it combines array values. It this is a function, result of call will be assigned to target.


## Node Compatibility

  - node `>= 6.0`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/putil-merge.svg
[npm-url]: https://npmjs.org/package/putil-merge
[travis-image]: https://img.shields.io/travis/panates/putil-merge/master.svg
[travis-url]: https://travis-ci.org/panates/putil-merge
[coveralls-image]: https://img.shields.io/coveralls/panates/putil-merge/master.svg
[coveralls-url]: https://coveralls.io/r/panates/putil-merge
[downloads-image]: https://img.shields.io/npm/dm/putil-merge.svg
[downloads-url]: https://npmjs.org/package/putil-merge
[devdependencies-image]: https://david-dm.org/panates/putil-merge/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/putil-merge?type=dev
