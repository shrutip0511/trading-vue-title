/*!
 * TradingVue.JS - v1.0.2 - Tue Apr 12 2022
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

/***/ 757:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(666);


/***/ }),

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

/***/ 418:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\r\n/* Anit-boostrap tactix */\n.trading-vue *, ::after, ::before {\r\n    box-sizing: content-box;\n}\n.trading-vue img {\r\n    vertical-align: initial;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 976:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-botbar {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 449:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\r\n    margin-left: 0.5em;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 108:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-item-list {\r\n    position: absolute;\r\n    user-select: none;\r\n    margin-top: -5px;\n}\n.tvjs-item-list-item {\r\n    display: flex;\r\n    align-items: center;\r\n    padding-right: 20px;\r\n    font-size: 1.15em;\r\n    letter-spacing: 0.05em;\n}\n.tvjs-item-list-item:hover {\r\n    background-color: #76878319;\n}\n.tvjs-item-list-item * {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 988:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\r\n    position: relative;\r\n    z-index: 100;\r\n    font-size: 1.25em;\r\n    margin-left: 10px;\r\n    pointer-events: none;\r\n    text-align: left;\r\n    user-select: none;\r\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\r\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\r\n    pointer-events: none;\r\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\r\n    font-variant-numeric: tabular-nums;\r\n    font-size: 0.95em;\r\n    color: #999999; /* TODO: move => params */\r\n    margin-left: 0.1em;\r\n    margin-right: 0.2em;\n}\n.t-vue-title {\r\n    margin-right: 0.25em;\r\n    font-size: 1.45em;\n}\n.t-vue-ind {\r\n    margin-left: 0.2em;\r\n    margin-bottom: 0.5em;\r\n    font-size: 1.0em;\r\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\r\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\r\n    color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\r\n.tvjs-appear-leave-active\r\n{\r\n    transition: all .25s ease;\n}\n.tvjs-appear-enter, .tvjs-appear-leave-to\r\n{\r\n    opacity: 0;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 423:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\r\n    z-index: 100;\r\n    pointer-events: all;\r\n    cursor: pointer;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 661:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-section {\r\n    height: 0;\r\n    position: absolute;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 168:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-spinner {\r\n    display: inline-block;\r\n    position: relative;\r\n    width: 20px;\r\n    height: 16px;\r\n    margin: -4px 0px -1px 0px;\r\n    opacity: 0.7;\n}\n.tvjs-spinner div {\r\n    position: absolute;\r\n    top: 8px;\r\n    width: 4px;\r\n    height: 4px;\r\n    border-radius: 50%;\r\n    animation-timing-function: cubic-bezier(1, 1, 1, 1);\n}\n.tvjs-spinner div:nth-child(1) {\r\n    left: 2px;\r\n    animation: tvjs-spinner1 0.6s infinite;\r\n    opacity: 0.9;\n}\n.tvjs-spinner div:nth-child(2) {\r\n    left: 2px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(3) {\r\n    left: 9px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(4) {\r\n    left: 16px;\r\n    animation: tvjs-spinner3 0.6s infinite;\r\n    opacity: 0.9;\n}\n@keyframes tvjs-spinner1 {\n0% {\r\n        transform: scale(0);\n}\n100% {\r\n        transform: scale(1);\n}\n}\n@keyframes tvjs-spinner3 {\n0% {\r\n        transform: scale(1);\n}\n100% {\r\n        transform: scale(0);\n}\n}\n@keyframes tvjs-spinner2 {\n0% {\r\n        transform: translate(0, 0);\n}\n100% {\r\n        transform: translate(7px, 0);\n}\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 29:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-drift-enter-active {\r\n    transition: all .3s ease;\n}\n.tvjs-drift-leave-active {\r\n    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.tvjs-drift-enter, .tvjs-drift-leave-to\r\n{\r\n    transform: translateX(10px);\r\n    opacity: 0;\n}\n.tvjs-the-tip {\r\n    position: absolute;\r\n    width: 200px;\r\n    text-align: center;\r\n    z-index: 10001;\r\n    color: #ffffff;\r\n    font-size: 1.5em;\r\n    line-height: 1.15em;\r\n    padding: 10px;\r\n    border-radius: 3px;\r\n    right: 70px;\r\n    top: 10px;\r\n    text-shadow: 1px 1px black;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 935:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-toolbar {\r\n    position: absolute;\r\n    border-right: 1px solid black;\r\n    z-index: 101;\r\n    padding-top: 3px;\r\n    user-select: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 379:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-tbitem {\n}\n.trading-vue-tbitem:hover {\r\n    background-color: #76878319;\n}\n.trading-vue-tbitem-exp {\r\n    position: absolute;\r\n    right: -3px;\r\n    padding: 18.5px 5px;\r\n    font-stretch: extra-condensed;\r\n    transform: scaleX(0.6);\r\n    font-size: 0.6em;\r\n    opacity: 0.0;\r\n    user-select: none;\r\n    line-height: 0;\n}\n.trading-vue-tbitem:hover\r\n.trading-vue-tbitem-exp {\r\n    opacity: 0.5;\n}\n.trading-vue-tbitem-exp:hover {\r\n    background-color: #76878330;\r\n    opacity: 0.9 !important;\n}\n.trading-vue-tbicon {\r\n    position: absolute;\n}\n.trading-vue-tbitem.selected-item > .trading-vue-tbicon,\r\n.tvjs-item-list-item.selected-item > .trading-vue-tbicon {\r\n     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;\n}\n.tvjs-pixelated {\r\n    -ms-interpolation-mode: nearest-neighbor;\r\n    image-rendering: -webkit-optimize-contrast;\r\n    image-rendering: -webkit-crisp-edges;\r\n    image-rendering: -moz-crisp-edges;\r\n    image-rendering: -o-crisp-edges;\r\n    image-rendering: pixelated;\n}\r\n\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 72:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-ux-wrapper {\n    position: absolute;\n    display: flex;\n}\n.tvjs-ux-wrapper-pin {\n    position: absolute;\n    width: 9px;\n    height: 9px;\n    z-index: 100;\n    background-color: #23a776;\n    border-radius: 10px;\n    margin-left: -6px;\n    margin-top: -6px;\n    pointer-events: none;\n}\n.tvjs-ux-wrapper-head {\n    position: absolute;\n    height: 23px;\n    width: 100%;\n}\n.tvjs-ux-wrapper-close {\n    position: absolute;\n    width: 11px;\n    height: 11px;\n    font-size: 1.5em;\n    line-height: 0.5em;\n    padding: 1px 1px 1px 1px;\n    border-radius: 10px;\n    right: 5px;\n    top: 5px;\n    user-select: none;\n    text-align: center;\n    z-index: 100;\n}\n.tvjs-ux-wrapper-close-hb {\n}\n.tvjs-ux-wrapper-close:hover {\n    background-color: #FF605C !important;\n    color: #692324 !important;\n}\n.tvjs-ux-wrapper-full {\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 983:
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

/***/ 666:
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ 863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(418);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("550b47ab", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 124:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(976);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("1b34bfeb", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 886:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(449);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("9895d3a6", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 807:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(108);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("8139036a", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 600:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(988);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("1db01c0b", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 169:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(423);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("68f243ea", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 11:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(661);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("12d2309d", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(168);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("5b620605", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 477:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(29);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("143dffab", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 153:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(935);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("f32fd36e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 501:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(379);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("604bf5ef", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(72);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("21fde573", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 5:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(983);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("fd83689e", content, false, {});
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

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=235c0ade&
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "trading-vue",
      style: {
        color: this.chart_props.colors.text,
        font: this.font_comp,
        width: this.width + "px",
        height: this.height + "px",
      },
      attrs: { id: _vm.id },
      on: { mousedown: _vm.mousedown, mouseleave: _vm.mouseleave },
    },
    [
      _vm.toolbar
        ? _c(
            "toolbar",
            _vm._b(
              {
                ref: "toolbar",
                attrs: { config: _vm.chart_config },
                on: { "custom-event": _vm.custom_event },
              },
              "toolbar",
              _vm.chart_props,
              false
            )
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.controllers.length
        ? _c("widgets", {
            ref: "widgets",
            attrs: {
              map: _vm.ws,
              width: _vm.width,
              height: _vm.height,
              tv: this,
              dc: _vm.data,
            },
          })
        : _vm._e(),
      _vm._v(" "),
      _c(
        "chart",
        _vm._b(
          {
            key: _vm.reset,
            ref: "chart",
            attrs: { tv_id: _vm.id, config: _vm.chart_config },
            on: {
              "custom-event": _vm.custom_event,
              "range-changed": _vm.range_changed,
              "legend-button-click": _vm.legend_button,
            },
          },
          "chart",
          _vm.chart_props,
          false
        )
      ),
      _vm._v(" "),
      _c(
        "transition",
        { attrs: { name: "tvjs-drift" } },
        [
          _vm.tip
            ? _c("the-tip", {
                attrs: { data: _vm.tip },
                on: {
                  "remove-me": function ($event) {
                    _vm.tip = null
                  },
                },
              })
            : _vm._e(),
        ],
        1
      ),
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true


;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=template&id=235c0ade&

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
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=4d06a4de&
var Chartvue_type_template_id_4d06a4de_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "trading-vue-chart", style: _vm.styles },
    [
      _c("keyboard", { ref: "keyboard" }),
      _vm._v(" "),
      _vm._l(this._layout.grids, function (grid, i) {
        return _c("grid-section", {
          key: grid.id,
          ref: "sec",
          refInFor: true,
          attrs: { common: _vm.section_props(i), grid_id: i },
          on: {
            "register-kb-listener": _vm.register_kb,
            "remove-kb-listener": _vm.remove_kb,
            "range-changed": _vm.range_changed,
            "cursor-changed": _vm.cursor_changed,
            "cursor-locked": _vm.cursor_locked,
            "sidebar-transform": _vm.set_ytransform,
            "layer-meta-props": _vm.layer_meta_props,
            "custom-event": _vm.emit_custom_event,
            "legend-button-click": _vm.legend_button_click,
          },
        })
      }),
      _vm._v(" "),
      _c(
        "botbar",
        _vm._b(
          { attrs: { shaders: _vm.shaders, timezone: _vm.timezone } },
          "botbar",
          _vm.botbar_props,
          false
        )
      ),
    ],
    2
  )
}
var Chartvue_type_template_id_4d06a4de_staticRenderFns = []
Chartvue_type_template_id_4d06a4de_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=template&id=4d06a4de&

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
    var lens = [];
    lens.push(self.$_hi.toFixed(self.prec).length);
    lens.push(self.$_lo.toFixed(self.prec).length);
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

      /*for (var i = 0; i < sub.length; i++) {
          let p = sub[i]
          let prev = sub[i-1] || []
          let prev_xs = self.xs[self.xs.length - 1] || [0,[]]
          let x = Math.floor((p[0] - range[0]) * r)
            insert_line(prev, p, x)
            // Filtering lines that are too near
          let xs = self.xs[self.xs.length - 1] || [0, []]
            if (prev_xs === xs) continue
            if (xs[1][0] - prev_xs[1][0] < self.t_step * 0.8) {
                // prev_xs is a higher "rank" label
              if (xs[2] <= prev_xs[2]) {
                  self.xs.pop()
              } else {
                  // Otherwise
                  self.xs.splice(self.xs.length - 2, 1)
              }
          }
      }*/
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
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=8fbe9336&
var Sectionvue_type_template_id_8fbe9336_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "trading-vue-section" },
    [
      _c("chart-legend", {
        ref: "legend",
        attrs: {
          values: _vm.section_values,
          grid_id: _vm.grid_id,
          common: _vm.legend_props,
          meta_props: _vm.get_meta_props,
        },
        on: { "legend-button-click": _vm.button_click },
      }),
      _vm._v(" "),
      _c(
        "grid",
        _vm._b(
          {
            ref: "grid",
            attrs: { grid_id: _vm.grid_id },
            on: {
              "register-kb-listener": _vm.register_kb,
              "remove-kb-listener": _vm.remove_kb,
              "range-changed": _vm.range_changed,
              "cursor-changed": _vm.cursor_changed,
              "cursor-locked": _vm.cursor_locked,
              "layer-meta-props": _vm.emit_meta_props,
              "custom-event": _vm.emit_custom_event,
              "sidebar-transform": _vm.sidebar_transform,
              "rezoom-range": _vm.rezoom_range,
            },
          },
          "grid",
          _vm.grid_props,
          false
        )
      ),
      _vm._v(" "),
      _c(
        "sidebar",
        _vm._b(
          {
            ref: "sb-" + _vm.grid_id,
            attrs: { grid_id: _vm.grid_id, rerender: _vm.rerender },
            on: { "sidebar-transform": _vm.sidebar_transform },
          },
          "sidebar",
          _vm.sidebar_props,
          false
        )
      ),
    ],
    1
  )
}
var Sectionvue_type_template_id_8fbe9336_staticRenderFns = []
Sectionvue_type_template_id_8fbe9336_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=template&id=8fbe9336&

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
    this.ctx = canvas.getContext('2d');
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
    this.listeners();
    this.overlays = [];
  }

  createClass_createClass(Grid, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;

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
      mc.get('pinch').set({
        enable: true
      });
      if (utils.is_mobile) mc.add(new hammer.Press());
      mc.on('panstart', function (event) {
        if (_this.cursor.scroll_lock) return;

        if (_this.cursor.mode === 'aim') {
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

        _this.comp.$emit('cursor-changed', {
          grid_id: _this.id,
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y
        });

        _this.comp.$emit('cursor-locked', true);
      });
      mc.on('panmove', function (event) {
        if (utils.is_mobile) {
          _this.calc_offset();

          _this.propagate('mousemove', _this.touch2mouse(event));
        }

        if (_this.drug) {
          _this.mousedrag(_this.drug.x + event.deltaX, _this.drug.y + event.deltaY);

          _this.comp.$emit('cursor-changed', {
            grid_id: _this.id,
            x: event.center.x + _this.offset_x,
            y: event.center.y + _this.offset_y
          });
        } else if (_this.cursor.mode === 'aim') {
          _this.emit_cursor_coord(event);
        }
      });
      mc.on('panend', function (event) {
        if (utils.is_mobile && _this.drug) {
          _this.pan_fade(event);
        }

        _this.drug = null;

        _this.comp.$emit('cursor-locked', false);
      });
      mc.on('tap', function (event) {
        if (!utils.is_mobile) return;

        _this.sim_mousedown(event);

        if (_this.fade) _this.fade.stop();

        _this.comp.$emit('cursor-changed', {});

        _this.comp.$emit('cursor-changed', {
          /*grid_id: this.id,
          x: undefined,//event.center.x + this.offset_x,
          y: undefined,//event.center.y + this.offset_y,*/
          mode: 'explore'
        });

        _this.update();
      });
      mc.on('pinchstart', function () {
        _this.drug = null;
        _this.pinch = {
          t: _this.range[1] - _this.range[0],
          r: _this.range.slice()
        };
      });
      mc.on('pinchend', function () {
        _this.pinch = null;
      });
      mc.on('pinch', function (event) {
        if (_this.pinch) _this.pinchzoom(event.scale);
      });
      mc.on('press', function (event) {
        if (!utils.is_mobile) return;
        if (_this.fade) _this.fade.stop();

        _this.calc_offset();

        _this.emit_cursor_coord(event, {
          mode: 'aim'
        });

        setTimeout(function () {
          return _this.update();
        });

        _this.sim_mousedown(event);
      });
      var add = addEventListener;
      add('gesturestart', this.gesturestart);
      add('gesturechange', this.gesturechange);
      add('gestureend', this.gestureend);
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
      this.comp.$emit('cursor-changed', {
        grid_id: this.id,
        x: event.layerX,
        y: event.layerY + this.layout.offset
      });
      this.calc_offset();
      this.propagate('mousemove', event);
    }
  }, {
    key: "mouseout",
    value: function mouseout(event) {
      if (utils.is_mobile) return;
      this.comp.$emit('cursor-changed', {});
      this.propagate('mouseout', event);
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      this.drug = null;
      this.comp.$emit('cursor-locked', false);
      this.propagate('mouseup', event);
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (utils.is_mobile) return;
      this.propagate('mousedown', event);
      this.comp.$emit('cursor-locked', true);
      if (event.defaultPrevented) return;
      this.comp.$emit('custom-event', {
        event: 'grid-mousedown',
        args: [this.id, event]
      });
    } // Simulated mousedown (for mobile)

  }, {
    key: "sim_mousedown",
    value: function sim_mousedown(event) {
      var _this2 = this;

      if (event.srcEvent.defaultPrevented) return;
      this.comp.$emit('custom-event', {
        event: 'grid-mousedown',
        args: [this.id, event]
      });
      this.propagate('mousemove', this.touch2mouse(event));
      this.update();
      this.propagate('mousedown', this.touch2mouse(event));
      setTimeout(function () {
        _this2.propagate('click', _this2.touch2mouse(event));
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
      this.propagate('click', event);
    }
  }, {
    key: "emit_cursor_coord",
    value: function emit_cursor_coord(event, add) {
      if (add === void 0) {
        add = {};
      }

      this.comp.$emit('cursor-changed', Object.assign({
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
      if (layer.name === 'crosshair') {
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
      var ymax = this.layout.height;

      var _iterator2 = grid_createForOfIteratorHelper(this.layout.xs),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              x = _step2$value[0],
              p = _step2$value[1];

          this.ctx.moveTo(x - 0.5, 0);
          this.ctx.lineTo(x - 0.5, ymax);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = grid_createForOfIteratorHelper(this.layout.ys),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              y = _step3$value[0],
              y$ = _step3$value[1];

          this.ctx.moveTo(0, y - 0.5);
          this.ctx.lineTo(this.layout.width, y - 0.5);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
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
      if (this.wmode !== 'pass') {
        if (this.wmode === 'click' && !this.$p.meta.activated) {
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
      var tl = this.comp.config.ZOOM_MODE === 'tl';

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

        this.comp.$emit('rezoom-range', {
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
        this.comp.$emit('sidebar-transform', {
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

      this.comp.$emit('range-changed', range);
    } // Propagate mouse event to overlays

  }, {
    key: "propagate",
    value: function propagate(name, event) {
      var _iterator4 = grid_createForOfIteratorHelper(this.overlays),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var layer = _step4.value;

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
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var rm = removeEventListener;
      rm('gesturestart', this.gesturestart);
      rm('gesturechange', this.gesturechange);
      rm('gestureend', this.gestureend);
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

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

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
  if (moduleIdentifier) { // server build
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
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
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

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/Crosshair.vue"
/* harmony default export */ const components_Crosshair = (component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/KeyboardListener.vue?vue&type=script&lang=js&
//
//
//
//
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

/* hot reload */
if (false) { var KeyboardListener_api; }
KeyboardListener_component.options.__file = "src/components/KeyboardListener.vue"
/* harmony default export */ const KeyboardListener = (KeyboardListener_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=template&id=390ccf6e&
var UxLayervue_type_template_id_390ccf6e_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "span",
    { class: "trading-vue-grid-ux-" + _vm.id, style: _vm.style },
    _vm._l(_vm.uxs, function (ux) {
      return _c("ux-wrapper", {
        key: ux.uuid,
        attrs: {
          ux: ux,
          updater: _vm.updater,
          colors: _vm.colors,
          config: _vm.config,
        },
        on: { "custom-event": _vm.on_custom_event },
      })
    }),
    1
  )
}
var UxLayervue_type_template_id_390ccf6e_staticRenderFns = []
UxLayervue_type_template_id_390ccf6e_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=template&id=390ccf6e&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=template&id=4bc32070&
var UxWrappervue_type_template_id_4bc32070_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.visible
    ? _c(
        "div",
        {
          staticClass: "trading-vue-ux-wrapper",
          style: _vm.style,
          attrs: { id: "tvjs-ux-wrapper-" + _vm.ux.uuid },
        },
        [
          _c(_vm.ux.component, {
            tag: "component",
            attrs: {
              ux: _vm.ux,
              updater: _vm.updater,
              wrapper: _vm.wrapper,
              colors: _vm.colors,
            },
            on: { "custom-event": _vm.on_custom_event },
          }),
          _vm._v(" "),
          _vm.ux.show_pin
            ? _c("div", {
                staticClass: "tvjs-ux-wrapper-pin",
                style: _vm.pin_style,
              })
            : _vm._e(),
          _vm._v(" "),
          _vm.ux.win_header !== false
            ? _c("div", { staticClass: "tvjs-ux-wrapper-head" }, [
                _c(
                  "div",
                  {
                    staticClass: "tvjs-ux-wrapper-close",
                    style: _vm.btn_style,
                    on: { click: _vm.close },
                  },
                  [_vm._v("×")]
                ),
              ])
            : _vm._e(),
        ],
        1
      )
    : _vm._e()
}
var UxWrappervue_type_template_id_4bc32070_staticRenderFns = []
UxWrappervue_type_template_id_4bc32070_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=template&id=4bc32070&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=style&index=0&lang=css&
var UxWrappervue_type_style_index_0_lang_css_ = __webpack_require__(565);
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue



;


/* normalize component */

var UxWrapper_component = normalizeComponent(
  components_UxWrappervue_type_script_lang_js_,
  UxWrappervue_type_template_id_4bc32070_render,
  UxWrappervue_type_template_id_4bc32070_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var UxWrapper_api; }
UxWrapper_component.options.__file = "src/components/UxWrapper.vue"
/* harmony default export */ const UxWrapper = (UxWrapper_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

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
  UxLayervue_type_template_id_390ccf6e_render,
  UxLayervue_type_template_id_390ccf6e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var UxLayer_api; }
UxLayer_component.options.__file = "src/components/UxLayer.vue"
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


      if (event === 'custom-event') return;

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

/* hot reload */
if (false) { var Spline_api; }
Spline_component.options.__file = "src/components/overlays/Spline.vue"
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

/* hot reload */
if (false) { var Splines_api; }
Splines_component.options.__file = "src/components/overlays/Splines.vue"
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

/* hot reload */
if (false) { var Range_api; }
Range_component.options.__file = "src/components/overlays/Range.vue"
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

/* hot reload */
if (false) { var Trades_api; }
Trades_component.options.__file = "src/components/overlays/Trades.vue"
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

/* hot reload */
if (false) { var Channel_api; }
Channel_component.options.__file = "src/components/overlays/Channel.vue"
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

/* hot reload */
if (false) { var Segment_api; }
Segment_component.options.__file = "src/components/overlays/Segment.vue"
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
          var h = config.PANHEIGHT;
          var lbl = bar.price.toFixed(layout.prec);
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

/* hot reload */
if (false) { var Candles_api; }
Candles_component.options.__file = "src/components/overlays/Candles.vue"
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

/* hot reload */
if (false) { var Volume_api; }
Volume_component.options.__file = "src/components/overlays/Volume.vue"
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

/* hot reload */
if (false) { var Splitters_api; }
Splitters_component.options.__file = "src/components/overlays/Splitters.vue"
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
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
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
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
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

/* hot reload */
if (false) { var LineTool_api; }
LineTool_component.options.__file = "src/components/overlays/LineTool.vue"
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

      var d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec); // Map interval to the actual tf (in ms)

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

/* hot reload */
if (false) { var RangeTool_api; }
RangeTool_component.options.__file = "src/components/overlays/RangeTool.vue"
/* harmony default export */ const RangeTool = (RangeTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js&
function Gridvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Gridvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function Gridvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function Gridvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Sets up all layers/overlays for the grid with 'grid_id'

















/* harmony default export */ const Gridvue_type_script_lang_js_ = ({
  name: 'Grid',
  components: {
    Crosshair: components_Crosshair,
    KeyboardListener: KeyboardListener
  },
  mixins: [canvas, uxlist],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'overlays', 'width', 'height', 'data', 'grid_id', 'y_transform', 'font', 'tv_id', 'config', 'meta', 'shaders'],
  data: function data() {
    var _this = this;

    return {
      layer_events: {
        'new-grid-layer': this.new_layer,
        'delete-grid-layer': this.del_layer,
        'show-grid-layer': function showGridLayer(d) {
          _this.renderer.show_hide_layer(d);

          _this.redraw();
        },
        'redraw-grid': this.redraw,
        'layer-meta-props': function layerMetaProps(d) {
          return _this.$emit('layer-meta-props', d);
        },
        'custom-event': function customEvent(d) {
          return _this.$emit('custom-event', d);
        }
      },
      keyboard_events: {
        'register-kb-listener': function registerKbListener(event) {
          _this.$emit('register-kb-listener', event);
        },
        'remove-kb-listener': function removeKbListener(event) {
          _this.$emit('remove-kb-listener', event);
        },
        'keyup': function keyup(event) {
          if (!_this.is_active) return;

          _this.renderer.propagate('keyup', event);
        },
        'keydown': function keydown(event) {
          if (!_this.is_active) return; // TODO: is this neeeded?

          _this.renderer.propagate('keydown', event);
        },
        'keypress': function keypress(event) {
          if (!_this.is_active) return;

          _this.renderer.propagate('keypress', event);
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
                if (typeof comp.id !== 'string') continue;
                var tuple = comp.id.split('_');
                tuple.pop();

                if (tuple.join('_') === ov.name) {
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

    this.$emit('custom-event', {
      event: 'register-tools',
      args: tools
    });
    this.$on('custom-event', function (e) {
      return _this3.on_ux_event(e, 'grid');
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  mounted: function mounted() {
    var _this4 = this;

    var el = this.$refs['canvas'];
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
      this.$emit('custom-event', {
        event: 'remove-shaders',
        args: [grid_id, layer]
      }); // TODO: close all interfaces

      this.$emit('custom-event', {
        event: 'remove-layer-meta',
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
      var e_pass = this.on_ux_event(e, 'grid');
      if (e_pass) this.$emit('custom-event', e);
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
        overflow: 'hidden'
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
          'custom-event': this.emit_ux_event
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

/* hot reload */
if (false) { var Grid_api; }
Grid_component.options.__file = "src/components/Grid.vue"
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
          var d = this.layout.prec;
          this.ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4);
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
      }

      var lbl = this.$p.cursor.y$.toFixed(this.layout.prec);
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

/* hot reload */
if (false) { var Sidebar_api; }
Sidebar_component.options.__file = "src/components/Sidebar.vue"
/* harmony default export */ const components_Sidebar = (Sidebar_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=34724886&
var Legendvue_type_template_id_34724886_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "trading-vue-legend", style: _vm.calc_style },
    [
      _vm.grid_id === 0
        ? _c(
            "div",
            {
              staticClass: "trading-vue-ohlcv",
              style: { "max-width": _vm.common.width + "px" },
            },
            [
              _c(
                "span",
                {
                  staticClass: "t-vue-title",
                  style: { color: _vm.common.colors.title },
                },
                [
                  _vm._v(
                    "\r\n              " +
                      _vm._s(_vm.common.title_txt) +
                      "\r\n        "
                  ),
                ]
              ),
              _vm._v(" "),
              _vm.show_values
                ? _c("span", [
                    _vm._v("\r\n            O"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[0])),
                    ]),
                    _vm._v("\r\n            H"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[1])),
                    ]),
                    _vm._v("\r\n            L"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[2])),
                    ]),
                    _vm._v("\r\n            C"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[3])),
                    ]),
                    _vm._v("\r\n            V"),
                    _c("span", { staticClass: "t-vue-lspan" }, [
                      _vm._v(_vm._s(_vm.ohlcv[4])),
                    ]),
                  ])
                : _vm._e(),
              _vm._v(" "),
              !_vm.show_values
                ? _c(
                    "span",
                    {
                      staticClass: "t-vue-lspan",
                      style: { color: _vm.common.colors.text },
                    },
                    [
                      _vm._v(
                        "\r\n            " +
                          _vm._s((_vm.common.meta.last || [])[4]) +
                          "\r\n        "
                      ),
                    ]
                  )
                : _vm._e(),
            ]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm._l(this.indicators, function (ind) {
        return _c(
          "div",
          { staticClass: "t-vue-ind" },
          [
            _c("span", { staticClass: "t-vue-iname" }, [
              _vm._v(_vm._s(ind.name)),
            ]),
            _vm._v(" "),
            ind.showLegendButtons
              ? _c("button-group", {
                  attrs: {
                    buttons: _vm.common.buttons,
                    config: _vm.common.config,
                    ov_id: ind.id,
                    grid_id: _vm.grid_id,
                    index: ind.index,
                    tv_id: _vm.common.tv_id,
                    display: ind.v,
                  },
                  on: { "legend-button-click": _vm.button_click },
                })
              : _vm._e(),
            _vm._v(" "),
            ind.v
              ? _c(
                  "span",
                  { staticClass: "t-vue-ivalues" },
                  _vm._l(ind.values, function (v) {
                    return _vm.show_values
                      ? _c(
                          "span",
                          {
                            staticClass: "t-vue-lspan t-vue-ivalue",
                            style: { color: v.color },
                          },
                          [
                            _vm._v(
                              "\r\n                " +
                                _vm._s(v.value) +
                                "\r\n            "
                            ),
                          ]
                        )
                      : _vm._e()
                  }),
                  0
                )
              : _vm._e(),
            _vm._v(" "),
            ind.unk
              ? _c("span", { staticClass: "t-vue-unknown" }, [
                  _vm._v("\r\n            (Unknown type)\r\n        "),
                ])
              : _vm._e(),
            _vm._v(" "),
            _c(
              "transition",
              { attrs: { name: "tvjs-appear" } },
              [
                ind.loading
                  ? _c("spinner", { attrs: { colors: _vm.common.colors } })
                  : _vm._e(),
              ],
              1
            ),
          ],
          1
        )
      }),
    ],
    2
  )
}
var Legendvue_type_template_id_34724886_staticRenderFns = []
Legendvue_type_template_id_34724886_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=template&id=34724886&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=6f826426&
var ButtonGroupvue_type_template_id_6f826426_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "span",
    { staticClass: "t-vue-lbtn-grp" },
    _vm._l(_vm.buttons, function (b, i) {
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
          config: _vm.config,
        },
        on: { "legend-button-click": _vm.button_click },
      })
    }),
    1
  )
}
var ButtonGroupvue_type_template_id_6f826426_staticRenderFns = []
ButtonGroupvue_type_template_id_6f826426_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=template&id=6f826426&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=1ad87362&
var LegendButtonvue_type_template_id_1ad87362_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("img", {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + "px",
      height: _vm.config.L_BTN_SIZE + "px",
      margin: _vm.config.L_BTN_MARGIN,
    },
    attrs: { id: _vm.uuid, src: _vm.base64 },
    on: { click: _vm.onclick },
  })
}
var LegendButtonvue_type_template_id_1ad87362_staticRenderFns = []
LegendButtonvue_type_template_id_1ad87362_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=template&id=1ad87362&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//

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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&lang=css&
var LegendButtonvue_type_style_index_0_lang_css_ = __webpack_require__(169);
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js_,
  LegendButtonvue_type_template_id_1ad87362_render,
  LegendButtonvue_type_template_id_1ad87362_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var LegendButton_api; }
LegendButton_component.options.__file = "src/components/LegendButton.vue"
/* harmony default export */ const LegendButton = (LegendButton_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&lang=css&
var ButtonGroupvue_type_style_index_0_lang_css_ = __webpack_require__(886);
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js_,
  ButtonGroupvue_type_template_id_6f826426_render,
  ButtonGroupvue_type_template_id_6f826426_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ButtonGroup_api; }
ButtonGroup_component.options.__file = "src/components/ButtonGroup.vue"
/* harmony default export */ const ButtonGroup = (ButtonGroup_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=template&id=39432f99&
var Spinnervue_type_template_id_39432f99_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "tvjs-spinner" },
    _vm._l(4, function (i) {
      return _c("div", { key: i, style: { background: _vm.colors.text } })
    }),
    0
  )
}
var Spinnervue_type_template_id_39432f99_staticRenderFns = []
Spinnervue_type_template_id_39432f99_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=template&id=39432f99&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=script&lang=js&
//
//
//
//
//
//
/* harmony default export */ const Spinnervue_type_script_lang_js_ = ({
  name: 'Spinner',
  props: ['colors']
});
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Spinnervue_type_script_lang_js_ = (Spinnervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=style&index=0&lang=css&
var Spinnervue_type_style_index_0_lang_css_ = __webpack_require__(372);
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Spinner.vue



;


/* normalize component */

var Spinner_component = normalizeComponent(
  components_Spinnervue_type_script_lang_js_,
  Spinnervue_type_template_id_39432f99_render,
  Spinnervue_type_template_id_39432f99_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Spinner_api; }
Spinner_component.options.__file = "src/components/Spinner.vue"
/* harmony default export */ const Spinner = (Spinner_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ const Legendvue_type_script_lang_js_ = ({
  name: 'ChartLegend',
  components: {
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  props: ['common', 'values', 'grid_id', 'meta_props'],
  computed: {
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      }

      var prec = this.layout.prec; // TODO: main the main legend more customizable

      var id = this.main_type + '_0';
      var meta = this.$props.meta_props[id] || {};

      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }

      return [this.$props.values.ohlcv[1].toFixed(prec), this.$props.values.ohlcv[2].toFixed(prec), this.$props.values.ohlcv[3].toFixed(prec), this.$props.values.ohlcv[4].toFixed(prec), this.$props.values.ohlcv[5] ? this.$props.values.ohlcv[5].toFixed(2) : 'n/a'];
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&lang=css&
var Legendvue_type_style_index_0_lang_css_ = __webpack_require__(600);
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js_,
  Legendvue_type_template_id_34724886_render,
  Legendvue_type_template_id_34724886_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Legend_api; }
Legend_component.options.__file = "src/components/Legend.vue"
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

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ const Sectionvue_type_script_lang_js_ = ({
  name: 'GridSection',
  components: {
    Grid: components_Grid,
    Sidebar: components_Sidebar,
    ChartLegend: Legend
  },
  mixins: [shaders],
  props: ['common', 'grid_id'],
  data: function data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: ''
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
    grid_shaders: function grid_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === 'grid';
      });
    },
    sb_shaders: function sb_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === 'sidebar';
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
  },
  methods: {
    range_changed: function range_changed(r) {
      this.$emit('range-changed', r);
    },
    cursor_changed: function cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit('cursor-changed', c);
    },
    cursor_locked: function cursor_locked(state) {
      this.$emit('cursor-locked', state);
    },
    sidebar_transform: function sidebar_transform(s) {
      this.$emit('sidebar-transform', s);
    },
    emit_meta_props: function emit_meta_props(d) {
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit('layer-meta-props', d);
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'sidebar');
      this.$emit('custom-event', d);
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      this.$emit('register-kb-listener', event);
    },
    remove_kb: function remove_kb(event) {
      this.$emit('remove-kb-listener', event);
    },
    rezoom_range: function rezoom_range(event) {
      var id = 'sb-' + event.grid_id;

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
      }, '');
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sectionvue_type_script_lang_js_ = (Sectionvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&lang=css&
var Sectionvue_type_style_index_0_lang_css_ = __webpack_require__(11);
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js_,
  Sectionvue_type_template_id_8fbe9336_render,
  Sectionvue_type_template_id_8fbe9336_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Section_api; }
Section_component.options.__file = "src/components/Section.vue"
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=style&index=0&lang=css&
var Botbarvue_type_style_index_0_lang_css_ = __webpack_require__(124);
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=style&index=0&lang=css&

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

/* hot reload */
if (false) { var Botbar_api; }
Botbar_component.options.__file = "src/components/Botbar.vue"
/* harmony default export */ const components_Botbar = (Botbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Keyboard.vue?vue&type=script&lang=js&
//
//
//
//
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

/* hot reload */
if (false) { var Keyboard_api; }
Keyboard_component.options.__file = "src/components/Keyboard.vue"
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


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//











/* harmony default export */ const Chartvue_type_script_lang_js_ = ({
  name: 'Chart',
  components: {
    GridSection: Section,
    Botbar: components_Botbar,
    Keyboard: Keyboard
  },
  mixins: [shaders, datatrack],
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'skin', 'timezone'],
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
      activated: false
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
      var sub = this.subset(r);
      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout();
      this.$emit('range-changed', r);
      if (this.$props.ib) this.save_data_t();
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
      this.on_shader_event(d, 'botbar');
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
  }
});
;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Chartvue_type_script_lang_js_ = (Chartvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Chart.vue





/* normalize component */
;
var Chart_component = normalizeComponent(
  components_Chartvue_type_script_lang_js_,
  Chartvue_type_template_id_4d06a4de_render,
  Chartvue_type_template_id_4d06a4de_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Chart_api; }
Chart_component.options.__file = "src/components/Chart.vue"
/* harmony default export */ const Chart = (Chart_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=template&id=021887fb&
var Toolbarvue_type_template_id_021887fb_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      key: _vm.tool_count,
      staticClass: "trading-vue-toolbar",
      style: _vm.styles,
    },
    _vm._l(_vm.groups, function (tool, i) {
      return tool.icon && !tool.hidden
        ? _c("toolbar-item", {
            key: i,
            attrs: {
              data: tool,
              subs: _vm.sub_map,
              dc: _vm.data,
              config: _vm.config,
              colors: _vm.colors,
              selected: _vm.is_selected(tool),
            },
            on: { "item-selected": _vm.selected },
          })
        : _vm._e()
    }),
    1
  )
}
var Toolbarvue_type_template_id_021887fb_staticRenderFns = []
Toolbarvue_type_template_id_021887fb_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=template&id=021887fb&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=template&id=227b3c2e&
var ToolbarItemvue_type_template_id_227b3c2e_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      class: ["trading-vue-tbitem", _vm.selected ? "selected-item" : ""],
      style: _vm.item_style,
      on: {
        click: function ($event) {
          return _vm.emit_selected("click")
        },
        mousedown: _vm.mousedown,
        touchstart: _vm.mousedown,
        touchend: function ($event) {
          return _vm.emit_selected("touch")
        },
      },
    },
    [
      _c("div", {
        staticClass: "trading-vue-tbicon tvjs-pixelated",
        style: _vm.icon_style,
      }),
      _vm._v(" "),
      _vm.data.group
        ? _c(
            "div",
            {
              staticClass: "trading-vue-tbitem-exp",
              style: _vm.exp_style,
              on: {
                click: _vm.exp_click,
                mousedown: _vm.expmousedown,
                mouseover: _vm.expmouseover,
                mouseleave: _vm.expmouseleave,
              },
            },
            [_vm._v("\n        ᐳ\n    ")]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.show_exp_list
        ? _c("item-list", {
            attrs: {
              config: _vm.config,
              items: _vm.data.items,
              colors: _vm.colors,
              dc: _vm.dc,
            },
            on: {
              "close-list": _vm.close_list,
              "item-selected": _vm.emit_selected_sub,
            },
          })
        : _vm._e(),
    ],
    1
  )
}
var ToolbarItemvue_type_template_id_227b3c2e_staticRenderFns = []
ToolbarItemvue_type_template_id_227b3c2e_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=template&id=227b3c2e&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=template&id=c50b23fe&
var ItemListvue_type_template_id_c50b23fe_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "tvjs-item-list",
      style: _vm.list_style(),
      on: { mousedown: _vm.thismousedown },
    },
    _vm._l(_vm.items, function (item) {
      return !item.hidden
        ? _c(
            "div",
            {
              class: _vm.item_class(item),
              style: _vm.item_style(item),
              on: {
                click: function (e) {
                  return _vm.item_click(e, item)
                },
              },
            },
            [
              _c("div", {
                staticClass: "trading-vue-tbicon tvjs-pixelated",
                style: _vm.icon_style(item),
              }),
              _vm._v(" "),
              _c("div", [_vm._v(_vm._s(item.type))]),
            ]
          )
        : _vm._e()
    }),
    0
  )
}
var ItemListvue_type_template_id_c50b23fe_staticRenderFns = []
ItemListvue_type_template_id_c50b23fe_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=template&id=c50b23fe&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=style&index=0&lang=css&
var ItemListvue_type_style_index_0_lang_css_ = __webpack_require__(807);
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/ItemList.vue



