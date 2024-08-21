# doublylinked

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

## About

Doubly linked list implementation for JavaScript with iterator and array-like interface

## Installation

`$ npm install doublylinked [--save]`

## Constructor

```js
const list = new DoublyLinked([element1[, ..[, elementN]]]);
```

##### Parameters

- *elementN :* The elements will list contains


## Methods

* [`DoublyLinked.prototype.concat()`](#doublylinkedprototypeconcat)
* [`DoublyLinked.prototype.entries()`](#doublylinkedprototypeentries) 
* [`DoublyLinked.prototype.every()`](#doublylinkedprototypeevery)
* [`DoublyLinked.prototype.everyRight()`](#doublylinkedprototypeeveryright)
* [`DoublyLinked.prototype.filter()`](#doublylinkedprototypefilter)
* [`DoublyLinked.prototype.find()`](#doublylinkedprototypefind)
* [`DoublyLinked.prototype.forEach()`](#doublylinkedprototypeforeach)
* [`DoublyLinked.prototype.forEachRight()`](#doublylinkedprototypeforeachright)
* [`DoublyLinked.prototype.includes()`](#doublylinkedprototypeincludes)
* [`DoublyLinked.prototype.insert()`](#doublylinkedprototypeinsert)
* [`DoublyLinked.prototype.join()`](#doublylinkedprototypejoin)
* [`DoublyLinked.prototype.map()`](#doublylinkedprototypemap)
* [`DoublyLinked.prototype.next()`](#doublylinkedprototypenext)
* [`DoublyLinked.prototype.prev()`](#doublylinkedprototypeprev)
* [`DoublyLinked.prototype.pop()`](#doublylinkedprototypepop)
* [`DoublyLinked.prototype.push()`](#doublylinkedprototypepush)
* [`DoublyLinked.prototype.reduce()`](#doublylinkedprototypereduce)
* [`DoublyLinked.prototype.reduce()`](#doublylinkedprototypereduce)
* [`DoublyLinked.prototype.reduceRight()`](#doublylinkedprototypereduceright)
* [`DoublyLinked.prototype.remove()`](#doublylinkedprototyperemove)
* [`DoublyLinked.prototype.reset()`](#doublylinkedprototypereset)
* [`DoublyLinked.prototype.reverse()`](#doublylinkedprototypereverse)
* [`DoublyLinked.prototype.shift()`](#doublylinkedprototypeshift)
* [`DoublyLinked.prototype.some()`](#doublylinkedprototypesome)
* [`DoublyLinked.prototype.someRight()`](#doublylinkedprototypesomeright)
* [`DoublyLinked.prototype.toArray()`](#doublylinkedprototypetoarray)
* [`DoublyLinked.prototype.toString()`](#doublylinkedprototypetostring)
* [`DoublyLinked.prototype.unshift()`](#doublylinkedprototypeunshift)
* [`DoublyLinked.prototype[@@iterator]`](#doublylinkedprototypeiterator)

### DoublyLinked.prototype.concat()

Merges cursor list with and given lists/values into new list.

`list.concat(otherList1[, element1[, ...[otherList2]]])`

##### Parameters

- *valueN :* Lists and/or values to concatenate into a new list

- *Return value :* A new DoublyLinked instance



### DoublyLinked.prototype.entries()

Returns the iterator object contains entries

`list.entries()`

##### Parameters

- *Return value :* A new iterator object.



### DoublyLinked.prototype.every()

Tests whether all elements in the list pass the test implemented by the provided function (from left to right)

`list.every(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *currentValue :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* true if the callback function returns a truthy value for every list element; otherwise, false


### DoublyLinked.prototype.everyRight()

Tests whether all elements in the list pass the test implemented by the provided function (from right to left)

`list.everyRight(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *currentValue :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* true if the callback function returns a truthy value for every list element; otherwise, false



### DoublyLinked.prototype.filter()

Creates a new list with all elements that pass the test implemented by the provided function

`list.filter(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *element :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* A new list with the elements that pass the test



### DoublyLinked.prototype.find()

Returns the value of the first element in the list that satisfies the provided testing function. Otherwise undefined is returned

`list.find(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *element :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* A value in the list if an element passes the test; otherwise, undefined



### DoublyLinked.prototype.forEach()

Executes a provided function once for each list element (from left to right)

`list.forEach(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *element :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* Value to use as this when executing callback


### DoublyLinked.prototype.forEachRight()

Executes a provided function once for each list element (from right to left)

`list.forEachRight(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *element :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* Value to use as this when executing callback


### DoublyLinked.prototype.includes()

Determines whether an list includes a certain element, returning true or false as appropriate

`list.includes(searchElement[, fromIndex])`

##### Parameters

- *searchElement :* The element to search for
    
- *fromIndex :* The position in this list at which to begin searching for searchElement. A negative value searches from the index of list.length + fromIndex by asc. Defaults to 0.

- *Return value :* true if the searchElement found in the list; otherwise, false



### DoublyLinked.prototype.insert()

Adds one or more elements right after the cursor node of the list and returns the new length of the list

`list.insert(element1[, ...[, elementN]])`

##### Parameters

- *elementN :* The elements to add right after the cursor
    
- *Return value :* The new length of the list


### DoublyLinked.prototype.join()

Adds one or more elements right after the cursor node of the list and returns the new length of the list

`list.join([separator])`

##### Parameters

- *separator :* Specifies a string to separate each pair of adjacent elements of the list
    
- *Return value :* A string with all list elements joined. If length is 0, the empty string is returned


### DoublyLinked.prototype.map()

Creates a new list with the results of calling a provided function on every element in the calling list

`list.map(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *currentValue :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* A new list with each element being the result of the callback function



### DoublyLinked.prototype.next()

Moves cursor to the next and returns its value

`list.next()`

##### Parameters

- *Return value :* Returns value of next node to the cursor. If cursor reaches to the end it returns undefined



### DoublyLinked.prototype.prev()

Moves cursor to the previous and returns its value

`list.prev()`

##### Parameters

- *Return value :* Returns value of previous node to the cursor. If cursor reaches to the head it returns undefined



### DoublyLinked.prototype.pop()

Removes the last element from the list and returns that element

`list.pop()`

##### Parameters

- *Return value :* The removed element from the list; undefined if the list is empty.



### DoublyLinked.prototype.push()

Adds one or more elements to the end of the list and returns the new length of the list

`list.push(element1[, ...[, elementN]])`

##### Parameters

- *elementN :* The elements to add to the end of the list
    
- *Return value :* The new length of the list



### DoublyLinked.prototype.reduce()

Applies a function against an accumulator and each element in the list (from left-to-right) to reduce it to a single value

`list.reduce(callback[, initialValue])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *accumulator :* The accumulator accumulates the callback's return values; it is the accumulated value previously returned in the last invocation of the callback, or initialValue, if supplied.
    
    - *currentValue :* The current element being processed in the list
    
    - *currentIndex :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *initialValue :* Value to use as the first argument to the first call of the callback

- *Return value :* The value that results from the reduction


### DoublyLinked.prototype.reduceRight()

Applies a function against an accumulator and each element in the list (from right-to-left) to reduce it to a single value

`list.reduceRight(callback[, initialValue])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *accumulator :* The accumulator accumulates the callback's return values; it is the accumulated value previously returned in the last invocation of the callback, or initialValue, if supplied.
    
    - *currentValue :* The current element being processed in the list
    
    - *currentIndex :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *initialValue :* Value to use as the first argument to the first call of the callback

- *Return value :* The value that results from the reduction


### DoublyLinked.prototype.reset()

Resets cursor to head

`list.reset()`

##### Parameters

- *Return value :* Returns the DoublyLinked instance which this method is called



### DoublyLinked.prototype.reverse()

Reverses a list in place. The first array element becomes the last, and the last list element becomes the first

`list.reverse()`

##### Parameters

- *Return value :* Returns the DoublyLinked instance which this method is called


### DoublyLinked.prototype.shift()

Removes the first element from the list and returns that element

`list.shift()`

##### Parameters

- *Return value :* The removed element from the list; undefined if the list is empty



### DoublyLinked.prototype.some()

Tests whether all elements in the list pass the test implemented by the provided function (from left to right)

`list.some(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *currentValue :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* Value to use as this when executing callback



### DoublyLinked.prototype.someRight()

Tests whether all elements in the list pass the test implemented by the provided function (from right to left)

`list.someRight(callback[, thisArg])`

##### Parameters

- *callback :* Function to test for each element, taking three arguments:
    
    - *currentValue :* The current element being processed in the list
    
    - *index :* The index of the current element being processed in the list
    
    - *list :* The list every was called upon

- *thisArg :* Value to use as this when executing callback

- *Return value :* Value to use as this when executing callback


### DoublyLinked.prototype.toArray()

Returns a new array containing elements of the list

`list.toArray()`

##### Parameters

- *Return value :* A new Array instance contains elements of the list



### DoublyLinked.prototype.toString()

Returns a string representing the specified list and its elements

`list.toString()`

##### Parameters

- *Return value :* Returns a string representing the specified list and its elements.



### DoublyLinked.prototype.unshift()

Adds one or more elements to the beginning of the list the new length of the list

`list.unshift(element1[, ...[, elementN]])`

##### Parameters

- *elementN :* The elements to add to the front of the list
    
- *Return value :* The new length of the list


### DoublyLinked.prototype\[@@iterator\]

Returns the iterator object contains entries

`const iterator = list[Symbol.iterator]()`

```js
for (const val in list) {
  ...
}
```

##### Parameters
    
- *Return value :* Returns the iterator object contains entries



## Properties

#### cursor

Returns current located node of the list

#### head

Returns first node of the list

#### length

Returns the element count of the list

#### head

Returns last node of the list

## Node Compatibility

  - node `>= 6.0`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/doublylinked.svg
[npm-url]: https://npmjs.org/package/doublylinked
[travis-image]: https://img.shields.io/travis/panates/doublylinked/master.svg
[travis-url]: https://travis-ci.org/panates/doublylinked
[coveralls-image]: https://img.shields.io/coveralls/panates/doublylinked/master.svg
[coveralls-url]: https://coveralls.io/r/panates/doublylinked
[downloads-image]: https://img.shields.io/npm/dm/doublylinked.svg
[downloads-url]: https://npmjs.org/package/doublylinked
[gitter-image]: https://badges.gitter.im/panates/doublylinked.svg
[gitter-url]: https://gitter.im/panates/doublylinked?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/panates/doublylinked/status.svg
[dependencies-url]:https://david-dm.org/panates/doublylinked
[devdependencies-image]: https://david-dm.org/panates/doublylinked/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/doublylinked?type=dev
[quality-image]: http://npm.packagequality.com/shield/doublylinked.png
[quality-url]: http://packagequality.com/#?package=doublylinked
