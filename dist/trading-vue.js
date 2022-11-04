/*!
 * TradingVue.JS - v1.0.3 - Sat Nov 05 2022
 *     https://github.com/tvjsx/trading-vue-js
 *     Copyright (c) 2019 C451 Code's All Right;
 *     Licensed under the MIT license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TradingVueJs"] = factory();
	else
		root["TradingVueJs"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 546:
/***/ ((module) => {

/**
 * Utility compare functions
 */

module.exports = {

    /**
     * Compare two numbers.
     *
     * @param {Number} a
     * @param {Number} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    numcmp: function (a, b) {
        return a - b;
    },

    /**
     * Compare two strings.
     *
     * @param {Number|String} a
     * @param {Number|String} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    strcmp: function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

};


/***/ }),

/***/ 678:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Indexed Array Binary Search module
 */

/**
 * Dependencies
 */
var util = __webpack_require__(500),
    cmp = __webpack_require__(546),
    bin = __webpack_require__(101);

/**
 * Module interface definition
 */
module.exports = IndexedArray;

/**
 * Indexed Array constructor
 *
 * It loads the array data, defines the index field and the comparison function
 * to be used.
 *
 * @param {Array} data is an array of objects
 * @param {String} index is the object's property used to search the array
 */
function IndexedArray(data, index) {

    // is data sortable array or array-like object?
    if (!util.isSortableArrayLike(data))
        throw new Error("Invalid data");

    // is index a valid property?
    if (!index || data.length > 0 && !(index in data[0]))
        throw new Error("Invalid index");

    // data array
    this.data = data;

    // name of the index property
    this.index = index;

    // set index boundary values
    this.setBoundaries();

    // default comparison function
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;

    // default search function
    this.search = bin.search;

    // cache of index values to array positions
    // each value stores an object as { found: true|false, index: array-index }
    this.valpos = {};

    // cursor and adjacent positions
    this.cursor = null;
    this.nextlow = null;
    this.nexthigh = null;
}

/**
 * Set the comparison function
 *
 * @param {Function} fn to compare index values that returnes 1, 0, -1
 */
IndexedArray.prototype.setCompare = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.compare = fn;
    return this;
};

/**
 * Set the search function
 *
 * @param {Function} fn to search index values in the array of objects
 */
IndexedArray.prototype.setSearch = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.search = fn;
    return this;
};

/**
 * Sort the data array by its index property
 */
IndexedArray.prototype.sort = function () {
    var self = this,
        index = this.index;

    // sort the array
    this.data.sort(function (a, b) {
        return self.compare(a[index], b[index]);
    });

    // recalculate boundary values
    this.setBoundaries();

    return this;
};

/**
 * Inspect and set the boundaries of the internal data array
 */
IndexedArray.prototype.setBoundaries = function () {
    var data = this.data,
        index = this.index;

    this.minv = data.length && data[0][index];
    this.maxv = data.length && data[data.length - 1][index];

    return this;
};

/**
 * Get the position of the object corresponding to the given index
 *
 * @param {Number|String} index is the id of the requested object
 * @returns {Number} the position of the object in the array
 */
IndexedArray.prototype.fetch = function (value) {
    // check data has objects
    if (this.data.length === 0) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = null;
        return this;
    }

    // check the request is within range
    if (this.compare(value, this.minv) === -1) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = 0;
        return this;
    }
    if (this.compare(value, this.maxv) === 1) {
        this.cursor = null;
        this.nextlow = this.data.length - 1;
        this.nexthigh = null;
        return this;
    }

    var valpos = this.valpos,
        pos = valpos[value];

    // if the request is memorized, just give it back
    if (pos) {
        if (pos.found) {
            this.cursor = pos.index;
            this.nextlow = null;
            this.nexthigh = null;
        } else {
            this.cursor = null;
            this.nextlow = pos.prev;
            this.nexthigh = pos.next;
        }
        return this;
    }

    // if not, do the search
    var result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
};

/**
 * Get the object corresponding to the given index
 *
 * When no value is given, the function will default to the last fetched item.
 *
 * @param {Number|String} [optional] index is the id of the requested object
 * @returns {Object} the found object or null
 */
IndexedArray.prototype.get = function (value) {
    if (value)
        this.fetch(value);

    var pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
};

/**
 * Get an slice of the data array
 *
 * Boundaries have to be in order.
 *
 * @param {Number|String} begin index is the id of the requested object
 * @param {Number|String} end index is the id of the requested object
 * @returns {Object} the slice of data array or []
 */
IndexedArray.prototype.getRange = function (begin, end) {
    // check if boundaries are in order
    if (this.compare(begin, end) === 1) {
        return [];
    }

    // fetch start and default to the next index above
    this.fetch(begin);
    var start = this.cursor || this.nexthigh;

    // fetch finish and default to the next index below
    this.fetch(end);
    var finish = this.cursor || this.nextlow;

    // if any boundary is not set, return no range
    if (start === null || finish === null) {
        return [];
    }

    // return range
    return this.data.slice(start, finish + 1);
};


/***/ }),

/***/ 101:
/***/ ((module) => {

/**
 * Binary search implementation
 */

/**
 * Main search recursive function
 */
function loop(data, min, max, index, valpos) {

    // set current position as the middle point between min and max
    var curr = (max + min) >>> 1;

    // compare current index value with the one we are looking for
    var diff = this.compare(data[curr][this.index], index);

    // found?
    if (!diff) {
        return valpos[index] = {
            "found": true,
            "index": curr,
            "prev": null,
            "next": null
        };
    }

    // no more positions available?
    if (min >= max) {
        return valpos[index] = {
            "found": false,
            "index": null,
            "prev": (diff < 0) ? max : max - 1,
            "next": (diff < 0) ? max + 1 : max
        };
    }

    // continue looking for index in one of the remaining array halves
    // current position can be skept as index is not there...
    if (diff > 0)
        return loop.call(this, data, min, curr - 1, index, valpos);
    else
        return loop.call(this, data, curr + 1, max, index, valpos);
}

/**
 * Search bootstrap
 * The function has to be executed in the context of the IndexedArray object
 */
function search(index) {
    var data = this.data;
    return loop.call(this, data, 0, data.length - 1, index, this.valpos);
}

/**
 * Export search function
 */
module.exports.search = search;


/***/ }),

/***/ 500:
/***/ ((module) => {

/**
 * Utils module
 */

/**
 * Check if an object is an array-like object
 *
 * @credit Javascript: The Definitive Guide, O'Reilly, 2011
 */
function isArrayLike(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        isFinite(o.length) &&                // o.length is a finite number
        o.length >= 0 &&                     // o.length is non-negative
        o.length === Math.floor(o.length) && // o.length is an integer
        o.length < 4294967296)               // o.length < 2^32
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for the existence of the sort function in the object
 */
function isSortable(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        typeof o.sort === "function")        // o.sort is a function
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for sortable-array-like objects
 */
module.exports.isSortableArrayLike = function (o) {
    return isArrayLike(o) && isSortable(o);
};


/***/ }),

/***/ 426:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\r\n/* Anit-boostrap tactix */\n.trading-vue *,\r\n::after,\r\n::before {\r\n  box-sizing: content-box;\n}\n.trading-vue img {\r\n  vertical-align: initial;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 47:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-botbar {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 790:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\r\n    margin-left: 0.5em;\r\n    display: flex;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 197:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-item-list {\r\n    position: absolute;\r\n    user-select: none;\r\n    margin-top: -5px;\n}\n.tvjs-item-list-item {\r\n    display: flex;\r\n    align-items: center;\r\n    padding-right: 20px;\r\n    font-size: 1.15em;\r\n    letter-spacing: 0.05em;\n}\n.tvjs-item-list-item:hover {\r\n    background-color: #76878319;\n}\n.tvjs-item-list-item * {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 991:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\r\n    position: relative;\r\n    z-index: 100;\r\n    font-size: 1.25em;\r\n    margin-left: 10px;\r\n    pointer-events: none;\r\n    text-align: left;\r\n    user-select: none;\r\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\r\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\r\n    pointer-events: none;\r\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\r\n    font-variant-numeric: tabular-nums;\r\n    font-size: 0.95em;\r\n    color: #999999; /* TODO: move => params */\r\n    margin-left: 0.1em;\r\n    margin-right: 0.2em;\n}\n.t-vue-title {\r\n    margin-right: 0.25em;\r\n    font-size: 1.45em;\n}\n.t-vue-ind {\r\n  display: flex;\r\n    margin-left: 0.2em;\r\n    margin-bottom: 0.5em;\r\n    font-size: 1.0em;\r\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\r\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\r\n    color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\r\n.tvjs-appear-leave-active\r\n{\r\n    transition: all .25s ease;\n}\n.tvjs-appear-enter, .tvjs-appear-leave-to\r\n{\r\n    opacity: 0;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 264:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\r\n    z-index: 100;\r\n    pointer-events: all;\r\n    cursor: pointer;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 245:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-section {\r\n  height: 0;\r\n  position: absolute;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 260:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-spinner {\r\n    display: inline-block;\r\n    position: relative;\r\n    width: 20px;\r\n    height: 16px;\r\n    margin: -4px 0px -1px 0px;\r\n    opacity: 0.7;\n}\n.tvjs-spinner div {\r\n    position: absolute;\r\n    top: 8px;\r\n    width: 4px;\r\n    height: 4px;\r\n    border-radius: 50%;\r\n    animation-timing-function: cubic-bezier(1, 1, 1, 1);\n}\n.tvjs-spinner div:nth-child(1) {\r\n    left: 2px;\r\n    animation: tvjs-spinner1 0.6s infinite;\r\n    opacity: 0.9;\n}\n.tvjs-spinner div:nth-child(2) {\r\n    left: 2px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(3) {\r\n    left: 9px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(4) {\r\n    left: 16px;\r\n    animation: tvjs-spinner3 0.6s infinite;\r\n    opacity: 0.9;\n}\n@keyframes tvjs-spinner1 {\n0% {\r\n        transform: scale(0);\n}\n100% {\r\n        transform: scale(1);\n}\n}\n@keyframes tvjs-spinner3 {\n0% {\r\n        transform: scale(1);\n}\n100% {\r\n        transform: scale(0);\n}\n}\n@keyframes tvjs-spinner2 {\n0% {\r\n        transform: translate(0, 0);\n}\n100% {\r\n        transform: translate(7px, 0);\n}\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 343:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-drift-enter-active {\r\n    transition: all .3s ease;\n}\n.tvjs-drift-leave-active {\r\n    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.tvjs-drift-enter, .tvjs-drift-leave-to\r\n{\r\n    transform: translateX(10px);\r\n    opacity: 0;\n}\n.tvjs-the-tip {\r\n    position: absolute;\r\n    width: 200px;\r\n    text-align: center;\r\n    z-index: 10001;\r\n    color: #ffffff;\r\n    font-size: 1.5em;\r\n    line-height: 1.15em;\r\n    padding: 10px;\r\n    border-radius: 3px;\r\n    right: 70px;\r\n    top: 10px;\r\n    text-shadow: 1px 1px black;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 746:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-toolbar {\r\n    position: absolute;\r\n    border-right: 1px solid black;\r\n    z-index: 101;\r\n    padding-top: 3px;\r\n    user-select: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 899:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-tbitem {\n}\n.trading-vue-tbitem:hover {\r\n    background-color: #76878319;\n}\n.trading-vue-tbitem-exp {\r\n    position: absolute;\r\n    right: -3px;\r\n    padding: 18.5px 5px;\r\n    font-stretch: extra-condensed;\r\n    transform: scaleX(0.6);\r\n    font-size: 0.6em;\r\n    opacity: 0.0;\r\n    user-select: none;\r\n    line-height: 0;\n}\n.trading-vue-tbitem:hover\r\n.trading-vue-tbitem-exp {\r\n    opacity: 0.5;\n}\n.trading-vue-tbitem-exp:hover {\r\n    background-color: #76878330;\r\n    opacity: 0.9 !important;\n}\n.trading-vue-tbicon {\r\n    position: absolute;\n}\n.trading-vue-tbitem.selected-item > .trading-vue-tbicon,\r\n.tvjs-item-list-item.selected-item > .trading-vue-tbicon {\r\n     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;\n}\n.tvjs-pixelated {\r\n    -ms-interpolation-mode: nearest-neighbor;\r\n    image-rendering: -webkit-optimize-contrast;\r\n    image-rendering: -webkit-crisp-edges;\r\n    image-rendering: -moz-crisp-edges;\r\n    image-rendering: -o-crisp-edges;\r\n    image-rendering: pixelated;\n}\r\n\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 158:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-ux-wrapper {\n    position: absolute;\n    display: flex;\n}\n.tvjs-ux-wrapper-pin {\n    position: absolute;\n    width: 9px;\n    height: 9px;\n    z-index: 100;\n    background-color: #23a776;\n    border-radius: 10px;\n    margin-left: -6px;\n    margin-top: -6px;\n    pointer-events: none;\n}\n.tvjs-ux-wrapper-head {\n    position: absolute;\n    height: 23px;\n    width: 100%;\n}\n.tvjs-ux-wrapper-close {\n    position: absolute;\n    width: 11px;\n    height: 11px;\n    font-size: 1.5em;\n    line-height: 0.5em;\n    padding: 1px 1px 1px 1px;\n    border-radius: 10px;\n    right: 5px;\n    top: 5px;\n    user-select: none;\n    text-align: center;\n    z-index: 100;\n}\n.tvjs-ux-wrapper-close-hb {\n}\n.tvjs-ux-wrapper-close:hover {\n    background-color: #FF605C !important;\n    color: #692324 !important;\n}\n.tvjs-ux-wrapper-full {\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 251:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-widgets {\r\n    position: absolute;\r\n    z-index: 1000;\r\n    pointer-events: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ 840:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hammer;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}

})(window, document, 'Hammer');


/***/ }),

/***/ 981:
/***/ ((module) => {

/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else if (true) {
  // CommonJS
  module.exports = Hamster;
} else {}

})(window, window.document);


/***/ }),

/***/ 961:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return LZString; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


/***/ }),

/***/ 846:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(426);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("9eaace90", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 495:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(47);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("5c706798", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 246:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(790);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("3cef57c8", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 171:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(197);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("ad023ec0", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 974:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(991);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("077a9c44", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 719:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(264);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("cb2c20a2", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 760:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(245);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("78da9f26", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 964:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(260);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("4c894658", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 138:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(343);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("2f682836", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 452:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(746);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("69c625e0", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 915:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(899);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("2964fc18", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 656:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(158);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("566749cb", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 13:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(251);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("5b9fc54d", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 346:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ addStylesClient)
});

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 61:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(698)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return exports;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function value(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (undefined === method) {
      if (context.delegate = null, "throw" === context.method) {
        if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel;
        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }
      return ContinueSentinel;
    }
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) {
              if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            }
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) {
      keys.push(key);
    }
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) {
        "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
      }
    },
    stop: function stop() {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 698:
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 687:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(61)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Candle": () => (/* reexport */ CandleExt),
  "Constants": () => (/* reexport */ constants),
  "DataCube": () => (/* reexport */ DataCube),
  "Interface": () => (/* reexport */ mixins_interface),
  "Overlay": () => (/* reexport */ overlay),
  "Tool": () => (/* reexport */ tool),
  "TradingVue": () => (/* reexport */ TradingVue),
  "Utils": () => (/* reexport */ utils),
  "Volbar": () => (/* reexport */ VolbarExt),
  "default": () => (/* binding */ src),
  "layout_cnv": () => (/* reexport */ layout_cnv),
  "layout_vol": () => (/* reexport */ layout_vol),
  "primitives": () => (/* binding */ primitives)
});

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=5c28b699&
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue",
    style: {
      color: this.chart_props.colors.text,
      font: this.font_comp,
      width: this.width + "px",
      height: this.height + "px"
    },
    attrs: {
      id: _vm.id
    },
    on: {
      mousedown: _vm.mousedown,
      mouseleave: _vm.mouseleave
    }
  }, [_vm.toolbar ? _c("toolbar", _vm._b({
    ref: "toolbar",
    attrs: {
      config: _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event
    }
  }, "toolbar", _vm.chart_props, false)) : _vm._e(), _vm._v(" "), _vm.controllers.length ? _c("widgets", {
    ref: "widgets",
    attrs: {
      map: _vm.ws,
      width: _vm.width,
      height: _vm.height,
      tv: this,
      dc: _vm.data
    }
  }) : _vm._e(), _vm._v(" "), _c("chart", _vm._b({
    key: _vm.reset,
    ref: "chart",
    attrs: {
      enableZoom: _vm.enableZoom,
      applyShaders: _vm.applyShaders,
      priceLine: _vm.priceLine,
      decimalPlace: _vm.decimalPlace,
      enableCrosshair: _vm.enableCrosshair,
      ignoreNegativeIndex: _vm.ignoreNegativeIndex,
      ignore_OHLC: _vm.ignore_OHLC,
      tv_id: _vm.id,
      config: _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event,
      "range-changed": _vm.range_changed,
      "legend-button-click": _vm.legend_button
    }
  }, "chart", _vm.chart_props, false)), _vm._v(" "), _c("transition", {
    attrs: {
      name: "tvjs-drift"
    }
  }, [_vm.tip ? _c("the-tip", {
    attrs: {
      data: _vm.tip
    },
    on: {
      "remove-me": function removeMe($event) {
        _vm.tip = null;
      }
    }
  }) : _vm._e()], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;

;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=template&id=5c28b699&

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
;// CONCATENATED MODULE: ./src/stuff/constants.js
var SECOND = 1000;
var MINUTE = SECOND * 60;
var MINUTE3 = MINUTE * 3;
var MINUTE5 = MINUTE * 5;
var MINUTE15 = MINUTE * 15;
var MINUTE30 = MINUTE * 30;
var HOUR = MINUTE * 60;
var HOUR4 = HOUR * 4;
var HOUR12 = HOUR * 12;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = WEEK * 4;
var YEAR = DAY * 365;
var MONTHMAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Grid time steps
var TIMESCALES = [YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR, MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH, DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY, HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR, MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE];

// Grid $ steps
var $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
var ChartConfig = {
  SBMIN: 60,
  // Minimal sidebar px
  SBMAX: Infinity,
  // Max sidebar, px
  TOOLBAR: 57,
  // Toolbar width px
  TB_ICON: 25,
  // Toolbar icon size px
  TB_ITEM_M: 6,
  // Toolbar item margin px
  TB_ICON_BRI: 1,
  // Toolbar icon brightness
  TB_ICON_HOLD: 420,
  // ms, wait to expand
  TB_BORDER: 1,
  // Toolbar border px
  TB_B_STYLE: 'dotted',
  // Toolbar border style
  TOOL_COLL: 7,
  // Tool collision threshold
  EXPAND: 0.15,
  // %/100 of range
  CANDLEW: 0.6,
  // %/100 of step
  GRIDX: 100,
  // px
  GRIDY: 47,
  // px
  BOTBAR: 28,
  // px
  PANHEIGHT: 22,
  // px
  DEFAULT_LEN: 50,
  // candles
  MINIMUM_LEN: 5,
  // candles,
  MIN_ZOOM: 25,
  // candles
  MAX_ZOOM: 1000,
  // candles,
  VOLSCALE: 0.15,
  // %/100 of height
  UX_OPACITY: 0.9,
  // Ux background opacity
  ZOOM_MODE: 'tv',
  // 'tv' or 'tl'
  L_BTN_SIZE: 21,
  // Legend Button size, px
  L_BTN_MARGIN: '-6px 0 -6px 0',
  // css margin
  SCROLL_WHEEL: 'prevent' // 'pass', 'click'
};

ChartConfig.FONT = "11px -apple-system,BlinkMacSystemFont,\n    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,\n    Fira Sans,Droid Sans,Helvetica Neue,\n    sans-serif";
var IB_TF_WARN = 'When using IB mode you should specify ' + 'timeframe (\'tf\' filed in \'chart\' object),' + 'otherwise you can get an unexpected behaviour';
var MAP_UNIT = {
  '1s': SECOND,
  '5s': SECOND * 5,
  '10s': SECOND * 10,
  '20s': SECOND * 20,
  '30s': SECOND * 30,
  '1m': MINUTE,
  '3m': MINUTE3,
  '5m': MINUTE5,
  '15m': MINUTE15,
  '30m': MINUTE30,
  '1H': HOUR,
  '2H': HOUR * 2,
  '3H': HOUR * 3,
  '4H': HOUR4,
  '12H': HOUR12,
  '1D': DAY,
  '1W': WEEK,
  '1M': MONTH,
  '1Y': YEAR
};
/* harmony default export */ const constants = ({
  SECOND: SECOND,
  MINUTE: MINUTE,
  MINUTE5: MINUTE5,
  MINUTE15: MINUTE15,
  MINUTE30: MINUTE30,
  HOUR: HOUR,
  HOUR4: HOUR4,
  DAY: DAY,
  WEEK: WEEK,
  MONTH: MONTH,
  YEAR: YEAR,
  MONTHMAP: MONTHMAP,
  TIMESCALES: TIMESCALES,
  $SCALES: $SCALES,
  ChartConfig: ChartConfig,
  map_unit: MAP_UNIT,
  IB_TF_WARN: IB_TF_WARN
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=9ce1cf84&
var Chartvue_type_template_id_9ce1cf84_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-chart",
    style: _vm.styles
  }, [_c("keyboard", {
    ref: "keyboard"
  }), _vm._v(" "), _vm._l(this._layout.grids, function (grid, i) {
    return _c("grid-section", {
      key: grid.id,
      ref: "sec",
      refInFor: true,
      attrs: {
        common: _vm.section_props(i),
        grid_id: i,
        enableZoom: _vm.enableZoom,
        decimalPlace: _vm.decimalPlace,
        applyShaders: _vm.applyShaders,
        priceLine: _vm.priceLine,
        enableCrosshair: _vm.enableCrosshair,
        ignore_OHLC: _vm.ignore_OHLC
      },
      on: {
        "register-kb-listener": _vm.register_kb,
        "remove-kb-listener": _vm.remove_kb,
        "range-changed": _vm.range_changed,
        "cursor-changed": _vm.cursor_changed,
        "cursor-locked": _vm.cursor_locked,
        "sidebar-transform": _vm.set_ytransform,
        "layer-meta-props": _vm.layer_meta_props,
        "custom-event": _vm.emit_custom_event,
        "legend-button-click": _vm.legend_button_click
      }
    });
  }), _vm._v(" "), _c("botbar", _vm._b({
    attrs: {
      shaders: _vm.shaders,
      timezone: _vm.timezone
    }
  }, "botbar", _vm.botbar_props, false))], 2);
};
var Chartvue_type_template_id_9ce1cf84_staticRenderFns = [];
Chartvue_type_template_id_9ce1cf84_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=template&id=9ce1cf84&

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
;// CONCATENATED MODULE: ./src/stuff/context.js
// Canvas context for text measurments

function Context($p) {
  var el = document.createElement('canvas');
  var ctx = el.getContext('2d');
  ctx.font = $p.font;
  return ctx;
}
/* harmony default export */ const context = (Context);
// EXTERNAL MODULE: ./node_modules/arrayslicer/lib/index.js
var lib = __webpack_require__(678);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);
;// CONCATENATED MODULE: ./src/stuff/utils.js



/* harmony default export */ const utils = ({
  clamp: function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  },
  add_zero: function add_zero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  },
  // Start of the day (zero millisecond)
  day_start: function day_start(t) {
    var start = new Date(t);
    return start.setUTCHours(0, 0, 0, 0);
  },
  // Start of the month
  month_start: function month_start(t) {
    var date = new Date(t);
    return Date.UTC(date.getFullYear(), date.getMonth(), 1);
  },
  // Start of the year
  year_start: function year_start(t) {
    return Date.UTC(new Date(t).getFullYear());
  },
  get_year: function get_year(t) {
    if (!t) return undefined;
    return new Date(t).getUTCFullYear();
  },
  get_month: function get_month(t) {
    if (!t) return undefined;
    return new Date(t).getUTCMonth();
  },
  // Nearest in array
  nearest_a: function nearest_a(x, array) {
    var dist = Infinity;
    var val = null;
    var index = -1;
    for (var i = 0; i < array.length; i++) {
      var xi = array[i];
      if (Math.abs(xi - x) < dist) {
        dist = Math.abs(xi - x);
        val = xi;
        index = i;
      }
    }
    return [index, val];
  },
  round: function round(num, decimals) {
    if (decimals === void 0) {
      decimals = 8;
    }
    return parseFloat(num.toFixed(decimals));
  },
  // Strip? No, it's ugly floats in js
  strip: function strip(number) {
    return parseFloat(parseFloat(number).toPrecision(12));
  },
  get_day: function get_day(t) {
    return t ? new Date(t).getDate() : null;
  },
  // Update array keeping the same reference
  overwrite: function overwrite(arr, new_arr) {
    arr.splice.apply(arr, [0, arr.length].concat(_toConsumableArray(new_arr)));
  },
  // Copy layout in reactive way
  copy_layout: function copy_layout(obj, new_obj) {
    for (var k in obj) {
      if (Array.isArray(obj[k])) {
        // (some offchart indicators are added/removed)
        // we need to update layout in a reactive way
        if (obj[k].length !== new_obj[k].length) {
          this.overwrite(obj[k], new_obj[k]);
          continue;
        }
        for (var m in obj[k]) {
          Object.assign(obj[k][m], new_obj[k][m]);
        }
      } else {
        Object.assign(obj[k], new_obj[k]);
      }
    }
  },
  // Detects candles interval
  detect_interval: function detect_interval(ohlcv) {
    var len = Math.min(ohlcv.length - 1, 99);
    var min = Infinity;
    ohlcv.slice(0, len).forEach(function (x, i) {
      var d = ohlcv[i + 1][0] - x[0];
      if (d === d && d < min) min = d;
    });
    // This saves monthly chart from being awkward
    if (min >= constants.MONTH && min <= constants.DAY * 30) {
      return constants.DAY * 31;
    }
    return min;
  },
  // Gets numberic part of overlay id (e.g 'EMA_1' = > 1)
  get_num_id: function get_num_id(id) {
    return parseInt(id.split('_').pop());
  },
  // Fast filter. Really fast, like 10X
  fast_filter: function fast_filter(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    try {
      var ia = new (lib_default())(arr, '0');
      var res = ia.getRange(t1, t2);
      var i0 = ia.valpos[t1].next;
      return [res, i0];
    } catch (e) {
      // Something wrong with fancy slice lib
      // Fast fix: fallback to filter
      return [arr.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      }), 0];
    }
  },
  // Fast filter (index-based)
  fast_filter_i: function fast_filter_i(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    var i1 = Math.floor(t1);
    if (i1 < 0) i1 = 0;
    var i2 = Math.floor(t2 + 1);
    var res = arr.slice(i1, i2);
    return [res, i1];
  },
  // Nearest indexes (left and right)
  fast_nearest: function fast_nearest(arr, t1) {
    var ia = new (lib_default())(arr, '0');
    ia.fetch(t1);
    return [ia.nextlow, ia.nexthigh];
  },
  now: function now() {
    return new Date().getTime();
  },
  pause: function pause(delay) {
    return new Promise(function (rs, rj) {
      return setTimeout(rs, delay);
    });
  },
  // Limit crazy wheel delta values
  smart_wheel: function smart_wheel(delta) {
    var abs = Math.abs(delta);
    if (abs > 500) {
      return (200 + Math.log(abs)) * Math.sign(delta);
    }
    return delta;
  },
  // Parse the original mouse event to find deltaX
  get_deltaX: function get_deltaX(event) {
    return event.originalEvent.deltaX / 12;
  },
  // Parse the original mouse event to find deltaY
  get_deltaY: function get_deltaY(event) {
    return event.originalEvent.deltaY / 12;
  },
  // Apply opacity to a hex color
  apply_opacity: function apply_opacity(c, op) {
    if (c.length === 7) {
      var n = Math.floor(op * 255);
      n = this.clamp(n, 0, 255);
      c += n.toString(16);
    }
    return c;
  },
  // Parse timeframe or return value in ms
  parse_tf: function parse_tf(smth) {
    if (typeof smth === 'string') {
      return constants.map_unit[smth];
    } else {
      return smth;
    }
  },
  // Detect index shift between the main data sub
  // and the overlay's sub (for IB-mode)
  index_shift: function index_shift(sub, data) {
    // Find the second timestamp (by value)
    if (!data.length) return 0;
    var first = data[0][0];
    var second;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== first) {
        second = data[i][0];
        break;
      }
    }
    for (var j = 0; j < sub.length; j++) {
      if (sub[j][0] === second) {
        return j - i;
      }
    }
    return 0;
  },
  // Fallback fix for Brave browser
  // https://github.com/brave/brave-browser/issues/1738
  measureText: function measureText(ctx, text, tv_id) {
    var m = ctx.measureTextOrg(text);
    if (m.width === 0) {
      var doc = document;
      var id = 'tvjs-measure-text';
      var el = doc.getElementById(id);
      if (!el) {
        var base = doc.getElementById(tv_id);
        el = doc.createElement('div');
        el.id = id;
        el.style.position = 'absolute';
        el.style.top = '-1000px';
        base.appendChild(el);
      }
      if (ctx.font) el.style.font = ctx.font;
      el.innerText = text.replace(/ /g, '.');
      return {
        width: el.offsetWidth
      };
    } else {
      return m;
    }
  },
  uuid: function uuid(temp) {
    if (temp === void 0) {
      temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    }
    return temp.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  },
  uuid2: function uuid2() {
    return this.uuid('xxxxxxxxxxxx');
  },
  // Delayed warning, f = condition lambda fn
  warn: function warn(f, text, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    setTimeout(function () {
      if (f()) console.warn(text);
    }, delay);
  },
  // Checks if script props updated
  // (and not style settings or something else)
  is_scr_props_upd: function is_scr_props_upd(n, prev) {
    var p = prev.find(function (x) {
      return x.v.$uuid === n.v.$uuid;
    });
    if (!p) return false;
    var props = n.p.settings.$props;
    if (!props) return false;
    return props.some(function (x) {
      return n.v[x] !== p.v[x];
    });
  },
  // Checks if it's time to make a script update
  // (based on execInterval in ms)
  delayed_exec: function delayed_exec(v) {
    if (!v.script || !v.script.execInterval) return true;
    var t = this.now();
    var dt = v.script.execInterval;
    if (!v.settings.$last_exec || t > v.settings.$last_exec + dt) {
      v.settings.$last_exec = t;
      return true;
    }
    return false;
  },
  // Format names such 'RSI, $length', where
  // length - is one of the settings
  format_name: function format_name(ov) {
    if (!ov.name) return undefined;
    var name = ov.name;
    for (var k in ov.settings || {}) {
      var val = ov.settings[k];
      var reg = new RegExp("\\$".concat(k), 'g');
      name = name.replace(reg, val);
    }
    return name;
  },
  // Default cursor mode
  xmode: function xmode() {
    return this.is_mobile ? 'explore' : 'default';
  },
  default_prevented: function default_prevented(event) {
    if (event.original) {
      return event.original.defaultPrevented;
    }
    return event.defaultPrevented;
  },
  // WTF with modern web development
  is_mobile: function (w) {
    return 'onorientationchange' in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || 'ontouchstart' in w || w.DocumentTouch && document instanceof w.DocumentTouch);
  }(typeof window !== 'undefined' ? window : {})
});
;// CONCATENATED MODULE: ./src/stuff/math.js
// Math/Geometry

/* harmony default export */ const math = ({
  // Distance from point to line
  // p1 = point, (p2, p3) = line
  point2line: function point2line(p1, p2, p3) {
    var _this$tri = this.tri(p1, p2, p3),
      area = _this$tri.area,
      base = _this$tri.base;
    return Math.abs(this.tri_h(area, base));
  },
  // Distance from point to segment
  // p1 = point, (p2, p3) = segment
  point2seg: function point2seg(p1, p2, p3) {
    var _this$tri2 = this.tri(p1, p2, p3),
      area = _this$tri2.area,
      base = _this$tri2.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Distance from right pin
    var l2 = Math.max(proj - base, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray: function point2ray(p1, p2, p3) {
    var _this$tri3 = this.tri(p1, p2, p3),
      area = _this$tri3.area,
      base = _this$tri3.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1);
  },
  tri: function tri(p1, p2, p3) {
    var area = this.area(p1, p2, p3);
    var dx = p3[0] - p2[0];
    var dy = p3[1] - p2[1];
    var base = Math.sqrt(dx * dx + dy * dy);
    return {
      area: area,
      base: base
    };
  },
  /* Area of triangle:
          p1
        /    \
      p2  _  p3
  */
  area: function area(p1, p2, p3) {
    return p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]);
  },
  // Triangle height
  tri_h: function tri_h(area, base) {
    return area / base;
  },
  // Dot product of (p2, p3) and (p2, p1)
  dot_prod: function dot_prod(p1, p2, p3) {
    var v1 = [p3[0] - p2[0], p3[1] - p2[1]];
    var v2 = [p1[0] - p2[0], p1[1] - p2[1]];
    return v1[0] * v2[0] + v1[1] * v2[1];
  },
  // Symmetrical log
  log: function log(x) {
    // TODO: log for small values
    return Math.sign(x) * Math.log(Math.abs(x) + 1);
  },
  // Symmetrical exp
  exp: function exp(x) {
    return Math.sign(x) * (Math.exp(Math.abs(x)) - 1);
  },
  // Middle line on log scale based on range & px height
  log_mid: function log_mid(r, h) {
    var log_hi = this.log(r[0]);
    var log_lo = this.log(r[1]);
    var px = h / 2;
    var gx = log_hi - px * (log_hi - log_lo) / h;
    return this.exp(gx);
  },
  // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line
  re_range: function re_range(r1, hi2, mid) {
    var log_hi1 = this.log(r1[0]);
    var log_lo1 = this.log(r1[1]);
    var log_hi2 = this.log(hi2);
    var log_$ = this.log(mid);
    var W = (log_hi2 - log_$) * (log_hi1 - log_lo1) / (log_hi1 - log_$);
    return this.exp(log_hi2 - W);
  } // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line + dy (shift)
  // WASTE
  /*range_shift(r1, hi2, mid, dy, h) {
      let log_hi1 = this.log(r1[0])
      let log_lo1 = this.log(r1[1])
      let log_hi2 = this.log(hi2)
      let log_$ = this.log(mid)
        let W = h * (log_hi2 - log_$) /
              (h * (log_hi1 - log_$) / (log_hi1 - log_lo1) + dy)
        return this.exp(log_hi2 - W)
    }*/
});
;// CONCATENATED MODULE: ./src/components/js/layout_fn.js
// Layout functional interface



/* harmony default export */ function layout_fn(self, range) {
  var ib = self.ti_map.ib;
  var dt = range[1] - range[0];
  var r = self.spacex / dt;
  var ls = self.grid.logScale || false;
  Object.assign(self, {
    // Time to screen coordinates
    t2screen: function t2screen(t) {
      if (ib) t = self.ti_map.smth2i(t);
      return Math.floor((t - range[0]) * r) - 0.5;
    },
    // $ to screen coordinates
    $2screen: function $2screen(y) {
      if (ls) y = math.log(y);
      return Math.floor(y * self.A + self.B) - 0.5;
    },
    // Time-axis nearest step
    t_magnet: function t_magnet(t) {
      if (ib) t = self.ti_map.smth2i(t);
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      if (!cn[i]) return;
      return Math.floor(cn[i].x) - 0.5;
    },
    // Screen-Y to dollar value (or whatever)
    screen2$: function screen2$(y) {
      if (ls) return math.exp((y - self.B) / self.A);
      return (y - self.B) / self.A;
    },
    // Screen-X to timestamp
    screen2t: function screen2t(x) {
      // TODO: most likely Math.floor not needed
      // return Math.floor(range[0] + x / r)
      return range[0] + x / r;
    },
    // $-axis nearest step
    $_magnet: function $_magnet(price) {},
    // Nearest candlestick
    c_magnet: function c_magnet(t) {
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      return cn[i];
    },
    // Nearest data points
    data_magnet: function data_magnet(t) {/* TODO: implement */}
  });
  return self;
}
;// CONCATENATED MODULE: ./src/components/js/log_scale.js
// Log-scale mode helpers

// TODO: all-negative numbers (sometimes wrong scaling)


/* harmony default export */ const log_scale = ({
  candle: function candle(self, mid, p, $p) {
    return {
      x: mid,
      w: self.px_step * $p.config.CANDLEW,
      o: Math.floor(math.log(p[1]) * self.A + self.B),
      h: Math.floor(math.log(p[2]) * self.A + self.B),
      l: Math.floor(math.log(p[3]) * self.A + self.B),
      c: Math.floor(math.log(p[4]) * self.A + self.B),
      raw: p
    };
  },
  expand: function expand(self, height) {
    // expand log scale
    var A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
    var B = -math.log(self.$_hi) * A;
    var top = -height * 0.1;
    var bot = height * 1.1;
    self.$_hi = math.exp((top - B) / A);
    self.$_lo = math.exp((bot - B) / A);
  }
});
;// CONCATENATED MODULE: ./src/components/js/grid_maker.js






var grid_maker_TIMESCALES = constants.TIMESCALES,
  grid_maker_$SCALES = constants.$SCALES,
  grid_maker_WEEK = constants.WEEK,
  grid_maker_MONTH = constants.MONTH,
  grid_maker_YEAR = constants.YEAR,
  grid_maker_HOUR = constants.HOUR,
  grid_maker_DAY = constants.DAY;
var MAX_INT = Number.MAX_SAFE_INTEGER;