;


/* normalize component */

var ItemList_component = normalizeComponent(
  components_ItemListvue_type_script_lang_js_,
  ItemListvue_type_template_id_c50b23fe_render,
  ItemListvue_type_template_id_c50b23fe_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ItemList_api; }
ItemList_component.options.__file = "src/components/ItemList.vue"
/* harmony default export */ const ItemList = (ItemList_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=style&index=0&lang=css&
var ToolbarItemvue_type_style_index_0_lang_css_ = __webpack_require__(501);
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue



;


/* normalize component */

var ToolbarItem_component = normalizeComponent(
  components_ToolbarItemvue_type_script_lang_js_,
  ToolbarItemvue_type_template_id_227b3c2e_render,
  ToolbarItemvue_type_template_id_227b3c2e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var ToolbarItem_api; }
ToolbarItem_component.options.__file = "src/components/ToolbarItem.vue"
/* harmony default export */ const ToolbarItem = (ToolbarItem_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=script&lang=js&
function Toolbarvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); }

function Toolbarvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=style&index=0&lang=css&
var Toolbarvue_type_style_index_0_lang_css_ = __webpack_require__(153);
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Toolbar.vue



;


/* normalize component */

var Toolbar_component = normalizeComponent(
  components_Toolbarvue_type_script_lang_js_,
  Toolbarvue_type_template_id_021887fb_render,
  Toolbarvue_type_template_id_021887fb_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Toolbar_api; }
