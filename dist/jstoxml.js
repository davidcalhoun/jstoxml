(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.jstoxml = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var privateVars = ['_selfCloseTag', '_attrs'];
  var privateVarsJoined = privateVars.join('|');
  var privateVarsRegexp = new RegExp(privateVarsJoined, 'g');

  /**
   * Determines the indent string based on current tree depth.
   */
  var getIndentStr = function getIndentStr() {
    var baseIndentStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return baseIndentStr.repeat(depth);
  };

  /**
   * Sugar function supplementing JS's quirky typeof operator, plus some extra help to detect
   * "special objects" expected by jstoxml.
   */
  var getType = function getType(val) {
    var type = void 0;
    if (Array.isArray(val)) {
      type = 'array';
    } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val !== null && val._name) {
      type = 'special-object';
    } else if (val instanceof Date) {
      type = 'date';
    } else if (val === null) {
      type = 'null';
    } else {
      type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
    }

    return type;
  };

  /**
   * Replaces matching values in a string with a new value.
   * Example:
   * filterStr('foo&bar', { '&': '&amp;' });
   */
  var filterStr = function filterStr() {
    var inputStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var searches = Object.keys(filter);
    var joinedSearches = searches.join('|');
    var regexpStr = '(' + joinedSearches + ')';
    var regexp = new RegExp(regexpStr, 'g');

    return String(inputStr).replace(regexp, function (str, entity) {
      return filter[entity] || '';
    });
  };

  /**
   * Maps an object or array of arribute keyval pairs to a string.
   * Examples:
   * { foo: 'bar', baz: 'g' } -> 'foo="bar" baz="g"'
   * [ { key: '⚡', val: true }, { foo: 'bar' } ] -> '⚡ foo="bar"'
   */
  var getAttributeKeyVals = function getAttributeKeyVals() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var filter = arguments[1];

    var isArray = Array.isArray(attributes);

    var keyVals = [];
    if (isArray) {
      // Array containing complex objects and potentially duplicate attributes.
      keyVals = attributes.map(function (attr) {
        var key = Object.keys(attr)[0];
        var val = attr[key];

        var filteredVal = filter ? filterStr(val, filter) : val;
        var valStr = filteredVal === true ? '' : '="' + filteredVal + '"';
        return '' + key + valStr;
      });
    } else {
      var keys = Object.keys(attributes);
      keyVals = keys.map(function (key) {
        // Simple object - keyval pairs.

        // For boolean true, simply output the key.
        var filteredVal = filter ? filterStr(attributes[key], filter) : attributes[key];
        var valStr = attributes[key] === true ? '' : '="' + filteredVal + '"';

        return '' + key + valStr;
      });
    }

    return keyVals;
  };

  /**
   * Converts an attributes object to a string of keyval pairs.
   * Example:
   * formatAttributes({ a: 1, b: 2 })
   * -> 'a="1" b="2"'
   */
  var formatAttributes = function formatAttributes() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var filter = arguments[1];

    var keyVals = getAttributeKeyVals(attributes, filter);
    if (keyVals.length === 0) return '';

    var keysValsJoined = keyVals.join(' ');
    return ' ' + keysValsJoined;
  };

  /**
   * Converts an object to a jstoxml array.
   * Example:
   * objToArray({ foo: 'bar', baz: 2 });
   * ->
   * [
   *   {
   *     _name: 'foo',
   *     _content: 'bar'
   *   },
   *   {
   *     _name: 'baz',
   *     _content: 2
   *   }
   * ]
   */
  var objToArray = function objToArray() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return Object.keys(obj).map(function (key) {
      return {
        _name: key,
        _content: obj[key]
      };
    });
  };

  /**
   * Determines if a value is a simple primitive type that can fit onto one line.  Needed for
   * determining any needed indenting and line breaks.
   */
  var isSimpleType = function isSimpleType(val) {
    var valType = getType(val);
    return valType === 'string' || valType === 'number' || valType === 'boolean' || valType === 'date' || valType === 'special-object';
  };

  /**
   * Determines if an XML string is a simple primitive, or contains nested data.
   */
  var isSimpleXML = function isSimpleXML(xmlStr) {
    return !xmlStr.match('<');
  };

  /**
   * Assembles an XML header as defined by the config.
   */
  var defaultHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  var getHeaderString = function getHeaderString(config, depth, isOutputStart) {
    var headerStr = '';
    var shouldOutputHeader = config.header && isOutputStart;
    if (shouldOutputHeader) {
      var shouldUseDefaultHeader = typeof config.header === 'boolean';
      headerStr = shouldUseDefaultHeader ? defaultHeader : config.header;

      if (config.indent) headerStr += '\n';
    }

    return headerStr;
  };

  /**
   * Recursively traverses an object tree and converts the output to an XML string.
   */
  var toXML = exports.toXML = function toXML() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // Determine tree depth.
    var depth = config.depth ? config.depth : 0;

    // Determine indent string based on depth.
    var indentStr = getIndentStr(config.indent, depth);

    // For branching based on value type.
    var valType = getType(obj);
    var isSimple = isSimpleType(obj);

    // Determine if this is the start of the output.  Needed for header and indenting.
    var isOutputStart = depth === 0 && (isSimple || !isSimple && config._isFirstItem);

    var outputStr = '';
    switch (valType) {
      case 'special-object':
        {
          // Processes a specially-formatted object used by jstoxml.

          var _name = obj._name,
              _content = obj._content;

          // Output text content without a tag wrapper.

          if (_content === null) {
            outputStr = _name;
            break;
          }

          // Don't output private vars (such as _attrs).
          if (_name.match(privateVarsRegexp)) break;

          // Process the nested new value and config.
          var newConfig = Object.assign({}, config, { depth: depth + 1 });
          var newVal = toXML(_content, newConfig);
          var newValType = getType(newVal);
          var isNewValSimple = isSimpleXML(newVal);

          // Pre-tag output (indent and line breaks).
          var preIndentStr = config.indent && !isOutputStart ? '\n' : '';
          var preTag = '' + preIndentStr + indentStr;

          // Tag output.
          var valIsEmpty = newValType === 'undefined' || newVal === '';
          var shouldSelfClose = typeof obj._selfCloseTag === 'boolean' ? valIsEmpty && obj._selfCloseTag : valIsEmpty;
          var selfCloseStr = shouldSelfClose ? '/' : '';
          var attributesString = formatAttributes(obj._attrs, config.attributesFilter);
          var tag = '<' + _name + attributesString + selfCloseStr + '>';

          // Post-tag output (closing tag, indent, line breaks).
          var preTagCloseStr = config.indent && !isNewValSimple ? '\n' + indentStr : '';
          var postTag = !shouldSelfClose ? '' + newVal + preTagCloseStr + '</' + _name + '>' : '';

          outputStr = '' + preTag + tag + postTag;
          break;
        }

      case 'object':
        {
          // Iterates over keyval pairs in an object, converting each item to a special-object.

          var keys = Object.keys(obj);
          var outputArr = keys.map(function (key, index) {
            var newConfig = Object.assign({}, config, {
              _isFirstItem: index === 0,
              _isLastItem: index + 1 === keys.length
            });

            var outputObj = { _name: key };

            if (getType(obj[key]) === 'object') {
              // Sub-object contains an object.

              // Move private vars up as needed.  Needed to support certain types of objects
              // E.g. { foo: { _attrs: { a: 1 } } } -> <foo a="1"/>
              privateVars.forEach(function (privateVar) {
                var val = obj[key][privateVar];
                if (typeof val !== 'undefined') {
                  outputObj[privateVar] = val;
                  delete obj[key][privateVar];
                }
              });

              var hasContent = typeof obj[key]._content !== 'undefined';
              if (hasContent) {
                // _content has sibling keys, so pass as an array (edge case).
                // E.g. { foo: 'bar', _content: { baz: 2 } } -> <foo>bar</foo><baz>2</baz>
                if (Object.keys(obj[key]).length > 1) {
                  var newContentObj = Object.assign({}, obj[key]);
                  delete newContentObj._content;

                  outputObj._content = [].concat(_toConsumableArray(objToArray(newContentObj)), [obj[key]._content]);
                }
              }
            }

            // Fallthrough: just pass the key as the content for the new special-object.
            if (typeof outputObj._content === 'undefined') outputObj._content = obj[key];

            var xml = toXML(outputObj, newConfig);

            return xml;
          }, config);

          outputStr = outputArr.join('');
          break;
        }

      case 'function':
        {
          // Executes a user-defined function and return output.

          var fnResult = obj(config);

          outputStr = toXML(fnResult, config);
          break;
        }

      case 'array':
        {
          // Iterates and converts each value in an array.

          var _outputArr = obj.map(function (singleVal, index) {
            var newConfig = Object.assign({}, config, {
              _isFirstItem: index === 0,
              _isLastItem: index + 1 === obj.length
            });
            return toXML(singleVal, newConfig);
          });

          outputStr = _outputArr.join('');
          break;
        }

      case 'number':
      case 'string':
      case 'boolean':
      case 'date':
      case 'null':
      default:
        {
          outputStr = filterStr(obj, config.filter);
          break;
        }
    }

    var headerStr = getHeaderString(config, depth, isOutputStart);

    outputStr = '' + headerStr + outputStr;

    return outputStr;
  };
});
