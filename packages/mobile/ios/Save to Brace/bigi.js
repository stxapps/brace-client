 (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bigi = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
 'use strict'

 exports.byteLength = byteLength
 exports.toByteArray = toByteArray
 exports.fromByteArray = fromByteArray

 var lookup = []
 var revLookup = []
 var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

 var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
 for (var i = 0, len = code.length; i < len; ++i) {
   lookup[i] = code[i]
   revLookup[code.charCodeAt(i)] = i
 }

 // Support decoding URL-safe base64 strings, as Node.js does.
 // See: https://en.wikipedia.org/wiki/Base64#URL_applications
 revLookup['-'.charCodeAt(0)] = 62
 revLookup['_'.charCodeAt(0)] = 63

 function placeHoldersCount (b64) {
   var len = b64.length
   if (len % 4 > 0) {
     throw new Error('Invalid string. Length must be a multiple of 4')
   }

   // the number of equal signs (place holders)
   // if there are two placeholders, than the two characters before it
   // represent one byte
   // if there is only one, then the three characters before it represent 2 bytes
   // this is just a cheap hack to not do indexOf twice
   return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
 }

 function byteLength (b64) {
   // base64 is 4/3 + up to two characters of the original data
   return (b64.length * 3 / 4) - placeHoldersCount(b64)
 }

 function toByteArray (b64) {
   var i, l, tmp, placeHolders, arr
   var len = b64.length
   placeHolders = placeHoldersCount(b64)

   arr = new Arr((len * 3 / 4) - placeHolders)

   // if there are placeholders, only get up to the last complete 4 chars
   l = placeHolders > 0 ? len - 4 : len

   var L = 0

   for (i = 0; i < l; i += 4) {
     tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
     arr[L++] = (tmp >> 16) & 0xFF
     arr[L++] = (tmp >> 8) & 0xFF
     arr[L++] = tmp & 0xFF
   }

   if (placeHolders === 2) {
     tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
     arr[L++] = tmp & 0xFF
   } else if (placeHolders === 1) {
     tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
     arr[L++] = (tmp >> 8) & 0xFF
     arr[L++] = tmp & 0xFF
   }

   return arr
 }

 function tripletToBase64 (num) {
   return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
 }

 function encodeChunk (uint8, start, end) {
   var tmp
   var output = []
   for (var i = start; i < end; i += 3) {
     tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF)
     output.push(tripletToBase64(tmp))
   }
   return output.join('')
 }

 function fromByteArray (uint8) {
   var tmp
   var len = uint8.length
   var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
   var output = ''
   var parts = []
   var maxChunkLength = 16383 // must be multiple of 3

   // go through the array every three bytes, we'll deal with trailing stuff later
   for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
     parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
   }

   // pad the end with zeros, but make sure to not forget the extra bytes
   if (extraBytes === 1) {
     tmp = uint8[len - 1]
     output += lookup[tmp >> 2]
     output += lookup[(tmp << 4) & 0x3F]
     output += '=='
   } else if (extraBytes === 2) {
     tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
     output += lookup[tmp >> 10]
     output += lookup[(tmp >> 4) & 0x3F]
     output += lookup[(tmp << 2) & 0x3F]
     output += '='
   }

   parts.push(output)

   return parts.join('')
 }

 },{}],2:[function(require,module,exports){
 /*!
  * The buffer module from node.js, for the browser.
  *
  * @author   Feross Aboukhadijeh <https://feross.org>
  * @license  MIT
  */
 /* eslint-disable no-proto */

 'use strict'

 var base64 = require('base64-js')
 var ieee754 = require('ieee754')

 exports.Buffer = Buffer
 exports.SlowBuffer = SlowBuffer
 exports.INSPECT_MAX_BYTES = 50

 var K_MAX_LENGTH = 0x7fffffff
 exports.kMaxLength = K_MAX_LENGTH

 /**
  * If `Buffer.TYPED_ARRAY_SUPPORT`:
  *   === true    Use Uint8Array implementation (fastest)
  *   === false   Print warning and recommend using `buffer` v4.x which has an Object
  *               implementation (most compatible, even IE6)
  *
  * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
  * Opera 11.6+, iOS 4.2+.
  *
  * We report that the browser does not support typed arrays if the are not subclassable
  * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
  * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
  * for __proto__ and has a buggy typed array implementation.
  */
 Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

 if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
     typeof console.error === 'function') {
   console.error(
     'This browser lacks typed array (Uint8Array) support which is required by ' +
     '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
   )
 }

 function typedArraySupport () {
   // Can typed array instances can be augmented?
   try {
     var arr = new Uint8Array(1)
     arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
     return arr.foo() === 42
   } catch (e) {
     return false
   }
 }

 Object.defineProperty(Buffer.prototype, 'parent', {
   get: function () {
     if (!(this instanceof Buffer)) {
       return undefined
     }
     return this.buffer
   }
 })

 Object.defineProperty(Buffer.prototype, 'offset', {
   get: function () {
     if (!(this instanceof Buffer)) {
       return undefined
     }
     return this.byteOffset
   }
 })

 function createBuffer (length) {
   if (length > K_MAX_LENGTH) {
     throw new RangeError('Invalid typed array length')
   }
   // Return an augmented `Uint8Array` instance
   var buf = new Uint8Array(length)
   buf.__proto__ = Buffer.prototype
   return buf
 }

 /**
  * The Buffer constructor returns instances of `Uint8Array` that have their
  * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
  * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
  * and the `Uint8Array` methods. Square bracket notation works as expected -- it
  * returns a single octet.
  *
  * The `Uint8Array` prototype remains unmodified.
  */

 function Buffer (arg, encodingOrOffset, length) {
   // Common case.
   if (typeof arg === 'number') {
     if (typeof encodingOrOffset === 'string') {
       throw new Error(
         'If encoding is specified then the first argument must be a string'
       )
     }
     return allocUnsafe(arg)
   }
   return from(arg, encodingOrOffset, length)
 }

 // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
 if (typeof Symbol !== 'undefined' && Symbol.species &&
     Buffer[Symbol.species] === Buffer) {
   Object.defineProperty(Buffer, Symbol.species, {
     value: null,
     configurable: true,
     enumerable: false,
     writable: false
   })
 }

 Buffer.poolSize = 8192 // not used by this implementation

 function from (value, encodingOrOffset, length) {
   if (typeof value === 'number') {
     throw new TypeError('"value" argument must not be a number')
   }

   if (isArrayBuffer(value) || (value && isArrayBuffer(value.buffer))) {
     return fromArrayBuffer(value, encodingOrOffset, length)
   }

   if (typeof value === 'string') {
     return fromString(value, encodingOrOffset)
   }

   return fromObject(value)
 }

 /**
  * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
  * if value is a number.
  * Buffer.from(str[, encoding])
  * Buffer.from(array)
  * Buffer.from(buffer)
  * Buffer.from(arrayBuffer[, byteOffset[, length]])
  **/
 Buffer.from = function (value, encodingOrOffset, length) {
   return from(value, encodingOrOffset, length)
 }

 // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
 // https://github.com/feross/buffer/pull/148
 Buffer.prototype.__proto__ = Uint8Array.prototype
 Buffer.__proto__ = Uint8Array

 function assertSize (size) {
   if (typeof size !== 'number') {
     throw new TypeError('"size" argument must be of type number')
   } else if (size < 0) {
     throw new RangeError('"size" argument must not be negative')
   }
 }

 function alloc (size, fill, encoding) {
   assertSize(size)
   if (size <= 0) {
     return createBuffer(size)
   }
   if (fill !== undefined) {
     // Only pay attention to encoding if it's a string. This
     // prevents accidentally sending in a number that would
     // be interpretted as a start offset.
     return typeof encoding === 'string'
       ? createBuffer(size).fill(fill, encoding)
       : createBuffer(size).fill(fill)
   }
   return createBuffer(size)
 }

 /**
  * Creates a new filled Buffer instance.
  * alloc(size[, fill[, encoding]])
  **/
 Buffer.alloc = function (size, fill, encoding) {
   return alloc(size, fill, encoding)
 }

 function allocUnsafe (size) {
   assertSize(size)
   return createBuffer(size < 0 ? 0 : checked(size) | 0)
 }

 /**
  * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
  * */
 Buffer.allocUnsafe = function (size) {
   return allocUnsafe(size)
 }
 /**
  * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
  */
 Buffer.allocUnsafeSlow = function (size) {
   return allocUnsafe(size)
 }

 function fromString (string, encoding) {
   if (typeof encoding !== 'string' || encoding === '') {
     encoding = 'utf8'
   }

   if (!Buffer.isEncoding(encoding)) {
     throw new TypeError('Unknown encoding: ' + encoding)
   }

   var length = byteLength(string, encoding) | 0
   var buf = createBuffer(length)

   var actual = buf.write(string, encoding)

   if (actual !== length) {
     // Writing a hex string, for example, that contains invalid characters will
     // cause everything after the first invalid character to be ignored. (e.g.
     // 'abxxcd' will be treated as 'ab')
     buf = buf.slice(0, actual)
   }

   return buf
 }

 function fromArrayLike (array) {
   var length = array.length < 0 ? 0 : checked(array.length) | 0
   var buf = createBuffer(length)
   for (var i = 0; i < length; i += 1) {
     buf[i] = array[i] & 255
   }
   return buf
 }

 function fromArrayBuffer (array, byteOffset, length) {
   if (byteOffset < 0 || array.byteLength < byteOffset) {
     throw new RangeError('"offset" is outside of buffer bounds')
   }

   if (array.byteLength < byteOffset + (length || 0)) {
     throw new RangeError('"length" is outside of buffer bounds')
   }

   var buf
   if (byteOffset === undefined && length === undefined) {
     buf = new Uint8Array(array)
   } else if (length === undefined) {
     buf = new Uint8Array(array, byteOffset)
   } else {
     buf = new Uint8Array(array, byteOffset, length)
   }

   // Return an augmented `Uint8Array` instance
   buf.__proto__ = Buffer.prototype
   return buf
 }

 function fromObject (obj) {
   if (Buffer.isBuffer(obj)) {
     var len = checked(obj.length) | 0
     var buf = createBuffer(len)

     if (buf.length === 0) {
       return buf
     }

     obj.copy(buf, 0, 0, len)
     return buf
   }

   if (obj) {
     if (ArrayBuffer.isView(obj) || 'length' in obj) {
       if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
         return createBuffer(0)
       }
       return fromArrayLike(obj)
     }

     if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
       return fromArrayLike(obj.data)
     }
   }

   throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.')
 }

 function checked (length) {
   // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
   // length is NaN (which is otherwise coerced to zero.)
   if (length >= K_MAX_LENGTH) {
     throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                          'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
   }
   return length | 0
 }

 function SlowBuffer (length) {
   if (+length != length) { // eslint-disable-line eqeqeq
     length = 0
   }
   return Buffer.alloc(+length)
 }

 Buffer.isBuffer = function isBuffer (b) {
   return b != null && b._isBuffer === true
 }

 Buffer.compare = function compare (a, b) {
   if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
     throw new TypeError('Arguments must be Buffers')
   }

   if (a === b) return 0

   var x = a.length
   var y = b.length

   for (var i = 0, len = Math.min(x, y); i < len; ++i) {
     if (a[i] !== b[i]) {
       x = a[i]
       y = b[i]
       break
     }
   }

   if (x < y) return -1
   if (y < x) return 1
   return 0
 }

 Buffer.isEncoding = function isEncoding (encoding) {
   switch (String(encoding).toLowerCase()) {
     case 'hex':
     case 'utf8':
     case 'utf-8':
     case 'ascii':
     case 'latin1':
     case 'binary':
     case 'base64':
     case 'ucs2':
     case 'ucs-2':
     case 'utf16le':
     case 'utf-16le':
       return true
     default:
       return false
   }
 }

 Buffer.concat = function concat (list, length) {
   if (!Array.isArray(list)) {
     throw new TypeError('"list" argument must be an Array of Buffers')
   }

   if (list.length === 0) {
     return Buffer.alloc(0)
   }

   var i
   if (length === undefined) {
     length = 0
     for (i = 0; i < list.length; ++i) {
       length += list[i].length
     }
   }

   var buffer = Buffer.allocUnsafe(length)
   var pos = 0
   for (i = 0; i < list.length; ++i) {
     var buf = list[i]
     if (ArrayBuffer.isView(buf)) {
       buf = Buffer.from(buf)
     }
     if (!Buffer.isBuffer(buf)) {
       throw new TypeError('"list" argument must be an Array of Buffers')
     }
     buf.copy(buffer, pos)
     pos += buf.length
   }
   return buffer
 }

 function byteLength (string, encoding) {
   if (Buffer.isBuffer(string)) {
     return string.length
   }
   if (ArrayBuffer.isView(string) || isArrayBuffer(string)) {
     return string.byteLength
   }
   if (typeof string !== 'string') {
     string = '' + string
   }

   var len = string.length
   if (len === 0) return 0

   // Use a for loop to avoid recursion
   var loweredCase = false
   for (;;) {
     switch (encoding) {
       case 'ascii':
       case 'latin1':
       case 'binary':
         return len
       case 'utf8':
       case 'utf-8':
       case undefined:
         return utf8ToBytes(string).length
       case 'ucs2':
       case 'ucs-2':
       case 'utf16le':
       case 'utf-16le':
         return len * 2
       case 'hex':
         return len >>> 1
       case 'base64':
         return base64ToBytes(string).length
       default:
         if (loweredCase) return utf8ToBytes(string).length // assume utf8
         encoding = ('' + encoding).toLowerCase()
         loweredCase = true
     }
   }
 }
 Buffer.byteLength = byteLength

 function slowToString (encoding, start, end) {
   var loweredCase = false

   // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
   // property of a typed array.

   // This behaves neither like String nor Uint8Array in that we set start/end
   // to their upper/lower bounds if the value passed is out of range.
   // undefined is handled specially as per ECMA-262 6th Edition,
   // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
   if (start === undefined || start < 0) {
     start = 0
   }
   // Return early if start > this.length. Done here to prevent potential uint32
   // coercion fail below.
   if (start > this.length) {
     return ''
   }

   if (end === undefined || end > this.length) {
     end = this.length
   }

   if (end <= 0) {
     return ''
   }

   // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
   end >>>= 0
   start >>>= 0

   if (end <= start) {
     return ''
   }

   if (!encoding) encoding = 'utf8'

   while (true) {
     switch (encoding) {
       case 'hex':
         return hexSlice(this, start, end)

       case 'utf8':
       case 'utf-8':
         return utf8Slice(this, start, end)

       case 'ascii':
         return asciiSlice(this, start, end)

       case 'latin1':
       case 'binary':
         return latin1Slice(this, start, end)

       case 'base64':
         return base64Slice(this, start, end)

       case 'ucs2':
       case 'ucs-2':
       case 'utf16le':
       case 'utf-16le':
         return utf16leSlice(this, start, end)

       default:
         if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
         encoding = (encoding + '').toLowerCase()
         loweredCase = true
     }
   }
 }

 // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
 // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
 // reliably in a browserify context because there could be multiple different
 // copies of the 'buffer' package in use. This method works even for Buffer
 // instances that were created from another copy of the `buffer` package.
 // See: https://github.com/feross/buffer/issues/154
 Buffer.prototype._isBuffer = true

 function swap (b, n, m) {
   var i = b[n]
   b[n] = b[m]
   b[m] = i
 }

 Buffer.prototype.swap16 = function swap16 () {
   var len = this.length
   if (len % 2 !== 0) {
     throw new RangeError('Buffer size must be a multiple of 16-bits')
   }
   for (var i = 0; i < len; i += 2) {
     swap(this, i, i + 1)
   }
   return this
 }

 Buffer.prototype.swap32 = function swap32 () {
   var len = this.length
   if (len % 4 !== 0) {
     throw new RangeError('Buffer size must be a multiple of 32-bits')
   }
   for (var i = 0; i < len; i += 4) {
     swap(this, i, i + 3)
     swap(this, i + 1, i + 2)
   }
   return this
 }

 Buffer.prototype.swap64 = function swap64 () {
   var len = this.length
   if (len % 8 !== 0) {
     throw new RangeError('Buffer size must be a multiple of 64-bits')
   }
   for (var i = 0; i < len; i += 8) {
     swap(this, i, i + 7)
     swap(this, i + 1, i + 6)
     swap(this, i + 2, i + 5)
     swap(this, i + 3, i + 4)
   }
   return this
 }

 Buffer.prototype.toString = function toString () {
   var length = this.length
   if (length === 0) return ''
   if (arguments.length === 0) return utf8Slice(this, 0, length)
   return slowToString.apply(this, arguments)
 }

 Buffer.prototype.toLocaleString = Buffer.prototype.toString

 Buffer.prototype.equals = function equals (b) {
   if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
   if (this === b) return true
   return Buffer.compare(this, b) === 0
 }

 Buffer.prototype.inspect = function inspect () {
   var str = ''
   var max = exports.INSPECT_MAX_BYTES
   if (this.length > 0) {
     str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
     if (this.length > max) str += ' ... '
   }
   return '<Buffer ' + str + '>'
 }

 Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
   if (!Buffer.isBuffer(target)) {
     throw new TypeError('Argument must be a Buffer')
   }

   if (start === undefined) {
     start = 0
   }
   if (end === undefined) {
     end = target ? target.length : 0
   }
   if (thisStart === undefined) {
     thisStart = 0
   }
   if (thisEnd === undefined) {
     thisEnd = this.length
   }

   if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
     throw new RangeError('out of range index')
   }

   if (thisStart >= thisEnd && start >= end) {
     return 0
   }
   if (thisStart >= thisEnd) {
     return -1
   }
   if (start >= end) {
     return 1
   }

   start >>>= 0
   end >>>= 0
   thisStart >>>= 0
   thisEnd >>>= 0

   if (this === target) return 0

   var x = thisEnd - thisStart
   var y = end - start
   var len = Math.min(x, y)

   var thisCopy = this.slice(thisStart, thisEnd)
   var targetCopy = target.slice(start, end)

   for (var i = 0; i < len; ++i) {
     if (thisCopy[i] !== targetCopy[i]) {
       x = thisCopy[i]
       y = targetCopy[i]
       break
     }
   }

   if (x < y) return -1
   if (y < x) return 1
   return 0
 }

 // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
 // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
 //
 // Arguments:
 // - buffer - a Buffer to search
 // - val - a string, Buffer, or number
 // - byteOffset - an index into `buffer`; will be clamped to an int32
 // - encoding - an optional encoding, relevant is val is a string
 // - dir - true for indexOf, false for lastIndexOf
 function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
   // Empty buffer means no match
   if (buffer.length === 0) return -1

   // Normalize byteOffset
   if (typeof byteOffset === 'string') {
     encoding = byteOffset
     byteOffset = 0
   } else if (byteOffset > 0x7fffffff) {
     byteOffset = 0x7fffffff
   } else if (byteOffset < -0x80000000) {
     byteOffset = -0x80000000
   }
   byteOffset = +byteOffset  // Coerce to Number.
   if (numberIsNaN(byteOffset)) {
     // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
     byteOffset = dir ? 0 : (buffer.length - 1)
   }

   // Normalize byteOffset: negative offsets start from the end of the buffer
   if (byteOffset < 0) byteOffset = buffer.length + byteOffset
   if (byteOffset >= buffer.length) {
     if (dir) return -1
     else byteOffset = buffer.length - 1
   } else if (byteOffset < 0) {
     if (dir) byteOffset = 0
     else return -1
   }

   // Normalize val
   if (typeof val === 'string') {
     val = Buffer.from(val, encoding)
   }

   // Finally, search either indexOf (if dir is true) or lastIndexOf
   if (Buffer.isBuffer(val)) {
     // Special case: looking for empty string/buffer always fails
     if (val.length === 0) {
       return -1
     }
     return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
   } else if (typeof val === 'number') {
     val = val & 0xFF // Search for a byte value [0-255]
     if (typeof Uint8Array.prototype.indexOf === 'function') {
       if (dir) {
         return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
       } else {
         return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
       }
     }
     return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
   }

   throw new TypeError('val must be string, number or Buffer')
 }

 function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
   var indexSize = 1
   var arrLength = arr.length
   var valLength = val.length

   if (encoding !== undefined) {
     encoding = String(encoding).toLowerCase()
     if (encoding === 'ucs2' || encoding === 'ucs-2' ||
         encoding === 'utf16le' || encoding === 'utf-16le') {
       if (arr.length < 2 || val.length < 2) {
         return -1
       }
       indexSize = 2
       arrLength /= 2
       valLength /= 2
       byteOffset /= 2
     }
   }

   function read (buf, i) {
     if (indexSize === 1) {
       return buf[i]
     } else {
       return buf.readUInt16BE(i * indexSize)
     }
   }

   var i
   if (dir) {
     var foundIndex = -1
     for (i = byteOffset; i < arrLength; i++) {
       if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
         if (foundIndex === -1) foundIndex = i
         if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
       } else {
         if (foundIndex !== -1) i -= i - foundIndex
         foundIndex = -1
       }
     }
   } else {
     if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
     for (i = byteOffset; i >= 0; i--) {
       var found = true
       for (var j = 0; j < valLength; j++) {
         if (read(arr, i + j) !== read(val, j)) {
           found = false
           break
         }
       }
       if (found) return i
     }
   }

   return -1
 }

 Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
   return this.indexOf(val, byteOffset, encoding) !== -1
 }

 Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
   return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
 }

 Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
   return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
 }

 function hexWrite (buf, string, offset, length) {
   offset = Number(offset) || 0
   var remaining = buf.length - offset
   if (!length) {
     length = remaining
   } else {
     length = Number(length)
     if (length > remaining) {
       length = remaining
     }
   }

   var strLen = string.length

   if (length > strLen / 2) {
     length = strLen / 2
   }
   for (var i = 0; i < length; ++i) {
     var parsed = parseInt(string.substr(i * 2, 2), 16)
     if (numberIsNaN(parsed)) return i
     buf[offset + i] = parsed
   }
   return i
 }

 function utf8Write (buf, string, offset, length) {
   return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
 }

 function asciiWrite (buf, string, offset, length) {
   return blitBuffer(asciiToBytes(string), buf, offset, length)
 }

 function latin1Write (buf, string, offset, length) {
   return asciiWrite(buf, string, offset, length)
 }

 function base64Write (buf, string, offset, length) {
   return blitBuffer(base64ToBytes(string), buf, offset, length)
 }

 function ucs2Write (buf, string, offset, length) {
   return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
 }

 Buffer.prototype.write = function write (string, offset, length, encoding) {
   // Buffer#write(string)
   if (offset === undefined) {
     encoding = 'utf8'
     length = this.length
     offset = 0
   // Buffer#write(string, encoding)
   } else if (length === undefined && typeof offset === 'string') {
     encoding = offset
     length = this.length
     offset = 0
   // Buffer#write(string, offset[, length][, encoding])
   } else if (isFinite(offset)) {
     offset = offset >>> 0
     if (isFinite(length)) {
       length = length >>> 0
       if (encoding === undefined) encoding = 'utf8'
     } else {
       encoding = length
       length = undefined
     }
   } else {
     throw new Error(
       'Buffer.write(string, encoding, offset[, length]) is no longer supported'
     )
   }

   var remaining = this.length - offset
   if (length === undefined || length > remaining) length = remaining

   if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
     throw new RangeError('Attempt to write outside buffer bounds')
   }

   if (!encoding) encoding = 'utf8'

   var loweredCase = false
   for (;;) {
     switch (encoding) {
       case 'hex':
         return hexWrite(this, string, offset, length)

       case 'utf8':
       case 'utf-8':
         return utf8Write(this, string, offset, length)

       case 'ascii':
         return asciiWrite(this, string, offset, length)

       case 'latin1':
       case 'binary':
         return latin1Write(this, string, offset, length)

       case 'base64':
         // Warning: maxLength not taken into account in base64Write
         return base64Write(this, string, offset, length)

       case 'ucs2':
       case 'ucs-2':
       case 'utf16le':
       case 'utf-16le':
         return ucs2Write(this, string, offset, length)

       default:
         if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
         encoding = ('' + encoding).toLowerCase()
         loweredCase = true
     }
   }
 }

 Buffer.prototype.toJSON = function toJSON () {
   return {
     type: 'Buffer',
     data: Array.prototype.slice.call(this._arr || this, 0)
   }
 }

 function base64Slice (buf, start, end) {
   if (start === 0 && end === buf.length) {
     return base64.fromByteArray(buf)
   } else {
     return base64.fromByteArray(buf.slice(start, end))
   }
 }

 function utf8Slice (buf, start, end) {
   end = Math.min(buf.length, end)
   var res = []

   var i = start
   while (i < end) {
     var firstByte = buf[i]
     var codePoint = null
     var bytesPerSequence = (firstByte > 0xEF) ? 4
       : (firstByte > 0xDF) ? 3
       : (firstByte > 0xBF) ? 2
       : 1

     if (i + bytesPerSequence <= end) {
       var secondByte, thirdByte, fourthByte, tempCodePoint

       switch (bytesPerSequence) {
         case 1:
           if (firstByte < 0x80) {
             codePoint = firstByte
           }
           break
         case 2:
           secondByte = buf[i + 1]
           if ((secondByte & 0xC0) === 0x80) {
             tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
             if (tempCodePoint > 0x7F) {
               codePoint = tempCodePoint
             }
           }
           break
         case 3:
           secondByte = buf[i + 1]
           thirdByte = buf[i + 2]
           if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
             tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
             if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
               codePoint = tempCodePoint
             }
           }
           break
         case 4:
           secondByte = buf[i + 1]
           thirdByte = buf[i + 2]
           fourthByte = buf[i + 3]
           if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
             tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
             if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
               codePoint = tempCodePoint
             }
           }
       }
     }

     if (codePoint === null) {
       // we did not generate a valid codePoint so insert a
       // replacement char (U+FFFD) and advance only 1 byte
       codePoint = 0xFFFD
       bytesPerSequence = 1
     } else if (codePoint > 0xFFFF) {
       // encode to utf16 (surrogate pair dance)
       codePoint -= 0x10000
       res.push(codePoint >>> 10 & 0x3FF | 0xD800)
       codePoint = 0xDC00 | codePoint & 0x3FF
     }

     res.push(codePoint)
     i += bytesPerSequence
   }

   return decodeCodePointsArray(res)
 }

 // Based on http://stackoverflow.com/a/22747272/680742, the browser with
 // the lowest limit is Chrome, with 0x10000 args.
 // We go 1 magnitude less, for safety
 var MAX_ARGUMENTS_LENGTH = 0x1000

 function decodeCodePointsArray (codePoints) {
   var len = codePoints.length
   if (len <= MAX_ARGUMENTS_LENGTH) {
     return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
   }

   // Decode in chunks to avoid "call stack size exceeded".
   var res = ''
   var i = 0
   while (i < len) {
     res += String.fromCharCode.apply(
       String,
       codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
     )
   }
   return res
 }

 function asciiSlice (buf, start, end) {
   var ret = ''
   end = Math.min(buf.length, end)

   for (var i = start; i < end; ++i) {
     ret += String.fromCharCode(buf[i] & 0x7F)
   }
   return ret
 }

 function latin1Slice (buf, start, end) {
   var ret = ''
   end = Math.min(buf.length, end)

   for (var i = start; i < end; ++i) {
     ret += String.fromCharCode(buf[i])
   }
   return ret
 }

 function hexSlice (buf, start, end) {
   var len = buf.length

   if (!start || start < 0) start = 0
   if (!end || end < 0 || end > len) end = len

   var out = ''
   for (var i = start; i < end; ++i) {
     out += toHex(buf[i])
   }
   return out
 }

 function utf16leSlice (buf, start, end) {
   var bytes = buf.slice(start, end)
   var res = ''
   for (var i = 0; i < bytes.length; i += 2) {
     res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
   }
   return res
 }

 Buffer.prototype.slice = function slice (start, end) {
   var len = this.length
   start = ~~start
   end = end === undefined ? len : ~~end

   if (start < 0) {
     start += len
     if (start < 0) start = 0
   } else if (start > len) {
     start = len
   }

   if (end < 0) {
     end += len
     if (end < 0) end = 0
   } else if (end > len) {
     end = len
   }

   if (end < start) end = start

   var newBuf = this.subarray(start, end)
   // Return an augmented `Uint8Array` instance
   newBuf.__proto__ = Buffer.prototype
   return newBuf
 }

 /*
  * Need to make sure that buffer isn't trying to write out of bounds.
  */
 function checkOffset (offset, ext, length) {
   if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
   if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
 }

 Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
   offset = offset >>> 0
   byteLength = byteLength >>> 0
   if (!noAssert) checkOffset(offset, byteLength, this.length)

   var val = this[offset]
   var mul = 1
   var i = 0
   while (++i < byteLength && (mul *= 0x100)) {
     val += this[offset + i] * mul
   }

   return val
 }

 Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
   offset = offset >>> 0
   byteLength = byteLength >>> 0
   if (!noAssert) {
     checkOffset(offset, byteLength, this.length)
   }

   var val = this[offset + --byteLength]
   var mul = 1
   while (byteLength > 0 && (mul *= 0x100)) {
     val += this[offset + --byteLength] * mul
   }

   return val
 }

 Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 1, this.length)
   return this[offset]
 }

 Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 2, this.length)
   return this[offset] | (this[offset + 1] << 8)
 }

 Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 2, this.length)
   return (this[offset] << 8) | this[offset + 1]
 }

 Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 4, this.length)

   return ((this[offset]) |
       (this[offset + 1] << 8) |
       (this[offset + 2] << 16)) +
       (this[offset + 3] * 0x1000000)
 }

 Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 4, this.length)

   return (this[offset] * 0x1000000) +
     ((this[offset + 1] << 16) |
     (this[offset + 2] << 8) |
     this[offset + 3])
 }

 Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
   offset = offset >>> 0
   byteLength = byteLength >>> 0
   if (!noAssert) checkOffset(offset, byteLength, this.length)

   var val = this[offset]
   var mul = 1
   var i = 0
   while (++i < byteLength && (mul *= 0x100)) {
     val += this[offset + i] * mul
   }
   mul *= 0x80

   if (val >= mul) val -= Math.pow(2, 8 * byteLength)

   return val
 }

 Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
   offset = offset >>> 0
   byteLength = byteLength >>> 0
   if (!noAssert) checkOffset(offset, byteLength, this.length)

   var i = byteLength
   var mul = 1
   var val = this[offset + --i]
   while (i > 0 && (mul *= 0x100)) {
     val += this[offset + --i] * mul
   }
   mul *= 0x80

   if (val >= mul) val -= Math.pow(2, 8 * byteLength)

   return val
 }

 Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 1, this.length)
   if (!(this[offset] & 0x80)) return (this[offset])
   return ((0xff - this[offset] + 1) * -1)
 }

 Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 2, this.length)
   var val = this[offset] | (this[offset + 1] << 8)
   return (val & 0x8000) ? val | 0xFFFF0000 : val
 }

 Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 2, this.length)
   var val = this[offset + 1] | (this[offset] << 8)
   return (val & 0x8000) ? val | 0xFFFF0000 : val
 }

 Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 4, this.length)

   return (this[offset]) |
     (this[offset + 1] << 8) |
     (this[offset + 2] << 16) |
     (this[offset + 3] << 24)
 }

 Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 4, this.length)

   return (this[offset] << 24) |
     (this[offset + 1] << 16) |
     (this[offset + 2] << 8) |
     (this[offset + 3])
 }

 Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 4, this.length)
   return ieee754.read(this, offset, true, 23, 4)
 }

 Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 4, this.length)
   return ieee754.read(this, offset, false, 23, 4)
 }

 Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 8, this.length)
   return ieee754.read(this, offset, true, 52, 8)
 }

 Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
   offset = offset >>> 0
   if (!noAssert) checkOffset(offset, 8, this.length)
   return ieee754.read(this, offset, false, 52, 8)
 }

 function checkInt (buf, value, offset, ext, max, min) {
   if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
   if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
   if (offset + ext > buf.length) throw new RangeError('Index out of range')
 }

 Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
   value = +value
   offset = offset >>> 0
   byteLength = byteLength >>> 0
   if (!noAssert) {
     var maxBytes = Math.pow(2, 8 * byteLength) - 1
     checkInt(this, value, offset, byteLength, maxBytes, 0)
   }

   var mul = 1
   var i = 0
   this[offset] = value & 0xFF
   while (++i < byteLength && (mul *= 0x100)) {
     this[offset + i] = (value / mul) & 0xFF
   }

   return offset + byteLength
 }

 Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
   value = +value
   offset = offset >>> 0
   byteLength = byteLength >>> 0
   if (!noAssert) {
     var maxBytes = Math.pow(2, 8 * byteLength) - 1
     checkInt(this, value, offset, byteLength, maxBytes, 0)
   }

   var i = byteLength - 1
   var mul = 1
   this[offset + i] = value & 0xFF
   while (--i >= 0 && (mul *= 0x100)) {
     this[offset + i] = (value / mul) & 0xFF
   }

   return offset + byteLength
 }

 Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
   this[offset] = (value & 0xff)
   return offset + 1
 }

 Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
   this[offset] = (value & 0xff)
   this[offset + 1] = (value >>> 8)
   return offset + 2
 }

 Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
   this[offset] = (value >>> 8)
   this[offset + 1] = (value & 0xff)
   return offset + 2
 }

 Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
   this[offset + 3] = (value >>> 24)
   this[offset + 2] = (value >>> 16)
   this[offset + 1] = (value >>> 8)
   this[offset] = (value & 0xff)
   return offset + 4
 }

 Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
   this[offset] = (value >>> 24)
   this[offset + 1] = (value >>> 16)
   this[offset + 2] = (value >>> 8)
   this[offset + 3] = (value & 0xff)
   return offset + 4
 }

 Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) {
     var limit = Math.pow(2, (8 * byteLength) - 1)

     checkInt(this, value, offset, byteLength, limit - 1, -limit)
   }

   var i = 0
   var mul = 1
   var sub = 0
   this[offset] = value & 0xFF
   while (++i < byteLength && (mul *= 0x100)) {
     if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
       sub = 1
     }
     this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
   }

   return offset + byteLength
 }

 Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) {
     var limit = Math.pow(2, (8 * byteLength) - 1)

     checkInt(this, value, offset, byteLength, limit - 1, -limit)
   }

   var i = byteLength - 1
   var mul = 1
   var sub = 0
   this[offset + i] = value & 0xFF
   while (--i >= 0 && (mul *= 0x100)) {
     if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
       sub = 1
     }
     this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
   }

   return offset + byteLength
 }

 Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
   if (value < 0) value = 0xff + value + 1
   this[offset] = (value & 0xff)
   return offset + 1
 }

 Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
   this[offset] = (value & 0xff)
   this[offset + 1] = (value >>> 8)
   return offset + 2
 }

 Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
   this[offset] = (value >>> 8)
   this[offset + 1] = (value & 0xff)
   return offset + 2
 }

 Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
   this[offset] = (value & 0xff)
   this[offset + 1] = (value >>> 8)
   this[offset + 2] = (value >>> 16)
   this[offset + 3] = (value >>> 24)
   return offset + 4
 }

 Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
   if (value < 0) value = 0xffffffff + value + 1
   this[offset] = (value >>> 24)
   this[offset + 1] = (value >>> 16)
   this[offset + 2] = (value >>> 8)
   this[offset + 3] = (value & 0xff)
   return offset + 4
 }

 function checkIEEE754 (buf, value, offset, ext, max, min) {
   if (offset + ext > buf.length) throw new RangeError('Index out of range')
   if (offset < 0) throw new RangeError('Index out of range')
 }

 function writeFloat (buf, value, offset, littleEndian, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) {
     checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
   }
   ieee754.write(buf, value, offset, littleEndian, 23, 4)
   return offset + 4
 }

 Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
   return writeFloat(this, value, offset, true, noAssert)
 }

 Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
   return writeFloat(this, value, offset, false, noAssert)
 }

 function writeDouble (buf, value, offset, littleEndian, noAssert) {
   value = +value
   offset = offset >>> 0
   if (!noAssert) {
     checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
   }
   ieee754.write(buf, value, offset, littleEndian, 52, 8)
   return offset + 8
 }

 Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
   return writeDouble(this, value, offset, true, noAssert)
 }

 Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
   return writeDouble(this, value, offset, false, noAssert)
 }

 // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
 Buffer.prototype.copy = function copy (target, targetStart, start, end) {
   if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
   if (!start) start = 0
   if (!end && end !== 0) end = this.length
   if (targetStart >= target.length) targetStart = target.length
   if (!targetStart) targetStart = 0
   if (end > 0 && end < start) end = start

   // Copy 0 bytes; we're done
   if (end === start) return 0
   if (target.length === 0 || this.length === 0) return 0

   // Fatal error conditions
   if (targetStart < 0) {
     throw new RangeError('targetStart out of bounds')
   }
   if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
   if (end < 0) throw new RangeError('sourceEnd out of bounds')

   // Are we oob?
   if (end > this.length) end = this.length
   if (target.length - targetStart < end - start) {
     end = target.length - targetStart + start
   }

   var len = end - start

   if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
     // Use built-in when available, missing from IE11
     this.copyWithin(targetStart, start, end)
   } else if (this === target && start < targetStart && targetStart < end) {
     // descending copy from end
     for (var i = len - 1; i >= 0; --i) {
       target[i + targetStart] = this[i + start]
     }
   } else {
     Uint8Array.prototype.set.call(
       target,
       this.subarray(start, end),
       targetStart
     )
   }

   return len
 }

 // Usage:
 //    buffer.fill(number[, offset[, end]])
 //    buffer.fill(buffer[, offset[, end]])
 //    buffer.fill(string[, offset[, end]][, encoding])
 Buffer.prototype.fill = function fill (val, start, end, encoding) {
   // Handle string cases:
   if (typeof val === 'string') {
     if (typeof start === 'string') {
       encoding = start
       start = 0
       end = this.length
     } else if (typeof end === 'string') {
       encoding = end
       end = this.length
     }
     if (encoding !== undefined && typeof encoding !== 'string') {
       throw new TypeError('encoding must be a string')
     }
     if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
       throw new TypeError('Unknown encoding: ' + encoding)
     }
     if (val.length === 1) {
       var code = val.charCodeAt(0)
       if ((encoding === 'utf8' && code < 128) ||
           encoding === 'latin1') {
         // Fast path: If `val` fits into a single byte, use that numeric value.
         val = code
       }
     }
   } else if (typeof val === 'number') {
     val = val & 255
   }

   // Invalid ranges are not set to a default, so can range check early.
   if (start < 0 || this.length < start || this.length < end) {
     throw new RangeError('Out of range index')
   }

   if (end <= start) {
     return this
   }

   start = start >>> 0
   end = end === undefined ? this.length : end >>> 0

   if (!val) val = 0

   var i
   if (typeof val === 'number') {
     for (i = start; i < end; ++i) {
       this[i] = val
     }
   } else {
     var bytes = Buffer.isBuffer(val)
       ? val
       : new Buffer(val, encoding)
     var len = bytes.length
     if (len === 0) {
       throw new TypeError('The value "' + val +
         '" is invalid for argument "value"')
     }
     for (i = 0; i < end - start; ++i) {
       this[i + start] = bytes[i % len]
     }
   }

   return this
 }

 // HELPER FUNCTIONS
 // ================

 var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

 function base64clean (str) {
   // Node takes equal signs as end of the Base64 encoding
   str = str.split('=')[0]
   // Node strips out invalid characters like \n and \t from the string, base64-js does not
   str = str.trim().replace(INVALID_BASE64_RE, '')
   // Node converts strings with length < 2 to ''
   if (str.length < 2) return ''
   // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
   while (str.length % 4 !== 0) {
     str = str + '='
   }
   return str
 }

 function toHex (n) {
   if (n < 16) return '0' + n.toString(16)
   return n.toString(16)
 }

 function utf8ToBytes (string, units) {
   units = units || Infinity
   var codePoint
   var length = string.length
   var leadSurrogate = null
   var bytes = []

   for (var i = 0; i < length; ++i) {
     codePoint = string.charCodeAt(i)

     // is surrogate component
     if (codePoint > 0xD7FF && codePoint < 0xE000) {
       // last char was a lead
       if (!leadSurrogate) {
         // no lead yet
         if (codePoint > 0xDBFF) {
           // unexpected trail
           if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
           continue
         } else if (i + 1 === length) {
           // unpaired lead
           if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
           continue
         }

         // valid lead
         leadSurrogate = codePoint

         continue
       }

       // 2 leads in a row
       if (codePoint < 0xDC00) {
         if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
         leadSurrogate = codePoint
         continue
       }

       // valid surrogate pair
       codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
     } else if (leadSurrogate) {
       // valid bmp char, but last char was a lead
       if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
     }

     leadSurrogate = null

     // encode utf8
     if (codePoint < 0x80) {
       if ((units -= 1) < 0) break
       bytes.push(codePoint)
     } else if (codePoint < 0x800) {
       if ((units -= 2) < 0) break
       bytes.push(
         codePoint >> 0x6 | 0xC0,
         codePoint & 0x3F | 0x80
       )
     } else if (codePoint < 0x10000) {
       if ((units -= 3) < 0) break
       bytes.push(
         codePoint >> 0xC | 0xE0,
         codePoint >> 0x6 & 0x3F | 0x80,
         codePoint & 0x3F | 0x80
       )
     } else if (codePoint < 0x110000) {
       if ((units -= 4) < 0) break
       bytes.push(
         codePoint >> 0x12 | 0xF0,
         codePoint >> 0xC & 0x3F | 0x80,
         codePoint >> 0x6 & 0x3F | 0x80,
         codePoint & 0x3F | 0x80
       )
     } else {
       throw new Error('Invalid code point')
     }
   }

   return bytes
 }

 function asciiToBytes (str) {
   var byteArray = []
   for (var i = 0; i < str.length; ++i) {
     // Node's code seems to be doing this and not & 0x7F..
     byteArray.push(str.charCodeAt(i) & 0xFF)
   }
   return byteArray
 }

 function utf16leToBytes (str, units) {
   var c, hi, lo
   var byteArray = []
   for (var i = 0; i < str.length; ++i) {
     if ((units -= 2) < 0) break

     c = str.charCodeAt(i)
     hi = c >> 8
     lo = c % 256
     byteArray.push(lo)
     byteArray.push(hi)
   }

   return byteArray
 }

 function base64ToBytes (str) {
   return base64.toByteArray(base64clean(str))
 }

 function blitBuffer (src, dst, offset, length) {
   for (var i = 0; i < length; ++i) {
     if ((i + offset >= dst.length) || (i >= src.length)) break
     dst[i + offset] = src[i]
   }
   return i
 }

 // ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
 // but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
 function isArrayBuffer (obj) {
   return obj instanceof ArrayBuffer ||
     (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
       typeof obj.byteLength === 'number')
 }

 function numberIsNaN (obj) {
   return obj !== obj // eslint-disable-line no-self-compare
 }

 },{"base64-js":1,"ieee754":3}],3:[function(require,module,exports){
 exports.read = function (buffer, offset, isLE, mLen, nBytes) {
   var e, m
   var eLen = nBytes * 8 - mLen - 1
   var eMax = (1 << eLen) - 1
   var eBias = eMax >> 1
   var nBits = -7
   var i = isLE ? (nBytes - 1) : 0
   var d = isLE ? -1 : 1
   var s = buffer[offset + i]

   i += d

   e = s & ((1 << (-nBits)) - 1)
   s >>= (-nBits)
   nBits += eLen
   for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

   m = e & ((1 << (-nBits)) - 1)
   e >>= (-nBits)
   nBits += mLen
   for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

   if (e === 0) {
     e = 1 - eBias
   } else if (e === eMax) {
     return m ? NaN : ((s ? -1 : 1) * Infinity)
   } else {
     m = m + Math.pow(2, mLen)
     e = e - eBias
   }
   return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
 }

 exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
   var e, m, c
   var eLen = nBytes * 8 - mLen - 1
   var eMax = (1 << eLen) - 1
   var eBias = eMax >> 1
   var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
   var i = isLE ? 0 : (nBytes - 1)
   var d = isLE ? 1 : -1
   var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

   value = Math.abs(value)

   if (isNaN(value) || value === Infinity) {
     m = isNaN(value) ? 1 : 0
     e = eMax
   } else {
     e = Math.floor(Math.log(value) / Math.LN2)
     if (value * (c = Math.pow(2, -e)) < 1) {
       e--
       c *= 2
     }
     if (e + eBias >= 1) {
       value += rt / c
     } else {
       value += rt * Math.pow(2, 1 - eBias)
     }
     if (value * c >= 2) {
       e++
       c /= 2
     }

     if (e + eBias >= eMax) {
       m = 0
       e = eMax
     } else if (e + eBias >= 1) {
       m = (value * c - 1) * Math.pow(2, mLen)
       e = e + eBias
     } else {
       m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
       e = 0
     }
   }

   for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

   e = (e << mLen) | m
   eLen += mLen
   for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

   buffer[offset + i - d] |= s * 128
 }

 },{}],4:[function(require,module,exports){
 // (public) Constructor
 function BigInteger(a, b, c) {
   if (!(this instanceof BigInteger))
     return new BigInteger(a, b, c)

   if (a != null) {
     if ("number" == typeof a) this.fromNumber(a, b, c)
     else if (b == null && "string" != typeof a) this.fromString(a, 256)
     else this.fromString(a, b)
   }
 }

 var proto = BigInteger.prototype

 // duck-typed isBigInteger
 proto.__bigi = require('../package.json').version
 BigInteger.isBigInteger = function (obj, check_ver) {
   return obj && obj.__bigi && (!check_ver || obj.__bigi === proto.__bigi)
 }

 // Bits per digit
 var dbits

 // am: Compute w_j += (x*this_i), propagate carries,
 // c is initial carry, returns final carry.
 // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
 // We need to select the fastest one that works in this environment.

 // am1: use a single mult and divide to get the high bits,
 // max digit bits should be 26 because
 // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
 function am1(i, x, w, j, c, n) {
   while (--n >= 0) {
     var v = x * this[i++] + w[j] + c
     c = Math.floor(v / 0x4000000)
     w[j++] = v & 0x3ffffff
   }
   return c
 }
 // am2 avoids a big mult-and-extract completely.
 // Max digit bits should be <= 30 because we do bitwise ops
 // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
 function am2(i, x, w, j, c, n) {
   var xl = x & 0x7fff,
     xh = x >> 15
   while (--n >= 0) {
     var l = this[i] & 0x7fff
     var h = this[i++] >> 15
     var m = xh * l + h * xl
     l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff)
     c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30)
     w[j++] = l & 0x3fffffff
   }
   return c
 }
 // Alternately, set max digit bits to 28 since some
 // browsers slow down when dealing with 32-bit numbers.
 function am3(i, x, w, j, c, n) {
   var xl = x & 0x3fff,
     xh = x >> 14
   while (--n >= 0) {
     var l = this[i] & 0x3fff
     var h = this[i++] >> 14
     var m = xh * l + h * xl
     l = xl * l + ((m & 0x3fff) << 14) + w[j] + c
     c = (l >> 28) + (m >> 14) + xh * h
     w[j++] = l & 0xfffffff
   }
   return c
 }

 // wtf?
 BigInteger.prototype.am = am1
 dbits = 26

 BigInteger.prototype.DB = dbits
 BigInteger.prototype.DM = ((1 << dbits) - 1)
 var DV = BigInteger.prototype.DV = (1 << dbits)

 var BI_FP = 52
 BigInteger.prototype.FV = Math.pow(2, BI_FP)
 BigInteger.prototype.F1 = BI_FP - dbits
 BigInteger.prototype.F2 = 2 * dbits - BI_FP

 // Digit conversions
 var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz"
 var BI_RC = new Array()
 var rr, vv
 rr = "0".charCodeAt(0)
 for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv
 rr = "a".charCodeAt(0)
 for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv
 rr = "A".charCodeAt(0)
 for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv

 function int2char(n) {
   return BI_RM.charAt(n)
 }

 function intAt(s, i) {
   var c = BI_RC[s.charCodeAt(i)]
   return (c == null) ? -1 : c
 }

 // (protected) copy this to r
 function bnpCopyTo(r) {
   for (var i = this.t - 1; i >= 0; --i) r[i] = this[i]
   r.t = this.t
   r.s = this.s
 }

 // (protected) set from integer value x, -DV <= x < DV
 function bnpFromInt(x) {
   this.t = 1
   this.s = (x < 0) ? -1 : 0
   if (x > 0) this[0] = x
   else if (x < -1) this[0] = x + DV
   else this.t = 0
 }

 // return bigint initialized to value
 function nbv(i) {
   var r = new BigInteger()
   r.fromInt(i)
   return r
 }

 // (protected) set from string and radix
 function bnpFromString(s, b) {
   var self = this

   var k
   if (b == 16) k = 4
   else if (b == 8) k = 3
   else if (b == 256) k = 8; // byte array
   else if (b == 2) k = 1
   else if (b == 32) k = 5
   else if (b == 4) k = 2
   else {
     self.fromRadix(s, b)
     return
   }
   self.t = 0
   self.s = 0
   var i = s.length,
     mi = false,
     sh = 0
   while (--i >= 0) {
     var x = (k == 8) ? s[i] & 0xff : intAt(s, i)
     if (x < 0) {
       if (s.charAt(i) == "-") mi = true
       continue
     }
     mi = false
     if (sh == 0)
       self[self.t++] = x
     else if (sh + k > self.DB) {
       self[self.t - 1] |= (x & ((1 << (self.DB - sh)) - 1)) << sh
       self[self.t++] = (x >> (self.DB - sh))
     } else
       self[self.t - 1] |= x << sh
     sh += k
     if (sh >= self.DB) sh -= self.DB
   }
   if (k == 8 && (s[0] & 0x80) != 0) {
     self.s = -1
     if (sh > 0) self[self.t - 1] |= ((1 << (self.DB - sh)) - 1) << sh
   }
   self.clamp()
   if (mi) BigInteger.ZERO.subTo(self, self)
 }

 // (protected) clamp off excess high words
 function bnpClamp() {
   var c = this.s & this.DM
   while (this.t > 0 && this[this.t - 1] == c)--this.t
 }

 // (public) return string representation in given radix
 function bnToString(b) {
   var self = this
   if (self.s < 0) return "-" + self.negate()
     .toString(b)
   var k
   if (b == 16) k = 4
   else if (b == 8) k = 3
   else if (b == 2) k = 1
   else if (b == 32) k = 5
   else if (b == 4) k = 2
   else return self.toRadix(b)
   var km = (1 << k) - 1,
     d, m = false,
     r = "",
     i = self.t
   var p = self.DB - (i * self.DB) % k
   if (i-- > 0) {
     if (p < self.DB && (d = self[i] >> p) > 0) {
       m = true
       r = int2char(d)
     }
     while (i >= 0) {
       if (p < k) {
         d = (self[i] & ((1 << p) - 1)) << (k - p)
         d |= self[--i] >> (p += self.DB - k)
       } else {
         d = (self[i] >> (p -= k)) & km
         if (p <= 0) {
           p += self.DB
           --i
         }
       }
       if (d > 0) m = true
       if (m) r += int2char(d)
     }
   }
   return m ? r : "0"
 }

 // (public) -this
 function bnNegate() {
   var r = new BigInteger()
   BigInteger.ZERO.subTo(this, r)
   return r
 }

 // (public) |this|
 function bnAbs() {
   return (this.s < 0) ? this.negate() : this
 }

 // (public) return + if this > a, - if this < a, 0 if equal
 function bnCompareTo(a) {
   var r = this.s - a.s
   if (r != 0) return r
   var i = this.t
   r = i - a.t
   if (r != 0) return (this.s < 0) ? -r : r
   while (--i >= 0)
     if ((r = this[i] - a[i]) != 0) return r
   return 0
 }

 // returns bit length of the integer x
 function nbits(x) {
   var r = 1,
     t
   if ((t = x >>> 16) != 0) {
     x = t
     r += 16
   }
   if ((t = x >> 8) != 0) {
     x = t
     r += 8
   }
   if ((t = x >> 4) != 0) {
     x = t
     r += 4
   }
   if ((t = x >> 2) != 0) {
     x = t
     r += 2
   }
   if ((t = x >> 1) != 0) {
     x = t
     r += 1
   }
   return r
 }

 // (public) return the number of bits in "this"
 function bnBitLength() {
   if (this.t <= 0) return 0
   return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM))
 }

 // (public) return the number of bytes in "this"
 function bnByteLength() {
   return this.bitLength() >> 3
 }

 // (protected) r = this << n*DB
 function bnpDLShiftTo(n, r) {
   var i
   for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i]
   for (i = n - 1; i >= 0; --i) r[i] = 0
   r.t = this.t + n
   r.s = this.s
 }

 // (protected) r = this >> n*DB
 function bnpDRShiftTo(n, r) {
   for (var i = n; i < this.t; ++i) r[i - n] = this[i]
   r.t = Math.max(this.t - n, 0)
   r.s = this.s
 }

 // (protected) r = this << n
 function bnpLShiftTo(n, r) {
   var self = this
   var bs = n % self.DB
   var cbs = self.DB - bs
   var bm = (1 << cbs) - 1
   var ds = Math.floor(n / self.DB),
     c = (self.s << bs) & self.DM,
     i
   for (i = self.t - 1; i >= 0; --i) {
     r[i + ds + 1] = (self[i] >> cbs) | c
     c = (self[i] & bm) << bs
   }
   for (i = ds - 1; i >= 0; --i) r[i] = 0
   r[ds] = c
   r.t = self.t + ds + 1
   r.s = self.s
   r.clamp()
 }

 // (protected) r = this >> n
 function bnpRShiftTo(n, r) {
   var self = this
   r.s = self.s
   var ds = Math.floor(n / self.DB)
   if (ds >= self.t) {
     r.t = 0
     return
   }
   var bs = n % self.DB
   var cbs = self.DB - bs
   var bm = (1 << bs) - 1
   r[0] = self[ds] >> bs
   for (var i = ds + 1; i < self.t; ++i) {
     r[i - ds - 1] |= (self[i] & bm) << cbs
     r[i - ds] = self[i] >> bs
   }
   if (bs > 0) r[self.t - ds - 1] |= (self.s & bm) << cbs
   r.t = self.t - ds
   r.clamp()
 }

 // (protected) r = this - a
 function bnpSubTo(a, r) {
   var self = this
   var i = 0,
     c = 0,
     m = Math.min(a.t, self.t)
   while (i < m) {
     c += self[i] - a[i]
     r[i++] = c & self.DM
     c >>= self.DB
   }
   if (a.t < self.t) {
     c -= a.s
     while (i < self.t) {
       c += self[i]
       r[i++] = c & self.DM
       c >>= self.DB
     }
     c += self.s
   } else {
     c += self.s
     while (i < a.t) {
       c -= a[i]
       r[i++] = c & self.DM
       c >>= self.DB
     }
     c -= a.s
   }
   r.s = (c < 0) ? -1 : 0
   if (c < -1) r[i++] = self.DV + c
   else if (c > 0) r[i++] = c
   r.t = i
   r.clamp()
 }

 // (protected) r = this * a, r != this,a (HAC 14.12)
 // "this" should be the larger one if appropriate.
 function bnpMultiplyTo(a, r) {
   var x = this.abs(),
     y = a.abs()
   var i = x.t
   r.t = i + y.t
   while (--i >= 0) r[i] = 0
   for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t)
   r.s = 0
   r.clamp()
   if (this.s != a.s) BigInteger.ZERO.subTo(r, r)
 }

 // (protected) r = this^2, r != this (HAC 14.16)
 function bnpSquareTo(r) {
   var x = this.abs()
   var i = r.t = 2 * x.t
   while (--i >= 0) r[i] = 0
   for (i = 0; i < x.t - 1; ++i) {
     var c = x.am(i, x[i], r, 2 * i, 0, 1)
     if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
       r[i + x.t] -= x.DV
       r[i + x.t + 1] = 1
     }
   }
   if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1)
   r.s = 0
   r.clamp()
 }

 // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
 // r != q, this != m.  q or r may be null.
 function bnpDivRemTo(m, q, r) {
   var self = this
   var pm = m.abs()
   if (pm.t <= 0) return
   var pt = self.abs()
   if (pt.t < pm.t) {
     if (q != null) q.fromInt(0)
     if (r != null) self.copyTo(r)
     return
   }
   if (r == null) r = new BigInteger()
   var y = new BigInteger(),
     ts = self.s,
     ms = m.s
   var nsh = self.DB - nbits(pm[pm.t - 1]); // normalize modulus
   if (nsh > 0) {
     pm.lShiftTo(nsh, y)
     pt.lShiftTo(nsh, r)
   } else {
     pm.copyTo(y)
     pt.copyTo(r)
   }
   var ys = y.t
   var y0 = y[ys - 1]
   if (y0 == 0) return
   var yt = y0 * (1 << self.F1) + ((ys > 1) ? y[ys - 2] >> self.F2 : 0)
   var d1 = self.FV / yt,
     d2 = (1 << self.F1) / yt,
     e = 1 << self.F2
   var i = r.t,
     j = i - ys,
     t = (q == null) ? new BigInteger() : q
   y.dlShiftTo(j, t)
   if (r.compareTo(t) >= 0) {
     r[r.t++] = 1
     r.subTo(t, r)
   }
   BigInteger.ONE.dlShiftTo(ys, t)
   t.subTo(y, y); // "negative" y so we can replace sub with am later
   while (y.t < ys) y[y.t++] = 0
   while (--j >= 0) {
     // Estimate quotient digit
     var qd = (r[--i] == y0) ? self.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2)
     if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
       y.dlShiftTo(j, t)
       r.subTo(t, r)
       while (r[i] < --qd) r.subTo(t, r)
     }
   }
   if (q != null) {
     r.drShiftTo(ys, q)
     if (ts != ms) BigInteger.ZERO.subTo(q, q)
   }
   r.t = ys
   r.clamp()
   if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
   if (ts < 0) BigInteger.ZERO.subTo(r, r)
 }

 // (public) this mod a
 function bnMod(a) {
   var r = new BigInteger()
   this.abs()
     .divRemTo(a, null, r)
   if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r)
   return r
 }

 // Modular reduction using "classic" algorithm
 function Classic(m) {
   this.m = m
 }

 function cConvert(x) {
   if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m)
   else return x
 }

 function cRevert(x) {
   return x
 }

 function cReduce(x) {
   x.divRemTo(this.m, null, x)
 }

 function cMulTo(x, y, r) {
   x.multiplyTo(y, r)
   this.reduce(r)
 }

 function cSqrTo(x, r) {
   x.squareTo(r)
   this.reduce(r)
 }

 Classic.prototype.convert = cConvert
 Classic.prototype.revert = cRevert
 Classic.prototype.reduce = cReduce
 Classic.prototype.mulTo = cMulTo
 Classic.prototype.sqrTo = cSqrTo

 // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
 // justification:
 //         xy == 1 (mod m)
 //         xy =  1+km
 //   xy(2-xy) = (1+km)(1-km)
 // x[y(2-xy)] = 1-k^2m^2
 // x[y(2-xy)] == 1 (mod m^2)
 // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
 // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
 // JS multiply "overflows" differently from C/C++, so care is needed here.
 function bnpInvDigit() {
   if (this.t < 1) return 0
   var x = this[0]
   if ((x & 1) == 0) return 0
   var y = x & 3; // y == 1/x mod 2^2
   y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
   y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
   y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
   // last step - calculate inverse mod DV directly
   // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
   y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
   // we really want the negative inverse, and -DV < y < DV
   return (y > 0) ? this.DV - y : -y
 }

 // Montgomery reduction
 function Montgomery(m) {
   this.m = m
   this.mp = m.invDigit()
   this.mpl = this.mp & 0x7fff
   this.mph = this.mp >> 15
   this.um = (1 << (m.DB - 15)) - 1
   this.mt2 = 2 * m.t
 }

 // xR mod m
 function montConvert(x) {
   var r = new BigInteger()
   x.abs()
     .dlShiftTo(this.m.t, r)
   r.divRemTo(this.m, null, r)
   if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r)
   return r
 }

 // x/R mod m
 function montRevert(x) {
   var r = new BigInteger()
   x.copyTo(r)
   this.reduce(r)
   return r
 }

 // x = x/R mod m (HAC 14.32)
 function montReduce(x) {
   while (x.t <= this.mt2) // pad x so am has enough room later
     x[x.t++] = 0
   for (var i = 0; i < this.m.t; ++i) {
     // faster way of calculating u0 = x[i]*mp mod DV
     var j = x[i] & 0x7fff
     var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM
     // use am to combine the multiply-shift-add into one call
     j = i + this.m.t
     x[j] += this.m.am(0, u0, x, i, 0, this.m.t)
     // propagate carry
     while (x[j] >= x.DV) {
       x[j] -= x.DV
       x[++j]++
     }
   }
   x.clamp()
   x.drShiftTo(this.m.t, x)
   if (x.compareTo(this.m) >= 0) x.subTo(this.m, x)
 }

 // r = "x^2/R mod m"; x != r
 function montSqrTo(x, r) {
   x.squareTo(r)
   this.reduce(r)
 }

 // r = "xy/R mod m"; x,y != r
 function montMulTo(x, y, r) {
   x.multiplyTo(y, r)
   this.reduce(r)
 }

 Montgomery.prototype.convert = montConvert
 Montgomery.prototype.revert = montRevert
 Montgomery.prototype.reduce = montReduce
 Montgomery.prototype.mulTo = montMulTo
 Montgomery.prototype.sqrTo = montSqrTo

 // (protected) true iff this is even
 function bnpIsEven() {
   return ((this.t > 0) ? (this[0] & 1) : this.s) == 0
 }

 // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
 function bnpExp(e, z) {
   if (e > 0xffffffff || e < 1) return BigInteger.ONE
   var r = new BigInteger(),
     r2 = new BigInteger(),
     g = z.convert(this),
     i = nbits(e) - 1
   g.copyTo(r)
   while (--i >= 0) {
     z.sqrTo(r, r2)
     if ((e & (1 << i)) > 0) z.mulTo(r2, g, r)
     else {
       var t = r
       r = r2
       r2 = t
     }
   }
   return z.revert(r)
 }

 // (public) this^e % m, 0 <= e < 2^32
 function bnModPowInt(e, m) {
   var z
   if (e < 256 || m.isEven()) z = new Classic(m)
   else z = new Montgomery(m)
   return this.exp(e, z)
 }

 // protected
 proto.copyTo = bnpCopyTo
 proto.fromInt = bnpFromInt
 proto.fromString = bnpFromString
 proto.clamp = bnpClamp
 proto.dlShiftTo = bnpDLShiftTo
 proto.drShiftTo = bnpDRShiftTo
 proto.lShiftTo = bnpLShiftTo
 proto.rShiftTo = bnpRShiftTo
 proto.subTo = bnpSubTo
 proto.multiplyTo = bnpMultiplyTo
 proto.squareTo = bnpSquareTo
 proto.divRemTo = bnpDivRemTo
 proto.invDigit = bnpInvDigit
 proto.isEven = bnpIsEven
 proto.exp = bnpExp

 // public
 proto.toString = bnToString
 proto.negate = bnNegate
 proto.abs = bnAbs
 proto.compareTo = bnCompareTo
 proto.bitLength = bnBitLength
 proto.byteLength = bnByteLength
 proto.mod = bnMod
 proto.modPowInt = bnModPowInt

 // (public)
 function bnClone() {
   var r = new BigInteger()
   this.copyTo(r)
   return r
 }

 // (public) return value as integer
 function bnIntValue() {
   if (this.s < 0) {
     if (this.t == 1) return this[0] - this.DV
     else if (this.t == 0) return -1
   } else if (this.t == 1) return this[0]
   else if (this.t == 0) return 0
   // assumes 16 < DB < 32
   return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0]
 }

 // (public) return value as byte
 function bnByteValue() {
   return (this.t == 0) ? this.s : (this[0] << 24) >> 24
 }

 // (public) return value as short (assumes DB>=16)
 function bnShortValue() {
   return (this.t == 0) ? this.s : (this[0] << 16) >> 16
 }

 // (protected) return x s.t. r^x < DV
 function bnpChunkSize(r) {
   return Math.floor(Math.LN2 * this.DB / Math.log(r))
 }

 // (public) 0 if this == 0, 1 if this > 0
 function bnSigNum() {
   if (this.s < 0) return -1
   else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0
   else return 1
 }

 // (protected) convert to radix string
 function bnpToRadix(b) {
   if (b == null) b = 10
   if (this.signum() == 0 || b < 2 || b > 36) return "0"
   var cs = this.chunkSize(b)
   var a = Math.pow(b, cs)
   var d = nbv(a),
     y = new BigInteger(),
     z = new BigInteger(),
     r = ""
   this.divRemTo(d, y, z)
   while (y.signum() > 0) {
     r = (a + z.intValue())
       .toString(b)
       .substr(1) + r
     y.divRemTo(d, y, z)
   }
   return z.intValue()
     .toString(b) + r
 }

 // (protected) convert from radix string
 function bnpFromRadix(s, b) {
   var self = this
   self.fromInt(0)
   if (b == null) b = 10
   var cs = self.chunkSize(b)
   var d = Math.pow(b, cs),
     mi = false,
     j = 0,
     w = 0
   for (var i = 0; i < s.length; ++i) {
     var x = intAt(s, i)
     if (x < 0) {
       if (s.charAt(i) == "-" && self.signum() == 0) mi = true
       continue
     }
     w = b * w + x
     if (++j >= cs) {
       self.dMultiply(d)
       self.dAddOffset(w, 0)
       j = 0
       w = 0
     }
   }
   if (j > 0) {
     self.dMultiply(Math.pow(b, j))
     self.dAddOffset(w, 0)
   }
   if (mi) BigInteger.ZERO.subTo(self, self)
 }

 // (protected) alternate constructor
 function bnpFromNumber(a, b, c) {
   var self = this
   if ("number" == typeof b) {
     // new BigInteger(int,int,RNG)
     if (a < 2) self.fromInt(1)
     else {
       self.fromNumber(a, c)
       if (!self.testBit(a - 1)) // force MSB set
         self.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, self)
       if (self.isEven()) self.dAddOffset(1, 0); // force odd
       while (!self.isProbablePrime(b)) {
         self.dAddOffset(2, 0)
         if (self.bitLength() > a) self.subTo(BigInteger.ONE.shiftLeft(a - 1), self)
       }
     }
   } else {
     // new BigInteger(int,RNG)
     var x = new Array(),
       t = a & 7
     x.length = (a >> 3) + 1
     b.nextBytes(x)
     if (t > 0) x[0] &= ((1 << t) - 1)
     else x[0] = 0
     self.fromString(x, 256)
   }
 }

 // (public) convert to bigendian byte array
 function bnToByteArray() {
   var self = this
   var i = self.t,
     r = new Array()
   r[0] = self.s
   var p = self.DB - (i * self.DB) % 8,
     d, k = 0
   if (i-- > 0) {
     if (p < self.DB && (d = self[i] >> p) != (self.s & self.DM) >> p)
       r[k++] = d | (self.s << (self.DB - p))
     while (i >= 0) {
       if (p < 8) {
         d = (self[i] & ((1 << p) - 1)) << (8 - p)
         d |= self[--i] >> (p += self.DB - 8)
       } else {
         d = (self[i] >> (p -= 8)) & 0xff
         if (p <= 0) {
           p += self.DB
           --i
         }
       }
       if ((d & 0x80) != 0) d |= -256
       if (k === 0 && (self.s & 0x80) != (d & 0x80))++k
       if (k > 0 || d != self.s) r[k++] = d
     }
   }
   return r
 }

 function bnEquals(a) {
   return (this.compareTo(a) == 0)
 }

 function bnMin(a) {
   return (this.compareTo(a) < 0) ? this : a
 }

 function bnMax(a) {
   return (this.compareTo(a) > 0) ? this : a
 }

 // (protected) r = this op a (bitwise)
 function bnpBitwiseTo(a, op, r) {
   var self = this
   var i, f, m = Math.min(a.t, self.t)
   for (i = 0; i < m; ++i) r[i] = op(self[i], a[i])
   if (a.t < self.t) {
     f = a.s & self.DM
     for (i = m; i < self.t; ++i) r[i] = op(self[i], f)
     r.t = self.t
   } else {
     f = self.s & self.DM
     for (i = m; i < a.t; ++i) r[i] = op(f, a[i])
     r.t = a.t
   }
   r.s = op(self.s, a.s)
   r.clamp()
 }

 // (public) this & a
 function op_and(x, y) {
   return x & y
 }

 function bnAnd(a) {
   var r = new BigInteger()
   this.bitwiseTo(a, op_and, r)
   return r
 }

 // (public) this | a
 function op_or(x, y) {
   return x | y
 }

 function bnOr(a) {
   var r = new BigInteger()
   this.bitwiseTo(a, op_or, r)
   return r
 }

 // (public) this ^ a
 function op_xor(x, y) {
   return x ^ y
 }

 function bnXor(a) {
   var r = new BigInteger()
   this.bitwiseTo(a, op_xor, r)
   return r
 }

 // (public) this & ~a
 function op_andnot(x, y) {
   return x & ~y
 }

 function bnAndNot(a) {
   var r = new BigInteger()
   this.bitwiseTo(a, op_andnot, r)
   return r
 }

 // (public) ~this
 function bnNot() {
   var r = new BigInteger()
   for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i]
   r.t = this.t
   r.s = ~this.s
   return r
 }

 // (public) this << n
 function bnShiftLeft(n) {
   var r = new BigInteger()
   if (n < 0) this.rShiftTo(-n, r)
   else this.lShiftTo(n, r)
   return r
 }

 // (public) this >> n
 function bnShiftRight(n) {
   var r = new BigInteger()
   if (n < 0) this.lShiftTo(-n, r)
   else this.rShiftTo(n, r)
   return r
 }

 // return index of lowest 1-bit in x, x < 2^31
 function lbit(x) {
   if (x == 0) return -1
   var r = 0
   if ((x & 0xffff) == 0) {
     x >>= 16
     r += 16
   }
   if ((x & 0xff) == 0) {
     x >>= 8
     r += 8
   }
   if ((x & 0xf) == 0) {
     x >>= 4
     r += 4
   }
   if ((x & 3) == 0) {
     x >>= 2
     r += 2
   }
   if ((x & 1) == 0)++r
   return r
 }

 // (public) returns index of lowest 1-bit (or -1 if none)
 function bnGetLowestSetBit() {
   for (var i = 0; i < this.t; ++i)
     if (this[i] != 0) return i * this.DB + lbit(this[i])
   if (this.s < 0) return this.t * this.DB
   return -1
 }

 // return number of 1 bits in x
 function cbit(x) {
   var r = 0
   while (x != 0) {
     x &= x - 1
     ++r
   }
   return r
 }

 // (public) return number of set bits
 function bnBitCount() {
   var r = 0,
     x = this.s & this.DM
   for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x)
   return r
 }

 // (public) true iff nth bit is set
 function bnTestBit(n) {
   var j = Math.floor(n / this.DB)
   if (j >= this.t) return (this.s != 0)
   return ((this[j] & (1 << (n % this.DB))) != 0)
 }

 // (protected) this op (1<<n)
 function bnpChangeBit(n, op) {
   var r = BigInteger.ONE.shiftLeft(n)
   this.bitwiseTo(r, op, r)
   return r
 }

 // (public) this | (1<<n)
 function bnSetBit(n) {
   return this.changeBit(n, op_or)
 }

 // (public) this & ~(1<<n)
 function bnClearBit(n) {
   return this.changeBit(n, op_andnot)
 }

 // (public) this ^ (1<<n)
 function bnFlipBit(n) {
   return this.changeBit(n, op_xor)
 }

 // (protected) r = this + a
 function bnpAddTo(a, r) {
   var self = this

   var i = 0,
     c = 0,
     m = Math.min(a.t, self.t)
   while (i < m) {
     c += self[i] + a[i]
     r[i++] = c & self.DM
     c >>= self.DB
   }
   if (a.t < self.t) {
     c += a.s
     while (i < self.t) {
       c += self[i]
       r[i++] = c & self.DM
       c >>= self.DB
     }
     c += self.s
   } else {
     c += self.s
     while (i < a.t) {
       c += a[i]
       r[i++] = c & self.DM
       c >>= self.DB
     }
     c += a.s
   }
   r.s = (c < 0) ? -1 : 0
   if (c > 0) r[i++] = c
   else if (c < -1) r[i++] = self.DV + c
   r.t = i
   r.clamp()
 }

 // (public) this + a
 function bnAdd(a) {
   var r = new BigInteger()
   this.addTo(a, r)
   return r
 }

 // (public) this - a
 function bnSubtract(a) {
   var r = new BigInteger()
   this.subTo(a, r)
   return r
 }

 // (public) this * a
 function bnMultiply(a) {
   var r = new BigInteger()
   this.multiplyTo(a, r)
   return r
 }

 // (public) this^2
 function bnSquare() {
   var r = new BigInteger()
   this.squareTo(r)
   return r
 }

 // (public) this / a
 function bnDivide(a) {
   var r = new BigInteger()
   this.divRemTo(a, r, null)
   return r
 }

 // (public) this % a
 function bnRemainder(a) {
   var r = new BigInteger()
   this.divRemTo(a, null, r)
   return r
 }

 // (public) [this/a,this%a]
 function bnDivideAndRemainder(a) {
   var q = new BigInteger(),
     r = new BigInteger()
   this.divRemTo(a, q, r)
   return new Array(q, r)
 }

 // (protected) this *= n, this >= 0, 1 < n < DV
 function bnpDMultiply(n) {
   this[this.t] = this.am(0, n - 1, this, 0, 0, this.t)
   ++this.t
   this.clamp()
 }

 // (protected) this += n << w words, this >= 0
 function bnpDAddOffset(n, w) {
   if (n == 0) return
   while (this.t <= w) this[this.t++] = 0
   this[w] += n
   while (this[w] >= this.DV) {
     this[w] -= this.DV
     if (++w >= this.t) this[this.t++] = 0
     ++this[w]
   }
 }

 // A "null" reducer
 function NullExp() {}

 function nNop(x) {
   return x
 }

 function nMulTo(x, y, r) {
   x.multiplyTo(y, r)
 }

 function nSqrTo(x, r) {
   x.squareTo(r)
 }

 NullExp.prototype.convert = nNop
 NullExp.prototype.revert = nNop
 NullExp.prototype.mulTo = nMulTo
 NullExp.prototype.sqrTo = nSqrTo

 // (public) this^e
 function bnPow(e) {
   return this.exp(e, new NullExp())
 }

 // (protected) r = lower n words of "this * a", a.t <= n
 // "this" should be the larger one if appropriate.
 function bnpMultiplyLowerTo(a, n, r) {
   var i = Math.min(this.t + a.t, n)
   r.s = 0; // assumes a,this >= 0
   r.t = i
   while (i > 0) r[--i] = 0
   var j
   for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t)
   for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i)
   r.clamp()
 }

 // (protected) r = "this * a" without lower n words, n > 0
 // "this" should be the larger one if appropriate.
 function bnpMultiplyUpperTo(a, n, r) {
   --n
   var i = r.t = this.t + a.t - n
   r.s = 0; // assumes a,this >= 0
   while (--i >= 0) r[i] = 0
   for (i = Math.max(n - this.t, 0); i < a.t; ++i)
     r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n)
   r.clamp()
   r.drShiftTo(1, r)
 }

 // Barrett modular reduction
 function Barrett(m) {
   // setup Barrett
   this.r2 = new BigInteger()
   this.q3 = new BigInteger()
   BigInteger.ONE.dlShiftTo(2 * m.t, this.r2)
   this.mu = this.r2.divide(m)
   this.m = m
 }

 function barrettConvert(x) {
   if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m)
   else if (x.compareTo(this.m) < 0) return x
   else {
     var r = new BigInteger()
     x.copyTo(r)
     this.reduce(r)
     return r
   }
 }

 function barrettRevert(x) {
   return x
 }

 // x = x mod m (HAC 14.42)
 function barrettReduce(x) {
   var self = this
   x.drShiftTo(self.m.t - 1, self.r2)
   if (x.t > self.m.t + 1) {
     x.t = self.m.t + 1
     x.clamp()
   }
   self.mu.multiplyUpperTo(self.r2, self.m.t + 1, self.q3)
   self.m.multiplyLowerTo(self.q3, self.m.t + 1, self.r2)
   while (x.compareTo(self.r2) < 0) x.dAddOffset(1, self.m.t + 1)
   x.subTo(self.r2, x)
   while (x.compareTo(self.m) >= 0) x.subTo(self.m, x)
 }

 // r = x^2 mod m; x != r
 function barrettSqrTo(x, r) {
   x.squareTo(r)
   this.reduce(r)
 }

 // r = x*y mod m; x,y != r
 function barrettMulTo(x, y, r) {
   x.multiplyTo(y, r)
   this.reduce(r)
 }

 Barrett.prototype.convert = barrettConvert
 Barrett.prototype.revert = barrettRevert
 Barrett.prototype.reduce = barrettReduce
 Barrett.prototype.mulTo = barrettMulTo
 Barrett.prototype.sqrTo = barrettSqrTo

 // (public) this^e % m (HAC 14.85)
 function bnModPow(e, m) {
   var i = e.bitLength(),
     k, r = nbv(1),
     z
   if (i <= 0) return r
   else if (i < 18) k = 1
   else if (i < 48) k = 3
   else if (i < 144) k = 4
   else if (i < 768) k = 5
   else k = 6
   if (i < 8)
     z = new Classic(m)
   else if (m.isEven())
     z = new Barrett(m)
   else
     z = new Montgomery(m)

   // precomputation
   var g = new Array(),
     n = 3,
     k1 = k - 1,
     km = (1 << k) - 1
   g[1] = z.convert(this)
   if (k > 1) {
     var g2 = new BigInteger()
     z.sqrTo(g[1], g2)
     while (n <= km) {
       g[n] = new BigInteger()
       z.mulTo(g2, g[n - 2], g[n])
       n += 2
     }
   }

   var j = e.t - 1,
     w, is1 = true,
     r2 = new BigInteger(),
     t
   i = nbits(e[j]) - 1
   while (j >= 0) {
     if (i >= k1) w = (e[j] >> (i - k1)) & km
     else {
       w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i)
       if (j > 0) w |= e[j - 1] >> (this.DB + i - k1)
     }

     n = k
     while ((w & 1) == 0) {
       w >>= 1
       --n
     }
     if ((i -= n) < 0) {
       i += this.DB
       --j
     }
     if (is1) { // ret == 1, don't bother squaring or multiplying it
       g[w].copyTo(r)
       is1 = false
     } else {
       while (n > 1) {
         z.sqrTo(r, r2)
         z.sqrTo(r2, r)
         n -= 2
       }
       if (n > 0) z.sqrTo(r, r2)
       else {
         t = r
         r = r2
         r2 = t
       }
       z.mulTo(r2, g[w], r)
     }

     while (j >= 0 && (e[j] & (1 << i)) == 0) {
       z.sqrTo(r, r2)
       t = r
       r = r2
       r2 = t
       if (--i < 0) {
         i = this.DB - 1
         --j
       }
     }
   }
   return z.revert(r)
 }

 // (public) gcd(this,a) (HAC 14.54)
 function bnGCD(a) {
   var x = (this.s < 0) ? this.negate() : this.clone()
   var y = (a.s < 0) ? a.negate() : a.clone()
   if (x.compareTo(y) < 0) {
     var t = x
     x = y
     y = t
   }
   var i = x.getLowestSetBit(),
     g = y.getLowestSetBit()
   if (g < 0) return x
   if (i < g) g = i
   if (g > 0) {
     x.rShiftTo(g, x)
     y.rShiftTo(g, y)
   }
   while (x.signum() > 0) {
     if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x)
     if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y)
     if (x.compareTo(y) >= 0) {
       x.subTo(y, x)
       x.rShiftTo(1, x)
     } else {
       y.subTo(x, y)
       y.rShiftTo(1, y)
     }
   }
   if (g > 0) y.lShiftTo(g, y)
   return y
 }

 // (protected) this % n, n < 2^26
 function bnpModInt(n) {
   if (n <= 0) return 0
   var d = this.DV % n,
     r = (this.s < 0) ? n - 1 : 0
   if (this.t > 0)
     if (d == 0) r = this[0] % n
     else
       for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n
   return r
 }

 // (public) 1/this % m (HAC 14.61)
 function bnModInverse(m) {
   var ac = m.isEven()
   if (this.signum() === 0) throw new Error('division by zero')
   if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO
   var u = m.clone(),
     v = this.clone()
   var a = nbv(1),
     b = nbv(0),
     c = nbv(0),
     d = nbv(1)
   while (u.signum() != 0) {
     while (u.isEven()) {
       u.rShiftTo(1, u)
       if (ac) {
         if (!a.isEven() || !b.isEven()) {
           a.addTo(this, a)
           b.subTo(m, b)
         }
         a.rShiftTo(1, a)
       } else if (!b.isEven()) b.subTo(m, b)
       b.rShiftTo(1, b)
     }
     while (v.isEven()) {
       v.rShiftTo(1, v)
       if (ac) {
         if (!c.isEven() || !d.isEven()) {
           c.addTo(this, c)
           d.subTo(m, d)
         }
         c.rShiftTo(1, c)
       } else if (!d.isEven()) d.subTo(m, d)
       d.rShiftTo(1, d)
     }
     if (u.compareTo(v) >= 0) {
       u.subTo(v, u)
       if (ac) a.subTo(c, a)
       b.subTo(d, b)
     } else {
       v.subTo(u, v)
       if (ac) c.subTo(a, c)
       d.subTo(b, d)
     }
   }
   if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO
   while (d.compareTo(m) >= 0) d.subTo(m, d)
   while (d.signum() < 0) d.addTo(m, d)
   return d
 }

 var lowprimes = [
   2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
   73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
   157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
   239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
   331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
   421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
   509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
   613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
   709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
   821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
   919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997
 ]

 var lplim = (1 << 26) / lowprimes[lowprimes.length - 1]

 // (public) test primality with certainty >= 1-.5^t
 function bnIsProbablePrime(t) {
   var i, x = this.abs()
   if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
     for (i = 0; i < lowprimes.length; ++i)
       if (x[0] == lowprimes[i]) return true
     return false
   }
   if (x.isEven()) return false
   i = 1
   while (i < lowprimes.length) {
     var m = lowprimes[i],
       j = i + 1
     while (j < lowprimes.length && m < lplim) m *= lowprimes[j++]
     m = x.modInt(m)
     while (i < j) if (m % lowprimes[i++] == 0) return false
   }
   return x.millerRabin(t)
 }

 // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
 function bnpMillerRabin(t) {
   var n1 = this.subtract(BigInteger.ONE)
   var k = n1.getLowestSetBit()
   if (k <= 0) return false
   var r = n1.shiftRight(k)
   t = (t + 1) >> 1
   if (t > lowprimes.length) t = lowprimes.length
   var a = new BigInteger(null)
   var j, bases = []
   for (var i = 0; i < t; ++i) {
     for (;;) {
       j = lowprimes[Math.floor(Math.random() * lowprimes.length)]
       if (bases.indexOf(j) == -1) break
     }
     bases.push(j)
     a.fromInt(j)
     var y = a.modPow(r, this)
     if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
       var j = 1
       while (j++ < k && y.compareTo(n1) != 0) {
         y = y.modPowInt(2, this)
         if (y.compareTo(BigInteger.ONE) == 0) return false
       }
       if (y.compareTo(n1) != 0) return false
     }
   }
   return true
 }

 // protected
 proto.chunkSize = bnpChunkSize
 proto.toRadix = bnpToRadix
 proto.fromRadix = bnpFromRadix
 proto.fromNumber = bnpFromNumber
 proto.bitwiseTo = bnpBitwiseTo
 proto.changeBit = bnpChangeBit
 proto.addTo = bnpAddTo
 proto.dMultiply = bnpDMultiply
 proto.dAddOffset = bnpDAddOffset
 proto.multiplyLowerTo = bnpMultiplyLowerTo
 proto.multiplyUpperTo = bnpMultiplyUpperTo
 proto.modInt = bnpModInt
 proto.millerRabin = bnpMillerRabin

 // public
 proto.clone = bnClone
 proto.intValue = bnIntValue
 proto.byteValue = bnByteValue
 proto.shortValue = bnShortValue
 proto.signum = bnSigNum
 proto.toByteArray = bnToByteArray
 proto.equals = bnEquals
 proto.min = bnMin
 proto.max = bnMax
 proto.and = bnAnd
 proto.or = bnOr
 proto.xor = bnXor
 proto.andNot = bnAndNot
 proto.not = bnNot
 proto.shiftLeft = bnShiftLeft
 proto.shiftRight = bnShiftRight
 proto.getLowestSetBit = bnGetLowestSetBit
 proto.bitCount = bnBitCount
 proto.testBit = bnTestBit
 proto.setBit = bnSetBit
 proto.clearBit = bnClearBit
 proto.flipBit = bnFlipBit
 proto.add = bnAdd
 proto.subtract = bnSubtract
 proto.multiply = bnMultiply
 proto.divide = bnDivide
 proto.remainder = bnRemainder
 proto.divideAndRemainder = bnDivideAndRemainder
 proto.modPow = bnModPow
 proto.modInverse = bnModInverse
 proto.pow = bnPow
 proto.gcd = bnGCD
 proto.isProbablePrime = bnIsProbablePrime

 // JSBN-specific extension
 proto.square = bnSquare

 // constants
 BigInteger.ZERO = nbv(0)
 BigInteger.ONE = nbv(1)
 BigInteger.valueOf = nbv

 module.exports = BigInteger

 },{"../package.json":8}],5:[function(require,module,exports){
 var BigInteger = require('./bigi')
 var Buffer = require('safe-buffer').Buffer

 /**
  * Turns a byte array into a big integer.
  *
  * This function  will interpret a byte array as a big integer in big
  * endian notation.
  */
 BigInteger.fromByteArrayUnsigned = function (byteArray) {
   // BigInteger expects a DER integer conformant byte array
   if (byteArray[0] & 0x80) {
     return new BigInteger([0].concat(byteArray))
   }

   return new BigInteger(byteArray)
 }

 /**
  * Returns a byte array representation of the big integer.
  *
  * This returns the absolute of the contained value in big endian
  * form. A value of zero results in an empty array.
  */
 BigInteger.prototype.toByteArrayUnsigned = function () {
   var byteArray = this.toByteArray()
   return byteArray[0] === 0 ? byteArray.slice(1) : byteArray
 }

 BigInteger.fromDERInteger = function (byteArray) {
   return new BigInteger(byteArray)
 }

 /*
  * Converts BigInteger to a DER integer representation.
  *
  * The format for this value uses the most significant bit as a sign
  * bit.  If the most significant bit is already set and the integer is
  * positive, a 0x00 is prepended.
  *
  * Examples:
  *
  *      0 =>     0x00
  *      1 =>     0x01
  *     -1 =>     0xff
  *    127 =>     0x7f
  *   -127 =>     0x81
  *    128 =>   0x0080
  *   -128 =>     0x80
  *    255 =>   0x00ff
  *   -255 =>   0xff01
  *  16300 =>   0x3fac
  * -16300 =>   0xc054
  *  62300 => 0x00f35c
  * -62300 => 0xff0ca4
 */
 BigInteger.prototype.toDERInteger = BigInteger.prototype.toByteArray

 BigInteger.fromBuffer = function (buffer) {
   // BigInteger expects a DER integer conformant byte array
   if (buffer[0] & 0x80) {
     var byteArray = Array.prototype.slice.call(buffer)

     return new BigInteger([0].concat(byteArray))
   }

   return new BigInteger(buffer)
 }

 BigInteger.fromHex = function (hex) {
   if (hex === '') return BigInteger.ZERO
   if (!/^[A-Fa-f0-9]+$/.test(hex)) throw new TypeError('Invalid hex string')
   if (hex.length % 2 !== 0) throw new TypeError('Incomplete hex')
   return new BigInteger(hex, 16)
 }

 BigInteger.prototype.toBuffer = function (size) {
   var byteArray = this.toByteArrayUnsigned()
   var zeros = []

   var padding = size - byteArray.length
   while (zeros.length < padding) zeros.push(0)

   return Buffer.from(zeros.concat(byteArray))
 }

 BigInteger.prototype.toHex = function (size) {
   return this.toBuffer(size).toString('hex')
 }

 },{"./bigi":4,"safe-buffer":7}],6:[function(require,module,exports){
 var BigInteger = require('./bigi')

 // addons
 require('./convert')

 function fromString (string) {
   if (typeof string !== 'string') throw new TypeError('Expected String')

   var a = new BigInteger()
   a.fromString(string)
   return a
 }

 module.exports = {
   ZERO: BigInteger.ZERO,
   ONE: BigInteger.ONE,
   fromBuffer: BigInteger.fromBuffer,
   fromByteArrayUnsigned: BigInteger.fromByteArrayUnsigned,
   fromDERInteger: BigInteger.fromDERInteger,
   fromHex: BigInteger.fromHex,
   fromString: fromString
 }

 },{"./bigi":4,"./convert":5}],7:[function(require,module,exports){
 /* eslint-disable node/no-deprecated-api */
 var buffer = require('buffer')
 var Buffer = buffer.Buffer

 // alternative to using Object.keys for old browsers
 function copyProps (src, dst) {
   for (var key in src) {
     dst[key] = src[key]
   }
 }
 if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
   module.exports = buffer
 } else {
   // Copy properties from require('buffer')
   copyProps(buffer, exports)
   exports.Buffer = SafeBuffer
 }

 function SafeBuffer (arg, encodingOrOffset, length) {
   return Buffer(arg, encodingOrOffset, length)
 }

 // Copy static methods from Buffer
 copyProps(Buffer, SafeBuffer)

 SafeBuffer.from = function (arg, encodingOrOffset, length) {
   if (typeof arg === 'number') {
     throw new TypeError('Argument must not be a number')
   }
   return Buffer(arg, encodingOrOffset, length)
 }

 SafeBuffer.alloc = function (size, fill, encoding) {
   if (typeof size !== 'number') {
     throw new TypeError('Argument must be a number')
   }
   var buf = Buffer(size)
   if (fill !== undefined) {
     if (typeof encoding === 'string') {
       buf.fill(fill, encoding)
     } else {
       buf.fill(fill)
     }
   } else {
     buf.fill(0)
   }
   return buf
 }

 SafeBuffer.allocUnsafe = function (size) {
   if (typeof size !== 'number') {
     throw new TypeError('Argument must be a number')
   }
   return Buffer(size)
 }

 SafeBuffer.allocUnsafeSlow = function (size) {
   if (typeof size !== 'number') {
     throw new TypeError('Argument must be a number')
   }
   return buffer.SlowBuffer(size)
 }

 },{"buffer":2}],8:[function(require,module,exports){
 module.exports={
   "name": "bigi",
   "version": "1.4.2",
   "description": "Big integers.",
   "keywords": [
     "cryptography",
     "math",
     "bitcoin",
     "arbitrary",
     "precision",
     "arithmetic",
     "big",
     "integer",
     "int",
     "number",
     "biginteger",
     "bigint",
     "bignumber",
     "decimal",
     "float"
   ],
   "devDependencies": {
     "coveralls": "^2.11.2",
     "istanbul": "^0.3.5",
     "jshint": "^2.5.1",
     "mocha": "^2.1.0",
     "mochify": "^2.1.0"
   },
   "repository": {
     "url": "https://github.com/cryptocoinjs/bigi",
     "type": "git"
   },
   "main": "./lib/index.js",
   "scripts": {
     "browser-test": "./node_modules/.bin/mochify --wd -R spec",
     "test": "./node_modules/.bin/_mocha -- test/*.js",
     "jshint": "./node_modules/.bin/jshint --config jshint.json lib/*.js ; true",
     "unit": "./node_modules/.bin/mocha",
     "coverage": "./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --reporter list test/*.js",
     "coveralls": "npm run-script coverage && node ./node_modules/.bin/coveralls < coverage/lcov.info"
   },
   "dependencies": {
     "safe-buffer": "^5.0.1"
   },
   "testling": {
     "files": "test/*.js",
     "harness": "mocha",
     "browsers": [
       "ie/9..latest",
       "firefox/latest",
       "chrome/latest",
       "safari/6.0..latest",
       "iphone/6.0..latest",
       "android-browser/4.2..latest"
     ]
   }
 }

 },{}]},{},[6])(6)
 });