Toolbar_component.options.__file = "src/components/Toolbar.vue"
/* harmony default export */ const Toolbar = (Toolbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=template&id=5fe4312f&
var Widgetsvue_type_template_id_5fe4312f_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "tvjs-widgets",
      style: { width: _vm.width + "px", height: _vm.height + "px" },
    },
    _vm._l(Object.keys(_vm.map), function (id) {
      return _c(_vm.initw(id), {
        key: id,
        tag: "component",
        attrs: {
          id: id,
          main: _vm.map[id].ctrl,
          data: _vm.map[id].data,
          tv: _vm.tv,
          dc: _vm.dc,
        },
      })
    }),
    1
  )
}
var Widgetsvue_type_template_id_5fe4312f_staticRenderFns = []
Widgetsvue_type_template_id_5fe4312f_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=template&id=5fe4312f&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=style&index=0&lang=css&
var Widgetsvue_type_style_index_0_lang_css_ = __webpack_require__(5);
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/Widgets.vue



;


/* normalize component */

var Widgets_component = normalizeComponent(
  components_Widgetsvue_type_script_lang_js_,
  Widgetsvue_type_template_id_5fe4312f_render,
  Widgetsvue_type_template_id_5fe4312f_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var Widgets_api; }
Widgets_component.options.__file = "src/components/Widgets.vue"
/* harmony default export */ const Widgets = (Widgets_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=template&id=2c1770cc&
var TheTipvue_type_template_id_2c1770cc_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", {
    staticClass: "tvjs-the-tip",
    style: _vm.style,
    domProps: { innerHTML: _vm._s(_vm.data.text) },
    on: {
      mousedown: function ($event) {
        return _vm.$emit("remove-me")
      },
    },
  })
}
var TheTipvue_type_template_id_2c1770cc_staticRenderFns = []
TheTipvue_type_template_id_2c1770cc_render._withStripped = true


