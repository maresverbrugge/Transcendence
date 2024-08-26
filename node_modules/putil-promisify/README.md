# putil-promisify

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

Simple and lightweight utility fore transforming callback functions to Promises

## Installation

  - `npm install putil-promisify --save`

## Usage

`promisify(resolver)`


```javascript
const Promisify = require('./');
const fs = require('fs');

// Transform callback function to promise
const promise = Promisify.fromCallback((cb) => {
  fs.readdir('./', cb);
});

// Do what ever you want with promise
promise.then(result => {
  console.log(result);
}).catch(e => {
  console.error(e);
});
```

## Node Compatibility

  - node `>= 6.x`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/putil-promisify.svg
[npm-url]: https://npmjs.org/package/putil-promisify
[travis-image]: https://img.shields.io/travis/panates/putil-promisify/master.svg
[travis-url]: https://travis-ci.org/panates/putil-promisify
[coveralls-image]: https://img.shields.io/coveralls/panates/putil-promisify/master.svg
[coveralls-url]: https://coveralls.io/r/panates/putil-promisify
[downloads-image]: https://img.shields.io/npm/dm/putil-promisify.svg
[downloads-url]: https://npmjs.org/package/putil-promisify
[gitter-image]: https://badges.gitter.im/panates/putil-promisify.svg
[gitter-url]: https://gitter.im/panates/putil-promisify?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/panates/putil-promisify/status.svg
[dependencies-url]:https://david-dm.org/panates/putil-promisify
[devdependencies-image]: https://david-dm.org/panates/putil-promisify/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/putil-promisify?type=dev
[quality-image]: http://npm.packagequality.com/shield/putil-promisify.png
[quality-url]: http://packagequality.com/#?package=putil-promisify
