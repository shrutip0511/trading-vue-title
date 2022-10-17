/*!
 * TradingVue.JS - v1.0.3 - Mon Oct 17 2022
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

/***/ 39:
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

/***/ 60:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\r\n    margin-left: 0.5em;\n}\r\n", ""]);
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

/***/ 734:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\r\n    position: relative;\r\n    z-index: 100;\r\n    font-size: 1.25em;\r\n    margin-left: 10px;\r\n    pointer-events: none;\r\n    text-align: left;\r\n    user-select: none;\r\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\r\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\r\n    pointer-events: none;\r\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\r\n    font-variant-numeric: tabular-nums;\r\n    font-size: 0.95em;\r\n    color: #999999; /* TODO: move => params */\r\n    margin-left: 0.1em;\r\n    margin-right: 0.2em;\n}\n.t-vue-title {\r\n    margin-right: 0.25em;\r\n    font-size: 1.45em;\n}\n.t-vue-ind {\r\n    margin-left: 0.2em;\r\n    margin-bottom: 0.5em;\r\n    font-size: 1.0em;\r\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\r\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\r\n    color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\r\n.tvjs-appear-leave-active\r\n{\r\n    transition: all .25s ease;\n}\n.tvjs-appear-enter, .tvjs-appear-leave-to\r\n{\r\n    opacity: 0;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 377:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\r\n    z-index: 100;\r\n    pointer-events: all;\r\n    cursor: pointer;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 821:
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

/***/ 233:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(39);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("c67b5498", content, false, {});
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

/***/ 598:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(60);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("36870e60", content, false, {});
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

/***/ 619:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(734);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("baa41140", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 862:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(377);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("cf6e4216", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 767:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(821);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("6cea774c", content, false, {});
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
  "use strict";
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */

  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return exports;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var exports = {},
      Op = Object.prototype,
      hasOwn = Op.hasOwnProperty,
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
    return generator._invoke = function (innerFn, self, context) {
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
    }(innerFn, self, context), generator;
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

    this._invoke = function (method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
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

  return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
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
  }), exports.keys = function (object) {
    var keys = [];

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

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=8c9ceaa4&
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

;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=template&id=8c9ceaa4&

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
var MONTHMAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // Grid time steps

var TIMESCALES = [YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR, MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH, DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY, HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR, MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE]; // Grid $ steps

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
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=532b3192&
var Chartvue_type_template_id_532b3192_render = function render() {
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

var Chartvue_type_template_id_532b3192_staticRenderFns = [];
Chartvue_type_template_id_532b3192_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=template&id=532b3192&

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
    }); // This saves monthly chart from being awkward

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
        base = _this$tri2.base; // Vector projection


    var proj = this.dot_prod(p1, p2, p3) / base; // Distance from left pin

    var l1 = Math.max(-proj, 0); // Distance from right pin

    var l2 = Math.max(proj - base, 0); // Normal

    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray: function point2ray(p1, p2, p3) {
    var _this$tri3 = this.tri(p1, p2, p3),
        area = _this$tri3.area,
        base = _this$tri3.base; // Vector projection


    var proj = this.dot_prod(p1, p2, p3) / base; // Distance from left pin

    var l1 = Math.max(-proj, 0); // Normal

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
    data_magnet: function data_magnet(t) {
      /* TODO: implement */
    }
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
var MAX_INT = Number.MAX_SAFE_INTEGER; // master_grid - ref to the master grid

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
    }); // The first y_range() determines the range

    if (yrs.length) y_range_fn = yrs[0].y_range;
  } // Calc vertical ($/₿) range


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
    } // Fixed y-range in non-auto mode


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
    } // TODO: improve sidebar width calculation
    // at transition point, when one precision is
    // replaced with another
    // Gets formated levels (their lengths),
    // calculates max and measures the sidebar length
    // from it:
    // TODO: add custom formatter f()


    self.prec = calc_precision(sub);
    var lens = []; //lens.push(self.$_hi.toFixed(self.prec).length)
    //lens.push(self.$_lo.toFixed(self.prec).length)

    lens.push(self.$_hi.toFixed(2).length);
    lens.push(self.$_lo.toFixed(2).length);
    var str = '0'.repeat(Math.max.apply(Math, lens)) + '    ';
    self.sb = ctx.measureText(str).width;
    self.sb = Math.max(Math.floor(self.sb), $p.config.SBMIN);
    self.sb = Math.min(self.sb, $p.config.SBMAX);
  } // Calculate $ precision for the Y-axis


  function calc_precision(data) {
    var max_r = 0,
        max_l = 0;
    var min = Infinity;
    var max = -Infinity; // Speed UP

    for (var i = 0, n = data.length; i < n; i++) {
      var x = data[i];
      if (x[1] > max) max = x[1];else if (x[1] < min) min = x[1];
    } // Get max lengths of integer and fractional parts


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
    }); // Select precision scheme depending
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
    var dt = range[1] - range[0]; // A pixel space available to draw on (x-axis)

    self.spacex = $p.width - self.sb; // Candle capacity

    var capacity = dt / interval;
    self.px_step = self.spacex / capacity; // px / time ratio

    var r = self.spacex / dt;
    self.startx = (sub[0][0] - range[0]) * r; // Candle Y-transform: (A = scale, B = shift)

    if (!grid.logScale) {
      self.A = -height / (self.$_hi - self.$_lo);
      self.B = -self.$_hi * self.A;
    } else {
      self.A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
      self.B = -math.log(self.$_hi) * self.A;
    }
  } // Select nearest good-loking t step (m is target scale)


  function time_step() {
    var k = ti_map.ib ? 60000 : 1;
    var xrange = (range[1] - range[0]) * k;
    var m = xrange * ($p.config.GRIDX / $p.width);
    var s = grid_maker_TIMESCALES;
    return utils.nearest_a(m, s)[1] / k;
  } // Select nearest good-loking $ step (m is target scale)


  function dollar_step() {
    var yrange = self.$_hi - self.$_lo;
    var m = yrange * ($p.config.GRIDY / height);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    var d = Math.pow(10, p);
    var s = grid_maker_$SCALES.map(function (x) {
      return x * d;
    }); // TODO: center the range (look at RSI for example,
    // it looks ugly when "80" is near the top)

    return utils.strip(utils.nearest_a(m, s)[1]);
  }

  function dollar_mult() {
    var mult_hi = dollar_mult_hi();
    var mult_lo = dollar_mult_lo();
    return Math.max(mult_hi, mult_lo);
  } // Price step multiplier (for the log-scale mode)


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
        insert_line(prev, p, x); // Filtering lines that are too near

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
      } // TODO: fix grid extension for bigger timeframes


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

    var d = timezone * grid_maker_HOUR; // TODO: take this block =========> (see below)

    if ((prev[0] || interval === grid_maker_YEAR) && utils.get_year(p_t) !== utils.get_year(prev_t)) {
      self.xs.push([x, p, grid_maker_YEAR]); // [px, [...], rank]
    } else if (prev[0] && utils.get_month(p_t) !== utils.get_month(prev_t)) {
      self.xs.push([x, p, grid_maker_MONTH]);
    } // TODO: should be added if this day !== prev day
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
      if (x < 0) break; // TODO: ==========> And insert it here somehow

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

    var q = 1 + (self.$_mult - 1) / 2; // Over 0

    for (var y$ = y1; y$ > 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var y = Math.floor(math.log(y$) * self.A + self.B);
      self.ys.push([y, utils.strip(y$)]);
      if (y > height) break;
      if (y - yp < $p.config.GRIDY * 0.7) break;
      if (self.ys.length > n + 1) break;
      yp = y;
    } // Under 0


    yp = Infinity;

    for (var y$ = y2; y$ < 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);

      var _y = Math.floor(math.log(y$) * self.A + self.B);

      if (yp - _y < $p.config.GRIDY * 0.7) break;
      self.ys.push([_y, utils.strip(y$)]);
      if (_y < 0) break;
      if (self.ys.length > n * 3 + 1) break;
      yp = _y;
    } // TODO: remove lines near to 0

  } // Search a start for the top grid so that
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
  } // Make log scale levels look great again


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

      apply_sizes(); // Link to the master grid (candlesticks)

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
  }); // Splits space between main chart
  // and offchart indicator grids

  function grid_hs() {
    var height = $p.height - $p.config.BOTBAR; // When at least one height defined (default = 1),
    // Pxs calculated as: (sum of weights) / number

    if (mgrid.height || offsub.find(function (x) {
      return x.grid.height;
    })) {
      return weighted_hs(mgrid, height);
    }

    var n = offsub.length;
    var off_h = 2 * Math.sqrt(n) / 7 / (n || 1); // Offchart grid height

    var px = Math.floor(height * off_h); // Main grid height

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
    }); // Refine the height if Math.floor decreased px sum

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
      }); // Clear volume bar if there is a time gap

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
  } // Main grid


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
  var gms = [new grid_maker(0, specs)]; // Sub grids

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
    } // Max sidebar among all grinds

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
      var data = this.comp[s].data; // Split offchart data between offchart grids

      if (grid.id > 0) {
        // Sequential grids
        var _d = data.filter(function (x) {
          return x.grid.id === undefined;
        }); // grids with custom ids (for merging)


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
    } // Nearest datapoints

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
    } // Get cursor t-position (extended)

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
      } // Inside the data range


      return candle.t;
    }
  }]);

  return CursorUpdater;
}();