// master_grid - ref to the master grid
function GridMaker(id, params, master_grid) {
  if (master_grid === void 0) {
    master_grid = null;
  }
  var sub = params.sub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    $p = params.$p,
    layers_meta = params.layers_meta,
    height = params.height,
    y_t = params.y_t,
    ti_map = params.ti_map,
    grid = params.grid,
    timezone = params.timezone;
  var self = {
    ti_map: ti_map
  };
  var lm = layers_meta[id];
  var y_range_fn = null;
  var ls = grid.logScale;
  if (lm && Object.keys(lm).length) {
    // Gets last y_range fn()
    var yrs = Object.values(lm).filter(function (x) {
      return x.y_range;
    });
    // The first y_range() determines the range
    if (yrs.length) y_range_fn = yrs[0].y_range;
  }

  // Calc vertical ($/₿) range
  function calc_$range() {
    if (!master_grid) {
      // $ candlestick range
      if (y_range_fn) {
        var _y_range_fn = y_range_fn(hi, lo),
          _y_range_fn2 = _slicedToArray(_y_range_fn, 2),
          hi = _y_range_fn2[0],
          lo = _y_range_fn2[1];
      } else {
        hi = -Infinity, lo = Infinity;
        for (var i = 0, n = sub.length; i < n; i++) {
          var x = sub[i];
          if (x[2] > hi) hi = x[2];
          if (x[3] < lo) lo = x[3];
        }
      }
    } else {
      // Offchart indicator range
      hi = -Infinity, lo = Infinity;
      for (var i = 0; i < sub.length; i++) {
        for (var j = 1; j < sub[i].length; j++) {
          var v = sub[i][j];
          if (v > hi) hi = v;
          if (v < lo) lo = v;
        }
      }
      if (y_range_fn) {
        var _y_range_fn3 = y_range_fn(hi, lo),
          _y_range_fn4 = _slicedToArray(_y_range_fn3, 3),
          hi = _y_range_fn4[0],
          lo = _y_range_fn4[1],
          exp = _y_range_fn4[2];
      }
    }

    // Fixed y-range in non-auto mode
    if (y_t && !y_t.auto && y_t.range) {
      self.$_hi = y_t.range[0];
      self.$_lo = y_t.range[1];
    } else {
      if (!ls) {
        exp = exp === false ? 0 : 1;
        self.$_hi = hi + (hi - lo) * $p.config.EXPAND * exp;
        self.$_lo = lo - (hi - lo) * $p.config.EXPAND * exp;
      } else {
        self.$_hi = hi;
        self.$_lo = lo;
        log_scale.expand(self, height);
      }
      if (self.$_hi === self.$_lo) {
        if (!ls) {
          self.$_hi *= 1.05; // Expand if height range === 0
          self.$_lo *= 0.95;
        } else {
          log_scale.expand(self, height);
        }
      }
    }
  }
  function calc_sidebar() {
    if (sub.length < 2) {
      self.prec = 0;
      self.sb = $p.config.SBMIN;
      return;
    }

    // TODO: improve sidebar width calculation
    // at transition point, when one precision is
    // replaced with another

    // Gets formated levels (their lengths),
    // calculates max and measures the sidebar length
    // from it:

    // TODO: add custom formatter f()

    self.prec = calc_precision(sub);
    var lens = [];
    //lens.push(self.$_hi.toFixed(self.prec).length)
    //lens.push(self.$_lo.toFixed(self.prec).length)
    lens.push(self.$_hi.toFixed(2).length);
    lens.push(self.$_lo.toFixed(2).length);
    var str = '0'.repeat(Math.max.apply(Math, lens)) + '    ';
    self.sb = ctx.measureText(str).width;
    self.sb = Math.max(Math.floor(self.sb), $p.config.SBMIN);
    self.sb = Math.min(self.sb, $p.config.SBMAX);
  }

  // Calculate $ precision for the Y-axis
  function calc_precision(data) {
    var max_r = 0,
      max_l = 0;
    var min = Infinity;
    var max = -Infinity;

    // Speed UP
    for (var i = 0, n = data.length; i < n; i++) {
      var x = data[i];
      if (x[1] > max) max = x[1];else if (x[1] < min) min = x[1];
    }
    // Get max lengths of integer and fractional parts
    [min, max].forEach(function (x) {
      // Fix undefined bug
      var str = x != null ? x.toString() : '';
      if (x < 0.000001) {
        // Parsing the exponential form. Gosh this
        // smells trickily
        var _str$split = str.split('e-'),
          _str$split2 = _slicedToArray(_str$split, 2),
          ls = _str$split2[0],
          rs = _str$split2[1];
        var _ls$split = ls.split('.'),
          _ls$split2 = _slicedToArray(_ls$split, 2),
          l = _ls$split2[0],
          r = _ls$split2[1];
        if (!r) r = '';
        r = {
          length: r.length + parseInt(rs) || 0
        };
      } else {
        var _str$split3 = str.split('.'),
          _str$split4 = _slicedToArray(_str$split3, 2),
          l = _str$split4[0],
          r = _str$split4[1];
      }
      if (r && r.length > max_r) {
        max_r = r.length;
      }
      if (l && l.length > max_l) {
        max_l = l.length;
      }
    });

    // Select precision scheme depending
    // on the left and right part lengths
    //
    var even = max_r - max_r % 2 + 2;
    if (max_l === 1) {
      return Math.min(8, Math.max(2, even));
    }
    if (max_l <= 2) {
      return Math.min(4, Math.max(2, even));
    }
    return 2;
  }
  function calc_positions() {
    if (sub.length < 2) return;
    var dt = range[1] - range[0];

    // A pixel space available to draw on (x-axis)
    self.spacex = $p.width - self.sb;

    // Candle capacity
    var capacity = dt / interval;
    self.px_step = self.spacex / capacity;

    // px / time ratio
    var r = self.spacex / dt;
    self.startx = (sub[0][0] - range[0]) * r;

    // Candle Y-transform: (A = scale, B = shift)
    if (!grid.logScale) {
      self.A = -height / (self.$_hi - self.$_lo);
      self.B = -self.$_hi * self.A;
    } else {
      self.A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
      self.B = -math.log(self.$_hi) * self.A;
    }
  }

  // Select nearest good-loking t step (m is target scale)
  function time_step() {
    var k = ti_map.ib ? 60000 : 1;
    var xrange = (range[1] - range[0]) * k;
    var m = xrange * ($p.config.GRIDX / $p.width);
    var s = grid_maker_TIMESCALES;
    return utils.nearest_a(m, s)[1] / k;
  }

  // Select nearest good-loking $ step (m is target scale)
  function dollar_step() {
    var yrange = self.$_hi - self.$_lo;
    var m = yrange * ($p.config.GRIDY / height);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    var d = Math.pow(10, p);
    var s = grid_maker_$SCALES.map(function (x) {
      return x * d;
    });

    // TODO: center the range (look at RSI for example,
    // it looks ugly when "80" is near the top)
    return utils.strip(utils.nearest_a(m, s)[1]);
  }
  function dollar_mult() {
    var mult_hi = dollar_mult_hi();
    var mult_lo = dollar_mult_lo();
    return Math.max(mult_hi, mult_lo);
  }

  // Price step multiplier (for the log-scale mode)
  function dollar_mult_hi() {
    var h = Math.min(self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = self.$_hi;
    if (self.$_lo > 0) {
      var yratio = self.$_hi / self.$_lo;
    } else {
      yratio = self.$_hi / 1; // TODO: small values
    }

    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function dollar_mult_lo() {
    var h = Math.min(height - self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = Math.abs(self.$_lo);
    if (self.$_hi < 0 && self.$_lo < 0) {
      var yratio = Math.abs(self.$_lo / self.$_hi);
    } else {
      yratio = Math.abs(self.$_lo) / 1;
    }
    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function grid_x() {
    // If this is a subgrid, no need to calc a timeline,
    // we just borrow it from the master_grid
    if (!master_grid) {
      self.t_step = time_step();
      self.xs = [];
      var dt = range[1] - range[0];
      var r = self.spacex / dt;

      /* TODO: remove the left-side glitch
        let year_0 = Utils.get_year(sub[0][0])
      for (var t0 = year_0; t0 < range[0]; t0 += self.t_step) {}
        let m0 = Utils.get_month(t0)*/

      for (var i = 0; i < sub.length; i++) {
        var p = sub[i];
        var prev = sub[i - 1] || [];
        var prev_xs = self.xs[self.xs.length - 1] || [0, []];
        var x = Math.floor((p[0] - range[0]) * r);
        insert_line(prev, p, x);

        // Filtering lines that are too near
        var xs = self.xs[self.xs.length - 1] || [0, []];
        if (prev_xs === xs) continue;
        if (xs[1][0] - prev_xs[1][0] < self.t_step * 0.8) {
          // prev_xs is a higher "rank" label
          if (xs[2] <= prev_xs[2]) {
            self.xs.pop();
          } else {
            // Otherwise
            self.xs.splice(self.xs.length - 2, 1);
          }
        }
      }

      // TODO: fix grid extension for bigger timeframes
      if (interval < grid_maker_WEEK && r > 0) {
        extend_left(dt, r);
        extend_right(dt, r);
      }
    } else {
      self.t_step = master_grid.t_step;
      self.px_step = master_grid.px_step;
      self.startx = master_grid.startx;
      self.xs = master_grid.xs;
    }
  }
  function insert_line(prev, p, x, m0) {
    var prev_t = ti_map.ib ? ti_map.i2t(prev[0]) : prev[0];
    var p_t = ti_map.ib ? ti_map.i2t(p[0]) : p[0];
    if (ti_map.tf < grid_maker_DAY) {
      prev_t += timezone * grid_maker_HOUR;
      p_t += timezone * grid_maker_HOUR;
    }
    var d = timezone * grid_maker_HOUR;

    // TODO: take this block =========> (see below)
    if ((prev[0] || interval === grid_maker_YEAR) && utils.get_year(p_t) !== utils.get_year(prev_t)) {
      self.xs.push([x, p, grid_maker_YEAR]); // [px, [...], rank]
    } else if (prev[0] && utils.get_month(p_t) !== utils.get_month(prev_t)) {
      self.xs.push([x, p, grid_maker_MONTH]);
    }
    // TODO: should be added if this day !== prev day
    // And the same for 'botbar.js', TODO(*)
    else if (utils.day_start(p_t) === p_t) {
      self.xs.push([x, p, grid_maker_DAY]);
    } else if (p[0] % self.t_step === 0) {
      self.xs.push([x, p, interval]);
    }
  }
  function extend_left(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[0][1][0];
    while (true) {
      t -= self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x < 0) break;
      // TODO: ==========> And insert it here somehow
      if (t % interval === 0) {
        self.xs.unshift([x, [t], interval]);
      }
    }
  }
  function extend_right(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[self.xs.length - 1][1][0];
    while (true) {
      t += self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x > self.spacex) break;
      if (t % interval === 0) {
        self.xs.push([x, [t], interval]);
      }
    }
  }
  function grid_y() {
    // Prevent duplicate levels
    var m = Math.pow(10, -self.prec);
    self.$_step = Math.max(m, dollar_step());
    self.ys = [];
    var y1 = self.$_lo - self.$_lo % self.$_step;
    for (var y$ = y1; y$ <= self.$_hi; y$ += self.$_step) {
      var y = Math.floor(y$ * self.A + self.B);
      if (y > height) continue;
      self.ys.push([y, utils.strip(y$)]);
    }
  }
  function grid_y_log() {
    // TODO: Prevent duplicate levels, is this even
    // a problem here ?
    self.$_mult = dollar_mult();
    self.ys = [];
    if (!sub.length) return;
    var v = Math.abs(sub[sub.length - 1][1] || 1);
    var y1 = search_start_pos(v);
    var y2 = search_start_neg(-v);
    var yp = -Infinity; // Previous y value
    var n = height / $p.config.GRIDY; // target grid N

    var q = 1 + (self.$_mult - 1) / 2;

    // Over 0
    for (var y$ = y1; y$ > 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var y = Math.floor(math.log(y$) * self.A + self.B);
      self.ys.push([y, utils.strip(y$)]);
      if (y > height) break;
      if (y - yp < $p.config.GRIDY * 0.7) break;
      if (self.ys.length > n + 1) break;
      yp = y;
    }

    // Under 0
    yp = Infinity;
    for (var y$ = y2; y$ < 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var _y = Math.floor(math.log(y$) * self.A + self.B);
      if (yp - _y < $p.config.GRIDY * 0.7) break;
      self.ys.push([_y, utils.strip(y$)]);
      if (_y < 0) break;
      if (self.ys.length > n * 3 + 1) break;
      yp = _y;
    }

    // TODO: remove lines near to 0
  }

  // Search a start for the top grid so that
  // the fixed value always included
  function search_start_pos(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = Infinity,
      y$ = value,
      count = 0;
    while (y > 0) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) return 0; // Prevents deadloops
    }

    return y$;
  }
  function search_start_neg(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = -Infinity,
      y$ = value,
      count = 0;
    while (y < height) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) break; // Prevents deadloops
    }

    return y$;
  }

  // Make log scale levels look great again
  function log_rounder(x, quality) {
    var s = Math.sign(x);
    x = Math.abs(x);
    if (x > 10) {
      for (var div = 10; div < MAX_INT; div *= 10) {
        var nice = Math.floor(x / div) * div;
        if (x / nice > quality) {
          // More than 10% off
          break;
        }
      }
      div /= 10;
      return s * Math.floor(x / div) * div;
    } else if (x < 1) {
      for (var ro = 10; ro >= 1; ro--) {
        var _nice = utils.round(x, ro);
        if (x / _nice > quality) {
          // More than 10% off
          break;
        }
      }
      return s * utils.round(x, ro + 1);
    } else {
      return s * Math.floor(x);
    }
  }
  function apply_sizes() {
    self.width = $p.width - self.sb;
    self.height = height;
  }
  calc_$range();
  calc_sidebar();
  return {
    // First we need to calculate max sidebar width
    // (among all grids). Then we can actually make
    // them
    create: function create() {
      calc_positions();
      grid_x();
      if (grid.logScale) {
        grid_y_log();
      } else {
        grid_y();
      }
      apply_sizes();

      // Link to the master grid (candlesticks)
      if (master_grid) {
        self.master_grid = master_grid;
      }
      self.grid = grid; // Grid params

      // Here we add some helpful functions for
      // plugin creators
      return layout_fn(self, range);
    },
    get_layout: function get_layout() {
      return self;
    },
    set_sidebar: function set_sidebar(v) {
      return self.sb = v;
    },
    get_sidebar: function get_sidebar() {
      return self.sb;
    }
  };
}
/* harmony default export */ const grid_maker = (GridMaker);
;// CONCATENATED MODULE: ./src/components/js/layout.js


function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = layout_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function layout_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return layout_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return layout_arrayLikeToArray(o, minLen); }
function layout_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Calculates all necessary s*it to build the chart
// Heights, widths, transforms, ... = everything
// Why such a mess you ask? Well, that's because
// one components size can depend on other component
// data formatting (e.g. grid width depends on sidebar precision)
// So it's better to calc all in one place.





function Layout(params) {
  var chart = params.chart,
    sub = params.sub,
    offsub = params.offsub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    layers_meta = params.layers_meta,
    ti_map = params.ti_map,
    $p = params.$props,
    y_ts = params.y_transforms;
  var mgrid = chart.grid || {};
  offsub = offsub.filter(function (x, i) {
    // Skip offchart overlays with custom grid id,
    // because they will be mergred with the existing grids
    return !(x.grid && x.grid.id);
  });

  // Splits space between main chart
  // and offchart indicator grids
  function grid_hs() {
    var height = $p.height - $p.config.BOTBAR;

    // When at least one height defined (default = 1),
    // Pxs calculated as: (sum of weights) / number
    if (mgrid.height || offsub.find(function (x) {
      return x.grid.height;
    })) {
      return weighted_hs(mgrid, height);
    }
    var n = offsub.length;
    var off_h = 2 * Math.sqrt(n) / 7 / (n || 1);

    // Offchart grid height
    var px = Math.floor(height * off_h);

    // Main grid height
    var m = height - px * n;
    return [m].concat(Array(n).fill(px));
  }
  function weighted_hs(grid, height) {
    var hs = [{
      grid: grid
    }].concat(_toConsumableArray(offsub)).map(function (x) {
      return x.grid.height || 1;
    });
    var sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    hs = hs.map(function (x) {
      return Math.floor(x / sum * height);
    });

    // Refine the height if Math.floor decreased px sum
    sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    for (var i = 0; i < height - sum; i++) {
      hs[i % hs.length]++;
    }
    return hs;
  }
  function candles_n_vol() {
    self.candles = [];
    self.volume = [];
    var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
      return x[5];
    })));
    var vs = $p.config.VOLSCALE * $p.height / maxv;
    var x1,
      x2,
      mid,
      prev = undefined;
    var splitter = self.px_step > 5 ? 1 : 0;
    var hf_px_step = self.px_step * 0.5;
    for (var i = 0; i < sub.length; i++) {
      var p = sub[i];
      mid = self.t2screen(p[0]) + 0.5;
      self.candles.push(mgrid.logScale ? log_scale.candle(self, mid, p, $p) : {
        x: mid,
        w: self.px_step * $p.config.CANDLEW,
        o: Math.floor(p[1] * self.A + self.B),
        h: Math.floor(p[2] * self.A + self.B),
        l: Math.floor(p[3] * self.A + self.B),
        c: Math.floor(p[4] * self.A + self.B),
        raw: p
      });
      // Clear volume bar if there is a time gap
      if (sub[i - 1] && p[0] - sub[i - 1][0] > interval) {
        prev = null;
      }
      x1 = prev || Math.floor(mid - hf_px_step);
      x2 = Math.floor(mid + hf_px_step) - 0.5;
      self.volume.push({
        x1: x1,
        x2: x2,
        h: p[5] * vs,
        green: p[4] >= p[1],
        raw: p
      });
      prev = x2 + splitter;
    }
  }

  // Main grid
  var hs = grid_hs();
  var specs = {
    sub: sub,
    interval: interval,
    range: range,
    ctx: ctx,
    $p: $p,
    layers_meta: layers_meta,
    ti_map: ti_map,
    height: hs[0],
    y_t: y_ts[0],
    grid: mgrid,
    timezone: $p.timezone
  };
  var gms = [new grid_maker(0, specs)];

  // Sub grids
  var _iterator = _createForOfIteratorHelper(offsub.entries()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        i = _step$value[0],
        _step$value$ = _step$value[1],
        data = _step$value$.data,
        grid = _step$value$.grid;
      specs.sub = data;
      specs.height = hs[i + 1];
      specs.y_t = y_ts[i + 1];
      specs.grid = grid || {};
      gms.push(new grid_maker(i + 1, specs, gms[0].get_layout()));
    }

    // Max sidebar among all grinds
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var sb = Math.max.apply(Math, _toConsumableArray(gms.map(function (x) {
    return x.get_sidebar();
  })));
  var grids = [],
    offset = 0;
  for (i = 0; i < gms.length; i++) {
    gms[i].set_sidebar(sb);
    grids.push(gms[i].create());
    grids[i].id = i;
    grids[i].offset = offset;
    offset += grids[i].height;
  }
  var self = grids[0];
  candles_n_vol();
  return {
    grids: grids,
    botbar: {
      width: $p.width,
      height: $p.config.BOTBAR,
      offset: offset,
      xs: grids[0] ? grids[0].xs : []
    }
  };
}
/* harmony default export */ const layout = (Layout);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function classCallCheck_classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function createClass_createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
;// CONCATENATED MODULE: ./src/components/js/updater.js



function updater_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = updater_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function updater_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return updater_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return updater_arrayLikeToArray(o, minLen); }
function updater_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Cursor updater: calculates current values for
// OHLCV and all other indicators


var CursorUpdater = /*#__PURE__*/function () {
  function CursorUpdater(comp) {
    classCallCheck_classCallCheck(this, CursorUpdater);
    this.comp = comp, this.grids = comp._layout.grids, this.cursor = comp.cursor;
  }
  createClass_createClass(CursorUpdater, [{
    key: "sync",
    value: function sync(e) {
      // TODO: values not displaying if a custom grid id is set:
      // grid: { id: N }
      this.cursor.grid_id = e.grid_id;
      var once = true;
      var _iterator = updater_createForOfIteratorHelper(this.grids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var grid = _step.value;
          var c = this.cursor_data(grid, e);
          if (!this.cursor.locked) {
            // TODO: find a better fix to invisible cursor prob
            if (once) {
              this.cursor.t = this.cursor_time(grid, e, c);
              if (this.cursor.t) once = false;
            }
            if (c.values) {
              this.comp.$set(this.cursor.values, grid.id, c.values);
            }
          }
          if (grid.id !== e.grid_id) continue;
          this.cursor.x = grid.t2screen(this.cursor.t);
          this.cursor.y = c.y;
          this.cursor.y$ = c.y$;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "overlay_data",
    value: function overlay_data(grid, e) {
      var s = grid.id === 0 ? 'main_section' : 'sub_section';
      var data = this.comp[s].data;

      // Split offchart data between offchart grids
      if (grid.id > 0) {
        // Sequential grids
        var _d = data.filter(function (x) {
          return x.grid.id === undefined;
        });
        // grids with custom ids (for merging)
        var m = data.filter(function (x) {
          return x.grid.id === grid.id;
        });
        data = [_d[grid.id - 1]].concat(_toConsumableArray(m));
      }
      var t = grid.screen2t(e.x);
      var ids = {},
        res = {};
      var _iterator2 = updater_createForOfIteratorHelper(data),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          var ts = d.data.map(function (x) {
            return x[0];
          });
          var i = utils.nearest_a(t, ts)[0];
          d.type in ids ? ids[d.type]++ : ids[d.type] = 0;
          res["".concat(d.type, "_").concat(ids[d.type])] = d.data[i];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return res;
    }

    // Nearest datapoints
  }, {
    key: "cursor_data",
    value: function cursor_data(grid, e) {
      var data = this.comp.main_section.sub;
      var xs = data.map(function (x) {
        return grid.t2screen(x[0]) + 0.5;
      });
      var i = utils.nearest_a(e.x, xs)[0];
      if (!xs[i]) return {};
      return {
        x: Math.floor(xs[i]) - 0.5,
        y: Math.floor(e.y - 2) - 0.5 - grid.offset,
        y$: grid.screen2$(e.y - 2 - grid.offset),
        t: (data[i] || [])[0],
        values: Object.assign({
          ohlcv: grid.id === 0 ? data[i] : undefined
        }, this.overlay_data(grid, e))
      };
    }

    // Get cursor t-position (extended)
  }, {
    key: "cursor_time",
    value: function cursor_time(grid, mouse, candle) {
      var t = grid.screen2t(mouse.x);
      var r = Math.abs((t - candle.t) / this.comp.interval);
      var sign = Math.sign(t - candle.t);
      if (r >= 0.5) {
        // Outside the data range
        var n = Math.round(r);
        return candle.t + n * this.comp.interval * sign;
      }
      // Inside the data range
      return candle.t;
    }
  }]);
  return CursorUpdater;
}();
/* harmony default export */ const updater = (CursorUpdater);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=18f3639b&
var Sectionvue_type_template_id_18f3639b_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-section"
  }, [_c("chart-legend", {
    ref: "legend",
    attrs: {
      values: _vm.section_values,
      decimalPlace: _vm.decimalPlace,
      grid_id: _vm.grid_id,
      common: _vm.legend_props,
      main_chart_type: _vm.main_chart_type,
      ignore_OHLC: _vm.ignore_OHLC,
      meta_props: _vm.get_meta_props
    },
    on: {
      "legend-button-click": _vm.button_click
    }
  }), _vm._v(" "), _c("grid", _vm._b({
    ref: "grid",
    attrs: {
      grid_id: _vm.grid_id,
      enableZoom: _vm.enableZoom,
      decimalPlace: _vm.decimalPlace,
      priceLine: _vm.priceLine,
      enableCrosshair: _vm.enableCrosshair
    },
    on: {
      "register-kb-listener": _vm.register_kb,
      "remove-kb-listener": _vm.remove_kb,
      "range-changed": _vm.range_changed,
      "cursor-changed": _vm.cursor_changed,
      "cursor-locked": _vm.cursor_locked,
      "layer-meta-props": _vm.emit_meta_props,
      "custom-event": _vm.emit_custom_event,
      "sidebar-transform": _vm.sidebar_transform,
      "rezoom-range": _vm.rezoom_range
    }
  }, "grid", _vm.grid_props, false)), _vm._v(" "), _c("sidebar", _vm._b({
    ref: "sb-" + _vm.grid_id,
    attrs: {
      grid_id: _vm.grid_id,
      rerender: _vm.rerender,
      decimalPlace: _vm.decimalPlace,
      applyShaders: _vm.applyShaders
    },
    on: {
      "sidebar-transform": _vm.sidebar_transform
    }
  }, "sidebar", _vm.sidebar_props, false))], 1);
};
var Sectionvue_type_template_id_18f3639b_staticRenderFns = [];
Sectionvue_type_template_id_18f3639b_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=template&id=18f3639b&

;// CONCATENATED MODULE: ./src/stuff/frame.js


// Annimation frame with a fallback for
// slower devices


var FrameAnimation = /*#__PURE__*/function () {
  function FrameAnimation(cb) {
    var _this = this;
    classCallCheck_classCallCheck(this, FrameAnimation);
    this.t0 = this.t = utils.now();
    this.id = setInterval(function () {
      // The prev frame took too long
      if (utils.now() - _this.t > 100) return;
      if (utils.now() - _this.t0 > 1200) {
        _this.stop();
      }
      if (_this.id) cb(_this);
      _this.t = utils.now();
    }, 16);
  }
  createClass_createClass(FrameAnimation, [{
    key: "stop",
    value: function stop() {
      clearInterval(this.id);
      this.id = null;
    }
  }]);
  return FrameAnimation;
}();

// EXTERNAL MODULE: ./node_modules/hammerjs/hammer.js
var hammer = __webpack_require__(840);
// EXTERNAL MODULE: ./node_modules/hamsterjs/hamster.js
var hamster = __webpack_require__(981);
var hamster_default = /*#__PURE__*/__webpack_require__.n(hamster);
;// CONCATENATED MODULE: ./src/components/js/grid.js




function grid_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = grid_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function grid_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return grid_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return grid_arrayLikeToArray(o, minLen); }
function grid_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Grid.js listens to various user-generated events,
// emits Vue-events if something has changed (e.g. range)
// Think of it as an I/O system for Grid.vue







// Grid is good.
var Grid = /*#__PURE__*/function () {
  function Grid(canvas, comp) {
    classCallCheck_classCallCheck(this, Grid);
    this.MIN_ZOOM = comp.config.MIN_ZOOM;
    this.MAX_ZOOM = comp.config.MAX_ZOOM;
    if (utils.is_mobile) this.MIN_ZOOM *= 0.5;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.interval = this.$p.interval;
    this.cursor = comp.$props.cursor;
    this.offset_x = 0;
    this.offset_y = 0;
    this.deltas = 0; // Wheel delta events
    this.wmode = this.$p.config.SCROLL_WHEEL;
    if (this.$p.enableZoom) {
      this.listeners();
    }
    this.overlays = [];
  }
  createClass_createClass(Grid, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;
      console.log(this.$p.enableZoom);
      this.hm = hamster_default()(this.canvas);
      this.hm.wheel(function (event, delta) {
        return _this.mousezoom(-delta * 50, event);
      });
      var mc = this.mc = new hammer.Manager(this.canvas);
      var T = utils.is_mobile ? 10 : 0;
      mc.add(new hammer.Pan({
        threshold: T
      }));
      mc.add(new hammer.Tap());
      mc.add(new hammer.Pinch({
        threshold: 0
      }));
      mc.get("pinch").set({
        enable: true
      });
      if (utils.is_mobile) mc.add(new hammer.Press());
      mc.on("panstart", function (event) {
        if (_this.cursor.scroll_lock) return;
        if (_this.cursor.mode === "aim") {
          return _this.emit_cursor_coord(event);
        }
        var tfrm = _this.$p.y_transform;
        _this.drug = {
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y,
          r: _this.range.slice(),
          t: _this.range[1] - _this.range[0],
          o: tfrm ? tfrm.offset || 0 : 0,
          y_r: tfrm && tfrm.range ? tfrm.range.slice() : undefined,
          B: _this.layout.B,
          t0: utils.now()
        };
        _this.comp.$emit("cursor-changed", {
          grid_id: _this.id,
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y
        });
        _this.comp.$emit("cursor-locked", true);
      });
      mc.on("panmove", function (event) {
        if (utils.is_mobile) {
          _this.calc_offset();
          _this.propagate("mousemove", _this.touch2mouse(event));
        }
        if (_this.drug) {
          _this.mousedrag(_this.drug.x + event.deltaX, _this.drug.y + event.deltaY);
          _this.comp.$emit("cursor-changed", {
            grid_id: _this.id,
            x: event.center.x + _this.offset_x,
            y: event.center.y + _this.offset_y
          });
        } else if (_this.cursor.mode === "aim") {
          _this.emit_cursor_coord(event);
        }
      });
      mc.on("panend", function (event) {
        if (utils.is_mobile && _this.drug) {
          _this.pan_fade(event);
        }
        _this.drug = null;
        _this.comp.$emit("cursor-locked", false);
      });
      mc.on("tap", function (event) {
        if (!utils.is_mobile) return;
        _this.sim_mousedown(event);
        if (_this.fade) _this.fade.stop();
        _this.comp.$emit("cursor-changed", {});
        _this.comp.$emit("cursor-changed", {
          /*grid_id: this.id,
                  x: undefined,//event.center.x + this.offset_x,
                  y: undefined,//event.center.y + this.offset_y,*/
          mode: "explore"
        });
        _this.update();
      });
      mc.on("pinchstart", function () {
        _this.drug = null;
        _this.pinch = {
          t: _this.range[1] - _this.range[0],
          r: _this.range.slice()
        };
      });
      mc.on("pinchend", function () {
        _this.pinch = null;
      });
      mc.on("pinch", function (event) {
        if (_this.pinch) _this.pinchzoom(event.scale);
      });
      mc.on("press", function (event) {
        if (!utils.is_mobile) return;
        if (_this.fade) _this.fade.stop();
        _this.calc_offset();
        _this.emit_cursor_coord(event, {
          mode: "aim"
        });
        setTimeout(function () {
          return _this.update();
        });
        _this.sim_mousedown(event);
      });
      var add = addEventListener;
      add("gesturestart", this.gesturestart);
      add("gesturechange", this.gesturechange);
      add("gestureend", this.gestureend);
    }
  }, {
    key: "gesturestart",
    value: function gesturestart(event) {
      event.preventDefault();
    }
  }, {
    key: "gesturechange",
    value: function gesturechange(event) {
      event.preventDefault();
    }
  }, {
    key: "gestureend",
    value: function gestureend(event) {
      event.preventDefault();
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      if (utils.is_mobile) return;
      this.comp.$emit("cursor-changed", {
        grid_id: this.id,
        x: event.layerX,
        y: event.layerY + this.layout.offset
      });
      this.calc_offset();
      this.propagate("mousemove", event);
    }
  }, {
    key: "mouseout",
    value: function mouseout(event) {
      if (utils.is_mobile) return;
      this.comp.$emit("cursor-changed", {});
      this.propagate("mouseout", event);
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      this.drug = null;
      this.comp.$emit("cursor-locked", false);
      this.propagate("mouseup", event);
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (utils.is_mobile) return;
      this.propagate("mousedown", event);
      this.comp.$emit("cursor-locked", true);
      if (event.defaultPrevented) return;
      this.comp.$emit("custom-event", {
        event: "grid-mousedown",
        args: [this.id, event]
      });
    }

    // Simulated mousedown (for mobile)
  }, {
    key: "sim_mousedown",
    value: function sim_mousedown(event) {
      var _this2 = this;
      if (event.srcEvent.defaultPrevented) return;
      this.comp.$emit("custom-event", {
        event: "grid-mousedown",
        args: [this.id, event]
      });
      this.propagate("mousemove", this.touch2mouse(event));
      this.update();
      this.propagate("mousedown", this.touch2mouse(event));
      setTimeout(function () {
        _this2.propagate("click", _this2.touch2mouse(event));
      });
    }

    // Convert touch to "mouse" event
  }, {
    key: "touch2mouse",
    value: function touch2mouse(e) {
      this.calc_offset();
      return {
        original: e.srcEvent,
        layerX: e.center.x + this.offset_x,
        layerY: e.center.y + this.offset_y,
        preventDefault: function preventDefault() {
          this.original.preventDefault();
        }
      };
    }
  }, {
    key: "click",
    value: function click(event) {
      this.propagate("click", event);
    }
  }, {
    key: "emit_cursor_coord",
    value: function emit_cursor_coord(event, add) {
      if (add === void 0) {
        add = {};
      }
      this.comp.$emit("cursor-changed", Object.assign({
        grid_id: this.id,
        x: event.center.x + this.offset_x,
        y: event.center.y + this.offset_y + this.layout.offset
      }, add));
    }
  }, {
    key: "pan_fade",
    value: function pan_fade(event) {
      var _this3 = this;
      var dt = utils.now() - this.drug.t0;
      var dx = this.range[1] - this.drug.r[1];
      var v = 42 * dx / dt;
      var v0 = Math.abs(v * 0.01);
      if (dt > 500) return;
      if (this.fade) this.fade.stop();
      this.fade = new FrameAnimation(function (self) {
        v *= 0.85;
        if (Math.abs(v) < v0) {
          self.stop();
        }
        _this3.range[0] += v;
        _this3.range[1] += v;
        _this3.change_range();
      });
    }
  }, {
    key: "calc_offset",
    value: function calc_offset() {
      var rect = this.canvas.getBoundingClientRect();
      this.offset_x = -rect.x;
      this.offset_y = -rect.y;
    }
  }, {
    key: "new_layer",
    value: function new_layer(layer) {
      if (layer.name === "crosshair") {
        this.crosshair = layer;
      } else {
        this.overlays.push(layer);
      }
      this.update();
    }
  }, {
    key: "del_layer",
    value: function del_layer(id) {
      this.overlays = this.overlays.filter(function (x) {
        return x.id !== id;
      });
      this.update();
    }
  }, {
    key: "show_hide_layer",
    value: function show_hide_layer(event) {
      var l = this.overlays.filter(function (x) {
        return x.id === event.id;
      });
      if (l.length) l[0].display = event.display;
    }
  }, {
    key: "update",
    value: function update() {
      var _this4 = this;
      // Update reference to the grid
      // TODO: check what happens if data changes interval
      this.layout = this.$p.layout.grids[this.id];
      this.interval = this.$p.interval;
      if (!this.layout) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.$p.shaders.length) this.apply_shaders();
      this.grid();
      var overlays = [];
      overlays.push.apply(overlays, _toConsumableArray(this.overlays));

      // z-index sorting
      overlays.sort(function (l1, l2) {
        return l1.z - l2.z;
      });
      overlays.forEach(function (l) {
        if (!l.display) return;
        _this4.ctx.save();
        var r = l.renderer;
        if (r.pre_draw) r.pre_draw(_this4.ctx);
        r.draw(_this4.ctx);
        if (r.post_draw) r.post_draw(_this4.ctx);
        _this4.ctx.restore();
      });
      if (this.crosshair) {
        this.crosshair.renderer.draw(this.ctx);
      }
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        range: this.range,
        interval: this.interval,
        tf: layout.ti_map.tf,
        cursor: this.cursor,
        colors: this.$p.colors,
        sub: this.data,
        font: this.$p.font,
        config: this.$p.config,
        meta: this.$p.meta
      };
      var _iterator = grid_createForOfIteratorHelper(this.$p.shaders),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Actually draws the grid (for real)
  }, {
    key: "grid",
    value: function grid() {
      this.ctx.strokeStyle = this.$p.colors.grid;
      this.ctx.beginPath();
      var ymax = this.layout.height;
      // for (var [x, p] of this.layout.xs) {
      //
      //     this.ctx.moveTo(x - 0.5, 0)
      //     this.ctx.lineTo(x - 0.5, ymax)
      //
      // }
      var _iterator2 = grid_createForOfIteratorHelper(this.layout.ys),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            y = _step2$value[0],
            y$ = _step2$value[1];
          this.ctx.moveTo(0, y - 0.5);
          this.ctx.lineTo(this.layout.width, y - 0.5);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }
  }, {
    key: "mousezoom",
    value: function mousezoom(delta, event) {
      // TODO: for mobile
      if (this.wmode !== "pass") {
        if (this.wmode === "click" && !this.$p.meta.activated) {
          return;
        }
        event.originalEvent.preventDefault();
        event.preventDefault();
      }
      event.deltaX = event.deltaX || utils.get_deltaX(event);
      event.deltaY = event.deltaY || utils.get_deltaY(event);
      if (Math.abs(event.deltaX) > 0) {
        this.trackpad = true;
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
          delta *= 0.1;
        }
        this.trackpad_scroll(event);
      }
      if (this.trackpad) delta *= 0.032;
      delta = utils.smart_wheel(delta);

      // TODO: mouse zooming is a little jerky,
      // needs to follow f(mouse_wheel_speed) and
      // if speed is low, scroll shoud be slower
      if (delta < 0 && this.data.length <= this.MIN_ZOOM) return;
      if (delta > 0 && this.data.length > this.MAX_ZOOM) return;
      var k = this.interval / 1000;
      var diff = delta * k * this.data.length;
      var tl = this.comp.config.ZOOM_MODE === "tl";
      if (event.originalEvent.ctrlKey || tl) {
        var offset = event.originalEvent.offsetX;
        var diff1 = offset / (this.canvas.width - 1) * diff;
        var diff2 = diff - diff1;
        this.range[0] -= diff1;
        this.range[1] += diff2;
      } else {
        this.range[0] -= diff;
      }
      if (tl) {
        var _offset = event.originalEvent.offsetY;
        var _diff = _offset / (this.canvas.height - 1) * 2;
        var _diff2 = 2 - _diff;
        var z = diff / (this.range[1] - this.range[0]);
        //rezoom_range(z, diff_x, diff_y)
        this.comp.$emit("rezoom-range", {
          grid_id: this.id,
          z: z,
          diff1: _diff,
          diff2: _diff2
        });
      }
      this.change_range();
    }
  }, {
    key: "mousedrag",
    value: function mousedrag(x, y) {
      var dt = this.drug.t * (this.drug.x - x) / this.layout.width;
      var d$ = this.layout.$_hi - this.layout.$_lo;
      d$ *= (this.drug.y - y) / this.layout.height;
      var offset = this.drug.o + d$;
      var ls = this.layout.grid.logScale;
      if (ls && this.drug.y_r) {
        var dy = this.drug.y - y;
        var range = this.drug.y_r.slice();
        range[0] = math.exp((0 - this.drug.B + dy) / this.layout.A);
        range[1] = math.exp((this.layout.height - this.drug.B + dy) / this.layout.A);
      }
      if (this.drug.y_r && this.$p.y_transform && !this.$p.y_transform.auto) {
        this.comp.$emit("sidebar-transform", {
          grid_id: this.id,
          range: ls ? range || this.drug.y_r : [this.drug.y_r[0] - offset, this.drug.y_r[1] - offset]
        });
      }
      this.range[0] = this.drug.r[0] + dt;
      this.range[1] = this.drug.r[1] + dt;
      this.change_range();
    }
  }, {
    key: "pinchzoom",
    value: function pinchzoom(scale) {
      if (scale > 1 && this.data.length <= this.MIN_ZOOM) return;
      if (scale < 1 && this.data.length > this.MAX_ZOOM) return;
      var t = this.pinch.t;
      var nt = t * 1 / scale;
      this.range[0] = this.pinch.r[0] - (nt - t) * 0.5;
      this.range[1] = this.pinch.r[1] + (nt - t) * 0.5;
      this.change_range();
    }
  }, {
    key: "trackpad_scroll",
    value: function trackpad_scroll(event) {
      var dt = this.range[1] - this.range[0];
      this.range[0] += event.deltaX * dt * 0.011;
      this.range[1] += event.deltaX * dt * 0.011;
      this.change_range();
    }
  }, {
    key: "change_range",
    value: function change_range() {
      // TODO: better way to limit the view. Problem:
      // when you are at the dead end of the data,
      // and keep scrolling,
      // the chart continues to scale down a little.
      // Solution: I don't know yet

      if (!this.range.length || this.data.length < 2) return;
      var l = this.data.length - 1;
      var data = this.data;
      var range = this.range;
      range[0] = utils.clamp(range[0], -Infinity, data[l][0] - this.interval * 5.5);
      range[1] = utils.clamp(range[1], data[0][0] + this.interval * 5.5, Infinity);

      // TODO: IMPORTANT scrolling is jerky The Problem caused
      // by the long round trip of 'range-changed' event.
      // First it propagates up to update layout in Chart.vue,
      // then it moves back as watch() update. It takes 1-5 ms.
      // And because the delay is different each time we see
      // the lag. No smooth movement and it's annoying.
      // Solution: we could try to calc the layout immediatly
      // somewhere here. Still will hurt the sidebar & bottombar
      this.comp.$emit("range-changed", range);
    }

    // Propagate mouse event to overlays
  }, {
    key: "propagate",
    value: function propagate(name, event) {
      var _iterator3 = grid_createForOfIteratorHelper(this.overlays),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var layer = _step3.value;
          if (layer.renderer[name]) {
            layer.renderer[name](event);
          }
          var mouse = layer.renderer.mouse;
          var keys = layer.renderer.keys;
          if (mouse.listeners) {
            mouse.emit(name, event);
          }
          if (keys && keys.listeners) {
            keys.emit(name, event);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var rm = removeEventListener;
      rm("gesturestart", this.gesturestart);
      rm("gesturechange", this.gesturechange);
      rm("gestureend", this.gestureend);
      if (this.mc) this.mc.destroy();
      if (this.hm) this.hm.unwheel();
    }
  }]);
  return Grid;
}();