;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=template&id=2c1770cc&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=script&lang=js&
//
//
//
//
//
//
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=style&index=0&lang=css&
var TheTipvue_type_style_index_0_lang_css_ = __webpack_require__(477);
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=style&index=0&lang=css&

;// CONCATENATED MODULE: ./src/components/TheTip.vue



;


/* normalize component */

var TheTip_component = normalizeComponent(
  components_TheTipvue_type_script_lang_js_,
  TheTipvue_type_template_id_2c1770cc_render,
  TheTipvue_type_template_id_2c1770cc_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var TheTip_api; }
TheTip_component.options.__file = "src/components/TheTip.vue"
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

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ const TradingVuevue_type_script_lang_js_ = ({
  name: 'TradingVue',
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
      "default": 'TradingVue.js'
    },
    id: {
      type: String,
      "default": 'trading-vue-js'
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
      "default": '#42b883'
    },
    colorBack: {
      type: String,
      "default": '#121826'
    },
    colorGrid: {
      type: String,
      "default": '#2f3240'
    },
    colorText: {
      type: String,
      "default": '#dedddd'
    },
    colorTextHL: {
      type: String,
      "default": '#fff'
    },
    colorScale: {
      type: String,
      "default": '#838383'
    },
    colorCross: {
      type: String,
      "default": '#8091a0'
    },
    colorCandleUp: {
      type: String,
      "default": '#23a776'
    },
    colorCandleDw: {
      type: String,
      "default": '#e54150'
    },
    colorWickUp: {
      type: String,
      "default": '#23a77688'
    },
    colorWickDw: {
      type: String,
      "default": '#e5415088'
    },
    colorWickSm: {
      type: String,
      "default": 'transparent' // deprecated

    },
    colorVolUp: {
      type: String,
      "default": '#79999e42'
    },
    colorVolDw: {
      type: String,
      "default": '#ef535042'
    },
    colorPanel: {
      type: String,
      "default": '#565c68'
    },
    colorTbBack: {
      type: String
    },
    colorTbBorder: {
      type: String,
      "default": '#8282827d'
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
      event: 'before-destroy'
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
          event: 'chart-reset',
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
      }

      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map; // Time range => index range

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
    showTheTip: function showTheTip(text, color) {
      if (color === void 0) {
        color = 'orange';
      }

      this.tip = {
        text: text,
        color: color
      };
    },
    legend_button: function legend_button(event) {
      this.custom_event({
        event: 'legend-button-click',
        args: [event]
      });
    },
    custom_event: function custom_event(d) {
      if ('args' in d) {
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
    range_changed: function range_changed(r) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        r = r.map(function (x) {
          return ti_map.i2t(x);
        });
      }

      this.$emit('range-changed', r);
      this.custom_event({
        event: 'range-changed',
        args: [r]
      });
      if (this.onrange) this.onrange(r);
    },
    set_loader: function set_loader(dc) {
      var _this2 = this;

      this.onrange = function (r) {
        var pf = _this2.chart_props.ib ? '_ms' : '';
        var tf = _this2.$refs.chart['interval' + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors: function parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf('color') === 0 && k !== 'colors') {
          var k2 = k.replace('color', '');
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
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&lang=css&
var TradingVuevue_type_style_index_0_lang_css_ = __webpack_require__(863);
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=style&index=0&lang=css&

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

/* hot reload */
if (false) { var TradingVue_api; }
TradingVue_component.options.__file = "src/TradingVue.vue"
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
var regenerator = __webpack_require__(757);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// CONCATENATED MODULE: ./src/helpers/tmp/ww$$$.json
const ww$$$_namespaceObject = JSON.parse('["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="]');
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