/* harmony default export */ const updater = (CursorUpdater);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=7a196dff&
var Sectionvue_type_template_id_7a196dff_render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c("div", {
    staticClass: "trading-vue-section"
  }, [_c("chart-legend", {
    ref: "legend",
    attrs: {
      values: _vm.section_values,
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
      enableZoom: _vm.enableZoom
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
      rerender: _vm.rerender
    },
    on: {
      "sidebar-transform": _vm.sidebar_transform
    }
  }, "sidebar", _vm.sidebar_props, false))], 1);
};

var Sectionvue_type_template_id_7a196dff_staticRenderFns = [];
Sectionvue_type_template_id_7a196dff_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=template&id=7a196dff&

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
    } // Simulated mousedown (for mobile)

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
    } // Convert touch to "mouse" event

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
      overlays.push.apply(overlays, _toConsumableArray(this.overlays)); // z-index sorting

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
    } // Actually draws the grid (for real)

  }, {
    key: "grid",
    value: function grid() {
      this.ctx.strokeStyle = this.$p.colors.grid;
      this.ctx.beginPath();
      var ymax = this.layout.height; // for (var [x, p] of this.layout.xs) {
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
      delta = utils.smart_wheel(delta); // TODO: mouse zooming is a little jerky,
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

        var z = diff / (this.range[1] - this.range[0]); //rezoom_range(z, diff_x, diff_y)

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
      range[1] = utils.clamp(range[1], data[0][0] + this.interval * 5.5, Infinity); // TODO: IMPORTANT scrolling is jerky The Problem caused
      // by the long round trip of 'range-changed' event.
      // First it propagates up to update layout in Chart.vue,
      // then it moves back as watch() update. It takes 1-5 ms.
      // And because the delay is different each time we see
      // the lag. No smooth movement and it's annoying.
      // Solution: we could try to calc the layout immediatly
      // somewhere here. Still will hurt the sidebar & bottombar

      this.comp.$emit("range-changed", range);
    } // Propagate mouse event to overlays

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
        var ctx = canvas.getContext('2d', {// TODO: test the boost:
          //alpha: false,
          //desynchronized: true,
          //preserveDrawingBuffer: false
        });
        ctx.scale(dpr, dpr);

        _this.redraw(); // Fallback fix for Brave browser
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
          this.uxs.push(d.args[0]); // this.rerender++
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
  }

  createClass_createClass(Crosshair, [{
    key: "draw",
    value: function draw(ctx) {
      // Update reference to the grid
      this.layout = this.$p.layout;
      var cursor = this.comp.$props.cursor;
      if (!this.visible && cursor.mode === 'explore') return;
      this.x = this.$p.cursor.x;
      this.y = this.$p.cursor.y;
      ctx.save();
      ctx.strokeStyle = this.$p.colors.cross;
      ctx.beginPath();
      ctx.setLineDash([5]); // H

      if (this.$p.cursor.grid_id === this.layout.id) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.layout.width - 0.5, this.y);
      } // V


      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, this.layout.height);
      ctx.stroke();
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
  props: ['cursor', 'colors', 'layout', 'sub'],
  watch: {
    cursor: {
      handler: function handler() {
        if (!this.ch) this.create(); // Explore = default mode on mobile

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
    }
  },
  methods: {
    create: function create() {
      this.ch = new Crosshair(this); // New grid overlay-renderer descriptor.
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
  } // You can choose where to place the handler
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
    } // Called by grid.js

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
    } // Main chart?


    var main = this.$props.sub === this.$props.data;
    this.meta_info(); // TODO(1): quick fix for vue2, in vue3 we use 3rd party emit

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
    }); // Overlay meta-props (adjusting behaviour)


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
      } // TODO: add a namespace to the event name
      // TODO(2): this prevents call overflow, but
      // the root of evil is in (1)


      if (event === 'custom-event') return; // console.log('custom-event',{event, args})

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
      var data = this.$props.data; // RSI values

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

      ctx.beginPath(); // Fill the area between the bands

      ctx.fillStyle = this.back_color;
      ctx.fillRect(0, upper, layout.width, lower - upper); // Upper band

      ctx.moveTo(0, upper);
      ctx.lineTo(layout.width, upper); // Lower band

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

      ctx.fill(); // Lines

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color; // Top line

      ctx.beginPath();

      for (var i = 0; i < data.length; i++) {
        var _p2 = data[i];

        var _x2 = layout.t2screen(_p2[0]);

        var _y2 = layout.$2screen(_p2[1] || undefined);

        ctx.lineTo(_x2, _y2);
      }

      ctx.stroke(); // Bottom line

      ctx.beginPath();

      for (var i = 0; i < data.length; i++) {
        var _p3 = data[i];

        var _x3 = layout.t2screen(_p3[0]);

        var _y3 = layout.$2screen(_p3[3] || undefined);

        ctx.lineTo(_x3, _y3);
      }

      ctx.stroke(); // Middle line

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
  var volume = []; // The volume bar height is determined as a percentage of
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
      prev = undefined; // Subset interval against main interval

  var _new_interval = new_interval(layout, $p, sub),
      _new_interval2 = _slicedToArray(_new_interval, 2),
      interval2 = _new_interval2[0],
      ratio = _new_interval2[1];

  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0; // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift

  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1; // Clear volume bar if there is a time gap

    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }

    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5; // TODO: add log scale support

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
  var volume = []; // Detect data second dimention size:

  var dim = sub[0] ? sub[0].length : 0; // Support special volume data (see API book), or OHLCV
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
      prev = undefined; // Subset interval against main interval

  var _new_interval3 = new_interval(layout, $p, sub),
      _new_interval4 = _slicedToArray(_new_interval3, 2),
      interval2 = _new_interval4[0],
      ratio = _new_interval4[1];

  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0; // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift

  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1; // Clear volume bar if there is a time gap

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
        this.ctx.fillStyle = body_color; // TODO: Move common calculations to layout.js

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
  } // Defines an inline shader (has access to both
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

      this.comp.$emit('new-shader', {
        target: 'sidebar',
        draw: function draw(ctx) {
          var bar = last_bar();
          if (!bar) return;
          var w = ctx.canvas.width;
          var h = config.PANHEIGHT; //let lbl = bar.price.toFixed(layout.prec)

          var lbl = bar.price.toFixed(2);
          ctx.fillStyle = bar.color;
          var x = -0.5;
          var y = bar.y - h * 0.5 - 0.5;
          var a = 7;
          ctx.fillRect(x - 0.5, y, w + 1, h);
          ctx.fillStyle = comp.$props.colors.textHL;
          ctx.textAlign = 'left';
          ctx.fillText(lbl, a, y + 15);
        }
      });
      this.shader = true;
    } // Regular draw call for overaly

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
      var y = layout.$2screen(last[4]); //let cndl = layout.c_magnet(last[0])

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
  }]);

  return Price;
}();