;// CONCATENATED MODULE: ./src/mixins/canvas.js
// Interactive canvas-based component
// Should implement: mousemove, mouseout, mouseup, mousedown, click


/* harmony default export */ const canvas = ({
  methods: {
    setup: function setup() {
      var _this = this;
      var id = "".concat(this.$props.tv_id, "-").concat(this._id, "-canvas");
      var canvas = document.getElementById(id);
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = "".concat(this._attrs.width, "px");
      canvas.style.height = "".concat(this._attrs.height, "px");
      if (dpr < 1) dpr = 1; // Realy ? That's it? Issue #63
      this.$nextTick(function () {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d', {
          // TODO: test the boost:
          //alpha: false,
          //desynchronized: true,
          //preserveDrawingBuffer: false
        });
        ctx.scale(dpr, dpr);
        _this.redraw();
        // Fallback fix for Brave browser
        // https://github.com/brave/brave-browser/issues/1738
        if (!ctx.measureTextOrg) {
          ctx.measureTextOrg = ctx.measureText;
        }
        ctx.measureText = function (text) {
          return utils.measureText(ctx, text, _this.$props.tv_id);
        };
      });
    },
    create_canvas: function create_canvas(h, id, props) {
      var _this2 = this;
      this._id = id;
      this._attrs = props.attrs;
      return h('div', {
        "class": "trading-vue-".concat(id),
        style: {
          left: props.position.x + 'px',
          top: props.position.y + 'px',
          position: 'absolute'
        }
      }, [h('canvas', {
        on: {
          mousemove: function mousemove(e) {
            return _this2.renderer.mousemove(e);
          },
          mouseout: function mouseout(e) {
            return _this2.renderer.mouseout(e);
          },
          mouseup: function mouseup(e) {
            return _this2.renderer.mouseup(e);
          },
          mousedown: function mousedown(e) {
            return _this2.renderer.mousedown(e);
          }
        },
        attrs: Object.assign({
          id: "".concat(this.$props.tv_id, "-").concat(id, "-canvas")
        }, props.attrs),
        ref: 'canvas',
        style: props.style
      })].concat(props.hs || []));
    },
    redraw: function redraw() {
      if (!this.renderer) return;
      this.renderer.update();
    }
  },
  watch: {
    width: function width(val) {
      this._attrs.width = val;
      this.setup();
    },
    height: function height(val) {
      this._attrs.height = val;
      this.setup();
    }
  }
});
;// CONCATENATED MODULE: ./src/mixins/uxlist.js
// Manager for Inteerface objects

/* harmony default export */ const uxlist = ({
  methods: {
    on_ux_event: function on_ux_event(d, target) {
      if (d.event === 'new-interface') {
        if (d.args[0].target === target) {
          d.args[0].vars = d.args[0].vars || {};
          d.args[0].grid_id = d.args[1];
          d.args[0].overlay_id = d.args[2];
          this.uxs.push(d.args[0]);
          // this.rerender++
        }
      } else if (d.event === 'close-interface') {
        this.uxs = this.uxs.filter(function (x) {
          return x.uuid !== d.args[0];
        });
      } else if (d.event === 'modify-interface') {
        var ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (ux.length) {
          this.modify(ux[0], d.args[1]);
        }
      } else if (d.event === 'hide-interface') {
        var _ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux.length) {
          _ux[0].hidden = true;
          this.modify(_ux[0], {
            hidden: true
          });
        }
      } else if (d.event === 'show-interface') {
        var _ux2 = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux2.length) {
          this.modify(_ux2[0], {
            hidden: false
          });
        }
      } else {
        return d;
      }
    },
    modify: function modify(ux, obj) {
      if (obj === void 0) {
        obj = {};
      }
      for (var k in obj) {
        if (k in ux) {
          this.$set(ux, k, obj[k]);
        }
      }
    },
    // Remove all UXs for a given overlay id
    remove_all_ux: function remove_all_ux(id) {
      this.uxs = this.uxs.filter(function (x) {
        return x.overlay.id !== id;
      });
    }
  },
  data: function data() {
    return {
      uxs: []
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/crosshair.js


var Crosshair = /*#__PURE__*/function () {
  function Crosshair(comp) {
    classCallCheck_classCallCheck(this, Crosshair);
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this._visible = false;
    this.locked = false;
    this.layout = this.$p.layout;
    this.enableCrosshair = this.$p.enableCrosshair;
  }
  createClass_createClass(Crosshair, [{
    key: "draw",
    value: function draw(ctx) {
      // Update reference to the grid
      this.layout = this.$p.layout;
      var cursor = this.comp.$props.cursor;
      // console.log(this.vis)
      if (!this.visible && cursor.mode === 'explore') return;
      this.x = this.$p.cursor.x;
      this.y = this.$p.cursor.y;
      ctx.save();
      ctx.strokeStyle = this.$p.colors.cross;
      ctx.beginPath();
      ctx.setLineDash([5]);

      // H
      if (this.$p.cursor.grid_id === this.layout.id) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.layout.width - 0.5, this.y);
      }

      // V
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, this.layout.height);
      if (this.enableCrosshair) {
        ctx.stroke();
      }
      ctx.restore();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.x = undefined;
      this.y = undefined;
    }
  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(val) {
      this._visible = val;
    }
  }]);
  return Crosshair;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Crosshair.vue?vue&type=script&lang=js&