;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Candles.vue?vue&type=script&lang=js&
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator





/* harmony default export */ const Candlesvue_type_script_lang_js_ = ({
  name: 'Candles',
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
      return 'showVolume' in this.sett ? this.sett.showVolume : true;
    },
    price_line: function price_line() {
      return 'priceLine' in this.sett ? this.sett.priceLine : true;
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
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.2.1'
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
        }; // Else, as offchart / onchart indicator:
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
      return ['Candles'];
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
    } // Called by grid.js

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
      this.x = this.comp.$props.cursor.x; // Save pin as time in IB mode
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
      this.x = this.layout.t2screen(this.t); // TODO: Save pin as time in IB mode
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
  } // p1[t, $], p2[t, $] (time-price coordinates)


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
    } // Collision function. x, y - mouse coord.

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
  } // p1[t, $], p2[t, $] (time-price coordinates)


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
      var h = layout.height; // TODO: transform k (angle) to screen ratio
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
    } // Collision function. x, y - mouse coord.

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
      this.pins.push(new Pin(this, 'p1')); // Second one is following mouse until it clicks

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
      })); // Second one is following mouse until it clicks

      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking',
        hidden: this.shift
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');

        _this.$emit('drawing-mode-off'); // Deselect the tool in shiftMode


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
      ctx.strokeStyle = this.color; // Background

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
        new Seg(this, ctx).draw([this.p1[0], this.p2[1]], [this.p2[0], this.p2[1]]); // Bottom

        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p2[0], this.p1[1]]);
      } // Vertical Arrow


      ctx.moveTo(xm - 4, y2 + 5 * dir);
      ctx.lineTo(xm, y2);
      ctx.lineTo(xm + 4, y2 + 5 * dir);
      ctx.stroke(); // Vertical Line

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
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p1[0], this.p2[1]]); // Right

        new Seg(this, ctx).draw([this.p2[0], this.p1[1]], [this.p2[0], this.p2[1]]);
      } // Horizontal Arrow


      ctx.moveTo(x2 - 5 * xdir, ym - 4);
      ctx.lineTo(x2, ym);
      ctx.lineTo(x2 - 5 * xdir, ym + 4);
      ctx.stroke(); // Horizontal Line

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

      ctx.font = this.new_font; // Price delta (anf percent)
      //let d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec)
      //let p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec)

      var d$ = (this.p2[1] - this.p1[1]).toFixed(2);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(2); // Map interval to the actual tf (in ms)

      var f = function f(t) {
        return _this2.layout.ti_map.smth2t(t);
      };

      var dt = f(this.p2[0]) - f(this.p1[0]);
      var tf = this.layout.ti_map.tf; // Bars count (through the candle index)

      var f2 = function f2(t) {
        var c = _this2.layout.c_magnet(t);

        var cn = _this2.layout.candles || _this2.layout.master_grid.candles;
        return cn.indexOf(c);
      }; // Bars count (and handling the negative values)


      var b = f2(this.p2[0]) - f2(this.p1[0]); // Format time delta
      // Format time delta

      var dtstr = this.t2str(dt);
      var text = [];
      if (this.price) text.push("".concat(d$, "  (").concat(p, "%)"));
      if (this.time) text.push("".concat(b, " bars, ").concat(dtstr));
      text = text.join('\n'); // "Multiple" fillText

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
  props: ["sub", "layout", "range", "interval", "cursor", "colors", "overlays", "width", "height", "data", "grid_id", "y_transform", "font", "tv_id", "config", "meta", "shaders", "enableZoom"],
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
    enableZoom: function (_enableZoom) {
      function enableZoom() {
        return _enableZoom.apply(this, arguments);
      }

      enableZoom.toString = function () {
        return _enableZoom.toString();
      };

      return enableZoom;
    }(function () {
      console.log("props:", enableZoom);
    }),
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
    this._list = [Spline, Splines, Range, Trades, Channel, Segment, Candles, Volume, Splitters, LineTool, RangeTool].concat(this.$props.overlays);
    this._registry = {}; // We need to know which components we will use.
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

    // console.log("props:",this.enableZoom);
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
      }); // TODO: close all interfaces

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
        colors: this.$props.colors,
        layout: this.$props.layout.grids[this.$props.grid_id],
        interval: this.$props.interval,
        sub: this.$props.sub,
        font: this.$props.font,
        config: this.$props.config
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
      } // Search for an overlay with the target 'name'


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
      side = 'right';
    }

    classCallCheck_classCallCheck(this, Sidebar);

    PANHEIGHT = comp.config.PANHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
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
        event: 'doubletap',
        taps: 2,
        posThreshold: 50
      }));
      mc.on('panstart', function (event) {
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
      mc.on('panmove', function (event) {
        if (_this.drug) {
          _this.zoom = _this.calc_zoom(event);

          _this.comp.$emit('sidebar-transform', {
            grid_id: _this.id,
            zoom: _this.zoom,
            auto: false,
            range: _this.calc_range(),
            drugging: true
          });

          _this.update();
        }
      });
      mc.on('panend', function () {
        _this.drug = null;

        _this.comp.$emit('sidebar-transform', {
          grid_id: _this.id,
          drugging: false
        });
      });
      mc.on('doubletap', function () {
        _this.comp.$emit('sidebar-transform', {
          grid_id: _this.id,
          zoom: 1.0,
          auto: true
        });

        _this.zoom = 1.0;

        _this.update();
      }); // TODO: Do later for mobile version
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
      var sb = this.layout.sb; //this.ctx.fillStyle = this.$p.colors.back

      this.ctx.font = this.$p.font;

      switch (side) {
        case 'left':
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height; //this.ctx.fillRect(x, y, w, h)

          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;

        case 'right':
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height; //this.ctx.fillRect(x, y, w, h)

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
          var x1 = side === 'left' ? w - 0.5 : x - 0.5;
          var x2 = side === 'left' ? x1 - 4.5 : x1 + 4.5;
          this.ctx.moveTo(x1, p[0] - 0.5);
          this.ctx.lineTo(x2, p[0] - 0.5);
          var offst = side === 'left' ? -10 : 10;
          this.ctx.textAlign = side === 'left' ? 'end' : 'start';
          var d = this.layout.prec; //this.ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4)

          this.ctx.fillText(p[1].toFixed(2), x1 + offst, p[0] + 4);
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
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    } // A gray bar behind the current price

  }, {
    key: "panel",
    value: function panel() {
      if (this.$p.cursor.grid_id !== this.layout.id) {
        return;
      } //let lbl = this.$p.cursor.y$.toFixed(this.layout.prec)


      var lbl = this.$p.cursor.y$.toFixed(2);
      this.ctx.fillStyle = this.$p.colors.panel;
      var panwidth = this.layout.sb + 1;
      var x = -0.5;
      var y = this.$p.cursor.y - PANHEIGHT * 0.5 - 0.5;
      var a = 7;
      this.ctx.fillRect(x - 0.5, y, panwidth, PANHEIGHT);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(lbl, a, y + 15);
    }
  }, {
    key: "calc_zoom",
    value: function calc_zoom(event) {
      var d = this.drug.y - event.center.y;
      var speed = d > 0 ? 3 : 1;
      var k = 1 + speed * d / this.layout.height;
      return utils.clamp(this.drug.z * k, 0.005, 100);
    } // Not the best place to calculate y-range but
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
        var new_lo = px_mid + px_mid * (1 / z); // Use old mapping to get a new range

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
      this.zoom = 1.0; // TODO: further work (improve scaling ratio)

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
      this.comp.$emit('sidebar-transform', {
        grid_id: this.id,
        zoom: this.zoom,
        auto: false,
        range: this.calc_range(diff1, diff2),
        drugging: true
      });
      this.drug = null;
      this.comp.$emit('sidebar-transform', {
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
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'grid_id', 'rerender', 'y_transform', 'tv_id', 'config', 'shaders'],
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
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=82eac28c&
var Legendvue_type_template_id_82eac28c_render = function render() {
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

var Legendvue_type_template_id_82eac28c_staticRenderFns = [];
Legendvue_type_template_id_82eac28c_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=template&id=82eac28c&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=c35cceb6&
var ButtonGroupvue_type_template_id_c35cceb6_render = function render() {
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

var ButtonGroupvue_type_template_id_c35cceb6_staticRenderFns = [];
ButtonGroupvue_type_template_id_c35cceb6_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=template&id=c35cceb6&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=b1c1a2a2&
var LegendButtonvue_type_template_id_b1c1a2a2_render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c("img", {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + "px",
      height: _vm.config.L_BTN_SIZE + "px",
      margin: _vm.config.L_BTN_MARGIN
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

var LegendButtonvue_type_template_id_b1c1a2a2_staticRenderFns = [];
LegendButtonvue_type_template_id_b1c1a2a2_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=template&id=b1c1a2a2&

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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&id=b1c1a2a2&prod&lang=css&
var LegendButtonvue_type_style_index_0_id_b1c1a2a2_prod_lang_css_ = __webpack_require__(862);
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=style&index=0&id=b1c1a2a2&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js_,
  LegendButtonvue_type_template_id_b1c1a2a2_render,
  LegendButtonvue_type_template_id_b1c1a2a2_staticRenderFns,
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&id=c35cceb6&prod&lang=css&
var ButtonGroupvue_type_style_index_0_id_c35cceb6_prod_lang_css_ = __webpack_require__(598);
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=style&index=0&id=c35cceb6&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js_,
  ButtonGroupvue_type_template_id_c35cceb6_render,
  ButtonGroupvue_type_template_id_c35cceb6_staticRenderFns,
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
  props: ['common', 'values', 'grid_id', 'meta_props', 'main_chart_type', 'ignore_OHLC'],
  computed: {
    legendTxtConfig: function legendTxtConfig() {
      var res = [];
      var legendTxtConfig = localStorage.getItem('legendTxtConfig'); // console.log('legendTxtConfig',legendTxtConfig)

      if (this.ignore_OHLC && legendTxtConfig) {
        res = JSON.parse(legendTxtConfig);
        console.log('parse response ', res);
      }

      return res;
    },
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      } // const prec = this.layout.prec


      var prec = 2; // TODO: main the main legend more customizable

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
      var meta = this.$props.meta_props[id] || {}; // Matches Overlay.data_colors with the data values
      // (see Spline.vue)

      if (!values[id]) return this.n_a(1); // Custom formatter

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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&id=82eac28c&prod&lang=css&
var Legendvue_type_style_index_0_id_82eac28c_prod_lang_css_ = __webpack_require__(619);
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=style&index=0&id=82eac28c&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js_,
  Legendvue_type_template_id_82eac28c_render,
  Legendvue_type_template_id_82eac28c_staticRenderFns,
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
          } // TODO: Sort by zIndex

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
  props: ["common", "grid_id", "enableZoom", "ignore_OHLC"],
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
      var p = Object.assign({}, this.$props.common); // Split offchart data between offchart grids

      if (id > 0) {
        var _p$data;

        var all = p.data;
        p.data = [p.data[id - 1]]; // Merge offchart overlays with custom ids with
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
      var p = Object.assign({}, this.$props.common); // Split offchart data between offchart grids

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
        var mainType = mainData.type ? mainData.type : ""; // console.log('this.$props.range',mainType,JSON.stringify(rangeParams))

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
    this.init_shaders(this.$props.common.skin); // console.log('common.data',this.$props.common.data)
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&id=7a196dff&prod&lang=css&
var Sectionvue_type_style_index_0_id_7a196dff_prod_lang_css_ = __webpack_require__(767);
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=style&index=0&id=7a196dff&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js_,
  Sectionvue_type_template_id_7a196dff_render,
  Sectionvue_type_template_id_7a196dff_staticRenderFns,
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
      var sb = this.layout.grids[0].sb; //this.ctx.fillStyle = this.$p.colors.back

      this.ctx.font = this.$p.font; //this.ctx.fillRect(0, 0, width, height)

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
      var ti = this.$p.layout.grids[0].ti_map.tf; // Enable timezones only for tf < 1D

      var k = ti < botbar_DAY ? 1 : 0;
      var tZ = t + k * this.$p.timezone * botbar_HOUR; //t += new Date(t).getTimezoneOffset() * MINUTE

      var d = new Date(tZ);

      if (p[2] === botbar_YEAR || utils.year_start(t) === t) {
        return d.getUTCFullYear();
      }

      if (p[2] === botbar_MONTH || utils.month_start(t) === t) {
        return botbar_MONTHMAP[d.getUTCMonth()];
      } // TODO(*) see grid_maker.js


      if (utils.day_start(tZ) === tZ) return d.getUTCDate();
      var h = utils.add_zero(d.getUTCHours());
      var m = utils.add_zero(d.getUTCMinutes());
      return h + ':' + m;
    }
  }, {
    key: "format_cursor_x",
    value: function format_cursor_x() {
      var t = this.$p.cursor.t;
      t = this.grid_0.ti_map.i2t(t); //let ti = this.$p.interval

      var ti = this.$p.layout.grids[0].ti_map.tf; // Enable timezones only for tf < 1D

      var k = ti < botbar_DAY ? 1 : 0; //t += new Date(t).getTimezoneOffset() * MINUTE

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
    } // Highlights the begining of a time interval
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

var MAX_ARR = Math.pow(2, 32); // 3 MODES of index calculation for overlays/subcharts:
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
      var start = meta.sub_start; // Skip mapping for the regular mode

      if (this.ib) {
        this.map_sub(res);
      }
    } // Make maps for the main subset

  }, {
    key: "map_sub",
    value: function map_sub(res) {
      for (var i = 0; i < res.length; i++) {
        var t = res[i][0];

        var _i = this.ss + i;

        this.ti_map[t] = _i;
        this.it_map[_i] = t; // Overwrite t with i

        var copy = _toConsumableArray(res[i]);

        copy[0] = _i;
        this.sub_i.push(copy);
      }
    } // Map overlay data
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
      } // If indicator data starts after ohlcv, calc the first index


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
          } // Linear interpolation
          else {
            var tk2 = this.sub[k + 1][0];
            index = tk === tk2 ? this.ss + k : this.ss + k + (t - tk) / (tk2 - tk);
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }
        } // Race of data points & sub points (ohlcv)
        // (like turn based increments)


        while (k + 1 < this.sub.length - 1 && t > this.sub[k + 1][0]) {
          k++;
          tk = this.sub[k][0];
        }

        _copy[0] = index;
        res.push(_copy);
      }

      return res;
    } // index => time

  }, {
    key: "i2t",
    value: function i2t(i) {
      if (!this.ib || !this.sub.length) return i; // Regular mode
      // Discrete mapping

      var res = this.it_map[i];
      if (res !== undefined) return res; // Linear extrapolation
      else if (i >= this.ss + this.sub_i.length) {
        var di = i - (this.ss + this.sub_i.length) + 1;
        var last = this.sub[this.sub.length - 1];
        return last[0] + di * this.tf;
      } else if (i < this.ss) {
        var _di = i - this.ss;

        return this.sub[0][0] + _di * this.tf;
      } // Linear Interpolation

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
    } // Map or bypass depending on the mode

  }, {
    key: "i2t_mode",
    value: function i2t_mode(i, mode) {
      return mode === 'data' ? i : this.i2t(i);
    } // time => index
    // TODO: when switch from IB mode to regular tools
    // disappear (bc there is no more mapping)

  }, {
    key: "t2i",
    value: function t2i(t) {
      if (!this.sub.length) return undefined; // Discrete mapping

      var res = this.ti_map[t];
      if (res !== undefined) return res;
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0]; // Linear extrapolation

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
    } // Auto detect: is it time or index?
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
    } // Global Time => Index (uses all data, approx. method)
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
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'skin', 'timezone', 'enableZoom', 'ignore_OHLC', 'ignoreNegativeIndex'],
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
        var sub = this.subset(); // Fixes Infinite loop warn, when the subset is empty
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
        this.update_last_values(); // TODO: update legend values for overalys

        this.rerender++;
        var findMain = this.main_section.data.find(function (d) {
          return d.main;
        }); // this
        //   this.$emit('custom-event', {})
        //   console.log('this.rerender',findMain,this.sub.length)
      },
      deep: true
    }
  },
  created: function created() {
    // Context for text measurements
    this.ctx = new context(this.$props); // Initial layout (All measurments for the chart)

    this.init_range();
    this.sub = this.subset();
    utils.overwrite(this.range, this.range); // Fix for IB mode

    this._layout = new layout(this); // Updates current cursor values

    this.updater = new updater(this);
    this.update_last_values();
    this.init_shaders(this.skin);
  },
  methods: {
    range_changed: function range_changed(r) {
      // Overwite & keep the original references
      // Quick fix for IB mode (switch 2 next lines)
      // TODO: wtf?
      var sub = this.subset(r); // console.log('this.range before update',this.range)

      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout(); // console.log('this.range after update',this.sub.length,r,this.range)
      // console.log('range_changes_working',this.ignoreNegativeIndex)

      if (this.ignoreNegativeIndex) {
        // let r2 = this.ti_map.t2i(r[0])
        this.$emit('range-changed', r, this.range);
      } else {
        this.$emit('range-changed', r);
      }

      if (this.$props.ib) this.save_data_t(); // console.log('this.ti_map.t2i(r[0])',this.ti_map.t2i(r[0]))
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
        skin: this.$props.skin
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

      this.$set(this.layers_meta[d.grid_id], d.layer_id, d); // Rerender

      this.update_layout();
    },
    remove_meta_props: function remove_meta_props(grid_id, layer_id) {
      if (grid_id in this.layers_meta) {
        this.$delete(this.layers_meta[grid_id], layer_id);
      }
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'botbar'); // console.log('emit_custom_event',d)

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
  Chartvue_type_template_id_532b3192_render,
  Chartvue_type_template_id_532b3192_staticRenderFns,
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
      clearTimeout(this.click_id); //if (Utils.is_mobile && src === 'click') return
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

          var nc = new x.Main(this, // tv inst
          this.data, // dc
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
        t2 = ti_map.gt2i(t2, ohlcv); // console.log('this.ignoreNegativeIndex and t1',t1, t2,this.ignoreNegativeIndex)

        if (t1 < 0 && this.ignoreNegativeIndex) {
          t1 = 0;
        }
      }

      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map; // Time range => index range
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
        var ti_map = this.$refs.chart.ti_map; // let copy = Object.assign({}, cursor);
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
      } // console.log('range_changes_working 1',r,r2)


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
  }
});
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=script&lang=js&
 /* harmony default export */ const src_TradingVuevue_type_script_lang_js_ = (TradingVuevue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&id=8c9ceaa4&prod&lang=css&
var TradingVuevue_type_style_index_0_id_8c9ceaa4_prod_lang_css_ = __webpack_require__(233);
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=style&index=0&id=8c9ceaa4&prod&lang=css&

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

      if (this.worker) this.worker.terminate(); // URL.createObjectURL

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
    } // Send to node.js via websocket

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
    } // Execute a task

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
    } // Relay an event from iframe postMessage
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
      } //let wrap = `${pre}_v(${vname}, ${vindex})[${vindex}]`


      var wrap = "".concat(vname, "[").concat(pre, "_i(").concat(vindex, ", ").concat(vname, ")]");
      src = src.replace(m[0], wrap);
      changed = true;
    }
  } while (m);

  return changed ? src : src;
} // Get all module helper classes

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
} // Get tf in ms from pairs such (`15`, `m`)

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
} // Apply filter for all new overlays

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
} // Return index of the next element in
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
} // Estimated size of datasets

function size_of_dss(data) {
  var bytes = 0;

  for (var id in data) {
    if (data[id].data && data[id].data[0]) {
      var s0 = size_of(data[id].data[0]);
      bytes += s0 * data[id].data.length;
    }
  }

  return bytes;
} // Used to measure the size of dataset

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
} // Update onchart/offchart

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
    this.dc = dc; // Send the data to WW

    if (desc.data) {
      this.dc.ww.just('upload-data', _defineProperty({}, this.id, desc)); // Remove the data from the descriptor

      delete desc.data;
    }

    var proto = Object.getPrototypeOf(this);
    Object.setPrototypeOf(desc, proto);
    Object.defineProperty(desc, 'dc', {
      get: function get() {
        return dc;
      }
    });
  } // Watch for the changes of descriptors


  createClass_createClass(Dataset, [{
    key: "set",
    value: // Set data (overwrite the whole dataset)
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
    } // Update with new data (array of data points)

  }, {
    key: "update",
    value: function update(arr) {
      this.dc.ww.just('update-data', _defineProperty({}, this.id, arr));
    } // Send WW a chunk to merge. The merge algo
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
    } // Remove the ds from WW

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
    } // Fetch data from WW

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
    } // Make an object for data transfer

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
      } // TODO: add more sophisticated search
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
  } // Update from 'update-data' event
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
    } // On dataset operation

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

    this.ww = new script_ww_api(this); // Listen to the web-worker events

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
  } // Called when overalay/tv emits 'custom-event'


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
    } // Triggered when one or multiple settings are changed
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
    } // When the set of $uuids is changed

  }, {
    key: "on_ids_changed",
    value: function on_ids_changed(values, prev) {
      var rem = prev.filter(function (x) {
        return x !== undefined && !values.includes(x);
      });

      if (rem.length) {
        this.ww.just('remove-scripts', rem);
      }
    } // Combine all tools and their mods

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
        } // Parse script props & get the values from the ov
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
        } // Remove old props (dropped by the current exec)


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
    } // Overlay modification from WW

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
      this.object_selected([]); // Remove the previous RangeTool

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
    } // Place a new tool

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
    } // Remove selected / Remove all, etc

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
    } // Apply new overlay settings

  }, {
    key: "change_settings",
    value: function change_settings(args) {
      var settings = args[0];
      delete settings.id;
      var grid_id = args[1];
      this.merge("".concat(args[3], ".settings"), settings);
    } // Lock the scrolling mechanism

  }, {
    key: "on_scroll_lock",
    value: function on_scroll_lock(flag) {
      this.tv.$set(this.data, 'scrollLock', flag);
    } // When new object is selected / unselected

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
    } // Set overlay data from the web-worker

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
    } // Push overlay updates from the web-worker

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
    } // Clean-up unfinished business (tools)

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
    } // Get overlay by grid-layer id

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
    value: // Set TV instance (once). Called by TradingVue itself
    function init_tvjs($root) {
      var _this = this;

      if (!this.tv) {
        this.tv = $root;
        this.init_data();
        this.update_ids(); // Listen to all setting changes
        // TODO: works only with merge()

        this.tv.$watch(function () {
          return _this.get_by_query('.settings');
        }, function (n, p) {
          return _this.on_settings(n, p);
        }); // Listen to all indices changes

        this.tv.$watch(function () {
          return _this.get('.').map(function (x) {
            return x.settings.$uuid;
          });
        }, function (n, p) {
          return _this.on_ids_changed(n, p);
        }); // Watch for all 'datasets' changes

        this.tv.$watch(function () {
          return _this.get('datasets');
        }, Dataset.watcher.bind(this));
      }
    } // Init Data Structure v1.1

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
      } // Remove ohlcv cuz we have Data v1.1^


      delete this.data.ohlcv;

      if (!('datasets' in this.data)) {
        this.tv.$set(this.data, 'datasets', []);
      } // Init dataset proxies


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
    } // Range change callback (called by TradingVue)
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
    } // Update ids for all overlays

  }, {
    key: "update_ids",
    value: function update_ids() {
      this.data.chart.id = "chart.".concat(this.data.chart.type);
      var count = {}; // grid_id,layer_id => DC id mapping

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
          if (!ov.settings) this.tv.$set(ov, 'settings', {}); // grid_id,layer_id => DC id mapping

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
          if (!ov.settings) this.tv.$set(ov, 'settings', {}); // grid_id,layer_id => DC id mapping

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
    } // TODO: chart refine (from the exchange chart)

  }, {
    key: "update_candle",
    value: function update_candle(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var candle = data['candle'];
      var tf = this.tv.$refs.chart.interval_ms;
      var t_next = last[0] + tf;
      var now = data.t || utils.now();
      var t = now >= t_next ? now - now % tf : last[0]; // Update the entire candle

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
    } // Updates all overlays with given values.

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
    } // Returns array of objects matching query.
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
    } // Merge overlapping time series

  }, {
    key: "merge_ts",
    value: function merge_ts(obj, data) {
      // Assume that both arrays are pre-sorted
      if (!data.length) return obj.v;
      var r1 = [obj.v[0][0], obj.v[obj.v.length - 1][0]];
      var r2 = [data[0][0], data[data.length - 1][0]]; // Overlap

      var o = [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];

      if (o[1] >= o[0]) {
        var _obj$v, _data;

        var _this$ts_overlap = this.ts_overlap(obj.v, data, o),
            od = _this$ts_overlap.od,
            d1 = _this$ts_overlap.d1,
            d2 = _this$ts_overlap.d2;

        (_obj$v = obj.v).splice.apply(_obj$v, _toConsumableArray(d1));

        (_data = data).splice.apply(_data, _toConsumableArray(d2)); // Dst === Overlap === Src


        if (!obj.v.length && !data.length) {
          this.tv.$set(obj.p, obj.i, od);
          return obj.v;
        } // If src is totally contained in dst


        if (!data.length) {
          data = obj.v.splice(d1[0]);
        } // If dst is totally contained in src


        if (!obj.v.length) {
          obj.v = data.splice(d2[0]);
        }

        this.tv.$set(obj.p, obj.i, this.combine(obj.v, od, data));
      } else {
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, [], data));
      }

      return obj.v;
    } // TODO: review performance, move to worker

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
      }); // Indices of segments

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
    } // Combine parts together:
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
      } // The overlap right in the middle


      if (src[0][0] >= dst[0][0] && last(src) <= last(dst)) {
        return Object.assign(dst, o); // The overlap is on the right
      } else if (last(src) > last(dst)) {
        // Psh(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _dst;

          (_dst = dst).push.apply(_dst, _toConsumableArray(o).concat(_toConsumableArray(src)));

          return dst;
        } else {
          return dst.concat(o, src);
        } // The overlap is on the left

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
    } // Simple data-point merge (faster)

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
      } // TODO: fill gaps


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
    _this.se_state = {}; //this.agg.update = this.agg_update.bind(this)

    return _this;
  } // Add new overlay


  createClass_createClass(DataCube, [{
    key: "add",
    value: function add(side, overlay) {
      if (side !== 'onchart' && side !== 'offchart' && side !== 'datasets') {
        return;
      }

      this.data[side].push(overlay);
      this.update_ids();
      return overlay.id;
    } // Get all objects matching the query

  }, {
    key: "get",
    value: function get(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      });
    } // Get first object matching the query

  }, {
    key: "get_one",
    value: function get_one(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      })[0];
    } // Set data (reactively)

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
    } // Merge object or array (reactively)

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
            if (!Array.isArray(data)) continue; // If array is a timeseries, merge it by timestamp
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
    } // Remove an overlay by query (id/type/name/...)

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
    } // Update/append data point, depending on timestamp

  }, {
    key: "update",
    value: function update(data) {
      if (data['candle']) {
        return this.update_candle(data);
      } else {
        return this.update_tick(data);
      }
    } // Lock overlays from being pulled by query_search
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
    } // Unlock overlays from being pulled by query_search
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
    } // Show indicator

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
    } // Hide indicator

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
    } // Set data loader callback

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