/* harmony default export */ const Crosshairvue_type_script_lang_js_ = ({
  name: 'Crosshair',
  props: ['cursor', 'colors', 'layout', 'sub', 'enableCrosshair'],
  watch: {
    cursor: {
      handler: function handler() {
        if (!this.ch) this.create();

        // Explore = default mode on mobile
        var cursor = this.$props.cursor;
        var explore = cursor.mode === 'explore';
        if (!cursor.x || !cursor.y) {
          this.ch.hide();
          this.$emit('redraw-grid');
          return;
        }
        this.ch.visible = !explore;
      },
      deep: true
    },
    enableCrosshair: {
      handler: function handler(n) {
        this.create();
      }
    }
  },
  methods: {
    create: function create() {
      this.ch = new Crosshair(this);

      // New grid overlay-renderer descriptor.
      // Should implement draw() (see Spline.vue)
      this.$emit('new-grid-layer', {
        name: 'crosshair',
        renderer: this.ch
      });
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/Crosshair.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Crosshairvue_type_script_lang_js_ = (Crosshairvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// CONCATENATED MODULE: ./src/components/Crosshair.vue
var Crosshair_render, Crosshair_staticRenderFns
;



/* normalize component */
;
var component = normalizeComponent(
  components_Crosshairvue_type_script_lang_js_,
  Crosshair_render,
  Crosshair_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Crosshair = (component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/KeyboardListener.vue?vue&type=script&lang=js&
/* harmony default export */ const KeyboardListenervue_type_script_lang_js_ = ({
  name: 'KeyboardListener',
  created: function created() {
    this.$emit('register-kb-listener', {
      id: this._uid,
      keydown: this.keydown,
      keyup: this.keyup,
      keypress: this.keypress
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$emit('remove-kb-listener', {
      id: this._uid
    });
  },
  methods: {
    keydown: function keydown(event) {
      this.$emit('keydown', event);
    },
    keyup: function keyup(event) {
      this.$emit('keyup', event);
    },
    keypress: function keypress(event) {
      this.$emit('keypress', event);
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_KeyboardListenervue_type_script_lang_js_ = (KeyboardListenervue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue
var KeyboardListener_render, KeyboardListener_staticRenderFns
;



/* normalize component */
;
var KeyboardListener_component = normalizeComponent(
  components_KeyboardListenervue_type_script_lang_js_,
  KeyboardListener_render,
  KeyboardListener_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const KeyboardListener = (KeyboardListener_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=template&id=15e2a3ac&
var UxLayervue_type_template_id_15e2a3ac_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("span", {
    "class": "trading-vue-grid-ux-".concat(_vm.id),
    style: _vm.style
  }, _vm._l(_vm.uxs, function (ux) {
    return _c("ux-wrapper", {
      key: ux.uuid,
      attrs: {
        ux: ux,
        updater: _vm.updater,
        colors: _vm.colors,
        config: _vm.config
      },
      on: {
        "custom-event": _vm.on_custom_event
      }
    });
  }), 1);
};
var UxLayervue_type_template_id_15e2a3ac_staticRenderFns = [];
UxLayervue_type_template_id_15e2a3ac_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=template&id=15e2a3ac&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=template&id=5c211b12&
var UxWrappervue_type_template_id_5c211b12_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _vm.visible ? _c("div", {
    staticClass: "trading-vue-ux-wrapper",
    style: _vm.style,
    attrs: {
      id: "tvjs-ux-wrapper-".concat(_vm.ux.uuid)
    }
  }, [_c(_vm.ux.component, {
    tag: "component",
    attrs: {
      ux: _vm.ux,
      updater: _vm.updater,
      wrapper: _vm.wrapper,
      colors: _vm.colors
    },
    on: {
      "custom-event": _vm.on_custom_event
    }
  }), _vm._v(" "), _vm.ux.show_pin ? _c("div", {
    staticClass: "tvjs-ux-wrapper-pin",
    style: _vm.pin_style
  }) : _vm._e(), _vm._v(" "), _vm.ux.win_header !== false ? _c("div", {
    staticClass: "tvjs-ux-wrapper-head"
  }, [_c("div", {
    staticClass: "tvjs-ux-wrapper-close",
    style: _vm.btn_style,
    on: {
      click: _vm.close
    }
  }, [_vm._v("×")])]) : _vm._e()], 1) : _vm._e();
};
var UxWrappervue_type_template_id_5c211b12_staticRenderFns = [];
UxWrappervue_type_template_id_5c211b12_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=template&id=5c211b12&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=script&lang=js&

/* harmony default export */ const UxWrappervue_type_script_lang_js_ = ({
  name: 'UxWrapper',
  props: ['ux', 'updater', 'colors', 'config'],
  data: function data() {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      visible: true
    };
  },
  computed: {
    uxr: function uxr() {
      return this.$props.ux; // just a ref
    },
    layout: function layout() {
      return this.$props.ux.overlay.layout;
    },
    settings: function settings() {
      return this.$props.ux.overlay.settings;
    },
    uuid: function uuid() {
      return "tvjs-ux-wrapper-".concat(this.uxr.uuid);
    },
    mouse: function mouse() {
      return this.uxr.overlay.mouse;
    },
    style: function style() {
      var st = {
        'display': this.uxr.hidden ? 'none' : undefined,
        'left': "".concat(this.x, "px"),
        'top': "".concat(this.y, "px"),
        'pointer-events': this.uxr.pointer_events || 'all',
        'z-index': this.z_index
      };
      if (this.uxr.win_styling !== false) st = Object.assign(st, {
        'border': "1px solid ".concat(this.$props.colors.grid),
        'border-radius': '3px',
        'background': "".concat(this.background)
      });
      return st;
    },
    pin_style: function pin_style() {
      return {
        'left': "".concat(-this.ox, "px"),
        'top': "".concat(-this.oy, "px"),
        'background-color': this.uxr.pin_color
      };
    },
    btn_style: function btn_style() {
      return {
        'background': "".concat(this.inactive_btn_color),
        'color': "".concat(this.inactive_btn_color)
      };
    },
    pin_pos: function pin_pos() {
      return this.uxr.pin_position ? this.uxr.pin_position.split(',') : ['0', '0'];
    },
    // Offset x
    ox: function ox() {
      if (this.pin_pos.length !== 2) return undefined;
      var x = this.parse_coord(this.pin_pos[0], this.w);
      return -x;
    },
    // Offset y
    oy: function oy() {
      if (this.pin_pos.length !== 2) return undefined;
      var y = this.parse_coord(this.pin_pos[1], this.h);
      return -y;
    },
    z_index: function z_index() {
      var base_index = this.settings['z-index'] || this.settings['zIndex'] || 0;
      var ux_index = this.uxr['z_index'] || 0;
      return base_index + ux_index;
    },
    background: function background() {
      var c = this.uxr.background || this.$props.colors.back;
      return utils.apply_opacity(c, this.uxr.background_opacity || this.$props.config.UX_OPACITY);
    },
    inactive_btn_color: function inactive_btn_color() {
      return this.uxr.inactive_btn_color || this.$props.colors.grid;
    },
    wrapper: function wrapper() {
      return {
        x: this.x,
        y: this.y,
        pin_x: this.x - this.ox,
        pin_y: this.y - this.oy
      };
    }
  },
  watch: {
    updater: function updater() {
      this.update_position();
    }
  },
  mounted: function mounted() {
    this.self = document.getElementById(this.uuid);
    this.w = this.self.offsetWidth; // TODO: => width: "content"
    this.h = this.self.offsetHeight; // TODO: => height: "content"
    this.update_position();
  },
  created: function created() {
    this.mouse.on('mousemove', this.mousemove);
    this.mouse.on('mouseout', this.mouseout);
  },
  beforeDestroy: function beforeDestroy() {
    this.mouse.off('mousemove', this.mousemove);
    this.mouse.off('mouseout', this.mouseout);
  },
  methods: {
    update_position: function update_position() {
      if (this.uxr.hidden) return;
      var lw = this.layout.width;
      var lh = this.layout.height;
      var pin = this.uxr.pin;
      switch (pin[0]) {
        case 'cursor':
          var x = this.uxr.overlay.cursor.x;
          break;
        case 'mouse':
          x = this.mouse.x;
          break;
        default:
          if (typeof pin[0] === 'string') {
            x = this.parse_coord(pin[0], lw);
          } else {
            x = this.layout.t2screen(pin[0]);
          }
      }
      switch (pin[1]) {
        case 'cursor':
          var y = this.uxr.overlay.cursor.y;
          break;
        case 'mouse':
          y = this.mouse.y;
          break;
        default:
          if (typeof pin[1] === 'string') {
            y = this.parse_coord(pin[1], lh);
          } else {
            y = this.layout.$2screen(pin[1]);
          }
      }
      this.x = x + this.ox;
      this.y = y + this.oy;
    },
    parse_coord: function parse_coord(str, scale) {
      str = str.trim();
      if (str === '0' || str === '') return 0;
      var plus = str.split('+');
      if (plus.length === 2) {
        return this.parse_coord(plus[0], scale) + this.parse_coord(plus[1], scale);
      }
      var minus = str.split('-');
      if (minus.length === 2) {
        return this.parse_coord(minus[0], scale) - this.parse_coord(minus[1], scale);
      }
      var per = str.split('%');
      if (per.length === 2) {
        return scale * parseInt(per[0]) / 100;
      }
      var px = str.split('px');
      if (px.length === 2) {
        return parseInt(px[0]);
      }
      return undefined;
    },
    mousemove: function mousemove() {
      this.update_position();
      this.visible = true;
    },
    mouseout: function mouseout() {
      if (this.uxr.pin.includes('cursor') || this.uxr.pin.includes('mouse')) this.visible = false;
    },
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
      if (event.event === 'modify-interface') {
        if (this.self) {
          this.w = this.self.offsetWidth;
          this.h = this.self.offsetHeight;
        }
        this.update_position();
      }
    },
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_UxWrappervue_type_script_lang_js_ = (UxWrappervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=style&index=0&id=5c211b12&prod&lang=css&
var UxWrappervue_type_style_index_0_id_5c211b12_prod_lang_css_ = __webpack_require__(656);
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=style&index=0&id=5c211b12&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue



;


/* normalize component */

var UxWrapper_component = normalizeComponent(
  components_UxWrappervue_type_script_lang_js_,
  UxWrappervue_type_template_id_5c211b12_render,
  UxWrappervue_type_template_id_5c211b12_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxWrapper = (UxWrapper_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=script&lang=js&

/* harmony default export */ const UxLayervue_type_script_lang_js_ = ({
  name: 'UxLayer',
  components: {
    UxWrapper: UxWrapper
  },
  props: ['tv_id', 'id', 'uxs', 'updater', 'colors', 'config'],
  computed: {
    style: function style() {
      return {
        'top': this.$props.id !== 0 ? '1px' : 0,
        'left': 0,
        'width': '100%',
        'height': 'calc(100% - 2px)',
        'position': 'absolute',
        'z-index': '1',
        'pointer-events': 'none',
        'overflow': 'hidden'
      };
    }
  },
  created: function created() {},
  mounted: function mounted() {},
  beforeDestroy: function beforeDestroy() {},
  methods: {
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_UxLayervue_type_script_lang_js_ = (UxLayervue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/UxLayer.vue





/* normalize component */
;
var UxLayer_component = normalizeComponent(
  components_UxLayervue_type_script_lang_js_,
  UxLayervue_type_template_id_15e2a3ac_render,
  UxLayervue_type_template_id_15e2a3ac_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxLayer = (UxLayer_component.exports);
;// CONCATENATED MODULE: ./src/stuff/mouse.js


function mouse_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = mouse_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function mouse_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return mouse_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return mouse_arrayLikeToArray(o, minLen); }
function mouse_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Mouse event handler for overlay
var Mouse = /*#__PURE__*/function () {
  function Mouse(comp) {
    classCallCheck_classCallCheck(this, Mouse);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.pressed = false;
    this.x = comp.$props.cursor.x;
    this.y = comp.$props.cursor.y;
    this.t = comp.$props.cursor.t;
    this.y$ = comp.$props.cursor.y$;
  }

  // You can choose where to place the handler
  // (beginning or end of the queue)
  createClass_createClass(Mouse, [{
    key: "on",
    value: function on(name, handler, dir) {
      if (dir === void 0) {
        dir = 'unshift';
      }
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name][dir](handler);
      this.listeners++;
    }
  }, {
    key: "off",
    value: function off(name, handler) {
      if (!this.map[name]) return;
      var i = this.map[name].indexOf(handler);
      if (i < 0) return;
      this.map[name].splice(i, 1);
      this.listeners--;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      var l = this.comp.layout;
      if (name in this.map) {
        var _iterator = mouse_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'mousemove') {
        this.x = event.layerX;
        this.y = event.layerY;
        this.t = l.screen2t(this.x);
        this.y$ = l.screen2$(this.y);
      }
      if (name === 'mousedown') {
        this.pressed = true;
      }
      if (name === 'mouseup') {
        this.pressed = false;
      }
    }
  }]);
  return Mouse;
}();

;// CONCATENATED MODULE: ./src/mixins/overlay.js
// Usuful stuff for creating overlays. Include as mixin


/* harmony default export */ const overlay = ({
  props: ['id', 'num', 'interval', 'cursor', 'colors', 'layout', 'sub', 'data', 'settings', 'grid_id', 'font', 'config', 'meta', 'tf', 'i0', 'last'],
  mounted: function mounted() {
    // TODO(1): when hot reloading, dynamicaly changed mixins
    // dissapear (cuz it's a hack), the only way for now
    // is to reload the browser
    if (!this.draw) {
      this.draw = function (ctx) {
        var text = 'EARLY ADOPTER BUG: reload the browser & enjoy';
        console.warn(text);
      };
    }
    // Main chart?
    var main = this.$props.sub === this.$props.data;
    this.meta_info();

    // TODO(1): quick fix for vue2, in vue3 we use 3rd party emit
    try {
      new Function('return ' + this.$emit)();
      this._$emit = this.$emit;
      this.$emit = this.custom_event;
    } catch (e) {
      return;
    }
    this._$emit('new-grid-layer', {
      name: this.$options.name,
      id: this.$props.id,
      renderer: this,
      display: 'display' in this.$props.settings ? this.$props.settings['display'] : true,
      z: this.$props.settings['z-index'] || this.$props.settings['zIndex'] || (main ? 0 : -1)
    });

    // Overlay meta-props (adjusting behaviour)
    this._$emit('layer-meta-props', {
      grid_id: this.$props.grid_id,
      layer_id: this.$props.id,
      legend: this.legend,
      data_colors: this.data_colors,
      y_range: this.y_range
    });
    this.exec_script();
    this.mouse = new Mouse(this);
    if (this.init_tool) this.init_tool();
    if (this.init) this.init();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.destroy) this.destroy();
    this._$emit('delete-grid-layer', this.$props.id);
  },
  methods: {
    use_for: function use_for() {
      /* override it (mandatory) */
      console.warn('use_for() should be implemented');
      console.warn("Format: use_for() {\n                  return ['type1', 'type2', ...]\n            }");
    },
    meta_info: function meta_info() {
      /* override it (optional) */
      var id = this.$props.id;
      console.warn("".concat(id, " meta_info() is req. for publishing"));
      console.warn("Format: meta_info() {\n                author: 'Satoshi Smith',\n                version: '1.0.0',\n                contact (opt) '<email>'\n                github: (opt) '<GitHub Page>',\n            }");
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (event === 'change-settings' || event === 'object-selected' || event === 'new-shader' || event === 'new-interface' || event === 'remove-tool') {
        args.push(this.grid_id, this.id);
        if (this.$props.settings.$uuid) {
          args.push(this.$props.settings.$uuid);
        }
      }
      if (event === 'new-interface') {
        args[0].overlay = this;
        args[0].uuid = this.last_ux_id = "".concat(this.grid_id, "-").concat(this.id, "-").concat(this.uxs_count++);
      }
      // TODO: add a namespace to the event name
      // TODO(2): this prevents call overflow, but
      // the root of evil is in (1)
      if (event === 'custom-event') return;
      // console.log('custom-event',{event, args})
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    },
    // TODO: the event is not firing when the same
    // overlay type is added to the offchart[]
    exec_script: function exec_script() {
      if (this.calc) this.$emit('exec-script', {
        grid_id: this.$props.grid_id,
        layer_id: this.$props.id,
        src: this.calc(),
        use_for: this.use_for()
      });
    }
  },
  watch: {
    settings: {
      handler: function handler(n, p) {
        // console.log('watch_uuid',this.watch_uuid,n)
        if (this.watch_uuid) this.watch_uuid(n, p);
        this._$emit('show-grid-layer', {
          id: this.$props.id,
          display: 'display' in this.$props.settings ? this.$props.settings['display'] : true
        });
      },
      deep: true
    }
  },
  data: function data() {
    return {
      uxs_count: 0,
      last_ux_id: null
    };
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Spline.vue?vue&type=script&lang=js&
// Spline renderer. (SMAs, EMAs, TEMAs...
// you know what I mean)
// TODO: make a real spline, not a bunch of lines...

// Adds all necessary stuff for you.

/* harmony default export */ const Splinevue_type_script_lang_js_ = ({
  name: 'Spline',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    data_index: function data_index() {
      return this.sett.dataIndex || 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.2'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var i = this.data_index;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i]);
          if (_p[i] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Spline', 'EMA', 'SMA'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splinevue_type_script_lang_js_ = (Splinevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue
var Spline_render, Spline_staticRenderFns
;



/* normalize component */
;
var Spline_component = normalizeComponent(
  overlays_Splinevue_type_script_lang_js_,
  Spline_render,
  Spline_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spline = (Spline_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splines.vue?vue&type=script&lang=js&
// Channel renderer. (Keltner, Bollinger)

/* harmony default export */ const Splinesvue_type_script_lang_js_ = ({
  name: 'Splines',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    widths: function widths() {
      return this.sett.lineWidths || [];
    },
    clrx: function clrx() {
      var colors = this.sett.colors || [];
      var n = this.$props.num;
      if (!colors.length) {
        for (var i = 0; i < this.lines_num; i++) {
          colors.push(this.COLORS[(n + i) % 5]);
        }
      }
      return colors;
    },
    lines_num: function lines_num() {
      if (!this.$props.data[0]) return 0;
      return this.$props.data[0].length - 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      for (var i = 0; i < this.lines_num; i++) {
        var _i = i % this.clrx.length;
        ctx.strokeStyle = this.clrx[_i];
        ctx.lineWidth = this.widths[i] || this.line_width;
        ctx.beginPath();
        this.draw_spline(ctx, i);
        ctx.stroke();
      }
    },
    draw_spline: function draw_spline(ctx, i) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i + 1]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i + 1]);
          if (_p[i + 1] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
    },
    use_for: function use_for() {
      return ['Splines', 'DMI'];
    },
    data_colors: function data_colors() {
      return this.clrx;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splinesvue_type_script_lang_js_ = (Splinesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue
var Splines_render, Splines_staticRenderFns
;



/* normalize component */
;
var Splines_component = normalizeComponent(
  overlays_Splinesvue_type_script_lang_js_,
  Splines_render,
  Splines_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splines = (Splines_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Range.vue?vue&type=script&lang=js&
// R S I . Because we love it

// Adds all necessary stuff for you.

/* harmony default export */ const Rangevue_type_script_lang_js_ = ({
  name: 'Range',
  mixins: [overlay],
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      return this.sett.color || '#ec206e';
    },
    band_color: function band_color() {
      return this.sett.bandColor || '#ddd';
    },
    back_color: function back_color() {
      return this.sett.backColor || '#381e9c16';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var upper = layout.$2screen(this.sett.upper || 70);
      var lower = layout.$2screen(this.sett.lower || 30);
      var data = this.$props.data;

      // RSI values

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1]);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = this.band_color;
      ctx.setLineDash([5]); // Will be removed after draw()
      ctx.beginPath();

      // Fill the area between the bands
      ctx.fillStyle = this.back_color;
      ctx.fillRect(0, upper, layout.width, lower - upper);

      // Upper band
      ctx.moveTo(0, upper);
      ctx.lineTo(layout.width, upper);

      // Lower band
      ctx.moveTo(0, lower);
      ctx.lineTo(layout.width, lower);
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Range', 'RSI'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    },
    // Y-Range tansform. For example you need a fixed
    // Y-range for an indicator, you can do it here!
    // Gets estimated range, @return you favorite range
    y_range: function y_range(hi, lo) {
      return [Math.max(hi, this.sett.upper || 70), Math.min(lo, this.sett.lower || 30)];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Rangevue_type_script_lang_js_ = (Rangevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue
var Range_render, Range_staticRenderFns
;



/* normalize component */
;
var Range_component = normalizeComponent(
  overlays_Rangevue_type_script_lang_js_,
  Range_render,
  Range_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Range = (Range_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Trades.vue?vue&type=script&lang=js&

/* harmony default export */ const Tradesvue_type_script_lang_js_ = ({
  name: 'Trades',
  mixins: [overlay],
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    default_font: function default_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    buy_color: function buy_color() {
      return this.sett.buyColor || '#63df89';
    },
    sell_color: function sell_color() {
      return this.sett.sellColor || '#ec4662';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#999';
    },
    marker_size: function marker_size() {
      return this.sett.markerSize || 5;
    },
    show_label: function show_label() {
      return this.sett.showLabel !== false;
    },
    new_font: function new_font() {
      return this.sett.font || this.default_font;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.2'
      };
    },
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'black';
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        ctx.fillStyle = p[1] ? this.buy_color : this.sell_color;
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        var y = layout.$2screen(p[2]); // y - Mapping
        ctx.arc(x, y, this.marker_size + 0.5, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        if (this.show_label && p[3]) {
          this.draw_label(ctx, x, y, p);
        }
      }
    },
    draw_label: function draw_label(ctx, x, y, p) {
      ctx.fillStyle = this.label_color;
      ctx.font = this.new_font;
      ctx.textAlign = 'center';
      ctx.fillText(p[3], x, y - 25);
    },
    use_for: function use_for() {
      return ['Trades'];
    },
    // Defines legend format (values & colors)
    legend: function legend(values) {
      switch (values[1]) {
        case 0:
          var pos = 'Sell';
          break;
        case 1:
          pos = 'Buy';
          break;
        default:
          pos = 'Unknown';
      }
      return [{
        value: pos
      }, {
        value: values[2].toFixed(4),
        color: this.$props.colors.text
      }].concat(values[3] ? [{
        value: values[3]
      }] : []);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Tradesvue_type_script_lang_js_ = (Tradesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue
var Trades_render, Trades_staticRenderFns
;



/* normalize component */
;
var Trades_component = normalizeComponent(
  overlays_Tradesvue_type_script_lang_js_,
  Trades_render,
  Trades_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Trades = (Trades_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Channel.vue?vue&type=script&lang=js&
// Channel renderer. (Keltner, Bollinger)
// TODO: allow color transparency
// TODO: improve performance: draw in one solid chunk

/* harmony default export */ const Channelvue_type_script_lang_js_ = ({
  name: 'Channel',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    show_mid: function show_mid() {
      return 'showMid' in this.sett ? this.sett.showMid : true;
    },
    back_color: function back_color() {
      return this.sett.backColor || this.color + '11';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    /*draw(ctx) {
        ctx.lineWidth = this.line_width
        ctx.strokeStyle = this.color
        ctx.fillStyle = this.back_color
          for (var i = 0; i < this.$props.data.length - 1; i++) {
                let p1 = this.mapp(this.$props.data[i])
            let p2 = this.mapp(this.$props.data[i+1])
              if (!p2) continue
            if (p1.y1 !== p1.y1) continue // Fix NaN
              // Background
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x + 0.1, p2.y1)
            ctx.lineTo(p2.x + 0.1, p2.y3)
            ctx.lineTo(p1.x, p1.y3)
            ctx.fill()
              // Lines
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x, p2.y1)
            if (this.show_mid) {
                ctx.moveTo(p1.x, p1.y2)
                ctx.lineTo(p2.x, p2.y2)
            }
            ctx.moveTo(p1.x, p1.y3)
            ctx.lineTo(p2.x, p2.y3)
            ctx.stroke()
          }
    },*/
    draw: function draw(ctx) {
      // Background
      var data = this.data;
      var layout = this.layout;
      ctx.beginPath();
      ctx.fillStyle = this.back_color;
      for (var i = 0; i < data.length; i++) {
        var p = data[i];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1] || undefined);
        ctx.lineTo(x, y);
      }
      for (var i = data.length - 1; i >= 0; i--) {
        var _p = data[i];
        var _x = layout.t2screen(_p[0]);
        var _y = layout.$2screen(_p[3] || undefined);
        ctx.lineTo(_x, _y);
      }
      ctx.fill();

      // Lines
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Top line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p2 = data[i];
        var _x2 = layout.t2screen(_p2[0]);
        var _y2 = layout.$2screen(_p2[1] || undefined);
        ctx.lineTo(_x2, _y2);
      }
      ctx.stroke();
      // Bottom line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p3 = data[i];
        var _x3 = layout.t2screen(_p3[0]);
        var _y3 = layout.$2screen(_p3[3] || undefined);
        ctx.lineTo(_x3, _y3);
      }
      ctx.stroke();
      // Middle line
      if (!this.show_mid) return;
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p4 = data[i];
        var _x4 = layout.t2screen(_p4[0]);
        var _y4 = layout.$2screen(_p4[2] || undefined);
        ctx.lineTo(_x4, _y4);
      }
      ctx.stroke();
    },
    mapp: function mapp(p) {
      var layout = this.$props.layout;
      return p && {
        x: layout.t2screen(p[0]),
        y1: layout.$2screen(p[1]),
        y2: layout.$2screen(p[2]),
        y3: layout.$2screen(p[3])
      };
    },
    use_for: function use_for() {
      return ['Channel', 'KC', 'BB'];
    },
    data_colors: function data_colors() {
      return [this.color, this.color, this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Channelvue_type_script_lang_js_ = (Channelvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue
var Channel_render, Channel_staticRenderFns
;



/* normalize component */
;
var Channel_component = normalizeComponent(
  overlays_Channelvue_type_script_lang_js_,
  Channel_render,
  Channel_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Channel = (Channel_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Segment.vue?vue&type=script&lang=js&
// Segment renderer.


/* harmony default export */ const Segmentvue_type_script_lang_js_ = ({
  name: 'Segment',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.0'
      };
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      ctx.moveTo(x1, y1);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    use_for: function use_for() {
      return ['Segment'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Segmentvue_type_script_lang_js_ = (Segmentvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue
var Segment_render, Segment_staticRenderFns
;



/* normalize component */
;
var Segment_component = normalizeComponent(
  overlays_Segmentvue_type_script_lang_js_,
  Segment_render,
  Segment_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Segment = (Segment_component.exports);
;// CONCATENATED MODULE: ./src/components/js/layout_cnv.js


// Claculates postions and sizes for candlestick
// and volume bars for the given subset of data


function layout_cnv(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var candles = [];
  var volume = [];

  // The volume bar height is determined as a percentage of
  // the chart's height (VOLSCALE)
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[5];
  })));
  var vs = $p.config.VOLSCALE * layout.height / maxv;
  var x1,
    x2,
    w,
    avg_w,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval = new_interval(layout, $p, sub),
    _new_interval2 = _slicedToArray(_new_interval, 2),
    interval2 = _new_interval2[0],
    ratio = _new_interval2[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;

    // TODO: add log scale support
    candles.push({
      x: mid,
      w: layout.px_step * $p.config.CANDLEW * ratio,
      o: Math.floor(p[1] * layout.A + layout.B),
      h: Math.floor(p[2] * layout.A + layout.B),
      l: Math.floor(p[3] * layout.A + layout.B),
      c: Math.floor(p[4] * layout.A + layout.B),
      raw: p
    });
    volume.push({
      x1: x1,
      x2: x2,
      h: p[5] * vs,
      green: p[4] >= p[1],
      raw: p
    });
    prev = x2 + splitter;
  }
  return {
    candles: candles,
    volume: volume
  };
}
function layout_vol(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var volume = [];

  // Detect data second dimention size:
  var dim = sub[0] ? sub[0].length : 0;

  // Support special volume data (see API book), or OHLCV
  // Data indices:
  self._i1 = dim < 6 ? 1 : 5;
  self._i2 = dim < 6 ? function (p) {
    return p[2];
  } : function (p) {
    return p[4] >= p[1];
  };
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[self._i1];
  })));
  var volscale = self.volscale || $p.config.VOLSCALE;
  var vs = volscale * layout.height / maxv;
  var x1,
    x2,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval3 = new_interval(layout, $p, sub),
    _new_interval4 = _slicedToArray(_new_interval3, 2),
    interval2 = _new_interval4[0],
    ratio = _new_interval4[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;
    volume.push({
      x1: x1,
      x2: x2,
      h: p[self._i1] * vs,
      green: self._i2(p),
      raw: p
    });
    prev = x2 + splitter;
  }
  return volume;
}
function new_interval(layout, $p, sub) {
  // Subset interval against main interval
  if (!layout.ti_map.ib) {
    var interval2 = $p.tf || utils.detect_interval(sub);
    var ratio = interval2 / $p.interval;
  } else {
    if ($p.tf) {
      var ratio = $p.tf / layout.ti_map.tf;
      var interval2 = ratio;
    } else {
      var interval2 = utils.detect_interval(sub);
      var ratio = interval2 / $p.interval;
    }
  }
  return [interval2, ratio];
}
;// CONCATENATED MODULE: ./src/components/primitives/candle.js


// Candle object for Candles overlay
var CandleExt = /*#__PURE__*/function () {
  function CandleExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, CandleExt);
    this.ctx = ctx;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  createClass_createClass(CandleExt, [{
    key: "draw",
    value: function draw(data) {
      var green = data.raw[4] >= data.raw[1];
      var body_color = green ? this.style.colorCandleUp : this.style.colorCandleDw;
      var wick_color = green ? this.style.colorWickUp : this.style.colorWickDw;
      var w = Math.max(data.w, 1);
      var hw = Math.max(Math.floor(w * 0.5), 1);
      var h = Math.abs(data.o - data.c);
      var max_h = data.c === data.o ? 1 : 2;
      var x05 = Math.floor(data.x) - 0.5;
      this.ctx.strokeStyle = wick_color;
      this.ctx.beginPath();
      this.ctx.moveTo(x05, Math.floor(data.h));
      this.ctx.lineTo(x05, Math.floor(data.l));
      this.ctx.stroke();
      if (data.w > 1.5) {
        this.ctx.fillStyle = body_color;
        // TODO: Move common calculations to layout.js
        var s = green ? 1 : -1;
        this.ctx.fillRect(Math.floor(data.x - hw - 1), data.c, Math.floor(hw * 2 + 1), s * Math.max(h, max_h));
      } else {
        this.ctx.strokeStyle = body_color;
        this.ctx.beginPath();
        this.ctx.moveTo(x05, Math.floor(Math.min(data.o, data.c)));
        this.ctx.lineTo(x05, Math.floor(Math.max(data.o, data.c)) + (data.o === data.c ? 1 : 0));
        this.ctx.stroke();
      }
    }
  }]);
  return CandleExt;
}();

;// CONCATENATED MODULE: ./src/components/primitives/volbar.js


var VolbarExt = /*#__PURE__*/function () {
  function VolbarExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, VolbarExt);
    this.ctx = ctx;
    this.$p = overlay.$props;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  createClass_createClass(VolbarExt, [{
    key: "draw",
    value: function draw(data) {
      var y0 = this.$p.layout.height;
      var w = data.x2 - data.x1;
      var h = Math.floor(data.h);
      this.ctx.fillStyle = data.green ? this.style.colorVolUp : this.style.colorVolDw;
      this.ctx.fillRect(Math.floor(data.x1), Math.floor(y0 - h - 0.5), Math.floor(w), Math.floor(h + 1));
    }
  }]);
  return VolbarExt;
}();

;// CONCATENATED MODULE: ./src/components/primitives/price.js


// Price bar & price line (shader)
var Price = /*#__PURE__*/function () {
  function Price(comp) {
    classCallCheck_classCallCheck(this, Price);
    this.comp = comp;
  }

  // Defines an inline shader (has access to both
  // target & overlay's contexts)
  createClass_createClass(Price, [{
    key: "init_shader",
    value: function init_shader() {
      var _this = this;
      var layout = this.comp.$props.layout;
      var config = this.comp.$props.config;
      var comp = this.comp;
      var last_bar = function last_bar() {
        return _this.last_bar();
      };
      console.log("init_shader comp", comp === null || comp === void 0 ? void 0 : comp.isArrow);
      this.comp.$emit('new-shader', {
        target: 'sidebar',
        draw: function draw(ctx) {
          var bar = last_bar();
          if (!bar) return;
          var w = ctx.canvas.width;
          var h = config.PANHEIGHT;
          //let lbl = bar.price.toFixed(layout.prec)
          var lbl = bar.price.toFixed(comp.decimalPlace);
          ctx.fillStyle = bar.color;
          var x = -0.5;
          var a = 7;
          // let isArrow = comp.$props.settings

          if (comp !== null && comp !== void 0 && comp.isArrow) {
            //y according to arrow
            var y = bar.y - h * 0 - 0.5;

            //map client arrow work
            ctx.miterLimit = 4;
            ctx.font = "15px''";
            ctx.fillStyle = bar.color;
            ctx.font = "15px''";
            ctx.save();
            ctx.fillStyle = bar.color;
            ctx.font = "15px''";
            ctx.beginPath();
            //1. ctx.moveTo(0,16);
            ctx.moveTo(x - 0.5, y);
            //2. ctx.lineTo(19,0);
            ctx.lineTo(x - 0.5 + 19, y - 16);
            //3. ctx.lineTo(66.5,0);
            ctx.lineTo(x - 0.5 + 19 + 66.5, y - 16);
            //4. ctx.lineTo(66.5,35);
            ctx.lineTo(x - 0.5 + 19 + 66.5, y + 32 - 16);
            //5. ctx.lineTo(19,35);
            ctx.lineTo(x - 0.5 + 19, y + 32 - 16);
            //6. ctx.lineTo(0,16);
            ctx.lineTo(x - 0.5, y);
            ctx.closePath();
            ctx.fill();
            // ctx.stroke();
            ctx.restore();
            ctx.restore();
            ctx.fillStyle = comp.$props.colors.textHL;
            ctx.textAlign = 'left';

            //for arrow work
            ctx.fillText(lbl, a + 10, y + 5);
          } else {
            var _x = -0.5;
            var _y = bar.y - h * 0.5 - 0.5;
            var _a = 7;
            ctx.fillRect(_x - 0.5, _y, w + 1, h);
            ctx.fillStyle = comp.$props.colors.textHL;
            ctx.textAlign = 'left';
            ctx.fillText(lbl, _a, _y + 15);
          }
        }
      });
      this.shader = true;
    }

    // Regular draw call for overaly
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (!this.comp.$props.meta.last) return;
      if (!this.shader) this.init_shader();
      var layout = this.comp.$props.layout;
      var last = this.comp.$props.last;
      var dir = last[4] >= last[1];
      var color = dir ? this.green() : this.red();
      var y = layout.$2screen(last[4]) + (dir ? 1 : 0);
      ctx.strokeStyle = color;
      ctx.setLineDash([1, 1]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, {
    key: "last_bar",
    value: function last_bar() {
      if (!this.comp.data.length) return undefined;
      var layout = this.comp.$props.layout;
      var last = this.comp.data[this.comp.data.length - 1];
      var y = layout.$2screen(last[4]);
      //let cndl = layout.c_magnet(last[0])
      return {
        y: y,
        //Math.floor(cndl.c) - 0.5,
        price: last[4],
        color: last[4] >= last[1] ? this.green() : this.red()
      };
    }
  }, {
    key: "last_price",
    value: function last_price() {
      return this.comp.$props.meta.last ? this.comp.$props.meta.last[4] : undefined;
    }
  }, {
    key: "green",
    value: function green() {
      return this.comp.colorCandleUp;
    }
  }, {
    key: "red",
    value: function red() {
      return this.comp.colorCandleDw;
    }
  }, {
    key: "drawArrow",
    value: function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
      //variables to be used when creating the arrow
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.miterLimit = 4;
      ctx.font = "15px ''";
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.font = "   15px ''";
      ctx.save();
      ctx.fillStyle = "#E65C5C";
      ctx.font = "   15px ''";
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(19, 0);
      ctx.lineTo(66.5, 0);
      ctx.lineTo(66.5, 35);
      ctx.lineTo(19, 35);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      return;
      var headlen = 15;
      var angle = Math.atan2(toy - fromy, tox - fromx);
      ctx.save();
      ctx.strokeStyle = color;

      //starting path of the arrow from the start square to the end square
      //and drawing the stroke
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineWidth = arrowWidth;
      ctx.stroke();

      //starting a new path from the head of the arrow to one of the sides of
      //the point
      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));

      //path from the side point of the arrow, to the other side point
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 4), toy - headlen * Math.sin(angle + Math.PI / 4));

      //path from the side point back to the tip of the arrow, and then
      //again to the opposite side point
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));

      //draws the paths created above
      ctx.stroke();
      ctx.restore();
    }
  }]);
  return Price;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Candles.vue?vue&type=script&lang=js&
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator






/* harmony default export */ const Candlesvue_type_script_lang_js_ = ({
  name: "Candles",
  mixins: [overlay],
  data: function data() {
    return {
      price: {}
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    show_volume: function show_volume() {
      return "showVolume" in this.sett ? this.sett.showVolume : true;
    },
    price_line: function price_line() {
      return "priceLine" in this.sett ? this.sett.priceLine : true;
    },
    colorCandleUp: function colorCandleUp() {
      return this.sett.colorCandleUp || this.$props.colors.candleUp;
    },
    colorCandleDw: function colorCandleDw() {
      return this.sett.colorCandleDw || this.$props.colors.candleDw;
    },
    colorWickUp: function colorWickUp() {
      return this.sett.colorWickUp || this.$props.colors.wickUp;
    },
    colorWickDw: function colorWickDw() {
      return this.sett.colorWickDw || this.$props.colors.wickDw;
    },
    colorWickSm: function colorWickSm() {
      return this.sett.colorWickSm || this.$props.colors.wickSm;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    isArrow: function isArrow() {
      return "isArrow" in this.sett ? this.sett.isArrow : false;
    },
    decimalPlace: function decimalPlace() {
      // return this.sett?.decimalPlace || 2;
      return "decimalPlace" in this.sett ? this.sett.decimalPlace : 2;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: "C451",
        version: "1.2.1"
      };
    },
    init: function init() {
      this.price = new Price(this);
    },
    draw: function draw(ctx) {
      // If data === main candlestick data
      // render as main chart:
      if (this.$props.sub === this.$props.data) {
        var cnv = {
          candles: this.$props.layout.candles,
          volume: this.$props.layout.volume
        };
        // Else, as offchart / onchart indicator:
      } else {
        cnv = layout_cnv(this);
      }
      if (this.show_volume) {
        var cv = cnv.volume;
        for (var i = 0, n = cv.length; i < n; i++) {
          new VolbarExt(this, ctx, cv[i]);
        }
      }
      var cc = cnv.candles;
      for (var i = 0, n = cc.length; i < n; i++) {
        new CandleExt(this, ctx, cc[i]);
      }
      if (this.price_line) this.price.draw(ctx);
    },
    use_for: function use_for() {
      return ["Candles"];
    },
    // In case it's added as offchart overlay
    y_range: function y_range() {
      var hi = -Infinity,
        lo = Infinity;
      for (var i = 0, n = this.sub.length; i < n; i++) {
        var x = this.sub[i];
        if (x[2] > hi) hi = x[2];
        if (x[3] < lo) lo = x[3];
      }
      return [hi, lo];
    }
  },
  watch: {
    isArrow: {
      handler: function handler(value) {
        console.log("candles isArrows", value, this.price);
        this.price = new Price(this);
      }
    }
  },
  mounted: function mounted() {
    console.log("candles mounted", this.$props);
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Candlesvue_type_script_lang_js_ = (Candlesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue
var Candles_render, Candles_staticRenderFns
;



/* normalize component */
;
var Candles_component = normalizeComponent(
  overlays_Candlesvue_type_script_lang_js_,
  Candles_render,
  Candles_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Candles = (Candles_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Volume.vue?vue&type=script&lang=js&

function Volumevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Volumevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Volumevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Volumevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Standalone renedrer for the volume




/* harmony default export */ const Volumevue_type_script_lang_js_ = ({
  name: 'Volume',
  mixins: [overlay],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    colorVolUpLegend: function colorVolUpLegend() {
      return this.sett.colorVolUpLegend || this.$props.colors.candleUp;
    },
    colorVolDwLegend: function colorVolDwLegend() {
      return this.sett.colorVolDwLegend || this.$props.colors.candleDw;
    },
    volscale: function volscale() {
      return this.sett.volscale || this.$props.grid_id > 0 ? 0.85 : this.$props.config.VOLSCALE;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      // TODO: volume average
      // TODO: Y-axis scaling
      var _iterator = Volumevue_type_script_lang_js_createForOfIteratorHelper(layout_vol(this)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var v = _step.value;
          new VolbarExt(this, ctx, v);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    use_for: function use_for() {
      return ['Volume'];
    },
    // Defines legend format (values & colors)
    // _i2 - detetected data index (see layout_cnv)
    legend: function legend(values) {
      var flag = this._i2 ? this._i2(values) : values[2];
      var color = flag ? this.colorVolUpLegend : this.colorVolDwLegend;
      return [{
        value: values[this._i1 || 1],
        color: color
      }];
    },
    // When added as offchart overlay
    // If data is OHLCV => recalc y-range
    // _i1 - detetected data index (see layout_cnv)
    y_range: function y_range(hi, lo) {
      var _this = this;
      if (this._i1 === 5) {
        var sub = this.$props.sub;
        return [Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        }))), Math.min.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        })))];
      } else {
        return [hi, lo];
      }
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Volumevue_type_script_lang_js_ = (Volumevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue
var Volume_render, Volume_staticRenderFns
;



/* normalize component */
;
var Volume_component = normalizeComponent(
  overlays_Volumevue_type_script_lang_js_,
  Volume_render,
  Volume_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Volume = (Volume_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splitters.vue?vue&type=script&lang=js&
// Data section splitters (with labels)


/* harmony default export */ const Splittersvue_type_script_lang_js_ = ({
  name: 'Splitters',
  mixins: [overlay],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    new_font: function new_font() {
      return this.sett.font || '12px ' + this.$props.font.split('px').pop();
    },
    flag_color: function flag_color() {
      return this.sett.flagColor || '#4285f4';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#fff';
    },
    line_color: function line_color() {
      return this.sett.lineColor || '#4285f4';
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.0;
    },
    y_position: function y_position() {
      return this.sett.yPosition || 0.9;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    draw: function draw(ctx) {
      var _this = this;
      var layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;
      this.$props.data.forEach(function (p, i) {
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        ctx.setLineDash([10, 10]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, _this.layout.height);
        ctx.stroke();
        if (p[1]) _this.draw_label(ctx, x, p);
      });
    },
    draw_label: function draw_label(ctx, x, p) {
      var side = p[2] ? 1 : -1;
      x += 2.5 * side;
      ctx.font = this.new_font;
      var pos = p[4] || this.y_position;
      var w = ctx.measureText(p[1]).width + 10;
      var y = this.layout.height * (1.0 - pos);
      y = Math.floor(y);
      ctx.fillStyle = p[3] || this.flag_color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.label_color;
      ctx.textAlign = side < 0 ? 'right' : 'left';
      ctx.fillText(p[1], x + 15 * side, y + 4);
    },
    use_for: function use_for() {
      return ['Splitters'];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splittersvue_type_script_lang_js_ = (Splittersvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue
var Splitters_render, Splitters_staticRenderFns
;



/* normalize component */
;
var Splitters_component = normalizeComponent(
  overlays_Splittersvue_type_script_lang_js_,
  Splitters_render,
  Splitters_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splitters = (Splitters_component.exports);
;// CONCATENATED MODULE: ./src/stuff/keys.js


function keys_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = keys_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function keys_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return keys_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return keys_arrayLikeToArray(o, minLen); }
function keys_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Keyboard event handler for overlay
var Keys = /*#__PURE__*/function () {
  function Keys(comp) {
    classCallCheck_classCallCheck(this, Keys);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.keymap = {};
  }
  createClass_createClass(Keys, [{
    key: "on",
    value: function on(name, handler) {
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name].push(handler);
      this.listeners++;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      if (name in this.map) {
        var _iterator = keys_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'keydown') {
        if (!this.keymap[event.key]) {
          this.emit(event.key);
        }
        this.keymap[event.key] = true;
      }
      if (name === 'keyup') {
        this.keymap[event.key] = false;
      }
    }
  }, {
    key: "pressed",
    value: function pressed(key) {
      return this.keymap[key];
    }
  }]);
  return Keys;
}();

;// CONCATENATED MODULE: ./src/mixins/tool.js
function tool_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = tool_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function tool_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return tool_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return tool_arrayLikeToArray(o, minLen); }
function tool_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Usuful stuff for creating tools. Include as mixin



/* harmony default export */ const tool = ({
  methods: {
    init_tool: function init_tool() {
      var _this = this;
      // Collision functions (float, float) => bool,
      this.collisions = [];
      this.pins = [];
      this.mouse.on('mousemove', function (e) {
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          _this.show_pins = true;
        } else {
          _this.show_pins = false;
        }
        if (_this.drag) _this.drag_update();
      });
      this.mouse.on('mousedown', function (e) {
        if (utils.default_prevented(e)) return;
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          if (!_this.selected) {
            _this.$emit('object-selected');
          }
          _this.start_drag();
          e.preventDefault();
          _this.pins.forEach(function (x) {
            return x.mousedown(e, true);
          });
        }
      });
      this.mouse.on('mouseup', function (e) {
        _this.drag = null;
        _this.$emit('scroll-lock', false);
      });
      this.keys = new Keys(this);
      this.keys.on('Delete', this.remove_tool);
      this.keys.on('Backspace', this.remove_tool);
      this.show_pins = false;
      this.drag = null;
    },
    render_pins: function render_pins(ctx) {
      if (this.selected || this.show_pins) {
        this.pins.forEach(function (x) {
          return x.draw(ctx);
        });
      }
    },
    set_state: function set_state(name) {
      this.$emit('change-settings', {
        $state: name
      });
    },
    watch_uuid: function watch_uuid(n, p) {
      // If layer $uuid is changed, then re-init
      // pins & collisions
      if (n.$uuid !== p.$uuid) {
        var _iterator = tool_createForOfIteratorHelper(this.pins),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var p = _step.value;
            p.re_init();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.collisions = [];
        this.show_pins = false;
        this.drag = null;
      }
    },
    pre_draw: function pre_draw() {
      // Delete all collision functions before
      // the draw() call and let primitives set
      // them again
      this.collisions = [];
    },
    remove_tool: function remove_tool() {
      if (this.selected) this.$emit('remove-tool');
    },
    start_drag: function start_drag() {
      this.$emit('scroll-lock', true);
      var cursor = this.$props.cursor;
      this.drag = {
        t: cursor.t,
        y$: cursor.y$
      };
      this.pins.forEach(function (x) {
        return x.rec_position();
      });
    },
    drag_update: function drag_update() {
      var dt = this.$props.cursor.t - this.drag.t;
      var dy = this.$props.cursor.y$ - this.drag.y$;
      this.pins.forEach(function (x) {
        return x.update_from([x.t1 + dt, x.y$1 + dy], true);
      });
    }
  },
  computed: {
    // Settings starting with $ are reserved
    selected: function selected() {
      return this.$props.settings.$selected;
    },
    state: function state() {
      return this.$props.settings.$state;
    }
  }
});
;// CONCATENATED MODULE: ./src/stuff/icons.json
const icons_namespaceObject = JSON.parse('{"extended.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAANElEQVR4nGNggABGEMEEIlhABAeI+AASF0AlHmAqA4kzKAAx8wGQuAMKwd6AoYzBAWonAwAcLwTgNfJ3RQAAAABJRU5ErkJggg==","ray.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAMklEQVR4nGNgQAJMIIIFRHCACAEQoQAiHICYvQEkjkrwYypjAIkzwk2zAREuqIQFzD4AE3kE4BEmGggAAAAASUVORK5CYII=","segment.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAATU1NJCQkCxcHIQAAAAN0Uk5TAP8SmutI5AAAACxJREFUeJxjYMACGAMgNAsLdpoVKi8AVe8A1QblQlWRKt0AoULw2w1zGxoAABdiAviQhF/mAAAAAElFTkSuQmCC","add.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqPz8/Pj4+BQUFCQkJAQEBZGRkh4eHAgICEBAQNjY2g4ODgYGBAAAAAwMDeXl5d3d3GBgYERERgICAgICANDQ0PDw8Y2NjCAgIhYWFGhoaJycnOjo6YWFhgICAdXV14Y16sQAAACp0Uk5TAAILDxIKESEnJiYoKCgTKSkpKCAnKSkFKCkpJiDl/ycpKSA2JyYpKSkpOkQ+xgAAARdJREFUeJzllNt2gyAQRTWiRsHLoDU0GpPYmMv//2BMS+sgl6Z9bM8bi73gnJkBz/sn8lcBIUHofwtG8TpJKUuTLI6cYF7QEqRKynP71VX9AkhNXVlsbMQrLLQVGyPZLsGHWgPrCxMJwHUPlXa79NBp2et5d9f3u3m1XxatQNn7SagOXCUjCjYUDuqxcWlHj4MSfw12FDJchFViRN8+1qcQoUH6lR1L1mEMEErofB6WzEUwylzomfzOQGiOJdXiWH7mQoUyMa4WXJQWOBvLFvPCGxt6FSr5kyH0qi0YddNG2/pgCsOjff4ZTizXPNwKIzl56OoGg9d9Z/+5cs6On+CFCfevFQ3ZaTycx1YMbvDdRvjkp/lHdAcPXzokxcwfDwAAAABJRU5ErkJggg==","cursor.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAATU1NTU1NTU1NwlMHHwAAAAR0Uk5TAOvhxbpPrUkAAAAkSURBVHicY2BgYHBggAByabxg1WoGBq2pRCk9AKUbcND43AEAufYHlSuusE4AAAAASUVORK5CYII=","display_off.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAU1QTFRFAAAAh4eHh4eHAAAAAAAAAAAAAwMDAAAAAAAAhoaGGBgYgYGBAAAAPz8/AgICg4ODCQkJhISEh4eHh4eHPj4+NjY2gYGBg4ODgYGBgYGBgoKCAQEBJycngoKChYWFEBAQg4ODCAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0hISEgYGBPDw8gYGBgYGBh4eHh4eHhYWFh4eHgoKChYWFgYGBgYGBg4ODhoaGg4ODYWFhgoKCBgYGdXV1goKCg4ODgYGBgICAgYGBAAAAg4ODhYWFhISEh4eHgoKChYWFOjo6goKCGhoah4eHh4eHh4eHgoKCh4eHeXl5hoaGgoKChISEgYGBgYGBgoKCY2NjgYGBgoKCh4eHgoKCgYGBhoaGg4ODhoaGhYWFh4eHgYGBhoaGhoaGhoaGg4ODgoKChISEgoKChYWFh4eHfKktUwAAAG90Uk5TACn/AhEFKA8SLCbxCigoVBNKUTYoJ/lh3PyAKSaTNiBtICYpISggKSkmJ0LEKef3lGxA8rn//+pcMSkpnCcptHPJKe0LUjnx5LzKKaMnX73hl64pLnhkzNSgKeLv17LQ+liIzaLe7PfTw5tFpz3K1fXR/gAAAgBJREFUeJzllNdXwjAUxknB0lIoCKVsGTIFQRAZ7r333nuv///R3LZ4mlDQZ/0ekp7b37n5bnITk+mfyDxv5Tir3fwjaElO5BIOKZFLJS1dQVfI0Y809TtEV+elo95RpFPWG+1go4fdQ5QybI8haaNBkM2ANbM09bnrwaPY7iFKrz7EMBdu7CHdVruXIt0M1hb+GKA3LTRKkp5lTA6Dg6xIkhaHhvQ1IlW/UCouQdJNJTRIpk1qO7+wUpcfpl537oBc7VNip3Gi/AmVPBAC1UrL6HXtSGVT+k2Yz0Focad07OMRf3P5BEbd63PFQx7HN+w61JoAm+uBlV48O/0jkLSMmtPCmQ8HwlYdykFV4/LJPp7e3hVyFdapHNehLk6PSjhSkBvwu/cFyJGIYvOyhoc1jjYQFGbygD4CWjoAMla/og3YoSw+KPhjPNoFcim4iFD+pFYA8zZ9WeYU5OBjZ3ORWyCfG03E+47kKpCIJTpGO4KP8XMgtw990xG/PBNTgmPEEXwf7P42oOdFIRAoBCtqTKL6Rcwq4Xsgh5xYC/mmSs6yJKk1YbnVeTq1NaEpmlHbmVn2EORkW2trF2ZzmHGTSUMGl1a9hp4ySRpdQ8yKGURpMmRIYg9pb1YPzg6kO79cLlE6bYFjEtv91bLEUxvhwbWwjY13BxUb9l8+mn9EX8x3Nki8ff5wAAAAAElFTkSuQmCC","display_on.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAR1QTFRFAAAAh4eHgYGBAAAAAAAAgYGBAAAAAwMDAAAAAAAAgYGBg4ODGBgYgYGBhISEAAAAPz8/AgIChoaGCQkJhYWFPj4+NjY2goKCgYGBAQEBJycngYGBgoKCEBAQCAgIhISEKioqZGRkCgoKBQUFERERd3d3gYGBg4ODgYGBGxsbNDQ0hISEgoKCgoKChYWFPDw8gYGBgYGBhoaGgoKCg4ODgoKCgYGBgoKCgoKCgoKCg4ODgoKChoaGgoKCgYGBhoaGg4ODYWFhBgYGdXV1gYGBg4ODgoKCgICAg4ODg4ODhISEAAAAg4ODOjo6gYGBGhoaeXl5goKCgYGBgoKChYWFgoKChISEgoKCY2NjgYGBg4ODgYGBgYGBg4ODgYGBo8n54AAAAF90Uk5TACn/AhH3BSgPEuhUJvFACigoLBM2KCeA6ykm+pMgIEkmKSEoICn9XCkmJ0u6nDop4sUypGuEzLZ6vmCYLZ/dLykpJynUYa8pcllCC1Ip2ycpisl1PadFsintbsPQZdi/bTW7AAAB4UlEQVR4nOWUZ1fCMBSGSSGWFiq0UDbIkr2XbBwMxS0b1P//M0xK9XSiftX7oel585zkvfcmMRj+SRhvzRRlthm/BU3Ry3TYzofTsajpIOjw2iNAjIiddehvHXSdA0mkXEEdG0fkE1DEKXmkSVqVIA6rBmsktUgAWLWHoGp30UNclbtLmwQgoyya91wPTbFy0mQXJ5zJQO6BgXRjfH0iSkX5stHIXr5r0bB/lu8syjR8rzsFbR2SpX+5J2eMP3csLtYsEY2K8BeTFuE2jaVCBw7bHOBuxq16AXmpbui3LtIfbRLUHMY2q4lcFo2WB4KA1SUAlWumNEKCzyxBKZxVHvYGaFguCBx1vM/x0IPzoqQoj5SdP4mns2cCGhBsrgj0uaeUBtzMyxQN8w4mYROTW8+r0oANp8W5mf6WQw5aCYJ2o7ymPaKMi2uVpmWM4TW6tdImgGo1bT4nK6DbbsCc0AZSdmLEFszzHrh6riVvRrNA3/9SE8QLWQu+Gjto9+gE9NBMwr9zi83gFeeFTe11zpm1CHE3HeyVCSknf3MIDcFTbfJKdbR1L4xX49L+/BoillV5uPJqkshD3JWSgpNMXP/lcrD8+hO84MnDr5YpFHv0Fe99VjJ0GBRs2H74aP6R+ACr+TFvZNAQ1wAAAABJRU5ErkJggg==","down.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAKVQTFRFAAAAg4ODgICAAAAAAAAAAAAACAgIAAAAAAAAAAAAAAAAOTk5hYWFEBAQfHx8ODg4dnZ2NDQ0XV1dGxsbKCgogICAFBQUIiIiZGRkgICAgICAFRUVAAAAgICAgICAgICAf39/Li4ugICAcHBwgoKCgICAgoKCgICAg4ODgYGBPj4+goKCgICAhISEgYGBgICAgoKCgICAgYGBgYGBf39/gICAgICAIdPQHAAAADd0Uk5TACn/KAIRIBMFDwooKyApKSknKSYmzCcmKfL7JRCUi2L3J7IpcLUrr0VbKXntNEnkMbxrUcG56CMpi50AAAFZSURBVHic5ZRpf4MgDIeFKFatWm/tfW091u7evv9Hm1Acoujm2y0vFPH5Jf+EEE37J6bblmlatv4jaBCI4rMfR0CMXtAEJ0fccgfM7tAkQHXzArdDxggmqGETGCnJWROkNlOwOqhIhKCtgbSicw1uK/dATSK0aRatIzytA8ik4XSiyJnLSm+VPxULgeyLI3uHRJH+qcB4WZGrKb4c20WwI7b3iUt74OS6XD+xZWrXUCtme0uKTvfcJ65CZFa9VOebqwXmft+oT8yF+/VymT4XeGB+Xx8L+j4gBcoFIDT+oMz6Qp93Y74pCeBpUXaLuW0rUk6r1iv3nP322ewYkgv2nZIvgpSPQDrY5wTjRJDNg9XAE/+uSXIVX812GdKEmtvR2rtWaw+5MAOuofJy79SXu9TgBl4d9DZdI0NjgyiswNCB/qk1J5Bmvp+lQOa9IJNhW4bxm6H5R+wLQYMSQXZNzbcAAAAASUVORK5CYII=","price_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC","price_time.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAOklEQVR4nGNggAPm/w9gTA4QIQPEClpMQMITRHCACScQoQQihBgY9P//grKgYk5wdTACYhQHFjuAAABZFAlc4e1fcQAAAABJRU5ErkJggg==","remove.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAK5QTFRFAAAAh4eHgICAAAAAAAAAh4eHAAAAAwMDAAAAAAAAgICAGBgYAAAAPz8/AgICgICACQkJhoaGhoaGgICAPj4+NjY2gYGBg4ODgYGBAQEBJycngoKCEBAQgICAgICACAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0gICAPDw8YWFhBgYGdXV1gICAg4ODgICAAAAAOjo6GhoaeXl5gICAhYWFY2NjhYWFgICA9O0oCgAAADp0Uk5TACn/AhErBSgPEvEmCigowxMuMcgoJ7hWrCkmdCD6vSAmKSEoICkpJie6KSknKSkp0wspJynCMik11rrLte8AAAFwSURBVHic5ZTXkoIwFIZNAAPSpKkoRQV7Wcva3v/FFiRmEwise7t7bs7MP98k/ylJq/VPQjjKiiJrwo+gON0uxro7XiRTsRHs+voE4JjoRrf+6sD7AFTMvaDGRht9glLMUJtLqmUwD5XDCohHAmBUPQSV27GHtFK7xycBWJab5uPaR+Hlmue7GfZxHwyWFHVMQghXFgD2A8IOZtfssdNJIXcyFEaSfchzp9BuMVP+Fhvr5Qh0nGfqYTGhm3BcYFUaQBKOhMWzRqHyGFRY03ppQ5lCFZ30RloVZGQTaa3QqEt0OyrQnkSkk8I1YJkvAwPCMgY0UpbzXRZhVbosIWGbZTLNQszGMCM42FJEjWDDjIAMtp+xj6x2K+/DqNDc0r4Yc8yGl3uer2aIyT1iyd8sYSuY8cldZbVrH4zPebTvP8OMNSoedj6XzDyk3pwG98u0/ufqGu7tBW5c1PxriXFyHq5PQxXFzeDThvbmp/lH4gt6WxfZ03H8DwAAAABJRU5ErkJggg==","settings.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAW5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqQEBAPj4+BQUFCAgIAQEBPz8/ZWVlh4eHZGRkAgICCQkJDw8PNjY2g4ODgoKCNTU1EBAQAAAAAwMDeXl5d3d3AAAAGBgYAAAAERERioqKgoKCgoKCgoKCgYGBgoKChISEhoaGNDQ0g4ODgICAgICAgICAgYGBgYGBhYWFgICAgICAPT09AAAAgYGBgICAgICAgICAgICAY2NjCAgIgICAgICAhYWFhYWFgYGBHBwcgICAhYWFGhoagYGBgYGBg4ODhoaGJycnAAAAhISEgICAg4ODPDw8AAAAgoKCgICAhISEOjo6h4eHgoKCgYGBgICAf39/gYGBgoKCgICAGBgYgYGBg4ODg4ODgICACwsLgYGBgICAgYGBgYGBgYGBgICAgYGBYWFhf39/g4ODPj4+gYGBg4ODgICAhYWFgoKCgYGBgICAgYGBgoKCdXV1T0kC9QAAAHp0Uk5TAAILDxMKESEnJiYpKSgTKSgpKSkoEyAnKSknIAYoKSkFJQEgKl94jYVvVC4nU9f/+K8pOu71KBCi3NPq/ikg0e01Nokm1UUnsZVqQSYOT9lrKRJz5lIpK12jyu+sesgnhGVLxCG55a6Um+GaKfJCKKRgKUt8ocergymDQ9knAAABsElEQVR4nOWUV1vCMBSGg1AQpBZrcVdE3KJxo4LgnuCoe4F7orjHv7doTk3bgF7rd5OnX94nZ+SkCP0TWQqsNpuVs/wI2h2FTleR2+XkHfa8YLHgKRGJSj2SN3fosvIKkVJlVXWONGrkWtEgn1zHJP1GMCs/g7XILFIUpXoTWmaKTnIImGovh72Gxqbmlta2dvgOGpsmQO0dnfhTXd3E6JH0pN1DNnr7MFE/HDsQ0qEO6Pxg9sCh4XDkGx2J6sovBD+G8eiYuo5PxLTKeLoJBZNgT2EcnjY0YYajUKsL7Fk1gcjU3PwChcYTFGorAnsRqlpa1tAVhUbdmr+6RtjIOlgbCjMBUdzc2t7ZzbJ7zAQ4p6GSfRVNwkeKLsvCg31w2JBdjlT0GDxZNzEnpcQ+xWfnFxeXVyp6Tay07gq+L/YUOoBvbomV0V8skiq//DutWfeEfJD1JPLCED4+Pb8kX986tApNQ4iqfSJT76bRzvlgBPODQXW/foYqK5lyeBeYJEL1gaoeGnwIBhjRoQ9SZgTAdEbO/9cKRfmZ+MpGPCVHQ3nBzzS4hKIkuNyh/5g+ALiAXSSas9hwAAAAAElFTkSuQmCC","time_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAJElEQVR4nGNgwAsUGJhQCScQoQQihBgY9P//grKgYk4YOvACACOpBKG6Svj+AAAAAElFTkSuQmCC","trash.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAALUlEQVR4nGNgAIN6ENHQACX4//9gYBBgYIESYC4LkA0lPEkmGFAI5v8PILYCAHygDJxlK0RUAAAAAElFTkSuQmCC","up.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAMZQTFRFAAAAh4eHgICAAAAAAAAAAAAAAwMDAAAAAAAAGBgYAAAAPz8/AgICCQkJgICAh4eHPj4+NjY2AQEBJycnEBAQgICAgICACAgIKioqZGRkCgoKBQUFgYGBERERd3d3gYGBGxsbNDQ0gICAgYGBPDw8gYGBh4eHgICAYWFhBgYGgYGBdXV1goKCg4ODhYWFgICAgoKCAAAAhISEOjo6gICAGhoagYGBeXl5hoaGgICAY2Njg4ODgoKCgoKCgYGBgoKCg4ODgoKC64uw1gAAAEJ0Uk5TACn/AhEFKA8SJgooKBP7KignKSYg9c0gJikhKLQgKSkmJ7ywKY8s5SknlClxKTMpXwtFKe0neiku8ClKWmSbbFFjM5GHSgAAAW5JREFUeJzllGd/gjAQxk3AMFWWOHDvVa2rVbu//5cqhJWQQO3b9nkVjv/v7rnLKJX+iYS9JMuSKvwIiu3loKkZzYHXFgvBiqW1QKSWplfySzvmAyDUN50cG2X0DDLqoTKXVLJgIIXDCohHAqCzHhymeuShy/Ru8kkAhtmhWUTvW9fdEnPQaVLU0n8XF0L3kn5P6LTtZPKgNoK+RrUkcGtQ7S9TsgOxxinrkUPYD+LwLCIh7CTsWSVQqRmTuPqpitlZFLQlApXjrsYBc335wOw47ksmUSMMrgKi/gnAE/awCqNHmTUwDf5X34LlBuedsgbUsK15kPMxTIXzzvFSIdsSPBw7nGD1K+7bL3F9xStEnZhoCw71TbpL71GBBbUF1MZmZWTOi97PI3eIJn9zCEtOj0+umaOde2EszqW9/xr6rM54WFtc0vfQNak57Ibd/Jerohu3GFwYqPjVEhve2Z4cbQU1ikFsQ73z0fwj+ga3VBezGuggFQAAAABJRU5ErkJggg=="}');
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
;// CONCATENATED MODULE: ./src/components/primitives/pin.js



// Semi-automatic pin object. For stretching things.


var Pin = /*#__PURE__*/function () {
  // (Comp reference, a name in overlay settings,
  // pin parameters)
  function Pin(comp, name, params) {
    var _this = this;
    if (params === void 0) {
      params = {};
    }
    classCallCheck_classCallCheck(this, Pin);
    this.RADIUS = comp.$props.config.PIN_RADIUS || 5.5;
    this.RADIUS_SQ = Math.pow(this.RADIUS + 7, 2);
    if (utils.is_mobile) {
      this.RADIUS += 2;
      this.RADIUS_SQ *= 2.5;
    }
    this.COLOR_BACK = comp.$props.colors.back;
    this.COLOR_BR = comp.$props.colors.text;
    this.comp = comp;
    this.layout = comp.layout;
    this.mouse = comp.mouse;
    this.name = name;
    this.state = params.state || 'settled';
    this.hidden = params.hidden || false;
    this.mouse.on('mousemove', function (e) {
      return _this.mousemove(e);
    });
    this.mouse.on('mousedown', function (e) {
      return _this.mousedown(e);
    });
    this.mouse.on('mouseup', function (e) {
      return _this.mouseup(e);
    });
    if (comp.state === 'finished') {
      this.state = 'settled';
      this.update_from(comp.$props.settings[name]);
    } else {
      this.update();
    }
    if (this.state !== 'settled') {
      this.comp.$emit('scroll-lock', true);
    }
  }
  createClass_createClass(Pin, [{
    key: "re_init",
    value: function re_init() {
      this.update_from(this.comp.$props.settings[this.name]);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (this.hidden) return;
      switch (this.state) {
        case 'tracking':
          break;
        case 'dragging':
          if (!this.moved) this.draw_circle(ctx);
          break;
        case 'settled':
          this.draw_circle(ctx);
          break;
      }
    }
  }, {
    key: "draw_circle",
    value: function draw_circle(ctx) {
      this.layout = this.comp.layout;
      if (this.comp.selected) {
        var r = this.RADIUS,
          lw = 1.5;
      } else {
        var r = this.RADIUS * 0.95,
          lw = 1;
      }
      ctx.lineWidth = lw;
      ctx.strokeStyle = this.COLOR_BR;
      ctx.fillStyle = this.COLOR_BACK;
      ctx.beginPath();
      ctx.arc(this.x = this.layout.t2screen(this.t), this.y = this.layout.$2screen(this.y$), r + 0.5, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.stroke();
    }
  }, {
    key: "update",
    value: function update() {
      this.y$ = this.comp.$props.cursor.y$;
      this.y = this.comp.$props.cursor.y;
      this.t = this.comp.$props.cursor.t;
      this.x = this.comp.$props.cursor.x;

      // Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      // Reset the settings attahed to the pin (position)
      this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "update_from",
    value: function update_from(data, emit) {
      if (emit === void 0) {
        emit = false;
      }
      if (!data) return;
      this.layout = this.comp.layout;
      this.y$ = data[1];
      this.y = this.layout.$2screen(this.y$);
      this.t = data[0];
      this.x = this.layout.t2screen(this.t);

      // TODO: Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      if (emit) this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "rec_position",
    value: function rec_position() {
      this.t1 = this.t;
      this.y$1 = this.y$;
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      switch (this.state) {
        case 'tracking':
        case 'dragging':
          this.moved = true;
          this.update();
          break;
      }
    }
  }, {
    key: "mousedown",
    value: function mousedown(event, force) {
      if (force === void 0) {
        force = false;
      }
      if (utils.default_prevented(event) && !force) return;
      switch (this.state) {
        case 'tracking':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
        case 'settled':
          if (this.hidden) return;
          if (this.hover()) {
            this.state = 'dragging';
            this.moved = false;
            this.comp.$emit('scroll-lock', true);
            this.comp.$emit('object-selected');
          }
          break;
      }
      if (this.hover()) {
        event.preventDefault();
      }
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      switch (this.state) {
        case 'dragging':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
      }
    }
  }, {
    key: "on",
    value: function on(name, handler) {
      switch (name) {
        case 'settled':
          this.on_settled = handler;
          break;
      }
    }
  }, {
    key: "hover",
    value: function hover() {
      var x = this.x;
      var y = this.y;
      return (x - this.mouse.x) * (x - this.mouse.x) + (y - this.mouse.y) * (y - this.mouse.y) < this.RADIUS_SQ;
    }
  }]);
  return Pin;
}();

;// CONCATENATED MODULE: ./src/components/primitives/seg.js


// Draws a segment, adds corresponding collision f-n



var Seg = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Seg(overlay, ctx) {
    classCallCheck_classCallCheck(this, Seg);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  createClass_createClass(Seg, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      return function (x, y) {
        return math.point2seg([x, y], p1, p2) < _this.T;
      };
    }
  }]);
  return Seg;
}();

;// CONCATENATED MODULE: ./src/components/primitives/line.js


// Draws a line, adds corresponding collision f-n



var Line = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Line(overlay, ctx) {
    classCallCheck_classCallCheck(this, Line);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  createClass_createClass(Line, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      var w = layout.width;
      var h = layout.height;
      // TODO: transform k (angle) to screen ratio
      // (this requires a new a2screen function)
      var k = (y2 - y1) / (x2 - x1);
      var s = Math.sign(x2 - x1 || y2 - y1);
      var dx = w * s * 2;
      var dy = w * k * s * 2;
      if (dy === Infinity) {
        dx = 0, dy = h * s;
      }
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 + dx, y2 + dy);
      if (!this.ray) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1 - dx, y1 - dy);
      }
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      var f = this.ray ? math.point2ray.bind(math) : math.point2line.bind(math);
      return function (x, y) {
        return f([x, y], p1, p2) < _this.T;
      };
    }
  }]);
  return Line;
}();

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
function typeof_typeof(obj) {
  "@babel/helpers - typeof";

  return typeof_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, typeof_typeof(obj);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(self, call) {
  if (call && (typeof_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
;// CONCATENATED MODULE: ./src/components/primitives/ray.js





function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
// Draws a ray, adds corresponding collision f-n


var Ray = /*#__PURE__*/function (_Line) {
  _inherits(Ray, _Line);
  var _super = _createSuper(Ray);
  function Ray(overlay, ctx) {
    var _this;
    classCallCheck_classCallCheck(this, Ray);
    _this = _super.call(this, overlay, ctx);
    _this.ray = true;
    return _this;
  }
  return createClass_createClass(Ray);
}(Line);

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/LineTool.vue?vue&type=script&lang=js&
// Line drawing tool
// TODO: make an angle-snap when "Shift" is pressed








/* harmony default export */ const LineToolvue_type_script_lang_js_ = ({
  name: 'LineTool',
  mixins: [overlay, tool],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || '#42b28a';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Lines',
        icon: icons_namespaceObject["segment.png"],
        type: 'Segment',
        hint: 'This hint will be shown on hover',
        data: [],
        // Default data
        settings: {},
        // Default settings
        // Modifications
        mods: {
          'Extended': {
            // Rewrites the default setting fields
            settings: {
              extended: true
            },
            icon: icons_namespaceObject["extended.png"]
          },
          'Ray': {
            // Rewrites the default setting fields
            settings: {
              ray: true
            },
            icon: icons_namespaceObject["ray.png"]
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1'));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      if (this.sett.ray) {
        new Ray(this, ctx).draw(this.p1, this.p2);
      } else if (this.sett.extended) {
        new Line(this, ctx).draw(this.p1, this.p2);
      } else {
        new Seg(this, ctx).draw(this.p1, this.p2);
      }
      ctx.stroke();
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['LineTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_LineToolvue_type_script_lang_js_ = (LineToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue
var LineTool_render, LineTool_staticRenderFns
;



/* normalize component */
;
var LineTool_component = normalizeComponent(
  overlays_LineToolvue_type_script_lang_js_,
  LineTool_render,
  LineTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LineTool = (LineTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/RangeTool.vue?vue&type=script&lang=js&

// Price/Time measurment tool






/* harmony default export */ const RangeToolvue_type_script_lang_js_ = ({
  name: 'RangeTool',
  mixins: [overlay, tool],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || this.$props.colors.cross;
    },
    back_color: function back_color() {
      return this.sett.backColor || '#9b9ba316';
    },
    value_back: function value_back() {
      return this.sett.valueBack || '#9b9ba316';
    },
    value_color: function value_color() {
      return this.sett.valueColor || this.$props.colors.text;
    },
    prec: function prec() {
      return this.sett.precision || 2;
    },
    new_font: function new_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    price: function price() {
      return 'price' in this.sett ? this.sett.price : true;
    },
    time: function time() {
      return 'time' in this.sett ? this.sett.time : false;
    },
    shift: function shift() {
      return this.sett.shiftMode;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '2.0.1'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Measurements',
        icon: icons_namespaceObject["price_range.png"],
        type: 'Price',
        hint: 'Price Range',
        data: [],
        // Default data
        settings: {},
        // Default settings
        mods: {
          'Time': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["time_range.png"],
            settings: {
              price: false,
              time: true
            }
          },
          'PriceTime': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["price_time.png"],
            settings: {
              price: true,
              time: true
            }
          },
          'ShiftMode': {
            // Rewrites the default setting fields
            settings: {
              price: true,
              time: true,
              shiftMode: true
            },
            hidden: true
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1', {
        hidden: this.shift
      }));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking',
        hidden: this.shift
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
        // Deselect the tool in shiftMode
        if (_this.shift) _this._$emit('custom-event', {
          event: 'object-selected',
          args: []
        });
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      var layout = this.$props.layout;
      var xm = layout.t2screen((this.p1[0] + this.p2[0]) * 0.5);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Background
      ctx.fillStyle = this.back_color;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      if (this.price) this.vertical(ctx, x1, y1, x2, y2, xm);
      if (this.time) this.horizontal(ctx, x1, y1, x2, y2, xm);
      this.draw_value(ctx, dir, xm, y2);
      this.render_pins(ctx);
    },
    vertical: function vertical(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      ctx.beginPath();
      if (!this.shift) {
        // Top
        new Seg(this, ctx).draw([this.p1[0], this.p2[1]], [this.p2[0], this.p2[1]]);
        // Bottom
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p2[0], this.p1[1]]);
      }

      // Vertical Arrow
      ctx.moveTo(xm - 4, y2 + 5 * dir);
      ctx.lineTo(xm, y2);
      ctx.lineTo(xm + 4, y2 + 5 * dir);
      ctx.stroke();

      // Vertical Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      new Seg(this, ctx).draw([(this.p1[0] + this.p2[0]) * 0.5, this.p2[1]], [(this.p1[0] + this.p2[0]) * 0.5, this.p1[1]]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    horizontal: function horizontal(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var xdir = Math.sign(this.p2[0] - this.p1[0]);
      var ym = (layout.$2screen(this.p1[1]) + layout.$2screen(this.p2[1])) / 2;
      ctx.beginPath();
      if (!this.shift) {
        // Left
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p1[0], this.p2[1]]);
        // Right
        new Seg(this, ctx).draw([this.p2[0], this.p1[1]], [this.p2[0], this.p2[1]]);
      }

      // Horizontal Arrow
      ctx.moveTo(x2 - 5 * xdir, ym - 4);
      ctx.lineTo(x2, ym);
      ctx.lineTo(x2 - 5 * xdir, ym + 4);
      ctx.stroke();

      // Horizontal Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x1, ym);
      ctx.lineTo(x2, ym);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    // WTF? I know dude, a lot of shitty code here
    draw_value: function draw_value(ctx, dir, xm, y) {
      var _this2 = this;
      ctx.font = this.new_font;
      // Price delta (anf percent)
      //let d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec)
      //let p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec)
      var d$ = (this.p2[1] - this.p1[1]).toFixed(2);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(2);
      // Map interval to the actual tf (in ms)
      var f = function f(t) {
        return _this2.layout.ti_map.smth2t(t);
      };
      var dt = f(this.p2[0]) - f(this.p1[0]);
      var tf = this.layout.ti_map.tf;
      // Bars count (through the candle index)
      var f2 = function f2(t) {
        var c = _this2.layout.c_magnet(t);
        var cn = _this2.layout.candles || _this2.layout.master_grid.candles;
        return cn.indexOf(c);
      };
      // Bars count (and handling the negative values)
      var b = f2(this.p2[0]) - f2(this.p1[0]);
      // Format time delta
      // Format time delta
      var dtstr = this.t2str(dt);
      var text = [];
      if (this.price) text.push("".concat(d$, "  (").concat(p, "%)"));
      if (this.time) text.push("".concat(b, " bars, ").concat(dtstr));
      text = text.join('\n');
      // "Multiple" fillText
      var lines = text.split('\n');
      var w = Math.max.apply(Math, _toConsumableArray(lines.map(function (x) {
        return ctx.measureText(x).width + 20;
      })).concat([100]));
      var n = lines.length;
      var h = 20 * n;
      ctx.fillStyle = this.value_back;
      ctx.fillRect(xm - w * 0.5, y - (10 + h) * dir, w, h * dir);
      ctx.fillStyle = this.value_color;
      ctx.textAlign = 'center';
      lines.forEach(function (l, i) {
        ctx.fillText(l, xm, y + (dir > 0 ? 20 * i - 20 * n + 5 : 20 * i + 25));
      });
    },
    // Formats time from ms to `1D 12h` for example
    t2str: function t2str(t) {
      var sign = Math.sign(t);
      var abs = Math.abs(t);
      var tfs = [[1000, 's', 60], [60000, 'm', 60], [3600000, 'h', 24], [86400000, 'D', 7], [604800000, 'W', 4], [2592000000, 'M', 12], [31536000000, 'Y', Infinity], [Infinity, 'Eternity', Infinity]];
      for (var i = 0; i < tfs.length; i++) {
        tfs[i][0] = Math.floor(abs / tfs[i][0]);
        if (tfs[i][0] === 0) {
          var p1 = tfs[i - 1];
          var p2 = tfs[i - 2];
          var txt = sign < 0 ? '-' : '';
          if (p1) {
            txt += p1.slice(0, 2).join('');
          }
          var n2 = p2 ? p2[0] - p1[0] * p2[2] : 0;
          if (p2 && n2) {
            txt += ' ';
            txt += "".concat(n2).concat(p2[1]);
          }
          return txt;
        }
      }
    },
    use_for: function use_for() {
      return ['RangeTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_RangeToolvue_type_script_lang_js_ = (RangeToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue
var RangeTool_render, RangeTool_staticRenderFns
;



/* normalize component */
;
var RangeTool_component = normalizeComponent(
  overlays_RangeToolvue_type_script_lang_js_,
  RangeTool_render,
  RangeTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const RangeTool = (RangeTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js&
function Gridvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Gridvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Gridvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Gridvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Sets up all layers/overlays for the grid with 'grid_id'


















/* harmony default export */ const Gridvue_type_script_lang_js_ = ({
  name: "Grid",
  components: {
    Crosshair: components_Crosshair,
    KeyboardListener: KeyboardListener
  },
  mixins: [canvas, uxlist],
  props: ["sub", "layout", "range", "interval", "cursor", "colors", "overlays", "width", "height", "data", "grid_id", "y_transform", "font", "tv_id", "config", "meta", "shaders", "enableZoom", "priceLine", "decimalPlace", "enableCrosshair"],
  data: function data() {
    var _this = this;
    return {
      layer_events: {
        "new-grid-layer": this.new_layer,
        "delete-grid-layer": this.del_layer,
        "show-grid-layer": function showGridLayer(d) {
          _this.renderer.show_hide_layer(d);
          _this.redraw();
        },
        "redraw-grid": this.redraw,
        "layer-meta-props": function layerMetaProps(d) {
          return _this.$emit("layer-meta-props", d);
        },
        "custom-event": function customEvent(d) {
          return _this.$emit("custom-event", d);
        }
      },
      keyboard_events: {
        "register-kb-listener": function registerKbListener(event) {
          _this.$emit("register-kb-listener", event);
        },
        "remove-kb-listener": function removeKbListener(event) {
          _this.$emit("remove-kb-listener", event);
        },
        keyup: function keyup(event) {
          if (!_this.is_active) return;
          _this.renderer.propagate("keyup", event);
        },
        keydown: function keydown(event) {
          if (!_this.is_active) return; // TODO: is this neeeded?
          _this.renderer.propagate("keydown", event);
        },
        keypress: function keypress(event) {
          if (!_this.is_active) return;
          _this.renderer.propagate("keypress", event);
        }
      }
    };
  },
  computed: {
    is_active: function is_active() {
      return this.$props.cursor.t !== undefined && this.$props.cursor.grid_id === this.$props.grid_id;
    }
  },
  watch: {
    enableZoom: function enableZoom() {
      // console.log("props:",enableZoom);
    },
    // enableCrosshair() {
    //   console.log("props:",enableCrosshair);
    // },
    range: {
      handler: function handler() {
        var _this2 = this;
        // TODO: Left-side render lag fix:
        // Overlay data is updated one tick later than
        // the main sub. Fast fix is to delay redraw()
        // call. It will be a solution until a better
        // one comes by.
        this.$nextTick(function () {
          return _this2.redraw();
        });
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        if (!this.$props.cursor.locked) this.redraw();
      },
      deep: true
    },
    overlays: {
      // Track changes in calc() functions
      handler: function handler(ovs) {
        var _iterator = Gridvue_type_script_lang_js_createForOfIteratorHelper(ovs),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var ov = _step.value;
            var _iterator2 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$children),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var comp = _step2.value;
                if (typeof comp.id !== "string") continue;
                var tuple = comp.id.split("_");
                tuple.pop();
                if (tuple.join("_") === ov.name) {
                  comp.calc = ov.methods.calc;
                  if (!comp.calc) continue;
                  var calc = comp.calc.toString();
                  if (calc !== ov.__prevscript__) {
                    comp.exec_script();
                  }
                  ov.__prevscript__ = calc;
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      },
      deep: true
    },
    // Redraw on the shader list change
    shaders: function shaders(n, p) {
      this.redraw();
    }
  },
  created: function created() {
    var _this3 = this;
    // List of all possible overlays (builtin + custom)
    console.log("this.$props", this.$props);
    this._list = [Spline, Splines, Range, Trades, Channel, Segment, Candles, Volume, Splitters, LineTool, RangeTool].concat(this.$props.overlays);
    this._registry = {};

    // We need to know which components we will use.
    // Custom overlay components overwrite built-ins:
    var tools = [];
    this._list.forEach(function (x, i) {
      var use_for = x.methods.use_for();
      if (x.methods.tool) tools.push({
        use_for: use_for,
        info: x.methods.tool()
      });
      use_for.forEach(function (indicator) {
        _this3._registry[indicator] = i;
      });
    });
    this.$emit("custom-event", {
      event: "register-tools",
      args: tools
    });
    this.$on("custom-event", function (e) {
      return _this3.on_ux_event(e, "grid");
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  mounted: function mounted() {
    var _this4 = this;
    //  console.log("props:",this.priceLine);
    var el = this.$refs["canvas"];
    this.renderer = new Grid(el, this);
    this.setup();
    this.$nextTick(function () {
      return _this4.redraw();
    });
  },
  methods: {
    new_layer: function new_layer(layer) {
      var _this5 = this;
      // console.log("new_layer",layer)
      this.$nextTick(function () {
        return _this5.renderer.new_layer(layer);
      });
    },
    del_layer: function del_layer(layer) {
      var _this6 = this;
      this.$nextTick(function () {
        return _this6.renderer.del_layer(layer);
      });
      var grid_id = this.$props.grid_id;
      this.$emit("custom-event", {
        event: "remove-shaders",
        args: [grid_id, layer]
      });
      // TODO: close all interfaces
      this.$emit("custom-event", {
        event: "remove-layer-meta",
        args: [grid_id, layer]
      });
      this.remove_all_ux(layer);
    },
    get_overlays: function get_overlays(h) {
      var _this7 = this;
      // Distributes overlay data & settings according
      // to this._registry; returns compo list
      var comp_list = [],
        count = {};
      var _iterator3 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$props.data),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var d = _step3.value;
          var comp = this._list[this._registry[d.type]];
          if (comp) {
            if (comp.methods.calc) {
              comp = this.inject_renderer(comp);
            }
            comp_list.push({
              cls: comp,
              type: d.type,
              data: d.data,
              settings: d.settings,
              i0: d.i0,
              tf: d.tf,
              last: d.last
            });
            count[d.type] = 0;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return comp_list.map(function (x, i) {
        // console.log("x.settings",x.type,x.settings)
        return h(x.cls, {
          on: _this7.layer_events,
          attrs: Object.assign(_this7.common_props(), {
            id: "".concat(x.type, "_").concat(count[x.type]++),
            type: x.type,
            data: x.data,
            settings: x.settings,
            i0: x.i0,
            tf: x.tf,
            num: i,
            data_234: 12,
            grid_id: _this7.$props.grid_id,
            meta: _this7.$props.meta,
            last: x.last
          })
        });
      });
    },
    common_props: function common_props() {
      return {
        cursor: this.$props.cursor,
        enableZoom: this.$props.enableZoom,
        enableCrosshair: this.$props.enableCrosshair,
        colors: this.$props.colors,
        layout: this.$props.layout.grids[this.$props.grid_id],
        interval: this.$props.interval,
        sub: this.$props.sub,
        font: this.$props.font,
        config: this.$props.config,
        priceLine: this.$props.priceLine
      };
    },
    emit_ux_event: function emit_ux_event(e) {
      var e_pass = this.on_ux_event(e, "grid");
      if (e_pass) this.$emit("custom-event", e);
    },
    // Replace the current comp with 'renderer'
    inject_renderer: function inject_renderer(comp) {
      var src = comp.methods.calc();
      if (!src.conf || !src.conf.renderer || comp.__renderer__) {
        return comp;
      }

      // Search for an overlay with the target 'name'
      var f = this._list.find(function (x) {
        return x.name === src.conf.renderer;
      });
      if (!f) return comp;
      comp.mixins.push(f);
      comp.__renderer__ = src.conf.renderer;
      return comp;
    }
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "grid-".concat(id), {
      position: {
        x: 0,
        y: layout.offset || 0
      },
      attrs: {
        width: layout.width,
        height: layout.height,
        overflow: "hidden"
      },
      style: {
        backgroundColor: this.$props.colors.back
      },
      hs: [h(components_Crosshair, {
        props: this.common_props(),
        on: this.layer_events
      }), h(KeyboardListener, {
        on: this.keyboard_events
      }), h(UxLayer, {
        props: {
          id: id,
          tv_id: this.$props.tv_id,
          uxs: this.uxs,
          colors: this.$props.colors,
          config: this.$props.config,
          domData: 1,
          updater: Math.random()
        },
        on: {
          "custom-event": this.emit_ux_event
        }
      })].concat(this.get_overlays(h))
    });
  }
});
;// CONCATENATED MODULE: ./src/components/Grid.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Gridvue_type_script_lang_js_ = (Gridvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Grid.vue
var Grid_render, Grid_staticRenderFns
;



/* normalize component */
;
var Grid_component = normalizeComponent(
  components_Gridvue_type_script_lang_js_,
  Grid_render,
  Grid_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Grid = (Grid_component.exports);
;// CONCATENATED MODULE: ./src/components/js/sidebar.js


function sidebar_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = sidebar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function sidebar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return sidebar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return sidebar_arrayLikeToArray(o, minLen); }
function sidebar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



var PANHEIGHT;
var Sidebar = /*#__PURE__*/function () {
  function Sidebar(canvas, comp, side) {
    if (side === void 0) {
      side = "right";
    }
    classCallCheck_classCallCheck(this, Sidebar);
    PANHEIGHT = comp.config.PANHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.side = side;
    this.listeners();
  }
  createClass_createClass(Sidebar, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;
      var mc = this.mc = new hammer.Manager(this.canvas);
      mc.add(new hammer.Pan({
        direction: hammer.DIRECTION_VERTICAL,
        threshold: 0
      }));
      mc.add(new hammer.Tap({
        event: "doubletap",
        taps: 2,
        posThreshold: 50
      }));
      mc.on("panstart", function (event) {
        if (_this.$p.y_transform) {
          _this.zoom = _this.$p.y_transform.zoom;
        } else {
          _this.zoom = 1.0;
        }
        _this.y_range = [_this.layout.$_hi, _this.layout.$_lo];
        _this.drug = {
          y: event.center.y,
          z: _this.zoom,
          mid: math.log_mid(_this.y_range, _this.layout.height),
          A: _this.layout.A,
          B: _this.layout.B
        };
      });
      mc.on("panmove", function (event) {
        if (_this.drug) {
          _this.zoom = _this.calc_zoom(event);
          _this.comp.$emit("sidebar-transform", {
            grid_id: _this.id,
            zoom: _this.zoom,
            auto: false,
            range: _this.calc_range(),
            drugging: true
          });
          _this.update();
        }
      });
      mc.on("panend", function () {
        _this.drug = null;
        _this.comp.$emit("sidebar-transform", {
          grid_id: _this.id,
          drugging: false
        });
      });
      mc.on("doubletap", function () {
        _this.comp.$emit("sidebar-transform", {
          grid_id: _this.id,
          zoom: 1.0,
          auto: true
        });
        _this.zoom = 1.0;
        _this.update();
      });

      // TODO: Do later for mobile version
    }
  }, {
    key: "update",
    value: function update() {
      // Update reference to the grid
      this.layout = this.$p.layout.grids[this.id];
      var points = this.layout.ys;
      var x,
        y,
        w,
        h,
        side = this.side;
      var sb = this.layout.sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      switch (side) {
        case "left":
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;

          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
        case "right":
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;
          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
      }
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = sidebar_createForOfIteratorHelper(points),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          if (p[0] > this.layout.height) continue;
          var x1 = side === "left" ? w - 0.5 : x - 0.5;
          var x2 = side === "left" ? x1 - 4.5 : x1 + 4.5;
          this.ctx.moveTo(x1, p[0] - 0.5);
          this.ctx.lineTo(x2, p[0] - 0.5);
          var offst = side === "left" ? -10 : 10;
          this.ctx.textAlign = side === "left" ? "end" : "start";
          var d = this.layout.prec;
          //this.ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4)
          this.ctx.fillText(p[1].toFixed(this.$p.decimalPlace), x1 + offst, p[0] + 4);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
      this.apply_shaders();
      if (this.$p.cursor.y && this.$p.cursor.y$) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      if (this.$p.applyShaders) {
        var layout = this.$p.layout.grids[this.id];
        var props = {
          layout: layout,
          cursor: this.$p.cursor
        };
        var _iterator2 = sidebar_createForOfIteratorHelper(this.$p.shaders),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var s = _step2.value;
            this.ctx.save();
            s.draw(this.ctx, props);
            this.ctx.restore();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }

    // A gray bar behind the current price
  }, {
    key: "panel",
    value: function panel() {
      if (this.$p.cursor.grid_id !== this.layout.id) {
        return;
      }

      //let lbl = this.$p.cursor.y$.toFixed(this.layout.prec)
      var lbl = this.$p.cursor.y$.toFixed(2);
      this.ctx.fillStyle = this.$p.colors.panel;
      var panwidth = this.layout.sb + 1;
      var x = -0.5;
      var y = this.$p.cursor.y - PANHEIGHT * 0.5 - 0.5;
      var a = 7;
      this.ctx.fillRect(x - 0.5, y, panwidth, PANHEIGHT);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = "left";
      this.ctx.fillText(lbl, a, y + 15);
    }
  }, {
    key: "calc_zoom",
    value: function calc_zoom(event) {
      var d = this.drug.y - event.center.y;
      var speed = d > 0 ? 3 : 1;
      var k = 1 + speed * d / this.layout.height;
      return utils.clamp(this.drug.z * k, 0.005, 100);
    }

    // Not the best place to calculate y-range but
    // this is the simplest solution I found up to
    // date
  }, {
    key: "calc_range",
    value: function calc_range(diff1, diff2) {
      var _this2 = this;
      if (diff1 === void 0) {
        diff1 = 1;
      }
      if (diff2 === void 0) {
        diff2 = 1;
      }
      var z = this.zoom / this.drug.z;
      var zk = (1 / z - 1) / 2;
      var range = this.y_range.slice();
      var delta = range[0] - range[1];
      if (!this.layout.grid.logScale) {
        range[0] = range[0] + delta * zk * diff1;
        range[1] = range[1] - delta * zk * diff2;
      } else {
        var px_mid = this.layout.height / 2;
        var new_hi = px_mid - px_mid * (1 / z);
        var new_lo = px_mid + px_mid * (1 / z);

        // Use old mapping to get a new range
        var f = function f(y) {
          return math.exp((y - _this2.drug.B) / _this2.drug.A);
        };
        var copy = range.slice();
        range[0] = f(new_hi);
        range[1] = f(new_lo);
      }
      return range;
    }
  }, {
    key: "rezoom_range",
    value: function rezoom_range(delta, diff1, diff2) {
      if (!this.$p.y_transform || this.$p.y_transform.auto) return;
      this.zoom = 1.0;
      // TODO: further work (improve scaling ratio)
      if (delta < 0) delta /= 3.75; // Btw, idk why 3.75, but it works
      delta *= 0.25;
      this.y_range = [this.layout.$_hi, this.layout.$_lo];
      this.drug = {
        y: 0,
        z: this.zoom,
        mid: math.log_mid(this.y_range, this.layout.height),
        A: this.layout.A,
        B: this.layout.B
      };
      this.zoom = this.calc_zoom({
        center: {
          y: delta * this.layout.height
        }
      });
      this.comp.$emit("sidebar-transform", {
        grid_id: this.id,
        zoom: this.zoom,
        auto: false,
        range: this.calc_range(diff1, diff2),
        drugging: true
      });
      this.drug = null;
      this.comp.$emit("sidebar-transform", {
        grid_id: this.id,
        drugging: false
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.mc) this.mc.destroy();
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
  return Sidebar;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Sidebar.vue?vue&type=script&lang=js&
// The side bar (yep, that thing with a bunch of $$$)



/* harmony default export */ const Sidebarvue_type_script_lang_js_ = ({
  name: 'Sidebar',
  mixins: [canvas],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'grid_id', 'rerender', 'y_transform', 'decimalPlace', 'applyShaders', 'tv_id', 'config', 'shaders'],
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Sidebar(el, this);
    this.setup();
    this.redraw();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "sidebar-".concat(id), {
      position: {
        x: layout.width,
        y: layout.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: this.$props.width,
        height: layout.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  }
});
;// CONCATENATED MODULE: ./src/components/Sidebar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sidebarvue_type_script_lang_js_ = (Sidebarvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Sidebar.vue
var Sidebar_render, Sidebar_staticRenderFns
;



/* normalize component */
;
var Sidebar_component = normalizeComponent(
  components_Sidebarvue_type_script_lang_js_,
  Sidebar_render,
  Sidebar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Sidebar = (Sidebar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=e9225dc2&
var Legendvue_type_template_id_e9225dc2_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-legend",
    "class": _vm.main_chart_type,
    style: _vm.calc_style
  }, [_vm.grid_id === 0 ? _c("div", {
    staticClass: "trading-vue-ohlcv",
    style: {
      "max-width": _vm.common.width + "px"
    }
  }, [!_vm.show_CustomProps ? _c("span", {
    staticClass: "t-vue-title",
    style: {
      color: _vm.common.colors.title
    }
  }, [_vm._v("\r\n              " + _vm._s(_vm.common.title_txt) + "\r\n        ")]) : _vm._e(), _vm._v(" "), _vm.show_CustomProps ? _vm._l(_vm.legendTxtConfig, function (n, i) {
    return _c("span", {
      key: i,
      style: n.style
    }, [_vm._v(_vm._s(n.name) + " ")]);
  }) : _vm._e(), _vm._v(" "), _vm.show_values && !_vm.show_CustomProps ? _c("span", [_vm._v("\r\n            O"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[0]))]), _vm._v("\r\n            H"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[1]))]), _vm._v("\r\n            L"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[2]))]), _vm._v("\r\n            C"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[3]))]), _vm._v("\r\n            V"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[4]))])]) : _vm._e(), _vm._v(" "), !_vm.show_values ? _c("span", {
    staticClass: "t-vue-lspan",
    style: {
      color: _vm.common.colors.text
    }
  }, [_vm._v("\r\n            " + _vm._s((_vm.common.meta.last || [])[4]) + "\r\n        ")]) : _vm._e()], 2) : _vm._e(), _vm._v(" "), _vm._l(this.indicators, function (ind) {
    return _c("div", {
      staticClass: "t-vue-ind"
    }, [_c("span", {
      staticClass: "t-vue-iname"
    }, [_vm._v(_vm._s(ind.name))]), _vm._v(" "), ind.showLegendButtons ? _c("button-group", {
      attrs: {
        buttons: _vm.common.buttons,
        config: _vm.common.config,
        ov_id: ind.id,
        grid_id: _vm.grid_id,
        index: ind.index,
        tv_id: _vm.common.tv_id,
        display: ind.v
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    }) : _vm._e(), _vm._v(" "), ind.v ? _c("span", {
      staticClass: "t-vue-ivalues"
    }, _vm._l(ind.values, function (v) {
      return _vm.show_values ? _c("span", {
        staticClass: "t-vue-lspan t-vue-ivalue",
        style: {
          color: v.color
        }
      }, [_vm._v("\r\n                " + _vm._s(v.value) + "\r\n            ")]) : _vm._e();
    }), 0) : _vm._e(), _vm._v(" "), ind.unk ? _c("span", {
      staticClass: "t-vue-unknown"
    }, [_vm._v("\r\n            (Unknown type)\r\n        ")]) : _vm._e(), _vm._v(" "), _c("transition", {
      attrs: {
        name: "tvjs-appear"
      }
    }, [ind.loading ? _c("spinner", {
      attrs: {
        colors: _vm.common.colors
      }
    }) : _vm._e()], 1)], 1);
  })], 2);
};
var Legendvue_type_template_id_e9225dc2_staticRenderFns = [];
Legendvue_type_template_id_e9225dc2_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=template&id=e9225dc2&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=72b6dd45&
var ButtonGroupvue_type_template_id_72b6dd45_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("span", {
    staticClass: "t-vue-lbtn-grp"
  }, _vm._l(_vm.buttons, function (b, i) {
    return _c("legend-button", {
      key: i,
      attrs: {
        id: b.name || b,
        tv_id: _vm.tv_id,
        ov_id: _vm.ov_id,
        grid_id: _vm.grid_id,
        index: _vm.index,
        display: _vm.display,
        icon: b.icon,
        config: _vm.config
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    });
  }), 1);
};
var ButtonGroupvue_type_template_id_72b6dd45_staticRenderFns = [];
ButtonGroupvue_type_template_id_72b6dd45_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=template&id=72b6dd45&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=7cd34a30&
var LegendButtonvue_type_template_id_7cd34a30_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("img", {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + "px",
      height: _vm.config.L_BTN_SIZE + "px"
    },
    attrs: {
      id: _vm.uuid,
      src: _vm.base64
    },
    on: {
      click: _vm.onclick
    }
  });
};
var LegendButtonvue_type_template_id_7cd34a30_staticRenderFns = [];
LegendButtonvue_type_template_id_7cd34a30_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=template&id=7cd34a30&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=script&lang=js&

/* harmony default export */ const LegendButtonvue_type_script_lang_js_ = ({
  name: 'LegendButton',
  props: ['id', 'tv_id', 'grid_id', 'ov_id', 'index', 'display', 'icon', 'config'],
  computed: {
    base64: function base64() {
      return this.icon || icons_namespaceObject[this.file_name];
    },
    file_name: function file_name() {
      var id = this.$props.id;
      if (this.$props.id === 'display') {
        id = this.$props.display ? 'display_on' : 'display_off';
      }
      return id + '.png';
    },
    uuid: function uuid() {
      var tv = this.$props.tv_id;
      var gr = this.$props.grid_id;
      var ov = this.$props.ov_id;
      return "".concat(tv, "-btn-g").concat(gr, "-").concat(ov);
    },
    data_type: function data_type() {
      return this.$props.grid_id === 0 ? 'onchart' : 'offchart';
    },
    data_index: function data_index() {
      return this.$props.index;
    }
  },
  mounted: function mounted() {},
  methods: {
    onclick: function onclick() {
      this.$emit('legend-button-click', {
        button: this.$props.id,
        type: this.data_type,
        dataIndex: this.data_index,
        grid: this.$props.grid_id,
        overlay: this.$props.ov_id
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_LegendButtonvue_type_script_lang_js_ = (LegendButtonvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&id=7cd34a30&prod&lang=css&
var LegendButtonvue_type_style_index_0_id_7cd34a30_prod_lang_css_ = __webpack_require__(719);
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=style&index=0&id=7cd34a30&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js_,
  LegendButtonvue_type_template_id_7cd34a30_render,
  LegendButtonvue_type_template_id_7cd34a30_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LegendButton = (LegendButton_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=script&lang=js&

/* harmony default export */ const ButtonGroupvue_type_script_lang_js_ = ({
  name: 'ButtonGroup',
  components: {
    LegendButton: LegendButton
  },
  props: ['buttons', 'tv_id', 'ov_id', 'grid_id', 'index', 'display', 'config'],
  methods: {
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ButtonGroupvue_type_script_lang_js_ = (ButtonGroupvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&id=72b6dd45&prod&lang=css&
var ButtonGroupvue_type_style_index_0_id_72b6dd45_prod_lang_css_ = __webpack_require__(246);
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=style&index=0&id=72b6dd45&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js_,
  ButtonGroupvue_type_template_id_72b6dd45_render,
  ButtonGroupvue_type_template_id_72b6dd45_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ButtonGroup = (ButtonGroup_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=template&id=a6fff878&
var Spinnervue_type_template_id_a6fff878_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-spinner"
  }, _vm._l(4, function (i) {
    return _c("div", {
      key: i,
      style: {
        background: _vm.colors.text
      }
    });
  }), 0);
};
var Spinnervue_type_template_id_a6fff878_staticRenderFns = [];
Spinnervue_type_template_id_a6fff878_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=template&id=a6fff878&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=script&lang=js&
/* harmony default export */ const Spinnervue_type_script_lang_js_ = ({
  name: 'Spinner',
  props: ['colors']
});
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Spinnervue_type_script_lang_js_ = (Spinnervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css&
var Spinnervue_type_style_index_0_id_a6fff878_prod_lang_css_ = __webpack_require__(964);
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Spinner.vue



;


/* normalize component */

var Spinner_component = normalizeComponent(
  components_Spinnervue_type_script_lang_js_,
  Spinnervue_type_template_id_a6fff878_render,
  Spinnervue_type_template_id_a6fff878_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spinner = (Spinner_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=script&lang=js&


/* harmony default export */ const Legendvue_type_script_lang_js_ = ({
  name: 'ChartLegend',
  components: {
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  props: ['common', 'values', 'decimalPlace', 'grid_id', 'meta_props', 'main_chart_type', 'ignore_OHLC'],
  computed: {
    legendTxtConfig: function legendTxtConfig() {
      var res = [];
      var legendTxtConfig = localStorage.getItem('legendTxtConfig');
      // console.log('legendTxtConfig',legendTxtConfig)
      if (this.ignore_OHLC && legendTxtConfig) {
        res = JSON.parse(legendTxtConfig);
        console.log('parse response ', res);
      }
      return res;
    },
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      }
      // const prec = this.layout.prec
      var prec = this.decimalPlace;
      // const prec = 3

      // TODO: main the main legend more customizable
      var id = this.main_type + '_0';
      var meta = this.$props.meta_props[id] || {};
      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }
      return [this.$props.values.ohlcv[1].toFixed(prec), this.$props.values.ohlcv[2].toFixed(prec), this.$props.values.ohlcv[3].toFixed(prec), this.$props.values.ohlcv[4].toFixed(prec), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
    },
    // TODO: add support for { grid: { id : N }}
    indicators: function indicators() {
      var _this = this;
      var values = this.$props.values;
      var f = this.format;
      var types = {};
      return this.json_data.filter(function (x) {
        return x.settings.legend !== false && !x.main;
      }).map(function (x) {
        if (!(x.type in types)) types[x.type] = 0;
        var id = x.type + "_".concat(types[x.type]++);
        return {
          v: 'display' in x.settings ? x.settings.display : true,
          name: x.name || id,
          index: (_this.off_data || _this.json_data).indexOf(x),
          id: id,
          values: values ? f(id, values) : _this.n_a(1),
          unk: !(id in (_this.$props.meta_props || {})),
          loading: x.loading,
          showLegendButtons: 'legendButtons' in x.settings ? x.settings.legendButtons : true
        };
      });
    },
    calc_style: function calc_style() {
      var top = this.layout.height > 150 ? 10 : 5;
      var grids = this.$props.common.layout.grids;
      var w = grids[0] ? grids[0].width : undefined;
      return {
        top: "".concat(this.layout.offset + top, "px"),
        width: "".concat(w - 20, "px")
      };
    },
    layout: function layout() {
      var id = this.$props.grid_id;
      return this.$props.common.layout.grids[id];
    },
    json_data: function json_data() {
      return this.$props.common.data;
    },
    off_data: function off_data() {
      return this.$props.common.offchart;
    },
    main_type: function main_type() {
      var f = this.common.data.find(function (x) {
        return x.main;
      });
      return f ? f.type : undefined;
    },
    show_values: function show_values() {
      return this.common.cursor.mode !== 'explore';
    },
    show_CustomProps: function show_CustomProps() {
      // console.log('ignoreOHLC',ignoreOHLC)
      return this.$props.ignore_OHLC.includes(this.$props.main_chart_type);
    }
  },
  methods: {
    format: function format(id, values) {
      var meta = this.$props.meta_props[id] || {};
      // Matches Overlay.data_colors with the data values
      // (see Spline.vue)
      if (!values[id]) return this.n_a(1);

      // Custom formatter
      if (meta.legend) return meta.legend(values[id]);
      return values[id].slice(1).map(function (x, i) {
        var cs = meta.data_colors ? meta.data_colors() : [];
        if (typeof x == 'number') {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }
        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined
        };
      });
    },
    n_a: function n_a(len) {
      return Array(len).fill({
        value: 'n/a'
      });
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Legendvue_type_script_lang_js_ = (Legendvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&id=e9225dc2&prod&lang=css&
var Legendvue_type_style_index_0_id_e9225dc2_prod_lang_css_ = __webpack_require__(974);
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=style&index=0&id=e9225dc2&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js_,
  Legendvue_type_template_id_e9225dc2_render,
  Legendvue_type_template_id_e9225dc2_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Legend = (Legend_component.exports);
;// CONCATENATED MODULE: ./src/mixins/shaders.js
function shaders_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = shaders_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function shaders_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return shaders_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return shaders_arrayLikeToArray(o, minLen); }
function shaders_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Parser for shader events

/* harmony default export */ const shaders = ({
  methods: {
    // Init shaders from extensions
    init_shaders: function init_shaders(skin, prev) {
      if (skin !== prev) {
        if (prev) this.shaders = this.shaders.filter(function (x) {
          return x.owner !== prev.id;
        });
        var _iterator = shaders_createForOfIteratorHelper(skin.shaders),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var Shader = _step.value;
            var shader = new Shader();
            shader.owner = skin.id;
            this.shaders.push(shader);
          }
          // TODO: Sort by zIndex
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    },
    on_shader_event: function on_shader_event(d, target) {
      if (d.event === 'new-shader') {
        if (d.args[0].target === target) {
          d.args[0].id = "".concat(d.args[1], "-").concat(d.args[2]);
          this.shaders.push(d.args[0]);
          this.rerender++;
        }
      }
      if (d.event === 'remove-shaders') {
        var id = d.args.join('-');
        this.shaders = this.shaders.filter(function (x) {
          return x.id !== id;
        });
      }
    }
  },
  watch: {
    skin: function skin(n, p) {
      this.init_shaders(n, p);
    }
  },
  data: function data() {
    return {
      shaders: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=script&lang=js&





/* harmony default export */ const Sectionvue_type_script_lang_js_ = ({
  name: "GridSection",
  components: {
    Grid: components_Grid,
    Sidebar: components_Sidebar,
    ChartLegend: Legend
  },
  mixins: [shaders],
  props: ["common", "grid_id", "enableZoom", "decimalPlace", "priceLine", "enableCrosshair", "applyShaders", "ignore_OHLC"],
  data: function data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: ""
    };
  },
  computed: {
    // Component-specific props subsets:
    grid_props: function grid_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        var _p$data;
        var all = p.data;
        p.data = [p.data[id - 1]];
        // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)
        (_p$data = p.data).push.apply(_p$data, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }
      p.width = p.layout.grids[id].width;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.grid_shaders;
      return p;
    },
    sidebar_props: function sidebar_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].sb;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.sb_shaders;
      return p;
    },
    section_values: function section_values() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].width;
      return p.cursor.values[id];
    },
    legend_props: function legend_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        var _p$data2;
        var all = p.data;
        p.offchart = all;
        p.data = [p.data[id - 1]];
        (_p$data2 = p.data).push.apply(_p$data2, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }
      return p;
    },
    get_meta_props: function get_meta_props() {
      return this.meta_props;
    },
    main_chart_type: function main_chart_type() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      if (id === 0) {
        var rangeParams = this.$props.common.range;
        var mainData = p.data.find(function (d) {
          return d.main;
        });
        var mainType = mainData.type ? mainData.type : "";
        // console.log('this.$props.range',mainType,JSON.stringify(rangeParams))
        return mainType;
      }
      return "";
    },
    grid_shaders: function grid_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === "grid";
      });
    },
    sb_shaders: function sb_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === "sidebar";
      });
    }
  },
  watch: {
    common: {
      handler: function handler(val, old_val) {
        var newhash = this.ghash(val);
        if (newhash !== this.last_ghash) {
          this.rerender++;
        }
        if (val.data.length !== old_val.data.length) {
          // Look at this nasty trick!
          this.rerender++;
        }
        this.last_ghash = newhash;
      },
      deep: true
    }
  },
  mounted: function mounted() {
    this.init_shaders(this.$props.common.skin);
    // console.log('common.data',this.$props.common.data)
  },

  methods: {
    range_changed: function range_changed(r) {
      this.$emit("range-changed", r);
    },
    cursor_changed: function cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit("cursor-changed", c);
    },
    cursor_locked: function cursor_locked(state) {
      this.$emit("cursor-locked", state);
    },
    sidebar_transform: function sidebar_transform(s) {
      this.$emit("sidebar-transform", s);
    },
    emit_meta_props: function emit_meta_props(d) {
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit("layer-meta-props", d);
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, "sidebar");
      this.$emit("custom-event", d);
    },
    button_click: function button_click(event) {
      this.$emit("legend-button-click", event);
    },
    register_kb: function register_kb(event) {
      this.$emit("register-kb-listener", event);
    },
    remove_kb: function remove_kb(event) {
      this.$emit("remove-kb-listener", event);
    },
    rezoom_range: function rezoom_range(event) {
      var id = "sb-" + event.grid_id;
      if (this.$refs[id]) {
        this.$refs[id].renderer.rezoom_range(event.z, event.diff1, event.diff2);
      }
    },
    ghash: function ghash(val) {
      // Measures grid heights configuration
      var hs = val.layout.grids.map(function (x) {
        return x.height;
      });
      return hs.reduce(function (a, b) {
        return a + b;
      }, "");
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sectionvue_type_script_lang_js_ = (Sectionvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&id=18f3639b&prod&lang=css&
var Sectionvue_type_style_index_0_id_18f3639b_prod_lang_css_ = __webpack_require__(760);
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=style&index=0&id=18f3639b&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js_,
  Sectionvue_type_template_id_18f3639b_render,
  Sectionvue_type_template_id_18f3639b_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Section = (Section_component.exports);
;// CONCATENATED MODULE: ./src/components/js/botbar.js


function botbar_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = botbar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function botbar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return botbar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return botbar_arrayLikeToArray(o, minLen); }
function botbar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }


var botbar_MINUTE15 = constants.MINUTE15,
  botbar_MINUTE = constants.MINUTE,
  botbar_HOUR = constants.HOUR,
  botbar_DAY = constants.DAY,
  botbar_WEEK = constants.WEEK,
  botbar_MONTH = constants.MONTH,
  botbar_YEAR = constants.YEAR,
  botbar_MONTHMAP = constants.MONTHMAP;
var Botbar = /*#__PURE__*/function () {
  function Botbar(canvas, comp) {
    classCallCheck_classCallCheck(this, Botbar);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.layout = this.$p.layout;
  }
  createClass_createClass(Botbar, [{
    key: "update",
    value: function update() {
      this.grid_0 = this.layout.grids[0];
      var width = this.layout.botbar.width;
      var height = this.layout.botbar.height;
      var sb = this.layout.grids[0].sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      //this.ctx.fillRect(0, 0, width, height)
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(Math.floor(width + 1), 0.5);
      this.ctx.stroke();
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = botbar_createForOfIteratorHelper(this.layout.botbar.xs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          var lbl = this.format_date(p);
          if (p[0] > width - sb) continue;
          this.ctx.moveTo(p[0] - 0.5, 0);
          this.ctx.lineTo(p[0] - 0.5, 4.5);
          if (!this.lbl_highlight(p[1][0])) {
            this.ctx.globalAlpha = 0.85;
          }
          this.ctx.textAlign = 'center';
          this.ctx.fillText(lbl, p[0], 18);
          this.ctx.globalAlpha = 1;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      this.apply_shaders();
      if (this.$p.cursor.x && this.$p.cursor.t !== undefined) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.layout.grids[0];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };
      var _iterator2 = botbar_createForOfIteratorHelper(this.comp.bot_shaders),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "panel",
    value: function panel() {
      var lbl = this.format_cursor_x();
      this.ctx.fillStyle = this.$p.colors.panel;
      var measure = this.ctx.measureText(lbl + '    ');
      var panwidth = Math.floor(measure.width);
      var cursor = this.$p.cursor.x;
      var x = Math.floor(cursor - panwidth * 0.5);
      var y = -0.5;
      var panheight = this.comp.config.PANHEIGHT;
      this.ctx.fillRect(x, y, panwidth, panheight + 0.5);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(lbl, cursor, y + 16);
    }
  }, {
    key: "format_date",
    value: function format_date(p) {
      var t = p[1][0];
      t = this.grid_0.ti_map.i2t(t);
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;
      var tZ = t + k * this.$p.timezone * botbar_HOUR;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(tZ);
      if (p[2] === botbar_YEAR || utils.year_start(t) === t) {
        return d.getUTCFullYear();
      }
      if (p[2] === botbar_MONTH || utils.month_start(t) === t) {
        return botbar_MONTHMAP[d.getUTCMonth()];
      }
      // TODO(*) see grid_maker.js
      if (utils.day_start(tZ) === tZ) return d.getUTCDate();
      var h = utils.add_zero(d.getUTCHours());
      var m = utils.add_zero(d.getUTCMinutes());
      return h + ':' + m;
    }
  }, {
    key: "format_cursor_x",
    value: function format_cursor_x() {
      var t = this.$p.cursor.t;
      t = this.grid_0.ti_map.i2t(t);
      //let ti = this.$p.interval
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(t + k * this.$p.timezone * botbar_HOUR);
      if (ti === botbar_YEAR) {
        return d.getUTCFullYear();
      }
      if (ti < botbar_YEAR) {
        var yr = '`' + "".concat(d.getUTCFullYear()).slice(-2);
        var mo = botbar_MONTHMAP[d.getUTCMonth()];
        var dd = '01';
      }
      if (ti <= botbar_WEEK) dd = d.getUTCDate();
      var date = "".concat(dd, " ").concat(mo, " ").concat(yr);
      var time = '';
      if (ti < botbar_DAY) {
        var h = utils.add_zero(d.getUTCHours());
        var m = utils.add_zero(d.getUTCMinutes());
        time = h + ':' + m;
      }
      return "".concat(date, "  ").concat(time);
    }

    // Highlights the begining of a time interval
    // TODO: improve. Problem: let's say we have a new month,
    // but if there is no grid line in place, there
    // will be no month name on t-axis. Sad.
    // Solution: manipulate the grid, skew it, you know
  }, {
    key: "lbl_highlight",
    value: function lbl_highlight(t) {
      var ti = this.$p.interval;
      if (t === 0) return true;
      if (utils.month_start(t) === t) return true;
      if (utils.day_start(t) === t) return true;
      if (ti <= botbar_MINUTE15 && t % botbar_HOUR === 0) return true;
      return false;
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
  return Botbar;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=script&lang=js&
// The bottom bar (yep, that thing with a bunch of dates)



/* harmony default export */ const Botbarvue_type_script_lang_js_ = ({
  name: 'Botbar',
  mixins: [canvas],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'rerender', 'tv_id', 'config', 'shaders', 'timezone'],
  computed: {
    bot_shaders: function bot_shaders() {
      return this.$props.shaders.filter(function (x) {
        return x.target === 'botbar';
      });
    }
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Botbar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var sett = this.$props.layout.botbar;
    return this.create_canvas(h, 'botbar', {
      position: {
        x: 0,
        y: sett.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: sett.width,
        height: sett.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  }
});
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Botbarvue_type_script_lang_js_ = (Botbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=style&index=0&id=1cb09285&prod&lang=css&
var Botbarvue_type_style_index_0_id_1cb09285_prod_lang_css_ = __webpack_require__(495);
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=style&index=0&id=1cb09285&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Botbar.vue
var Botbar_render, Botbar_staticRenderFns
;

;


/* normalize component */

var Botbar_component = normalizeComponent(
  components_Botbarvue_type_script_lang_js_,
  Botbar_render,
  Botbar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Botbar = (Botbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Keyboard.vue?vue&type=script&lang=js&
/* harmony default export */ const Keyboardvue_type_script_lang_js_ = ({
  name: 'Keyboard',
  created: function created() {
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('keypress', this.keypress);
    this._listeners = {};
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('keypress', this.keypress);
  },
  methods: {
    keydown: function keydown(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keydown) {
          l.keydown(event);
        } else {
          console.warn("No 'keydown' listener for ".concat(id));
        }
      }
    },
    keyup: function keyup(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keyup) {
          l.keyup(event);
        } else {
          console.warn("No 'keyup' listener for ".concat(id));
        }
      }
    },
    keypress: function keypress(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keypress) {
          l.keypress(event);
        } else {
          console.warn("No 'keypress' listener for ".concat(id));
        }
      }
    },
    register: function register(listener) {
      this._listeners[listener.id] = listener;
    },
    remove: function remove(listener) {
      delete this._listeners[listener.id];
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/Keyboard.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Keyboardvue_type_script_lang_js_ = (Keyboardvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Keyboard.vue
var Keyboard_render, Keyboard_staticRenderFns
;



/* normalize component */
;
var Keyboard_component = normalizeComponent(
  components_Keyboardvue_type_script_lang_js_,
  Keyboard_render,
  Keyboard_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Keyboard = (Keyboard_component.exports);
;// CONCATENATED MODULE: ./src/mixins/datatrack.js
// Data tracker/watcher


/* harmony default export */ const datatrack = ({
  methods: {
    data_changed: function data_changed() {
      var n = this.ohlcv;
      var changed = false;
      if (this._data_n0 !== n[0] && this._data_len !== n.length) {
        changed = true;
      }
      this.check_all_data(changed);
      if (this.ti_map.ib) {
        this.reindex_delta(n[0], this._data_n0);
      }
      this._data_n0 = n[0];
      this._data_len = n.length;
      this.save_data_t();
      return changed;
    },
    check_all_data: function check_all_data(changed) {
      // If length of data in the Structure changed by > 1 point
      // emit a special event for DC to recalc the scripts
      // TODO: check overlays data too
      var len = this._data_len || 0;
      if (Math.abs(this.ohlcv.length - len) > 1 || this._data_n0 !== this.ohlcv[0]) {
        this.$emit('custom-event', {
          event: 'data-len-changed',
          args: []
        });
      }
    },
    reindex_delta: function reindex_delta(n, p) {
      n = n || [[0]];
      p = p || [[0]];
      var dt = n[0] - p[0];
      if (dt !== 0 && this._data_t) {
        // Convert t back to index
        try {
          // More precise method first
          var nt = this._data_t + 0.01; // fix for the filter lib
          var res = utils.fast_nearest(this.ohlcv, nt);
          var cndl = this.ohlcv[res[0]];
          var off = (nt - cndl[0]) / this.interval_ms;
          this["goto"](res[0] + off);
        } catch (e) {
          this["goto"](this.ti_map.t2i(this._data_t));
        }
      }
    },
    save_data_t: function save_data_t() {
      this._data_t = this.ti_map.i2t(this.range[1]); // save as t
    }
  },
  data: function data() {
    return {
      _data_n0: null,
      _data_len: 0,
      _data_t: 0
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/ti_mapping.js




// Time-index mapping (for non-linear t-axis)


var MAX_ARR = Math.pow(2, 32);

// 3 MODES of index calculation for overlays/subcharts:
// ::: indexSrc :::
// * "map"      -> use TI mapping functions to detect index
//                 (slowest, for stocks only. DEFAULT)
//
// * "calc"     -> calculate shift between sub & data
//                 (faster, but overlay data should be perfectly
//                  align with the main chart,
//                  1-1 candle/data point. Supports Renko)
//
// * "data"     -> overlay data should come with candle index
//                 (fastest, supports Renko)
var TI = /*#__PURE__*/function () {
  function TI() {
    classCallCheck_classCallCheck(this, TI);
    this.ib = false;
  }
  createClass_createClass(TI, [{
    key: "init",
    value: function init(params, res) {
      var sub = params.sub,
        interval = params.interval,
        meta = params.meta,
        $p = params.$props,
        interval_ms = params.interval_ms,
        sub_start = params.sub_start,
        ib = params.ib;
      this.ti_map = [];
      this.it_map = [];
      this.sub_i = [];
      this.ib = ib;
      this.sub = res;
      this.ss = sub_start;
      this.tf = interval_ms;
      var start = meta.sub_start;

      // Skip mapping for the regular mode
      if (this.ib) {
        this.map_sub(res);
      }
    }

    // Make maps for the main subset
  }, {
    key: "map_sub",
    value: function map_sub(res) {
      for (var i = 0; i < res.length; i++) {
        var t = res[i][0];
        var _i = this.ss + i;
        this.ti_map[t] = _i;
        this.it_map[_i] = t;

        // Overwrite t with i
        var copy = _toConsumableArray(res[i]);
        copy[0] = _i;
        this.sub_i.push(copy);
      }
    }

    // Map overlay data
    // TODO: parse() called 3 times instead of 2 for 'spx_sample.json'
  }, {
    key: "parse",
    value: function parse(data, mode) {
      if (!this.ib || !this.sub[0] || mode === 'data') return data;
      var res = [];
      var k = 0; // Candlestick index

      if (mode === 'calc') {
        var shift = utils.index_shift(this.sub, data);
        for (var i = 0; i < data.length; i++) {
          var _i = this.ss + i;
          var copy = _toConsumableArray(data[i]);
          copy[0] = _i + shift;
          res.push(copy);
        }
        return res;
      }

      // If indicator data starts after ohlcv, calc the first index
      if (data.length) {
        try {
          var k1 = utils.fast_nearest(this.sub, data[0][0])[0];
          if (k1 !== null && k1 >= 0) k = k1;
        } catch (e) {}
      }
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];
      for (var i = 0; i < data.length; i++) {
        var _copy = _toConsumableArray(data[i]);
        var tk = this.sub[k][0];
        var t = data[i][0];
        var index = this.ti_map[t];
        if (index === undefined) {
          // Linear extrapolation
          if (t < t0 || t > tN) {
            index = this.ss + k - (tk - t) / this.tf;
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }

          // Linear interpolation
          else {
            var tk2 = this.sub[k + 1][0];
            index = tk === tk2 ? this.ss + k : this.ss + k + (t - tk) / (tk2 - tk);
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }
        }
        // Race of data points & sub points (ohlcv)
        // (like turn based increments)
        while (k + 1 < this.sub.length - 1 && t > this.sub[k + 1][0]) {
          k++;
          tk = this.sub[k][0];
        }
        _copy[0] = index;
        res.push(_copy);
      }
      return res;
    }

    // index => time
  }, {
    key: "i2t",
    value: function i2t(i) {
      if (!this.ib || !this.sub.length) return i; // Regular mode

      // Discrete mapping
      var res = this.it_map[i];
      if (res !== undefined) return res;
      // Linear extrapolation
      else if (i >= this.ss + this.sub_i.length) {
        var di = i - (this.ss + this.sub_i.length) + 1;
        var last = this.sub[this.sub.length - 1];
        return last[0] + di * this.tf;
      } else if (i < this.ss) {
        var _di = i - this.ss;
        return this.sub[0][0] + _di * this.tf;
      }

      // Linear Interpolation
      var i1 = Math.floor(i) - this.ss;
      var i2 = i1 + 1;
      var len = this.sub.length;
      if (i2 >= len) i2 = len - 1;
      var sub1 = this.sub[i1];
      var sub2 = this.sub[i2];
      if (sub1 && sub2) {
        var t1 = sub1[0];
        var t2 = sub2[0];
        return t1 + (t2 - t1) * (i - i1 - this.ss);
      }
      return undefined;
    }

    // Map or bypass depending on the mode
  }, {
    key: "i2t_mode",
    value: function i2t_mode(i, mode) {
      return mode === 'data' ? i : this.i2t(i);
    }

    // time => index
    // TODO: when switch from IB mode to regular tools
    // disappear (bc there is no more mapping)
  }, {
    key: "t2i",
    value: function t2i(t) {
      if (!this.sub.length) return undefined;

      // Discrete mapping
      var res = this.ti_map[t];
      if (res !== undefined) return res;
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];

      // Linear extrapolation
      if (t < t0) {
        return this.ss - (t0 - t) / this.tf;
      } else if (t > tN) {
        var k = this.sub.length - 1;
        return this.ss + k - (tN - t) / this.tf;
      }
      try {
        // Linear Interpolation
        var i = utils.fast_nearest(this.sub, t);
        var tk = this.sub[i[0]][0];
        var tk2 = this.sub[i[1]][0];
        var _k = (t - tk) / (tk2 - tk);
        return this.ss + i[0] + _k * (i[1] - i[0]);
      } catch (e) {}
      return undefined;
    }

    // Auto detect: is it time or index?
    // Assuming that index-based mode is ON
  }, {
    key: "smth2i",
    value: function smth2i(smth) {
      if (smth > MAX_ARR) {
        return this.t2i(smth); // it was time
      } else {
        return smth; // it was an index
      }
    }
  }, {
    key: "smth2t",
    value: function smth2t(smth) {
      if (smth < MAX_ARR) {
        return this.i2t(smth); // it was an index
      } else {
        return smth; // it was time
      }
    }

    // Global Time => Index (uses all data, approx. method)
    // Used by tv.goto()
  }, {
    key: "gt2i",
    value: function gt2i(smth, ohlcv) {
      if (smth > MAX_ARR) {
        var E = 0.1; // Fixes the arrayslicer bug
        var _Utils$fast_nearest = utils.fast_nearest(ohlcv, smth + E),
          _Utils$fast_nearest2 = _slicedToArray(_Utils$fast_nearest, 2),
          i1 = _Utils$fast_nearest2[0],
          i2 = _Utils$fast_nearest2[1];
        if (typeof i1 === 'number') {
          return i1;
        } else {
          return this.t2i(smth); // fallback
        }
      } else {
        return smth; // it was an index
      }
    }
  }]);
  return TI;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=script&lang=js&













/* harmony default export */ const Chartvue_type_script_lang_js_ = ({
  name: 'Chart',
  components: {
    GridSection: Section,
    Botbar: components_Botbar,
    Keyboard: Keyboard
  },
  mixins: [shaders, datatrack],
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'applyShaders', 'skin', 'timezone', 'enableZoom', 'decimalPlace', 'ignore_OHLC', 'priceLine', 'ignoreNegativeIndex', 'enableCrosshair'],
  data: function data() {
    return {
      // Current data slice
      sub: [],
      // Time range
      range: [],
      // Candlestick interval
      interval: 0,
      // Crosshair states
      cursor: {
        x: null,
        y: null,
        t: null,
        y$: null,
        grid_id: null,
        locked: false,
        values: {},
        scroll_lock: false,
        mode: utils.xmode()
      },
      // A trick to re-render botbar
      rerender: 0,
      // Layers meta-props (changing behaviour)
      layers_meta: {},
      // Y-transforms (for y-zoom and -shift)
      y_transforms: {},
      // Default OHLCV settings (when using DataStructure v1.0)
      settings_ohlcv: {},
      // Default overlay settings
      settings_ov: {},
      // Meta data
      last_candle: [],
      last_values: {},
      sub_start: undefined,
      activated: false,
      legendTxtConfig: undefined
    };
  },
  computed: {
    // Component-specific props subsets:
    main_section: function main_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.onchart, 'onchart');
      p.data.push({
        type: this.chart.type || 'Candles',
        main: true,
        data: this.sub,
        i0: this.sub_start,
        settings: this.chart.settings || this.settings_ohlcv,
        grid: this.chart.grid || {},
        last: this.last_candle
      });
      p.overlays = this.$props.overlays;
      return p;
    },
    sub_section: function sub_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.offchart, 'offchart');
      p.overlays = this.$props.overlays;
      return p;
    },
    botbar_props: function botbar_props() {
      var p = Object.assign({}, this.common_props());
      p.width = p.layout.botbar.width;
      p.height = p.layout.botbar.height;
      p.rerender = this.rerender;
      return p;
    },
    offsub: function offsub() {
      return this.overlay_subset(this.offchart, 'offchart');
    },
    // Datasets: candles, onchart, offchart indicators
    ohlcv: function ohlcv() {
      return this.$props.data.ohlcv || this.chart.data || [];
    },
    chart: function chart() {
      return this.$props.data.chart || {
        grid: {}
      };
    },
    onchart: function onchart() {
      return this.$props.data.onchart || [];
    },
    offchart: function offchart() {
      return this.$props.data.offchart || [];
    },
    filter: function filter() {
      return this.$props.ib ? utils.fast_filter_i : utils.fast_filter;
    },
    styles: function styles() {
      var w = this.$props.toolbar ? this.$props.config.TOOLBAR : 0;
      return {
        'margin-left': "".concat(w, "px")
      };
    },
    meta: function meta() {
      return {
        last: this.last_candle,
        sub_start: this.sub_start,
        activated: this.activated
      };
    },
    forced_tf: function forced_tf() {
      return this.chart.tf;
    }
  },
  watch: {
    width: function width() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    height: function height() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    ib: function ib(nw) {
      if (!nw) {
        // Change range index => time
        var t1 = this.ti_map.i2t(this.range[0]);
        var t2 = this.ti_map.i2t(this.range[1]);
        utils.overwrite(this.range, [t1, t2]);
        this.interval = this.interval_ms;
      } else {
        this.init_range(); // TODO: calc index range instead
        utils.overwrite(this.range, this.range);
        this.interval = 1;
      }
      var sub = this.subset();
      utils.overwrite(this.sub, sub);
      this.update_layout();
    },
    timezone: function timezone() {
      this.update_layout();
    },
    colors: function colors() {
      utils.overwrite(this.range, this.range);
    },
    forced_tf: function forced_tf(n, p) {
      this.update_layout(true);
      this.ce('exec-all-scripts');
    },
    data: {
      handler: function handler(n, p) {
        if (!this.sub.length) this.init_range();
        var sub = this.subset();
        // Fixes Infinite loop warn, when the subset is empty
        // TODO: Consider removing 'sub' from data entirely
        if (this.sub.length || sub.length) {
          utils.overwrite(this.sub, sub);
        }
        var nw = this.data_changed();
        this.update_layout(nw);
        utils.overwrite(this.range, this.range);
        this.cursor.scroll_lock = !!n.scrollLock;
        if (n.scrollLock && this.cursor.locked) {
          this.cursor.locked = false;
        }
        if (this._hook_data) this.ce('?chart-data', nw);
        this.update_last_values();
        // TODO: update legend values for overalys
        this.rerender++;
        var findMain = this.main_section.data.find(function (d) {
          return d.main;
        });
        // this
        //   this.$emit('custom-event', {})
        //   console.log('this.rerender',findMain,this.sub.length)
      },

      deep: true
    }
  },
  created: function created() {
    // Context for text measurements
    this.ctx = new context(this.$props);

    // Initial layout (All measurments for the chart)
    this.init_range();
    this.sub = this.subset();
    utils.overwrite(this.range, this.range); // Fix for IB mode
    this._layout = new layout(this);

    // Updates current cursor values
    this.updater = new updater(this);
    this.update_last_values();
    this.init_shaders(this.skin);
  },
  methods: {
    range_changed: function range_changed(r) {
      // Overwite & keep the original references
      // Quick fix for IB mode (switch 2 next lines)
      // TODO: wtf?
      var sub = this.subset(r);
      // console.log('this.range before update',this.range)
      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout();
      // console.log('this.range after update',this.sub.length,r,this.range)
      // console.log('range_changes_working',this.ignoreNegativeIndex)
      if (this.ignoreNegativeIndex) {
        // let r2 = this.ti_map.t2i(r[0])
        this.$emit('range-changed', r, this.range);
      } else {
        this.$emit('range-changed', r);
      }
      if (this.$props.ib) this.save_data_t();

      // console.log('this.ti_map.t2i(r[0])',this.ti_map.t2i(r[0]))
    },
    "goto": function goto(t) {
      var dt = this.range[1] - this.range[0];
      this.range_changed([t - dt, t]);
    },
    setRange: function setRange(t1, t2) {
      this.range_changed([t1, t2]);
    },
    cursor_changed: function cursor_changed(e) {
      if (e.mode) this.cursor.mode = e.mode;
      if (this.cursor.mode !== 'explore') {
        this.updater.sync(e);
      }
      if (this._hook_xchanged) this.ce('?x-changed', e);
    },
    cursor_locked: function cursor_locked(state) {
      if (this.cursor.scroll_lock && state) return;
      this.cursor.locked = state;
      if (this._hook_xlocked) this.ce('?x-locked', state);
    },
    calc_interval: function calc_interval() {
      var _this = this;
      var tf = utils.parse_tf(this.forced_tf);
      if (this.ohlcv.length < 2 && !tf) return;
      this.interval_ms = tf || utils.detect_interval(this.ohlcv);
      this.interval = this.$props.ib ? 1 : this.interval_ms;
      utils.warn(function () {
        return _this.$props.ib && !_this.chart.tf;
      }, constants.IB_TF_WARN, constants.SECOND);
    },
    set_ytransform: function set_ytransform(s) {
      var obj = this.y_transforms[s.grid_id] || {};
      Object.assign(obj, s);
      this.$set(this.y_transforms, s.grid_id, obj);
      this.update_layout();
      utils.overwrite(this.range, this.range);
    },
    default_range: function default_range() {
      var dl = this.$props.config.DEFAULT_LEN;
      var ml = this.$props.config.MINIMUM_LEN + 0.5;
      var l = this.ohlcv.length - 1;
      if (this.ohlcv.length < 2) return;
      if (this.ohlcv.length <= dl) {
        var s = 0,
          d = ml;
      } else {
        s = l - dl, d = 0.5;
      }
      if (!this.$props.ib) {
        utils.overwrite(this.range, [this.ohlcv[s][0] - this.interval * d, this.ohlcv[l][0] + this.interval * ml]);
      } else {
        utils.overwrite(this.range, [s - this.interval * d, l + this.interval * ml]);
      }
    },
    subset: function subset(range) {
      if (range === void 0) {
        range = this.range;
      }
      var _this$filter = this.filter(this.ohlcv, range[0] - this.interval, range[1]),
        _this$filter2 = _slicedToArray(_this$filter, 2),
        res = _this$filter2[0],
        index = _this$filter2[1];
      this.ti_map = new TI();
      if (res) {
        this.sub_start = index;
        this.ti_map.init(this, res);
        if (!this.$props.ib) return res || [];
        return this.ti_map.sub_i;
      }
      return [];
    },
    common_props: function common_props() {
      return {
        title_txt: this.chart.name || this.$props.title_txt,
        layout: this._layout,
        sub: this.sub,
        range: this.range,
        interval: this.interval,
        cursor: this.cursor,
        colors: this.$props.colors,
        font: this.$props.font,
        y_ts: this.y_transforms,
        tv_id: this.$props.tv_id,
        config: this.$props.config,
        buttons: this.$props.buttons,
        meta: this.meta,
        skin: this.$props.skin,
        noidea: true
      };
    },
    overlay_subset: function overlay_subset(source, side) {
      var _this2 = this;
      return source.map(function (d, i) {
        var res = utils.fast_filter(d.data, _this2.ti_map.i2t_mode(_this2.range[0] - _this2.interval, d.indexSrc), _this2.ti_map.i2t_mode(_this2.range[1], d.indexSrc));
        return {
          type: d.type,
          name: utils.format_name(d),
          data: _this2.ti_map.parse(res[0] || [], d.indexSrc || 'map'),
          settings: d.settings || _this2.settings_ov,
          grid: d.grid || {},
          tf: utils.parse_tf(d.tf),
          i0: res[1],
          loading: d.loading,
          some: 1,
          last: (_this2.last_values[side] || [])[i]
        };
      });
    },
    section_props: function section_props(i) {
      return i === 0 ? this.main_section : this.sub_section;
    },
    init_range: function init_range() {
      this.calc_interval();
      this.default_range();
    },
    layer_meta_props: function layer_meta_props(d) {
      // TODO: check reactivity when layout is changed
      if (!(d.grid_id in this.layers_meta)) {
        this.$set(this.layers_meta, d.grid_id, {});
      }
      this.$set(this.layers_meta[d.grid_id], d.layer_id, d);

      // Rerender
      this.update_layout();
    },
    remove_meta_props: function remove_meta_props(grid_id, layer_id) {
      if (grid_id in this.layers_meta) {
        this.$delete(this.layers_meta[grid_id], layer_id);
      }
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'botbar');
      // console.log('emit_custom_event',d)
      this.$emit('custom-event', d);
      if (d.event === 'remove-layer-meta') {
        this.remove_meta_props.apply(this, _toConsumableArray(d.args));
      }
    },
    update_layout: function update_layout(clac_tf) {
      if (clac_tf) this.calc_interval();
      var lay = new layout(this);
      utils.copy_layout(this._layout, lay);
      if (this._hook_update) this.ce('?chart-update', lay);
    },
    legend_button_click: function legend_button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.register(event);
    },
    remove_kb: function remove_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.remove(event);
    },
    update_last_values: function update_last_values() {
      var _this3 = this;
      this.last_candle = this.ohlcv ? this.ohlcv[this.ohlcv.length - 1] : undefined;
      this.last_values = {
        onchart: [],
        offchart: []
      };
      this.onchart.forEach(function (x, i) {
        var d = x.data || [];
        _this3.last_values.onchart[i] = d[d.length - 1];
      });
      this.offchart.forEach(function (x, i) {
        var d = x.data || [];
        _this3.last_values.offchart[i] = d[d.length - 1];
      });
    },
    // Hook events for extensions
    ce: function ce(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this.emit_custom_event({
        event: event,
        args: args
      });
    },
    // Set hooks list (called from an extension)
    hooks: function hooks() {
      var _this4 = this;
      for (var _len2 = arguments.length, list = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        list[_key2] = arguments[_key2];
      }
      list.forEach(function (x) {
        return _this4["_hook_".concat(x)] = true;
      });
    }
  },
  mounted: function mounted() {
    console.log(this._layout);
  }
});
;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Chartvue_type_script_lang_js_ = (Chartvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Chart.vue





/* normalize component */
;
var Chart_component = normalizeComponent(
  components_Chartvue_type_script_lang_js_,
  Chartvue_type_template_id_9ce1cf84_render,
  Chartvue_type_template_id_9ce1cf84_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Chart = (Chart_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=template&id=320099a6&
var Toolbarvue_type_template_id_320099a6_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    key: _vm.tool_count,
    staticClass: "trading-vue-toolbar",
    style: _vm.styles
  }, _vm._l(_vm.groups, function (tool, i) {
    return tool.icon && !tool.hidden ? _c("toolbar-item", {
      key: i,
      attrs: {
        data: tool,
        subs: _vm.sub_map,
        dc: _vm.data,
        config: _vm.config,
        colors: _vm.colors,
        selected: _vm.is_selected(tool)
      },
      on: {
        "item-selected": _vm.selected
      }
    }) : _vm._e();
  }), 1);
};
var Toolbarvue_type_template_id_320099a6_staticRenderFns = [];
Toolbarvue_type_template_id_320099a6_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=template&id=320099a6&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=template&id=5ce1aaa3&
var ToolbarItemvue_type_template_id_5ce1aaa3_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    "class": ["trading-vue-tbitem", _vm.selected ? "selected-item" : ""],
    style: _vm.item_style,
    on: {
      click: function click($event) {
        return _vm.emit_selected("click");
      },
      mousedown: _vm.mousedown,
      touchstart: _vm.mousedown,
      touchend: function touchend($event) {
        return _vm.emit_selected("touch");
      }
    }
  }, [_c("div", {
    staticClass: "trading-vue-tbicon tvjs-pixelated",
    style: _vm.icon_style
  }), _vm._v(" "), _vm.data.group ? _c("div", {
    staticClass: "trading-vue-tbitem-exp",
    style: _vm.exp_style,
    on: {
      click: _vm.exp_click,
      mousedown: _vm.expmousedown,
      mouseover: _vm.expmouseover,
      mouseleave: _vm.expmouseleave
    }
  }, [_vm._v("\n        ᐳ\n    ")]) : _vm._e(), _vm._v(" "), _vm.show_exp_list ? _c("item-list", {
    attrs: {
      config: _vm.config,
      items: _vm.data.items,
      colors: _vm.colors,
      dc: _vm.dc
    },
    on: {
      "close-list": _vm.close_list,
      "item-selected": _vm.emit_selected_sub
    }
  }) : _vm._e()], 1);
};
var ToolbarItemvue_type_template_id_5ce1aaa3_staticRenderFns = [];
ToolbarItemvue_type_template_id_5ce1aaa3_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=template&id=5ce1aaa3&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=template&id=75847764&
var ItemListvue_type_template_id_75847764_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-item-list",
    style: _vm.list_style(),
    on: {
      mousedown: _vm.thismousedown
    }
  }, _vm._l(_vm.items, function (item) {
    return !item.hidden ? _c("div", {
      "class": _vm.item_class(item),
      style: _vm.item_style(item),
      on: {
        click: function click(e) {
          return _vm.item_click(e, item);
        }
      }
    }, [_c("div", {
      staticClass: "trading-vue-tbicon tvjs-pixelated",
      style: _vm.icon_style(item)
    }), _vm._v(" "), _c("div", [_vm._v(_vm._s(item.type))])]) : _vm._e();
  }), 0);
};
var ItemListvue_type_template_id_75847764_staticRenderFns = [];
ItemListvue_type_template_id_75847764_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=template&id=75847764&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=script&lang=js&
/* harmony default export */ const ItemListvue_type_script_lang_js_ = ({
  name: 'ItemList',
  props: ['config', 'items', 'colors', 'dc'],
  data: function data() {
    return {};
  },
  computed: {},
  mounted: function mounted() {
    window.addEventListener('mousedown', this.onmousedown);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('mousedown', this.onmousedown);
  },
  methods: {
    list_style: function list_style() {
      var conf = this.$props.config;
      var w = conf.TOOLBAR;
      var brd = this.colors.tbListBorder || this.colors.grid;
      var bstl = "1px solid ".concat(brd);
      return {
        left: "".concat(w, "px"),
        background: this.colors.back,
        borderTop: bstl,
        borderRight: bstl,
        borderBottom: bstl
      };
    },
    item_class: function item_class(item) {
      if (this.dc.tool === item.type) {
        return 'tvjs-item-list-item selected-item';
      }
      return 'tvjs-item-list-item';
    },
    item_style: function item_style(item) {
      var conf = this.$props.config;
      var h = conf.TB_ICON + conf.TB_ITEM_M * 2 + 8;
      var sel = this.dc.tool === item.type;
      return {
        height: "".concat(h, "px"),
        color: sel ? undefined : '#888888'
      };
    },
    icon_style: function icon_style(data) {
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var im = conf.TB_ITEM_M;
      return {
        'background-image': "url(".concat(data.icon, ")"),
        'width': '25px',
        'height': '25px',
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    item_click: function item_click(e, item) {
      e.cancelBubble = true;
      this.$emit('item-selected', item);
      this.$emit('close-list');
    },
    onmousedown: function onmousedown() {
      this.$emit('close-list');
    },
    thismousedown: function thismousedown(e) {
      e.stopPropagation();
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ItemListvue_type_script_lang_js_ = (ItemListvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=style&index=0&id=75847764&prod&lang=css&
var ItemListvue_type_style_index_0_id_75847764_prod_lang_css_ = __webpack_require__(171);
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=style&index=0&id=75847764&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ItemList.vue



;


/* normalize component */

var ItemList_component = normalizeComponent(
  components_ItemListvue_type_script_lang_js_,
  ItemListvue_type_template_id_75847764_render,
  ItemListvue_type_template_id_75847764_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ItemList = (ItemList_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=script&lang=js&


/* harmony default export */ const ToolbarItemvue_type_script_lang_js_ = ({
  name: 'ToolbarItem',
  components: {
    ItemList: ItemList
  },
  props: ['data', 'selected', 'colors', 'tv_id', 'config', 'dc', 'subs'],
  data: function data() {
    return {
      exp_hover: false,
      show_exp_list: false,
      sub_item: null
    };
  },
  computed: {
    item_style: function item_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return this.splitter;
      }
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      var b = this.exp_hover ? 0 : 3;
      return {
        'width': "".concat(s, "px"),
        'height': "".concat(s, "px"),
        'margin': "8px ".concat(m, "px 0px ").concat(m, "px"),
        'border-radius': "3px ".concat(b, "px ").concat(b, "px 3px")
      };
    },
    icon_style: function icon_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return {};
      }
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var sz = conf.TB_ICON;
      var im = conf.TB_ITEM_M;
      var ic = this.sub_item ? this.sub_item.icon : this.$props.data.icon;
      return {
        'background-image': "url(".concat(ic, ")"),
        'width': "".concat(sz, "px"),
        'height': "".concat(sz, "px"),
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    exp_style: function exp_style() {
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var s = conf.TB_ICON * 0.5 + im;
      var p = (conf.TOOLBAR - s * 2) / 4;
      return {
        padding: "".concat(s, "px ").concat(p, "px"),
        transform: this.show_exp_list ? 'scale(-0.6, 1)' : 'scaleX(0.6)'
      };
    },
    splitter: function splitter() {
      var conf = this.$props.config;
      var colors = this.$props.colors;
      var c = colors.grid;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      return {
        'width': "".concat(s, "px"),
        'height': '1px',
        'margin': "8px ".concat(m, "px 8px ").concat(m, "px"),
        'background-color': c
      };
    }
  },
  mounted: function mounted() {
    if (this.data.group) {
      var type = this.subs[this.data.group];
      var item = this.data.items.find(function (x) {
        return x.type === type;
      });
      if (item) this.sub_item = item;
    }
  },
  methods: {
    mousedown: function mousedown(e) {
      var _this = this;
      this.click_start = utils.now();
      this.click_id = setTimeout(function () {
        _this.show_exp_list = true;
      }, this.config.TB_ICON_HOLD);
    },
    expmouseover: function expmouseover() {
      this.exp_hover = true;
    },
    expmouseleave: function expmouseleave() {
      this.exp_hover = false;
    },
    expmousedown: function expmousedown(e) {
      if (this.show_exp_list) e.stopPropagation();
    },
    emit_selected: function emit_selected(src) {
      if (utils.now() - this.click_start > this.config.TB_ICON_HOLD) return;
      clearTimeout(this.click_id);
      //if (Utils.is_mobile && src === 'click') return
      // TODO: double firing
      if (!this.data.group) {
        this.$emit('item-selected', this.data);
      } else {
        var item = this.sub_item || this.data.items[0];
        this.$emit('item-selected', item);
      }
    },
    emit_selected_sub: function emit_selected_sub(item) {
      this.$emit('item-selected', item);
      this.sub_item = item;
    },
    exp_click: function exp_click(e) {
      if (!this.data.group) return;
      e.cancelBubble = true;
      this.show_exp_list = !this.show_exp_list;
    },
    close_list: function close_list() {
      this.show_exp_list = false;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ToolbarItemvue_type_script_lang_js_ = (ToolbarItemvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=style&index=0&id=5ce1aaa3&prod&lang=css&
var ToolbarItemvue_type_style_index_0_id_5ce1aaa3_prod_lang_css_ = __webpack_require__(915);
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=style&index=0&id=5ce1aaa3&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue



;


/* normalize component */

var ToolbarItem_component = normalizeComponent(
  components_ToolbarItemvue_type_script_lang_js_,
  ToolbarItemvue_type_template_id_5ce1aaa3_render,
  ToolbarItemvue_type_template_id_5ce1aaa3_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ToolbarItem = (ToolbarItem_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=script&lang=js&
function Toolbarvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Toolbarvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/* harmony default export */ const Toolbarvue_type_script_lang_js_ = ({
  name: 'Toolbar',
  components: {
    ToolbarItem: ToolbarItem
  },
  props: ['data', 'height', 'colors', 'tv_id', 'config'],
  data: function data() {
    return {
      tool_count: 0,
      sub_map: {}
    };
  },
  computed: {
    styles: function styles() {
      var colors = this.$props.colors;
      var b = this.$props.config.TB_BORDER;
      var w = this.$props.config.TOOLBAR - b;
      var c = colors.grid;
      var cb = colors.tbBack || colors.back;
      var brd = colors.tbBorder || colors.scale;
      var st = this.$props.config.TB_B_STYLE;
      return {
        'width': "".concat(w, "px"),
        'height': "".concat(this.$props.height - 3, "px"),
        'background-color': cb,
        'border-right': "".concat(b, "px ").concat(st, " ").concat(brd)
      };
    },
    groups: function groups() {
      var arr = [];
      var _iterator = Toolbarvue_type_script_lang_js_createForOfIteratorHelper(this.data.tools || []),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var tool = _step.value;
          if (!tool.group) {
            arr.push(tool);
            continue;
          }
          var g = arr.find(function (x) {
            return x.group === tool.group;
          });
          if (!g) {
            arr.push({
              group: tool.group,
              icon: tool.icon,
              items: [tool]
            });
          } else {
            g.items.push(tool);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    }
  },
  watch: {
    data: {
      handler: function handler(n) {
        // For some reason Vue.js doesn't want to
        // update 'tools' automatically when new item
        // is pushed/removed. Yo, Vue, I herd you
        // you want more dirty tricks?
        if (n.tools) this.tool_count = n.tools.length;
      },
      deep: true
    }
  },
  mounted: function mounted() {},
  methods: {
    selected: function selected(tool) {
      this.$emit('custom-event', {
        event: 'tool-selected',
        args: [tool.type]
      });
      if (tool.group) {
        // TODO: emit the sub map to DC (save)
        this.sub_map[tool.group] = tool.type;
      }
    },
    is_selected: function is_selected(tool) {
      var _this = this;
      if (tool.group) {
        return !!tool.items.find(function (x) {
          return x.type === _this.data.tool;
        });
      }
      return tool.type === this.data.tool;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Toolbarvue_type_script_lang_js_ = (Toolbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=style&index=0&id=320099a6&prod&lang=css&
var Toolbarvue_type_style_index_0_id_320099a6_prod_lang_css_ = __webpack_require__(452);
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=style&index=0&id=320099a6&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Toolbar.vue



;


/* normalize component */

var Toolbar_component = normalizeComponent(
  components_Toolbarvue_type_script_lang_js_,
  Toolbarvue_type_template_id_320099a6_render,
  Toolbarvue_type_template_id_320099a6_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Toolbar = (Toolbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=template&id=296e303a&
var Widgetsvue_type_template_id_296e303a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-widgets",
    style: {
      width: _vm.width + "px",
      height: _vm.height + "px"
    }
  }, _vm._l(Object.keys(_vm.map), function (id) {
    return _c(_vm.initw(id), {
      key: id,
      tag: "component",
      attrs: {
        id: id,
        main: _vm.map[id].ctrl,
        data: _vm.map[id].data,
        tv: _vm.tv,
        dc: _vm.dc
      }
    });
  }), 1);
};
var Widgetsvue_type_template_id_296e303a_staticRenderFns = [];
Widgetsvue_type_template_id_296e303a_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=template&id=296e303a&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=script&lang=js&
/* harmony default export */ const Widgetsvue_type_script_lang_js_ = ({
  name: 'Widgets',
  props: ['width', 'height', 'map', 'tv', 'dc'],
  methods: {
    initw: function initw(id) {
      return this.$props.map[id].cls;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Widgetsvue_type_script_lang_js_ = (Widgetsvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=style&index=0&id=296e303a&prod&lang=css&
var Widgetsvue_type_style_index_0_id_296e303a_prod_lang_css_ = __webpack_require__(13);
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=style&index=0&id=296e303a&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Widgets.vue



;


/* normalize component */

var Widgets_component = normalizeComponent(
  components_Widgetsvue_type_script_lang_js_,
  Widgetsvue_type_template_id_296e303a_render,
  Widgetsvue_type_template_id_296e303a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Widgets = (Widgets_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=template&id=1be6bf21&
var TheTipvue_type_template_id_1be6bf21_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-the-tip",
    style: _vm.style,
    domProps: {
      innerHTML: _vm._s(_vm.data.text)
    },
    on: {
      mousedown: function mousedown($event) {
        return _vm.$emit("remove-me");
      }
    }
  });
};
var TheTipvue_type_template_id_1be6bf21_staticRenderFns = [];
TheTipvue_type_template_id_1be6bf21_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=template&id=1be6bf21&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=script&lang=js&
/* harmony default export */ const TheTipvue_type_script_lang_js_ = ({
  name: 'TheTip',
  props: ['data'],
  computed: {
    style: function style() {
      return {
        background: this.data.color
      };
    }
  },
  mounted: function mounted() {
    var _this = this;
    setTimeout(function () {
      return _this.$emit('remove-me');
    }, 3000);
  }
});
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_TheTipvue_type_script_lang_js_ = (TheTipvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=style&index=0&id=1be6bf21&prod&lang=css&
var TheTipvue_type_style_index_0_id_1be6bf21_prod_lang_css_ = __webpack_require__(138);
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=style&index=0&id=1be6bf21&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/TheTip.vue



;


/* normalize component */

var TheTip_component = normalizeComponent(
  components_TheTipvue_type_script_lang_js_,
  TheTipvue_type_template_id_1be6bf21_render,
  TheTipvue_type_template_id_1be6bf21_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TheTip = (TheTip_component.exports);
;// CONCATENATED MODULE: ./src/mixins/xcontrol.js
function xcontrol_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = xcontrol_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function xcontrol_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return xcontrol_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return xcontrol_arrayLikeToArray(o, minLen); }
function xcontrol_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// extensions control

/* harmony default export */ const xcontrol = ({
  mounted: function mounted() {
    this.ctrllist();
    this.skin_styles();
  },
  methods: {
    // Build / rebuild component list
    ctrllist: function ctrllist() {
      this.ctrl_destroy();
      this.controllers = [];
      var _iterator = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          var name = x.Main.__name__;
          if (!this.xSettings[name]) {
            this.$set(this.xSettings, name, {});
          }
          var nc = new x.Main(this,
          // tv inst
          this.data,
          // dc
          this.xSettings[name] // settings
          );

          nc.name = name;
          this.controllers.push(nc);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return this.controllers;
    },
    // TODO: preventDefault
    pre_dc: function pre_dc(e) {
      var _iterator2 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.update) {
            ctrl.update(e);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    post_dc: function post_dc(e) {
      var _iterator3 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ctrl = _step3.value;
          if (ctrl.post_update) {
            ctrl.post_update(e);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    ctrl_destroy: function ctrl_destroy() {
      var _iterator4 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var ctrl = _step4.value;
          if (ctrl.destroy) ctrl.destroy();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    },
    skin_styles: function skin_styles() {
      var id = 'tvjs-skin-styles';
      var stbr = document.getElementById(id);
      if (stbr) {
        var parent = stbr.parentNode;
        parent.removeChild(stbr);
      }
      if (this.skin_proto && this.skin_proto.styles) {
        var sheet = document.createElement('style');
        sheet.setAttribute('id', id);
        sheet.innerHTML = this.skin_proto.styles;
        this.$el.appendChild(sheet);
      }
    }
  },
  computed: {
    ws: function ws() {
      var ws = {};
      var _iterator5 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var ctrl = _step5.value;
          if (ctrl.widgets) {
            for (var id in ctrl.widgets) {
              ws[id] = ctrl.widgets[id];
              ws[id].ctrl = ctrl;
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return ws;
    },
    skins: function skins() {
      var sks = {};
      var _iterator6 = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var x = _step6.value;
          for (var id in x.skins || {}) {
            sks[id] = x.skins[id];
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      return sks;
    },
    skin_proto: function skin_proto() {
      return this.skins[this.$props.skin];
    },
    colorpack: function colorpack() {
      var sel = this.skins[this.$props.skin];
      return sel ? sel.colors : undefined;
    }
  },
  watch: {
    // TODO: This is fast & dirty fix, need
    // to fix the actual reactivity problem
    skin: function skin(n, p) {
      if (n !== p) this.resetChart();
      this.skin_styles();
    },
    extensions: function extensions() {
      this.ctrllist();
    },
    xSettings: {
      handler: function handler(n, p) {
        var _iterator7 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step7;
        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var ctrl = _step7.value;
            if (ctrl.onsettings) {
              ctrl.onsettings(n, p);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      },
      deep: true
    }
  },
  data: function data() {
    return {
      controllers: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=script&lang=js&

function TradingVuevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function TradingVuevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }






/* harmony default export */ const TradingVuevue_type_script_lang_js_ = ({
  name: "TradingVue",
  components: {
    Chart: Chart,
    Toolbar: Toolbar,
    Widgets: Widgets,
    TheTip: TheTip
  },
  mixins: [xcontrol],
  props: {
    titleTxt: {
      type: String,
      "default": "TradingVue.js"
    },
    id: {
      type: String,
      "default": "trading-vue-js"
    },
    width: {
      type: Number,
      "default": 800
    },
    height: {
      type: Number,
      "default": 421
    },
    colorTitle: {
      type: String,
      "default": "#42b883"
    },
    colorBack: {
      type: String,
      "default": "#121826"
    },
    colorGrid: {
      type: String,
      "default": "#2f3240"
    },
    colorText: {
      type: String,
      "default": "#dedddd"
    },
    colorTextHL: {
      type: String,
      "default": "#fff"
    },
    colorScale: {
      type: String,
      "default": "#838383"
    },
    colorCross: {
      type: String,
      "default": "#8091a0"
    },
    colorCandleUp: {
      type: String,
      "default": "#23a776"
    },
    colorCandleDw: {
      type: String,
      "default": "#e54150"
    },
    colorWickUp: {
      type: String,
      "default": "#23a77688"
    },
    colorWickDw: {
      type: String,
      "default": "#e5415088"
    },
    colorWickSm: {
      type: String,
      "default": "transparent" // deprecated
    },

    colorVolUp: {
      type: String,
      "default": "#79999e42"
    },
    colorVolDw: {
      type: String,
      "default": "#ef535042"
    },
    colorPanel: {
      type: String,
      "default": "#565c68"
    },
    colorTbBack: {
      type: String
    },
    colorTbBorder: {
      type: String,
      "default": "#8282827d"
    },
    colors: {
      type: Object
    },
    font: {
      type: String,
      "default": constants.ChartConfig.FONT
    },
    toolbar: {
      type: Boolean,
      "default": false
    },
    data: {
      type: Object,
      required: true
    },
    // Your overlay classes here
    overlays: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    // Overwrites ChartConfig values,
    // see constants.js
    chartConfig: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    legendButtons: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    indexBased: {
      type: Boolean,
      "default": false
    },
    extensions: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    xSettings: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    skin: {
      type: String // Skin Name
    },

    timezone: {
      type: Number,
      "default": 0
    },
    enableZoom: {
      type: Boolean,
      "default": false
    },
    priceLine: {
      type: Boolean,
      "default": true
    },
    decimalPlace: {
      type: Number,
      "default": 2
    },
    applyShaders: {
      type: Boolean,
      "default": true
    },
    enableCrosshair: {
      type: Boolean,
      "default": false
    },
    enableArrow: {
      type: Boolean,
      "default": false
    },
    ignoreNegativeIndex: {
      type: Boolean,
      "default": false
    },
    ignore_OHLC: {
      type: Array[Object],
      "default": function _default() {
        return [];
      }
    }
  },
  data: function data() {
    return {
      reset: 0,
      tip: null
    };
  },
  computed: {
    // Copy a subset of TradingVue props
    chart_props: function chart_props() {
      var offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0;
      var chart_props = {
        title_txt: this.$props.titleTxt,
        overlays: this.$props.overlays.concat(this.mod_ovs),
        data: this.decubed,
        width: this.$props.width - offset,
        height: this.$props.height,
        font: this.font_comp,
        buttons: this.$props.legendButtons,
        toolbar: this.$props.toolbar,
        ib: this.$props.indexBased || this.index_based || false,
        colors: Object.assign({}, this.$props.colors || this.colorpack),
        skin: this.skin_proto,
        timezone: this.$props.timezone
      };
      this.parse_colors(chart_props.colors);
      return chart_props;
    },
    chart_config: function chart_config() {
      return Object.assign({}, constants.ChartConfig, this.$props.chartConfig);
    },
    decubed: function decubed() {
      var data = this.$props.data;
      if (data.data !== undefined) {
        // DataCube detected
        data.init_tvjs(this);
        return data.data;
      } else {
        return data;
      }
    },
    index_based: function index_based() {
      var base = this.$props.data;
      if (base.chart) {
        return base.chart.indexBased;
      } else if (base.data) {
        return base.data.chart.indexBased;
      }
      return false;
    },
    mod_ovs: function mod_ovs() {
      var arr = [];
      var _iterator = TradingVuevue_type_script_lang_js_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          arr.push.apply(arr, _toConsumableArray(Object.values(x.overlays)));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    },
    font_comp: function font_comp() {
      return this.skin_proto && this.skin_proto.font ? this.skin_proto.font : this.font;
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.custom_event({
      event: "before-destroy"
    });
    this.ctrl_destroy();
  },
  methods: {
    updateRefData: function updateRefData() {},
    // TODO: reset extensions?
    resetChart: function resetChart(resetRange) {
      var _this = this;
      if (resetRange === void 0) {
        resetRange = true;
      }
      this.reset++;
      var range = this.getRange();
      if (!resetRange && range[0] && range[1]) {
        this.$nextTick(function () {
          return _this.setRange.apply(_this, _toConsumableArray(range));
        });
      }
      this.$nextTick(function () {
        return _this.custom_event({
          event: "chart-reset",
          args: []
        });
      });
    },
    "goto": function goto(t) {
      // TODO: limit goto & setRange (out of data error)
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        t = ti_map.gt2i(t, this.$refs.chart.ohlcv);
      }
      this.$refs.chart["goto"](t);
    },
    setRange: function setRange(t1, t2) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var ohlcv = this.$refs.chart.ohlcv;
        t1 = ti_map.gt2i(t1, ohlcv);
        t2 = ti_map.gt2i(t2, ohlcv);
        // console.log('this.ignoreNegativeIndex and t1',t1, t2,this.ignoreNegativeIndex)
        if (t1 < 0 && this.ignoreNegativeIndex) {
          t1 = 0;
        }
      }
      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // Time range => index range
        // console.log('this.$refs.chart',this.$refs.chart)
        return this.$refs.chart.range.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      return this.$refs.chart.range;
    },
    getCursor: function getCursor() {
      var cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var copy = Object.assign({}, cursor);
        copy.i = copy.t;
        copy.t = ti_map.i2t(copy.t);
        return copy;
      }
      return cursor;
    },
    getTimeIndex: function getTimeIndex(t) {
      // let cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // let copy = Object.assign({}, cursor);
        // copy.i = copy.t;
        // copy.t = ti_map.i2t(copy.t);
        return ti_map.t2i(t);
      }
      return null;
    },
    showTheTip: function showTheTip(text, color) {
      if (color === void 0) {
        color = "orange";
      }
      this.tip = {
        text: text,
        color: color
      };
    },
    legend_button: function legend_button(event) {
      this.custom_event({
        event: "legend-button-click",
        args: [event]
      });
    },
    custom_event: function custom_event(d) {
      if ("args" in d) {
        this.$emit.apply(this, [d.event].concat(_toConsumableArray(d.args)));
      } else {
        this.$emit(d.event);
      }
      var data = this.$props.data;
      var ctrl = this.controllers.length !== 0;
      if (ctrl) this.pre_dc(d);
      if (data.tv) {
        // If the data object is DataCube
        data.on_custom_event(d.event, d.args);
      }
      if (ctrl) this.post_dc(d);
    },
    range_changed: function range_changed(r, r2) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        r = r.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      // console.log('range_changes_working 1',r,r2)
      this.$emit("range-changed", r, r2);
      this.custom_event({
        event: "range-changed",
        args: [r, r2]
      });
      if (this.onrange) this.onrange(r);
    },
    set_loader: function set_loader(dc) {
      var _this2 = this;
      this.onrange = function (r) {
        var pf = _this2.chart_props.ib ? "_ms" : "";
        var tf = _this2.$refs.chart["interval" + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors: function parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf("color") === 0 && k !== "colors") {
          var k2 = k.replace("color", "");
          k2 = k2[0].toLowerCase() + k2.slice(1);
          if (colors[k2]) continue;
          colors[k2] = this.$props[k];
        }
      }
    },
    mousedown: function mousedown() {
      this.$refs.chart.activated = true;
    },
    mouseleave: function mouseleave() {
      this.$refs.chart.activated = false;
    }
  },
  watch: {
    decimalPlace: function decimalPlace(n) {
      var base = this.$props.data;
      // console.log("props:",base);
      base.merge('chart.settings', {
        decimalPlace: n
      });
    },
    enableArrow: function enableArrow(n) {
      var base = this.$props.data;
      // console.log("props:",base);
      base.merge('chart.settings', {
        isArrow: n
      });
    }
  },
  mounted: function mounted() {
    var base = this.$props.data;
    // console.log("props:",this.$props.enableArrow);
    base.merge('chart.settings', {
      isArrow: this.$props.enableArrow,
      decimalPlace: this.$props.decimalPlace
    });
  }
});
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=script&lang=js&
 /* harmony default export */ const src_TradingVuevue_type_script_lang_js_ = (TradingVuevue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&id=5c28b699&prod&lang=css&
var TradingVuevue_type_style_index_0_id_5c28b699_prod_lang_css_ = __webpack_require__(846);
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=style&index=0&id=5c28b699&prod&lang=css&

;// CONCATENATED MODULE: ./src/TradingVue.vue



;


/* normalize component */

var TradingVue_component = normalizeComponent(
  src_TradingVuevue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TradingVue = (TradingVue_component.exports);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(687);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// CONCATENATED MODULE: ./src/helpers/tmp/ww$$$.json
const ww$$$_namespaceObject = JSON.parse('["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"]');
// EXTERNAL MODULE: ./node_modules/lz-string/libs/lz-string.js
var lz_string = __webpack_require__(961);
var lz_string_default = /*#__PURE__*/__webpack_require__.n(lz_string);
;// CONCATENATED MODULE: ./src/helpers/script_ww_api.js




// Webworker interface

// Compiled webworker (see webpack/ww_plugin.js)



 // For webworker-loader to find the ww
var WebWork = /*#__PURE__*/function () {
  function WebWork(dc) {
    classCallCheck_classCallCheck(this, WebWork);
    this.dc = dc;
    this.tasks = {};
    this.onevent = function () {};
    this.start();
  }
  createClass_createClass(WebWork, [{
    key: "start",
    value: function start() {
      var _this = this;
      if (this.worker) this.worker.terminate();
      // URL.createObjectURL
      window.URL = window.URL || window.webkitURL;
      var data = lz_string_default().decompressFromBase64(ww$$$_namespaceObject[0]);
      var blob;
      try {
        blob = new Blob([data], {
          type: 'application/javascript'
        });
      } catch (e) {
        // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(data);
        blob = blob.getBlob();
      }
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = function (e) {
        return _this.onmessage(e);
      };
    }
  }, {
    key: "start_socket",
    value: function start_socket() {
      var _this2 = this;
      if (!this.dc.sett.node_url) return;
      this.socket = new WebSocket(this.dc.sett.node_url);
      this.socket.addEventListener('message', function (e) {
        _this2.onmessage({
          data: JSON.parse(e.data)
        });
      });
      this.msg_queue = [];
    }
  }, {
    key: "send",
    value: function send(msg, tx_keys) {
      if (this.dc.sett.node_url) {
        return this.send_node(msg, tx_keys);
      }
      if (tx_keys) {
        var tx_objs = tx_keys.map(function (k) {
          return msg.data[k];
        });
        this.worker.postMessage(msg, tx_objs);
      } else {
        this.worker.postMessage(msg);
      }
    }

    // Send to node.js via websocket
  }, {
    key: "send_node",
    value: function send_node(msg, tx_keys) {
      if (!this.socket) this.start_socket();
      if (this.socket && this.socket.readyState) {
        // Send the old messages first
        while (this.msg_queue.length) {
          var m = this.msg_queue.shift();
          this.socket.send(JSON.stringify(m));
        }
        this.socket.send(JSON.stringify(msg));
      } else {
        this.msg_queue.push(msg);
      }
    }
  }, {
    key: "onmessage",
    value: function onmessage(e) {
      if (e.data.id in this.tasks) {
        this.tasks[e.data.id](e.data.data);
        delete this.tasks[e.data.id];
      } else {
        this.onevent(e);
      }
    }

    // Execute a task
  }, {
    key: "exec",
    value: function () {
      var _exec = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(type, data, tx_keys) {
        var _this3 = this;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (rs, rj) {
                  var id = utils.uuid();
                  _this3.send({
                    type: type,
                    id: id,
                    data: data
                  }, tx_keys);
                  _this3.tasks[id] = function (res) {
                    rs(res);
                  };
                }));
              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      function exec(_x, _x2, _x3) {
        return _exec.apply(this, arguments);
      }
      return exec;
    }() // Execute a task, but just fucking do it,
    // do not wait for the result
  }, {
    key: "just",
    value: function just(type, data, tx_keys) {
      var id = utils.uuid();
      this.send({
        type: type,
        id: id,
        data: data
      }, tx_keys);
    }

    // Relay an event from iframe postMessage
    // (for the future)
  }, {
    key: "relay",
    value: function () {
      var _relay = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2(event, just) {
        var _this4 = this;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (just === void 0) {
                  just = false;
                }
                return _context2.abrupt("return", new Promise(function (rs, rj) {
                  _this4.send(event, event.tx_keys);
                  if (!just) {
                    _this4.tasks[event.id] = function (res) {
                      rs(res);
                    };
                  }
                }));
              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      function relay(_x4, _x5) {
        return _relay.apply(this, arguments);
      }
      return relay;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.worker) this.worker.terminate();
    }
  }]);
  return WebWork;
}();
/* harmony default export */ const script_ww_api = (WebWork);
;// CONCATENATED MODULE: ./src/helpers/script_utils.js


var FDEFS = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?)\)/gmi;
var SBRACKETS = /([$A-Z_][0-9A-Z_$\.]*)[\s]*?\[([^"^\[^\]]+?)\]/gmi;
var TFSTR = /(\d+)(\w*)/gm;
var BUF_INC = 5;
var tf_cache = {};
function f_args(src) {
  FDEFS.lastIndex = 0;
  var m = FDEFS.exec(src);
  if (m) {
    var fkeyword = m[1].trim();
    var fname = m[2].trim();
    var fargs = m[3].trim();
    return fargs.split(',').map(function (x) {
      return x.trim();
    });
  }
  return [];
}
function f_body(src) {
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
}
function wrap_idxs(src, pre) {
  if (pre === void 0) {
    pre = '';
  }
  SBRACKETS.lastIndex = 0;
  var changed = false;
  do {
    var m = SBRACKETS.exec(src);
    if (m) {
      var vname = m[1].trim();
      var vindex = m[2].trim();
      if (vindex === '0' || parseInt(vindex) < BUF_INC) {
        continue;
      }
      switch (vname) {
        case 'let':
        case 'var':
        case 'return':
          continue;
      }

      //let wrap = `${pre}_v(${vname}, ${vindex})[${vindex}]`
      var wrap = "".concat(vname, "[").concat(pre, "_i(").concat(vindex, ", ").concat(vname, ")]");
      src = src.replace(m[0], wrap);
      changed = true;
    }
  } while (m);
  return changed ? src : src;
}

// Get all module helper classes
function make_module_lib(mod) {
  var lib = {};
  for (var k in mod) {
    if (k === 'main' || k === 'id') continue;
    var a = f_args(mod[k]);
    lib[k] = new Function(a, f_body(mod[k]));
  }
  return lib;
}
function get_raw_src(f) {
  if (typeof f === 'string') return f;
  var src = f.toString();
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
}

// Get tf in ms from pairs such (`15`, `m`)
function tf_from_pair(num, pf) {
  var mult = 1;
  switch (pf) {
    case 's':
      mult = Const.SECOND;
      break;
    case 'm':
      mult = Const.MINUTE;
      break;
    case 'H':
      mult = Const.HOUR;
      break;
    case 'D':
      mult = Const.DAY;
      break;
    case 'W':
      mult = Const.WEEK;
      break;
    case 'M':
      mult = Const.MONTH;
      break;
    case 'Y':
      mult = Const.YEAR;
      break;
  }
  return parseInt(num) * mult;
}
function tf_from_str(str) {
  if (typeof str === 'number') return str;
  if (tf_cache[str]) return tf_cache[str];
  TFSTR.lastIndex = 0;
  var m = TFSTR.exec(str);
  if (m) {
    tf_cache[str] = tf_from_pair(m[1], m[2]);
    return tf_cache[str];
  }
  return undefined;
}
function get_fn_id(pre, id) {
  return pre + '-' + id.split('<-').pop();
}

// Apply filter for all new overlays
function ovf(obj, f) {
  var nw = {};
  for (var id in obj) {
    nw[id] = {};
    for (var k in obj[id]) {
      if (k === 'data') continue;
      nw[id][k] = obj[id][k];
    }
    nw[id].data = f(obj[id].data);
  }
  return nw;
}

// Return index of the next element in
// dataset (since t). Impl: simple binary search
// TODO: optimize (remember the penultimate
// iteration and start from there)
function nextt(data, t, ti) {
  if (ti === void 0) {
    ti = 0;
  }
  var i0 = 0;
  var iN = data.length - 1;
  while (i0 <= iN) {
    var mid = Math.floor((i0 + iN) / 2);
    if (data[mid][ti] === t) {
      return mid;
    } else if (data[mid][ti] < t) {
      i0 = mid + 1;
    } else {
      iN = mid - 1;
    }
  }
  return t < data[mid][ti] ? mid : mid + 1;
}

// Estimated size of datasets
function size_of_dss(data) {
  var bytes = 0;
  for (var id in data) {
    if (data[id].data && data[id].data[0]) {
      var s0 = size_of(data[id].data[0]);
      bytes += s0 * data[id].data.length;
    }
  }
  return bytes;
}

// Used to measure the size of dataset
function size_of(object) {
  var list = [],
    stack = [object],
    bytes = 0;
  while (stack.length) {
    var value = stack.pop();
    var type = _typeof(value);
    if (type === 'boolean') {
      bytes += 4;
    } else if (type === 'string') {
      bytes += value.length * 2;
    } else if (type === 'number') {
      bytes += 8;
    } else if (type === 'object' && list.indexOf(value) === -1) {
      list.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}

// Update onchart/offchart
function update(data, val) {
  var i = data.length - 1;
  var last = data[i];
  if (!last || val[0] > last[0]) {
    data.push(val);
  } else {
    data[i] = val;
  }
}
function script_utils_now() {
  return new Date().getTime();
}
;// CONCATENATED MODULE: ./src/helpers/dataset.js




function dataset_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dataset_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dataset_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dataset_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dataset_arrayLikeToArray(o, minLen); }
function dataset_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Dataset proxy between vuejs & WebWorker


var Dataset = /*#__PURE__*/function () {
  function Dataset(dc, desc) {
    classCallCheck_classCallCheck(this, Dataset);
    // TODO: dataset url arrow fn tells WW
    // to load the ds directly from web

    this.type = desc.type;
    this.id = desc.id;
    this.dc = dc;

    // Send the data to WW
    if (desc.data) {
      this.dc.ww.just('upload-data', _defineProperty({}, this.id, desc));
      // Remove the data from the descriptor
      delete desc.data;
    }
    var proto = Object.getPrototypeOf(this);
    Object.setPrototypeOf(desc, proto);
    Object.defineProperty(desc, 'dc', {
      get: function get() {
        return dc;
      }
    });
  }

  // Watch for the changes of descriptors
  createClass_createClass(Dataset, [{
    key: "set",
    value:
    // Set data (overwrite the whole dataset)
    function set(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'set',
        data: data,
        exec: exec
      });
    }

    // Update with new data (array of data points)
  }, {
    key: "update",
    value: function update(arr) {
      this.dc.ww.just('update-data', _defineProperty({}, this.id, arr));
    }

    // Send WW a chunk to merge. The merge algo
    // here is simpler than in DC. It just adds
    // data at the beginning or/and the end of ds
  }, {
    key: "merge",
    value: function merge(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'mrg',
        data: data,
        exec: exec
      });
    }

    // Remove the ds from WW
  }, {
    key: "remove",
    value: function remove(exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.del("datasets.".concat(this.id));
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'del',
        exec: exec
      });
      delete this.dc.dss[this.id];
    }

    // Fetch data from WW
  }, {
    key: "data",
    value: function () {
      var _data = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        var ds;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.dc.ww.exec('get-dataset', this.id);
              case 2:
                ds = _context.sent;
                if (ds) {
                  _context.next = 5;
                  break;
                }
                return _context.abrupt("return");
              case 5:
                return _context.abrupt("return", ds.data);
              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      function data() {
        return _data.apply(this, arguments);
      }
      return data;
    }()
  }], [{
    key: "watcher",
    value: function watcher(n, p) {
      var nids = n.map(function (x) {
        return x.id;
      });
      var pids = p.map(function (x) {
        return x.id;
      });
      var _iterator = dataset_createForOfIteratorHelper(nids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          if (!pids.includes(id)) {
            var ds = n.filter(function (x) {
              return x.id === id;
            })[0];
            this.dss[id] = new Dataset(this, ds);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = dataset_createForOfIteratorHelper(pids),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var id = _step2.value;
          if (!nids.includes(id) && this.dss[id]) {
            this.dss[id].remove();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    // Make an object for data transfer
  }, {
    key: "make_tx",
    value: function make_tx(dc, types) {
      var main = dc.data.chart.data;
      var base = {};
      if (types.find(function (x) {
        return x.type === 'OHLCV';
      })) {
        base = {
          ohlcv: main
        };
      }

      // TODO: add more sophisticated search
      // (using 'script.datasets' paramerter)
      /*for (var req of types) {
          let ds = Object.values(dc.dss || {})
              .find(x => x.type === req.type)
          if (ds && ds.data) {
              base[ds.id] = {
                  id: ds.id,
                  type: ds.type,
                  data: ds.data
              }
          }
      }*/
      // TODO: Data request callback ?

      return base;
    }
  }]);
  return Dataset;
}(); // Dataset reciever (created on WW)

var DatasetWW = /*#__PURE__*/(/* unused pure expression or super */ null && (function () {
  function DatasetWW(id, data) {
    _classCallCheck(this, DatasetWW);
    this.last_upd = now();
    this.id = id;
    if (Array.isArray(data)) {
      // Regular array
      this.data = data;
      if (id === 'ohlcv') this.type = 'OHLCV';
    } else {
      // Dataset descriptor
      this.data = data.data;
      this.type = data.type;
    }
  }

  // Update from 'update-data' event
  // TODO: ds size limit (in MB / data points)
  _createClass(DatasetWW, [{
    key: "merge",
    value: function merge(data) {
      var len = this.data.length;
      if (!len) {
        this.data = data;
        return;
      }
      var t0 = this.data[0][0];
      var tN = this.data[len - 1][0];
      var l = data.filter(function (x) {
        return x[0] < t0;
      });
      var r = data.filter(function (x) {
        return x[0] > tN;
      });
      this.data = l.concat(this.data, r);
    }

    // On dataset operation
  }, {
    key: "op",
    value: function op(se, _op) {
      this.last_upd = now();
      switch (_op.type) {
        case 'set':
          this.data = _op.data;
          se.recalc_size();
          break;
        case 'del':
          delete se.data[this.id];
          se.recalc_size();
          break;
        case 'mrg':
          this.merge(_op.data);
          se.recalc_size();
          break;
      }
    }
  }], [{
    key: "update_all",
    value: function update_all(se, data) {
      for (var k in data) {
        if (k === 'ohlcv') continue;
        var id = k.split('.')[1] || k;
        if (!se.data[id]) continue;
        var arr = se.data[id].data;
        var iN = arr.length - 1;
        var last = arr[iN];
        var _iterator3 = dataset_createForOfIteratorHelper(data[k]),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var dp = _step3.value;
            if (!last || dp[0] > last[0]) {
              arr.push(dp);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        se.data[id].last_upd = now();
      }
    }
  }]);
  return DatasetWW;
}()));
;// CONCATENATED MODULE: ./src/helpers/dc_events.js




function dc_events_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dc_events_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dc_events_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_events_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_events_arrayLikeToArray(o, minLen); }
function dc_events_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// DataCube event handlers





var DCEvents = /*#__PURE__*/function () {
  function DCEvents() {
    var _this = this;
    classCallCheck_classCallCheck(this, DCEvents);
    this.ww = new script_ww_api(this);

    // Listen to the web-worker events
    this.ww.onevent = function (e) {
      var _iterator = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ctrl = _step.value;
          if (ctrl.ww) ctrl.ww(e.data);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      switch (e.data.type) {
        case 'request-data':
          // TODO: DataTunnel class for smarter data transfer
          if (_this.ww._data_uploading) break;
          var data = Dataset.make_tx(_this, e.data.data);
          _this.send_meta_2_ww();
          _this.ww.just('upload-data', data);
          _this.ww._data_uploading = true;
          break;
        case 'overlay-data':
          _this.on_overlay_data(e.data.data);
          break;
        case 'overlay-update':
          _this.on_overlay_update(e.data.data);
          break;
        case 'data-uploaded':
          _this.ww._data_uploading = false;
          break;
        case 'engine-state':
          _this.se_state = Object.assign(_this.se_state || {}, e.data.data);
          break;
        case 'modify-overlay':
          _this.modify_overlay(e.data.data);
          break;
        case 'script-signal':
          _this.tv.$emit('signal', e.data.data);
          break;
      }
      var _iterator2 = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.post_ww) ctrl.post_ww(e.data);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };
  }

  // Called when overalay/tv emits 'custom-event'
  createClass_createClass(DCEvents, [{
    key: "on_custom_event",
    value: function on_custom_event(event, args) {
      switch (event) {
        case 'register-tools':
          this.register_tools(args);
          break;
        case 'exec-script':
          this.exec_script(args);
          break;
        case 'exec-all-scripts':
          this.exec_all_scripts();
          break;
        case 'data-len-changed':
          this.data_changed(args);
          break;
        case 'tool-selected':
          if (!args[0]) break; // TODO: Quick fix, investigate
          if (args[0].split(':')[0] === 'System') {
            this.system_tool(args[0].split(':')[1]);
            break;
          }
          this.tv.$set(this.data, 'tool', args[0]);
          if (args[0] === 'Cursor') {
            this.drawing_mode_off();
          }
          break;
        case 'grid-mousedown':
          this.grid_mousedown(args);
          break;
        case 'drawing-mode-off':
          this.drawing_mode_off();
          break;
        case 'change-settings':
          this.change_settings(args);
          break;
        case 'range-changed':
          this.scripts_onrange.apply(this, _toConsumableArray(args));
          break;
        case 'scroll-lock':
          this.on_scroll_lock(args[0]);
          break;
        case 'object-selected':
          this.object_selected(args);
          break;
        case 'remove-tool':
          this.system_tool('Remove');
          break;
        case 'before-destroy':
          this.before_destroy();
          break;
      }
    }

    // Triggered when one or multiple settings are changed
    // We select only the changed ones & re-exec them on the
    // web worker
  }, {
    key: "on_settings",
    value: function on_settings(values, prev) {
      var _this2 = this;
      if (!this.sett.scripts) return;
      var delta = {};
      var changed = false;
      var _loop = function _loop() {
        var n = values[i];
        var arr = prev.filter(function (x) {
          return x.v === n.v;
        });
        if (!arr.length && n.p.settings.$props) {
          var id = n.p.settings.$uuid;
          if (utils.is_scr_props_upd(n, prev) && utils.delayed_exec(n.p)) {
            delta[id] = n.v;
            changed = true;
            _this2.tv.$set(n.p, 'loading', true);
          }
        }
      };
      for (var i = 0; i < values.length; i++) {
        _loop();
      }
      if (changed && Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // When the set of $uuids is changed
  }, {
    key: "on_ids_changed",
    value: function on_ids_changed(values, prev) {
      var rem = prev.filter(function (x) {
        return x !== undefined && !values.includes(x);
      });
      if (rem.length) {
        this.ww.just('remove-scripts', rem);
      }
    }

    // Combine all tools and their mods
  }, {
    key: "register_tools",
    value: function register_tools(tools) {
      var preset = {};
      var _iterator3 = dc_events_createForOfIteratorHelper(this.data.tools || []),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var tool = _step3.value;
          preset[tool.type] = tool;
          delete tool.type;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.tv.$set(this.data, 'tools', []);
      var list = [{
        type: 'Cursor',
        icon: icons_namespaceObject["cursor.png"]
      }];
      var _iterator4 = dc_events_createForOfIteratorHelper(tools),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var tool = _step4.value;
          var proto = Object.assign({}, tool.info);
          var type = tool.info.type || 'Default';
          proto.type = "".concat(tool.use_for, ":").concat(type);
          this.merge_presets(proto, preset[tool.use_for]);
          this.merge_presets(proto, preset[proto.type]);
          delete proto.mods;
          list.push(proto);
          for (var mod in tool.info.mods) {
            var mp = Object.assign({}, proto);
            mp = Object.assign(mp, tool.info.mods[mod]);
            mp.type = "".concat(tool.use_for, ":").concat(mod);
            this.merge_presets(mp, preset[tool.use_for]);
            this.merge_presets(mp, preset[mp.type]);
            list.push(mp);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      this.tv.$set(this.data, 'tools', list);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }
  }, {
    key: "exec_script",
    value: function exec_script(args) {
      if (args.length && this.sett.scripts) {
        var obj = this.get_overlay(args[0]);
        if (!obj || obj.scripts === false) return;
        if (obj.script && obj.script.src) {
          args[0].src = obj.script.src; // opt, override the src
        }
        // Parse script props & get the values from the ov
        // TODO: remove unnecessary script initializations
        var s = obj.settings;
        var props = args[0].src.props || {};
        if (!s.$uuid) s.$uuid = "".concat(obj.type, "-").concat(utils.uuid2());
        args[0].uuid = s.$uuid;
        args[0].sett = s;
        for (var k in props || {}) {
          var proto = props[k];
          if (s[k] !== undefined) {
            proto.val = s[k]; // use the existing val
            continue;
          }
          if (proto.def === undefined) {
            // TODO: add support of info / errors to the legend
            console.error("Overlay ".concat(obj.id, ": script prop '").concat(k, "' ") + 'doesn\'t have a default value');
            return;
          }
          s[k] = proto.val = proto.def; // set the default
        }
        // Remove old props (dropped by the current exec)
        if (s.$props) {
          for (var k in s) {
            if (s.$props.includes(k) && !(k in props)) {
              delete s[k];
            }
          }
        }
        s.$props = Object.keys(args[0].src.props || {});
        this.tv.$set(obj, 'loading', true);
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        if (obj.script && obj.script.output != null) {
          args[0].output = obj.script.output;
        }
        this.ww.just('exec-script', {
          s: args[0],
          tf: tf,
          range: range
        });
      }
    }
  }, {
    key: "exec_all_scripts",
    value: function exec_all_scripts() {
      if (!this.sett.scripts) return;
      this.set_loading(true);
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('exec-all-scripts', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "scripts_onrange",
    value: function scripts_onrange(r) {
      if (!this.sett.scripts) return;
      var delta = {};
      this.get('.').forEach(function (v) {
        if (v.script && v.script.execOnRange && v.settings.$uuid) {
          // TODO: execInterrupt flag?
          if (utils.delayed_exec(v)) {
            delta[v.settings.$uuid] = v.settings;
          }
        }
      });
      if (Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // Overlay modification from WW
  }, {
    key: "modify_overlay",
    value: function modify_overlay(upd) {
      var obj = this.get_overlay(upd);
      if (obj) {
        for (var k in upd.fields || {}) {
          if (typeof_typeof(obj[k]) === 'object') {
            this.merge("".concat(upd.uuid, ".").concat(k), upd.fields[k]);
          } else {
            this.tv.$set(obj, k, upd.fields[k]);
          }
        }
      }
    }
  }, {
    key: "data_changed",
    value: function data_changed(args) {
      if (!this.sett.scripts) return;
      if (this.sett.data_change_exec === false) return;
      var main = this.data.chart.data;
      if (this.ww._data_uploading) return;
      if (!this.se_state.scripts) return;
      this.send_meta_2_ww();
      this.ww.just('upload-data', {
        ohlcv: main
      });
      this.ww._data_uploading = true;
      this.set_loading(true);
    }
  }, {
    key: "set_loading",
    value: function set_loading(flag) {
      var skrr = this.get('.').filter(function (x) {
        return x.settings.$props;
      });
      var _iterator5 = dc_events_createForOfIteratorHelper(skrr),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var s = _step5.value;
          this.merge("".concat(s.id), {
            loading: flag
          });
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "send_meta_2_ww",
    value: function send_meta_2_ww() {
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('send-meta-info', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "merge_presets",
    value: function merge_presets(proto, preset) {
      if (!preset) return;
      for (var k in preset) {
        if (k === 'settings') {
          Object.assign(proto[k], preset[k]);
        } else {
          proto[k] = preset[k];
        }
      }
    }
  }, {
    key: "grid_mousedown",
    value: function grid_mousedown(args) {
      var _this3 = this;
      // TODO: tool state finished?
      this.object_selected([]);
      // Remove the previous RangeTool
      var rem = function rem() {
        return _this3.get('RangeTool').filter(function (x) {
          return x.settings.shiftMode;
        }).forEach(function (x) {
          return _this3.del(x.id);
        });
      };
      if (this.data.tool && this.data.tool !== 'Cursor' && !this.data.drawingMode) {
        // Prevent from "null" tools (tool created with HODL)
        if (args[1].type !== 'tap') {
          this.tv.$set(this.data, 'drawingMode', true);
          this.build_tool(args[0]);
        } else {
          this.tv.showTheTip('<b>Hodl</b>+<b>Drug</b> to create, ' + '<b>Tap</b> to finish a tool');
        }
      } else if (this.sett.shift_measure && args[1].shiftKey) {
        rem();
        this.tv.$nextTick(function () {
          return _this3.build_tool(args[0], 'RangeTool:ShiftMode');
        });
      } else {
        rem();
      }
    }
  }, {
    key: "drawing_mode_off",
    value: function drawing_mode_off() {
      this.tv.$set(this.data, 'drawingMode', false);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }

    // Place a new tool
  }, {
    key: "build_tool",
    value: function build_tool(grid_id, type) {
      var list = this.data.tools;
      type = type || this.data.tool;
      var proto = list.find(function (x) {
        return x.type === type;
      });
      if (!proto) return;
      var sett = Object.assign({}, proto.settings || {});
      var data = (proto.data || []).slice();
      if (!('legend' in sett)) sett.legend = false;
      if (!('z-index' in sett)) sett['z-index'] = 100;
      sett.$selected = true;
      sett.$state = 'wip';
      var side = grid_id ? 'offchart' : 'onchart';
      var id = this.add(side, {
        name: proto.name,
        type: type.split(':')[0],
        settings: sett,
        data: data,
        grid: {
          id: grid_id
        }
      });
      sett.$uuid = "".concat(id, "-").concat(utils.now());
      this.tv.$set(this.data, 'selected', sett.$uuid);
      this.add_trash_icon();
    }

    // Remove selected / Remove all, etc
  }, {
    key: "system_tool",
    value: function system_tool(type) {
      switch (type) {
        case 'Remove':
          if (this.data.selected) {
            this.del(this.data.selected);
            this.remove_trash_icon();
            this.drawing_mode_off();
            this.on_scroll_lock(false);
          }
          break;
      }
    }

    // Apply new overlay settings
  }, {
    key: "change_settings",
    value: function change_settings(args) {
      var settings = args[0];
      delete settings.id;
      var grid_id = args[1];
      this.merge("".concat(args[3], ".settings"), settings);
    }

    // Lock the scrolling mechanism
  }, {
    key: "on_scroll_lock",
    value: function on_scroll_lock(flag) {
      this.tv.$set(this.data, 'scrollLock', flag);
    }

    // When new object is selected / unselected
  }, {
    key: "object_selected",
    value: function object_selected(args) {
      var q = this.data.selected;
      if (q) {
        // Check if current drawing is finished
        //let res = this.get_one(`${q}.settings`)
        //if (res && res.$state !== 'finished') return
        this.merge("".concat(q, ".settings"), {
          $selected: false
        });
        this.remove_trash_icon();
      }
      this.tv.$set(this.data, 'selected', null);
      if (!args.length) return;
      this.tv.$set(this.data, 'selected', args[2]);
      this.merge("".concat(args[2], ".settings"), {
        $selected: true
      });
      this.add_trash_icon();
    }
  }, {
    key: "add_trash_icon",
    value: function add_trash_icon() {
      var type = 'System:Remove';
      if (this.data.tools.find(function (x) {
        return x.type === type;
      })) {
        return;
      }
      this.data.tools.push({
        type: type,
        icon: icons_namespaceObject["trash.png"]
      });
    }
  }, {
    key: "remove_trash_icon",
    value: function remove_trash_icon() {
      // TODO: Does not call Toolbar render (distr version)
      var type = 'System:Remove';
      utils.overwrite(this.data.tools, this.data.tools.filter(function (x) {
        return x.type !== type;
      }));
    }

    // Set overlay data from the web-worker
  }, {
    key: "on_overlay_data",
    value: function on_overlay_data(data) {
      var _this4 = this;
      this.get('.').forEach(function (x) {
        if (x.settings.$synth) _this4.del("".concat(x.id));
      });
      var _iterator6 = dc_events_createForOfIteratorHelper(data),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var ov = _step6.value;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.tv.$set(obj, 'loading', false);
            if (!ov.data) continue;
            obj.data = ov.data;
          }
          if (!ov.new_ovs) continue;
          for (var id in ov.new_ovs.onchart) {
            if (!this.get_one("onchart.".concat(id))) {
              this.add('onchart', ov.new_ovs.onchart[id]);
            }
          }
          for (var id in ov.new_ovs.offchart) {
            if (!this.get_one("offchart.".concat(id))) {
              this.add('offchart', ov.new_ovs.offchart[id]);
            }
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }

    // Push overlay updates from the web-worker
  }, {
    key: "on_overlay_update",
    value: function on_overlay_update(data) {
      var _iterator7 = dc_events_createForOfIteratorHelper(data),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var ov = _step7.value;
          if (!ov.data) continue;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.fast_merge(obj.data, ov.data, false);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }

    // Clean-up unfinished business (tools)
  }, {
    key: "before_destroy",
    value: function before_destroy() {
      var f = function f(x) {
        return !x.settings.$state || x.settings.$state === 'finished';
      };
      this.data.onchart = this.data.onchart.filter(f);
      this.data.offchart = this.data.offchart.filter(f);
      this.drawing_mode_off();
      this.on_scroll_lock(false);
      this.object_selected([]);
      this.ww.destroy();
    }

    // Get overlay by grid-layer id
  }, {
    key: "get_overlay",
    value: function get_overlay(obj) {
      var id = obj.id || "g".concat(obj.grid_id, "_").concat(obj.layer_id);
      var dcid = obj.uuid || this.gldc[id];
      return this.get_one("".concat(dcid));
    }
  }]);
  return DCEvents;
}();

;// CONCATENATED MODULE: ./src/helpers/dc_core.js








function dc_core_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dc_core_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dc_core_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_core_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_core_arrayLikeToArray(o, minLen); }
function dc_core_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function dc_core_createSuper(Derived) { var hasNativeReflectConstruct = dc_core_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function dc_core_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
// DataCube "private" methods




var DCCore = /*#__PURE__*/function (_DCEvents) {
  _inherits(DCCore, _DCEvents);
  var _super = dc_core_createSuper(DCCore);
  function DCCore() {
    classCallCheck_classCallCheck(this, DCCore);
    return _super.apply(this, arguments);
  }
  createClass_createClass(DCCore, [{
    key: "init_tvjs",
    value:
    // Set TV instance (once). Called by TradingVue itself
    function init_tvjs($root) {
      var _this = this;
      if (!this.tv) {
        this.tv = $root;
        this.init_data();
        this.update_ids();

        // Listen to all setting changes
        // TODO: works only with merge()
        this.tv.$watch(function () {
          return _this.get_by_query('.settings');
        }, function (n, p) {
          return _this.on_settings(n, p);
        });

        // Listen to all indices changes
        this.tv.$watch(function () {
          return _this.get('.').map(function (x) {
            return x.settings.$uuid;
          });
        }, function (n, p) {
          return _this.on_ids_changed(n, p);
        });

        // Watch for all 'datasets' changes
        this.tv.$watch(function () {
          return _this.get('datasets');
        }, Dataset.watcher.bind(this));
      }
    }

    // Init Data Structure v1.1
  }, {
    key: "init_data",
    value: function init_data($root) {
      if (!('chart' in this.data)) {
        this.tv.$set(this.data, 'chart', {
          type: 'Candles',
          data: this.data.ohlcv || []
        });
      }
      if (!('onchart' in this.data)) {
        this.tv.$set(this.data, 'onchart', []);
      }
      if (!('offchart' in this.data)) {
        this.tv.$set(this.data, 'offchart', []);
      }
      if (!this.data.chart.settings) {
        this.tv.$set(this.data.chart, 'settings', {});
      }

      // Remove ohlcv cuz we have Data v1.1^
      delete this.data.ohlcv;
      if (!('datasets' in this.data)) {
        this.tv.$set(this.data, 'datasets', []);
      }

      // Init dataset proxies
      var _iterator = dc_core_createForOfIteratorHelper(this.data.datasets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ds = _step.value;
          if (!this.dss) this.dss = {};
          this.dss[ds.id] = new Dataset(this, ds);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Range change callback (called by TradingVue)
    // TODO: improve (reliablity + chunk with limited size)
  }, {
    key: "range_changed",
    value: function () {
      var _range_changed = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(range, tf, check) {
        var _this2 = this;
        var first, prom;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (check === void 0) {
                  check = false;
                }
                if (this.loader) {
                  _context.next = 3;
                  break;
                }
                return _context.abrupt("return");
              case 3:
                if (this.loading) {
                  _context.next = 19;
                  break;
                }
                first = this.data.chart.data[0][0];
                if (!(range[0] < first)) {
                  _context.next = 19;
                  break;
                }
                this.loading = true;
                _context.next = 9;
                return utils.pause(250);
              case 9:
                // Load bigger chunks
                range = range.slice(); // copy
                range[0] = Math.floor(range[0]);
                range[1] = Math.floor(first);
                prom = this.loader(range, tf, function (d) {
                  // Callback way
                  _this2.chunk_loaded(d);
                });
                if (!(prom && prom.then)) {
                  _context.next = 19;
                  break;
                }
                _context.t0 = this;
                _context.next = 17;
                return prom;
              case 17:
                _context.t1 = _context.sent;
                _context.t0.chunk_loaded.call(_context.t0, _context.t1);
              case 19:
                if (!check) this.last_chunk = [range, tf];
              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      function range_changed(_x, _x2, _x3) {
        return _range_changed.apply(this, arguments);
      }
      return range_changed;
    }() // A new chunk of data is loaded
    // TODO: bulletproof fetch
  }, {
    key: "chunk_loaded",
    value: function chunk_loaded(data) {
      // Updates only candlestick data, or
      if (Array.isArray(data)) {
        this.merge('chart.data', data);
      } else {
        // Bunch of overlays, including chart.data
        for (var k in data) {
          this.merge(k, data[k]);
        }
      }
      this.loading = false;
      if (this.last_chunk) {
        this.range_changed.apply(this, _toConsumableArray(this.last_chunk).concat([true]));
        this.last_chunk = null;
      }
    }

    // Update ids for all overlays
  }, {
    key: "update_ids",
    value: function update_ids() {
      this.data.chart.id = "chart.".concat(this.data.chart.type);
      var count = {};
      // grid_id,layer_id => DC id mapping
      this.gldc = {}, this.dcgl = {};
      var _iterator2 = dc_core_createForOfIteratorHelper(this.data.onchart),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ov = _step2.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var i = count[ov.type]++;
          ov.id = "onchart.".concat(ov.type).concat(i);
          if (!ov.name) ov.name = ov.type + " ".concat(i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          this.gldc["g0_".concat(ov.type, "_").concat(i)] = ov.id;
          this.dcgl[ov.id] = "g0_".concat(ov.type, "_").concat(i);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      count = {};
      var grids = [{}];
      var gid = 0;
      var _iterator3 = dc_core_createForOfIteratorHelper(this.data.offchart),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ov = _step3.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var _i = count[ov.type]++;
          ov.id = "offchart.".concat(ov.type).concat(_i);
          if (!ov.name) ov.name = ov.type + " ".concat(_i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          gid++;
          var rgid = (ov.grid || {}).id || gid; // real grid_id
          // When we merge grid, skip ++
          if ((ov.grid || {}).id) gid--;
          if (!grids[rgid]) grids[rgid] = {};
          if (grids[rgid][ov.type] === undefined) {
            grids[rgid][ov.type] = 0;
          }
          var ri = grids[rgid][ov.type]++;
          this.gldc["g".concat(rgid, "_").concat(ov.type, "_").concat(ri)] = ov.id;
          this.dcgl[ov.id] = "g".concat(rgid, "_").concat(ov.type, "_").concat(ri);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }

    // TODO: chart refine (from the exchange chart)
  }, {
    key: "update_candle",
    value: function update_candle(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var candle = data['candle'];
      var tf = this.tv.$refs.chart.interval_ms;
      var t_next = last[0] + tf;
      var now = data.t || utils.now();
      var t = now >= t_next ? now - now % tf : last[0];

      // Update the entire candle
      if (candle.length >= 6) {
        t = candle[0];
      } else {
        candle = [t].concat(_toConsumableArray(candle));
      }
      this.agg.push('ohlcv', candle);
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }
  }, {
    key: "update_tick",
    value: function update_tick(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var tick = data['price'];
      var volume = data['volume'] || 0;
      var tf = this.tv.$refs.chart.interval_ms;
      if (!tf) {
        return console.warn('Define the main timeframe');
      }
      var now = data.t || utils.now();
      if (!last) last = [now - now % tf];
      var t_next = last[0] + tf;
      var t = now >= t_next ? now - now % tf : last[0];
      if ((t >= t_next || !ohlcv.length) && tick !== undefined) {
        // And new zero-height candle
        var nc = [t, tick, tick, tick, tick, volume];
        this.agg.push('ohlcv', nc, tf);
        ohlcv.push(nc);
        this.scroll_to(t);
      } else if (tick !== undefined) {
        // Update an existing one
        // TODO: make a separate class Sampler
        last[2] = Math.max(tick, last[2]);
        last[3] = Math.min(tick, last[3]);
        last[4] = tick;
        last[5] += volume;
        this.agg.push('ohlcv', last, tf);
      }
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }

    // Updates all overlays with given values.
  }, {
    key: "update_overlays",
    value: function update_overlays(data, t, tf) {
      for (var k in data) {
        if (k === 'price' || k === 'volume' || k === 'candle' || k === 't') {
          continue;
        }
        if (k.includes('datasets.')) {
          this.agg.push(k, data[k], tf);
          continue;
        }
        if (!Array.isArray(data[k])) {
          var val = [data[k]];
        } else {
          val = data[k];
        }
        if (!k.includes('.data')) k += '.data';
        this.agg.push(k, [t].concat(_toConsumableArray(val)), tf);
      }
    }

    // Returns array of objects matching query.
    // Object contains { parent, index, value }
    // TODO: query caching
  }, {
    key: "get_by_query",
    value: function get_by_query(query, chuck) {
      var tuple = query.split('.');
      switch (tuple[0]) {
        case 'chart':
          var result = this.chart_as_piv(tuple);
          break;
        case 'onchart':
        case 'offchart':
          result = this.query_search(query, tuple);
          break;
        case 'datasets':
          result = this.query_search(query, tuple);
          var _iterator4 = dc_core_createForOfIteratorHelper(result),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var r = _step4.value;
              if (r.i === 'data') {
                r.v = this.dss[r.p.id].data();
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          break;
        default:
          /* Should get('.') return also the chart? */
          /*let ch = this.chart_as_query([
              'chart',
              tuple[1]
          ])*/
          var on = this.query_search(query, ['onchart', tuple[0], tuple[1]]);
          var off = this.query_search(query, ['offchart', tuple[0], tuple[1]]);
          result = [].concat(_toConsumableArray(on), _toConsumableArray(off));
          break;
      }
      return result.filter(function (x) {
        return !(x.v || {}).locked || chuck;
      });
    }
  }, {
    key: "chart_as_piv",
    value: function chart_as_piv(tuple) {
      var field = tuple[1];
      if (field) return [{
        p: this.data.chart,
        i: field,
        v: this.data.chart[field]
      }];else return [{
        p: this.data,
        i: 'chart',
        v: this.data.chart
      }];
    }
  }, {
    key: "query_search",
    value: function query_search(query, tuple) {
      var _this3 = this;
      var side = tuple[0];
      var path = tuple[1] || '';
      var field = tuple[2];
      var arr = this.data[side].filter(function (x) {
        return x.id === query || x.id && x.id.includes(path) || x.name === query || x.name && x.name.includes(path) || query.includes((x.settings || {}).$uuid);
      });
      if (field) {
        return arr.map(function (x) {
          return {
            p: x,
            i: field,
            v: x[field]
          };
        });
      }
      return arr.map(function (x, i) {
        return {
          p: _this3.data[side],
          i: _this3.data[side].indexOf(x),
          v: x
        };
      });
    }
  }, {
    key: "merge_objects",
    value: function merge_objects(obj, data, new_obj) {
      if (new_obj === void 0) {
        new_obj = {};
      }
      // The only way to get Vue to update all stuff
      // reactively is to create a brand new object.
      // TODO: Is there a simpler approach?
      Object.assign(new_obj, obj.v);
      Object.assign(new_obj, data);
      this.tv.$set(obj.p, obj.i, new_obj);
    }

    // Merge overlapping time series
  }, {
    key: "merge_ts",
    value: function merge_ts(obj, data) {
      // Assume that both arrays are pre-sorted

      if (!data.length) return obj.v;
      var r1 = [obj.v[0][0], obj.v[obj.v.length - 1][0]];
      var r2 = [data[0][0], data[data.length - 1][0]];

      // Overlap
      var o = [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];
      if (o[1] >= o[0]) {
        var _obj$v, _data;
        var _this$ts_overlap = this.ts_overlap(obj.v, data, o),
          od = _this$ts_overlap.od,
          d1 = _this$ts_overlap.d1,
          d2 = _this$ts_overlap.d2;
        (_obj$v = obj.v).splice.apply(_obj$v, _toConsumableArray(d1));
        (_data = data).splice.apply(_data, _toConsumableArray(d2));

        // Dst === Overlap === Src
        if (!obj.v.length && !data.length) {
          this.tv.$set(obj.p, obj.i, od);
          return obj.v;
        }

        // If src is totally contained in dst
        if (!data.length) {
          data = obj.v.splice(d1[0]);
        }

        // If dst is totally contained in src
        if (!obj.v.length) {
          obj.v = data.splice(d2[0]);
        }
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, od, data));
      } else {
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, [], data));
      }
      return obj.v;
    }

    // TODO: review performance, move to worker
  }, {
    key: "ts_overlap",
    value: function ts_overlap(arr1, arr2, range) {
      var t1 = range[0];
      var t2 = range[1];
      var ts = {}; // timestamp map

      var a1 = arr1.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });
      var a2 = arr2.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });

      // Indices of segments
      var id11 = arr1.indexOf(a1[0]);
      var id12 = arr1.indexOf(a1[a1.length - 1]);
      var id21 = arr2.indexOf(a2[0]);
      var id22 = arr2.indexOf(a2[a2.length - 1]);
      for (var i = 0; i < a1.length; i++) {
        ts[a1[i][0]] = a1[i];
      }
      for (var i = 0; i < a2.length; i++) {
        ts[a2[i][0]] = a2[i];
      }
      var ts_sorted = Object.keys(ts).sort();
      return {
        od: ts_sorted.map(function (x) {
          return ts[x];
        }),
        d1: [id11, id12 - id11 + 1],
        d2: [id21, id22 - id21 + 1]
      };
    }

    // Combine parts together:
    // (destination, overlap, source)
  }, {
    key: "combine",
    value: function combine(dst, o, src) {
      function last(arr) {
        return arr[arr.length - 1][0];
      }
      if (!dst.length) {
        dst = o;
        o = [];
      }
      if (!src.length) {
        src = o;
        o = [];
      }

      // The overlap right in the middle
      if (src[0][0] >= dst[0][0] && last(src) <= last(dst)) {
        return Object.assign(dst, o);

        // The overlap is on the right
      } else if (last(src) > last(dst)) {
        // Psh(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _dst;
          (_dst = dst).push.apply(_dst, _toConsumableArray(o).concat(_toConsumableArray(src)));
          return dst;
        } else {
          return dst.concat(o, src);
        }

        // The overlap is on the left
      } else if (src[0][0] < dst[0][0]) {
        // Push(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _src;
          (_src = src).push.apply(_src, _toConsumableArray(o).concat(_toConsumableArray(dst)));
          return src;
        } else {
          return src.concat(o, dst);
        }
      } else {
        return [];
      }
    }

    // Simple data-point merge (faster)
  }, {
    key: "fast_merge",
    value: function fast_merge(data, point, main) {
      if (main === void 0) {
        main = true;
      }
      if (!data) return;
      var last_t = (data[data.length - 1] || [])[0];
      var upd_t = point[0];
      if (!data.length || upd_t > last_t) {
        data.push(point);
        if (main && this.sett.auto_scroll) {
          this.scroll_to(upd_t);
        }
      } else if (upd_t === last_t) {
        if (main) {
          this.tv.$set(data, data.length - 1, point);
        } else {
          data[data.length - 1] = point;
        }
      }
    }
  }, {
    key: "scroll_to",
    value: function scroll_to(t) {
      if (this.tv.$refs.chart.cursor.locked) return;
      var last = this.tv.$refs.chart.last_candle;
      if (!last) return;
      var tl = last[0];
      var d = this.tv.getRange()[1] - tl;
      if (d > 0) this.tv["goto"](t + d);
    }
  }]);
  return DCCore;
}(DCEvents);

;// CONCATENATED MODULE: ./src/helpers/sett_proxy.js
// Sends all dc.sett changes to the web-worker

/* harmony default export */ function sett_proxy(sett, ww) {
  var h = {
    get: function get(sett, k) {
      return sett[k];
    },
    set: function set(sett, k, v) {
      sett[k] = v;
      ww.just('update-dc-settings', sett);
      return true;
    }
  };
  ww.just('update-dc-settings', sett);
  return new Proxy(sett, h);
}
;// CONCATENATED MODULE: ./src/helpers/agg_tool.js


// Tick aggregation


var AggTool = /*#__PURE__*/function () {
  function AggTool(dc, _int) {
    if (_int === void 0) {
      _int = 100;
    }
    classCallCheck_classCallCheck(this, AggTool);
    this.symbols = {};
    this["int"] = _int; // Itarval in ms
    this.dc = dc;
    this.st_id = null;
    this.data_changed = false;
  }
  createClass_createClass(AggTool, [{
    key: "push",
    value: function push(sym, upd, tf) {
      var _this = this;
      // Start auto updates
      if (!this.st_id) {
        this.st_id = setTimeout(function () {
          return _this.update();
        });
      }
      tf = parseInt(tf);
      var old = this.symbols[sym];
      var t = utils.now();
      var isds = sym.includes('datasets.');
      this.data_changed = true;
      if (!old) {
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else if (upd[0] >= old.upd[0] + tf && !isds) {
        // Refine the previous data point
        this.refine(sym, old.upd.slice());
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else {
        // Tick updates the current
        this.symbols[sym].upd = upd;
        this.symbols[sym].t = t;
      }
      if (isds) {
        this.symbols[sym].data.push(upd);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;
      var out = {};
      for (var sym in this.symbols) {
        var upd = this.symbols[sym].upd;
        switch (sym) {
          case 'ohlcv':
            var data = this.dc.data.chart.data;
            this.dc.fast_merge(data, upd);
            out.ohlcv = data.slice(-2);
            break;
          default:
            if (sym.includes('datasets.')) {
              this.update_ds(sym, out);
              continue;
            }
            var data = this.dc.get_one("".concat(sym));
            if (!data) continue;
            this.dc.fast_merge(data, upd, false);
            break;
        }
      }
      // TODO: fill gaps
      if (this.data_changed) {
        this.dc.ww.just('update-data', out);
        this.data_changed = false;
      }
      setTimeout(function () {
        return _this2.update();
      }, this["int"]);
    }
  }, {
    key: "refine",
    value: function refine(sym, upd) {
      if (sym === 'ohlcv') {
        var data = this.dc.data.chart.data;
        this.dc.fast_merge(data, upd);
      } else {
        var data = this.dc.get_one("".concat(sym));
        if (!data) return;
        this.dc.fast_merge(data, upd, false);
      }
    }
  }, {
    key: "update_ds",
    value: function update_ds(sym, out) {
      var data = this.symbols[sym].data;
      if (data.length) {
        out[sym] = data;
        this.symbols[sym].data = [];
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.symbols = {};
    }
  }]);
  return AggTool;
}();

;// CONCATENATED MODULE: ./src/helpers/datacube.js







function datacube_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = datacube_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function datacube_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return datacube_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return datacube_arrayLikeToArray(o, minLen); }
function datacube_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function datacube_createSuper(Derived) { var hasNativeReflectConstruct = datacube_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function datacube_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
// Main DataHelper class. A container for data,
// which works as a proxy and CRUD interface






// Interface methods. Private methods in dc_core.js
var DataCube = /*#__PURE__*/function (_DCCore) {
  _inherits(DataCube, _DCCore);
  var _super = datacube_createSuper(DataCube);
  function DataCube(data, sett) {
    var _this;
    if (data === void 0) {
      data = {};
    }
    if (sett === void 0) {
      sett = {};
    }
    classCallCheck_classCallCheck(this, DataCube);
    var def_sett = {
      aggregation: 100,
      // Update aggregation interval
      script_depth: 0,
      // 0 === Exec on all data
      auto_scroll: true,
      // Auto scroll to a new candle
      scripts: true,
      // Enable overlays scripts,
      ww_ram_limit: 0,
      // WebWorker RAM limit (MB)
      node_url: null,
      // Use node.js instead of WW
      shift_measure: true // Draw measurment shift+click
    };

    sett = Object.assign(def_sett, sett);
    _this = _super.call(this);
    _this.sett = sett;
    _this.data = data;
    _this.sett = sett_proxy(sett, _this.ww);
    _this.agg = new AggTool(_assertThisInitialized(_this), sett.aggregation);
    _this.se_state = {};

    //this.agg.update = this.agg_update.bind(this)
    return _this;
  }

  // Add new overlay
  createClass_createClass(DataCube, [{
    key: "add",
    value: function add(side, overlay) {
      if (side !== 'onchart' && side !== 'offchart' && side !== 'datasets') {
        return;
      }
      this.data[side].push(overlay);
      this.update_ids();
      return overlay.id;
    }

    // Get all objects matching the query
  }, {
    key: "get",
    value: function get(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      });
    }

    // Get first object matching the query
  }, {
    key: "get_one",
    value: function get_one(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      })[0];
    }

    // Set data (reactively)
  }, {
    key: "set",
    value: function set(query, data) {
      var objects = this.get_by_query(query);
      var _iterator = datacube_createForOfIteratorHelper(objects),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var obj = _step.value;
          var i = obj.i !== undefined ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$set(obj.p, i, data);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.update_ids();
    }

    // Merge object or array (reactively)
  }, {
    key: "merge",
    value: function merge(query, data) {
      var objects = this.get_by_query(query);
      var _iterator2 = datacube_createForOfIteratorHelper(objects),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var obj = _step2.value;
          if (Array.isArray(obj.v)) {
            if (!Array.isArray(data)) continue;
            // If array is a timeseries, merge it by timestamp
            // else merge by item index
            if (obj.v[0] && obj.v[0].length >= 2) {
              this.merge_ts(obj, data);
            } else {
              this.merge_objects(obj, data, []);
            }
          } else if (typeof_typeof(obj.v) === 'object') {
            this.merge_objects(obj, data);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.update_ids();
    }

    // Remove an overlay by query (id/type/name/...)
  }, {
    key: "del",
    value: function del(query) {
      var objects = this.get_by_query(query);
      var _iterator3 = datacube_createForOfIteratorHelper(objects),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var obj = _step3.value;
          // Find current index of the field (if not defined)
          var i = typeof obj.i !== 'number' ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$delete(obj.p, i);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.update_ids();
    }

    // Update/append data point, depending on timestamp
  }, {
    key: "update",
    value: function update(data) {
      if (data['candle']) {
        return this.update_candle(data);
      } else {
        return this.update_tick(data);
      }
    }

    // Lock overlays from being pulled by query_search
    // TODO: subject to review
  }, {
    key: "lock",
    value: function lock(query) {
      var objects = this.get_by_query(query);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = true;
        }
      });
    }

    // Unlock overlays from being pulled by query_search
    //
  }, {
    key: "unlock",
    value: function unlock(query) {
      var objects = this.get_by_query(query, true);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = false;
        }
      });
    }

    // Show indicator
  }, {
    key: "show",
    value: function show(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: true
      });
    }

    // Hide indicator
  }, {
    key: "hide",
    value: function hide(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: false
      });
    }

    // Set data loader callback
  }, {
    key: "onrange",
    value: function onrange(callback) {
      var _this2 = this;
      this.loader = callback;
      setTimeout(function () {
        return _this2.tv.set_loader(callback ? _this2 : null);
      }, 0);
    }
  }]);
  return DataCube;
}(DCCore);

;// CONCATENATED MODULE: ./src/mixins/interface.js
// Html interface, shown on top of the grid.
// Can be static (a tooltip) or interactive,
// e.g. a control panel.

/* harmony default export */ const mixins_interface = ({
  props: ['ux', 'updater', 'colors', 'wrapper'],
  mounted: function mounted() {
    this._$emit = this.$emit;
    this.$emit = this.custom_event;
    if (this.init) this.init();
  },
  methods: {
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    },
    // TODO: emit all the way to the uxlist
    // add apply the changes there
    modify: function modify(obj) {
      this.$emit('custom-event', {
        event: 'modify-interface',
        args: [this.$props.ux.uuid, obj]
      });
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    }
  },
  computed: {
    overlay: function overlay() {
      return this.$props.ux.overlay;
    },
    layout: function layout() {
      return this.overlay.layout;
    },
    uxr: function uxr() {
      return this.$props.ux;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/index.js















var primitives = {
  Candle: CandleExt,
  Volbar: VolbarExt,
  Line: Line,
  Pin: Pin,
  Price: Price,
  Ray: Ray,
  Seg: Seg
};
TradingVue.install = function (Vue) {
  Vue.component(TradingVue.name, TradingVue);
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TradingVue);
  window.TradingVueLib = {
    TradingVue: TradingVue,
    Overlay: overlay,
    Utils: utils,
    Constants: constants,
    Candle: CandleExt,
    Volbar: VolbarExt,
    layout_cnv: layout_cnv,
    layout_vol: layout_vol,
    DataCube: DataCube,
    Tool: tool,
    Interface: mixins_interface,
    primitives: primitives
  };
}
/* harmony default export */ const src = (TradingVue);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=trading-vue.js.map