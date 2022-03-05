const DATA_TYPES = {
    ARRAY: 'array',
    BOOLEAN: 'boolean',
    DATE: 'date',
    FUNCTION: 'function',
    JSTOXML_OBJECT: 'jstoxml-object',
    NULL: 'null',
    NUMBER: 'number',
    OBJECT: 'object',
    STRING: 'string'
};

const PRIVATE_VARS = ['_selfCloseTag', '_attrs'];

/**
 * Determines the indent string based on current tree depth.
 */
const getIndentStr = (indent = '', depth = 0) => indent.repeat(depth);

/**
 * Sugar function supplementing JS's quirky typeof operator, plus some extra help to detect
 * "special objects" expected by jstoxml.
 * @example
 * getType(new Date());
 * // -> 'date'
 */
const getType = (val) =>
    (Array.isArray(val) && DATA_TYPES.ARRAY) ||
    (typeof val === DATA_TYPES.OBJECT && val !== null && val._name && DATA_TYPES.JSTOXML_OBJECT) ||
    (val instanceof Date && DATA_TYPES.DATE) ||
    (val === null && DATA_TYPES.NULL) ||
    typeof val;

/**
 * Replaces matching values in a string with a new value.
 * @example
 * mapStr('foo&bar', { '&': '&amp;' });
 * // -> 'foo&amp;bar'
 */
const mapStr = (inputStr = '', replacements = {}) => {
    // Passthrough/no-op for nonstrings (e.g. number, boolean).
    if (typeof inputStr !== 'string') {
        return inputStr;
    }

    const regexp = new RegExp(`(${Object.keys(replacements).join('|')})(?!(\\w|#)*;)`, 'g');

    return String(inputStr).replace(regexp, (str, entity) => replacements[entity] || '');
};

/**
 * Maps an object or array of arribute keyval pairs to a string.
 * @example
 * getAttributeKeyVals({ foo: 'bar', baz: 'g' });
 * // -> 'foo="bar" baz="g"'
 * getAttributeKeyVals([ { ⚡: true }, { foo: 'bar' } ]);
 * // -> '⚡ foo="bar"'
 */
const getAttributeKeyVals = (attributes = {}, replacements, filter) => {
    let keyVals = [];
    if (Array.isArray(attributes)) {
        // Array containing complex objects and potentially duplicate attributes.
        keyVals = attributes.reduce((allAttributes, attr) => {
            const key = Object.keys(attr)[0];
            const val = attr[key];

            if (typeof filter === DATA_TYPES.FUNCTION) {
                const shouldFilterOut = filter(key, val);
                if (shouldFilterOut) {
                    return allAttributes;
                }
            }

            const replacedVal = replacements ? mapStr(val, replacements) : val;
            const valStr = replacedVal === true ? '' : `="${replacedVal}"`;
            allAttributes.push(`${key}${valStr}`);
            return allAttributes;
        }, []);
    } else {
        const entries = Object.entries(attributes);
        keyVals = entries.reduce((allAttributes, [key, val]) => {
            // Simple object - keyval pairs.

            if (typeof filter === DATA_TYPES.FUNCTION) {
                const shouldFilterOut = filter(key, val);
                if (shouldFilterOut) {
                    return allAttributes;
                }
            }

            // For boolean true, simply output the key.
            const replacedVal = replacements ? mapStr(attributes[key], replacements) : attributes[key];
            const valStr = attributes[key] === true ? '' : `="${replacedVal}"`;

            allAttributes.push(`${key}${valStr}`);
            return allAttributes;
        }, []);
    }

    return keyVals;
};

/**
 * Converts an attributes object/array to a string of keyval pairs.
 * @example
 * formatAttributes({ a: 1, b: 2 })
 * // -> 'a="1" b="2"'
 */
const formatAttributes = (attributes = {}, replacements, filter) => {
    const keyVals = getAttributeKeyVals(attributes, replacements, filter);
    if (keyVals.length === 0) return '';

    const keysValsJoined = keyVals.join(' ');
    return ` ${keysValsJoined}`;
};

/**
 * Converts an object to a jstoxml array.
 * @example
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
const objToArray = (obj = {}) =>
    Object.keys(obj).map((key) => {
        return {
            _name: key,
            _content: obj[key]
        };
    });

/**
 * Determines if a value is a primitive JavaScript value (not including Symbol).
 * @example
 * isPrimitive(4);
 * // -> true
 */
const PRIMITIVE_TYPES = [DATA_TYPES.STRING, DATA_TYPES.NUMBER, DATA_TYPES.BOOLEAN];
const isPrimitive = (val) => PRIMITIVE_TYPES.includes(getType(val));

/**
 * Determines if a value is a simple primitive type that can fit onto one line.  Needed for
 * determining any needed indenting and line breaks.
 * @example
 * isSimpleType(new Date());
 * // -> true
 */
const SIMPLE_TYPES = [...PRIMITIVE_TYPES, DATA_TYPES.DATE, DATA_TYPES.JSTOXML_OBJECT];
const isSimpleType = (val) => SIMPLE_TYPES.includes(getType(val));

/**
 * Determines if an XML string is a simple primitive, or contains nested data.
 * @example
 * isSimpleXML('<foo />');
 * // -> false
 */
const isSimpleXML = (xmlStr) => !xmlStr.match('<');

/**
 * Assembles an XML header as defined by the config.
 */
const DEFAULT_XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const getHeaderString = ({ header, indent, isOutputStart /*, depth */ }) => {
    const shouldOutputHeader = header && isOutputStart;
    if (!shouldOutputHeader) return '';

    const shouldUseDefaultHeader = typeof header === DATA_TYPES.BOOLEAN;
    return shouldUseDefaultHeader ? DEFAULT_XML_HEADER : header;
};

/**
 * Recursively traverses an object tree and converts the output to an XML string.
 * @example
 * toXML({ foo: 'bar' });
 * // -> <foo>bar</foo>
 */
const defaultEntityReplacements = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
};
export const toXML = (obj = {}, config = {}) => {
    const {
        // Tree depth
        depth = 0,
        indent,
        _isFirstItem,
        // _isLastItem,
        _isOutputStart = true,
        header,
        attributeReplacements: rawAttributeReplacements = {},
        attributeFilter,
        contentReplacements: rawContentReplacements = {},
        contentFilter
    } = config;

    const shouldTurnOffAttributeReplacements =
        typeof rawAttributeReplacements === 'boolean' && !rawAttributeReplacements;
    const attributeReplacements = shouldTurnOffAttributeReplacements
        ? {}
        : {
              ...defaultEntityReplacements,
              ...{ '"': '&quot;' },
              ...rawAttributeReplacements
          };

    const shouldTurnOffContentReplacements = typeof rawContentReplacements === 'boolean' && !rawContentReplacements;
    const contentReplacements = shouldTurnOffContentReplacements
        ? {}
        : { ...defaultEntityReplacements, ...rawContentReplacements };

    // Determine indent string based on depth.
    const indentStr = getIndentStr(indent, depth);

    // For branching based on value type.
    const valType = getType(obj);

    const headerStr = getHeaderString({ header, indent, depth, isOutputStart: _isOutputStart });

    const isOutputStart = _isOutputStart && !headerStr && _isFirstItem && depth === 0;

    let outputStr = '';
    switch (valType) {
        case DATA_TYPES.JSTOXML_OBJECT: {
            // Processes a specially-formatted object used by jstoxml.

            const { _name, _content } = obj;

            // Output text content without a tag wrapper.
            if (_content === null) {
                outputStr = _name;
                break;
            }

            // Handles arrays of primitive values. (#33)
            const isArrayOfPrimitives = Array.isArray(_content) && _content.every(isPrimitive);
            if (isArrayOfPrimitives) {
                const primitives = _content.map((a) => {
                    return toXML(
                        {
                            _name,
                            _content: a
                        },
                        {
                            ...config,
                            depth,
                            _isOutputStart: false
                        }
                    );
                });
                return primitives.join('');
            }

            // Don't output private vars (such as _attrs).
            if (_name.includes(PRIVATE_VARS)) break;

            // Process the nested new value and create new config.
            const newVal = toXML(_content, { ...config, depth: depth + 1, _isOutputStart: isOutputStart });
            const newValType = getType(newVal);
            const isNewValSimple = isSimpleXML(newVal);

            // Pre-tag output (indent and line breaks).
            const preIndentStr = indent && !isOutputStart ? '\n' : '';
            const preTag = `${preIndentStr}${indentStr}`;

            // Special handling for comments, preserving preceding line breaks/indents.
            if (_name === '_comment') {
                outputStr += `${preTag}<!-- ${_content} -->`;
                break;
            }

            // Tag output.
            const valIsEmpty = newValType === 'undefined' || newVal === '';
            const shouldSelfClose =
                typeof obj._selfCloseTag === DATA_TYPES.BOOLEAN ? valIsEmpty && obj._selfCloseTag : valIsEmpty;
            const selfCloseStr = shouldSelfClose ? '/' : '';
            const attributesString = formatAttributes(obj._attrs, attributeReplacements, attributeFilter);
            const tag = `<${_name}${attributesString}${selfCloseStr}>`;

            // Post-tag output (closing tag, indent, line breaks).
            const preTagCloseStr = indent && !isNewValSimple ? `\n${indentStr}` : '';
            const postTag = !shouldSelfClose ? `${newVal}${preTagCloseStr}</${_name}>` : '';
            outputStr += `${preTag}${tag}${postTag}`;
            break;
        }

        case DATA_TYPES.OBJECT: {
            // Iterates over keyval pairs in an object, converting each item to a special-object.

            const keys = Object.keys(obj);
            const outputArr = keys.map((key, index) => {
                const newConfig = {
                    ...config,
                    _isFirstItem: index === 0,
                    _isLastItem: index + 1 === keys.length,
                    _isOutputStart: isOutputStart
                };

                const outputObj = { _name: key };

                if (getType(obj[key]) === DATA_TYPES.OBJECT) {
                    // Sub-object contains an object.

                    // Move private vars up as needed.  Needed to support certain types of objects
                    // E.g. { foo: { _attrs: { a: 1 } } } -> <foo a="1"/>
                    PRIVATE_VARS.forEach((privateVar) => {
                        const val = obj[key][privateVar];
                        if (typeof val !== 'undefined') {
                            outputObj[privateVar] = val;
                            delete obj[key][privateVar];
                        }
                    });

                    const hasContent = typeof obj[key]._content !== 'undefined';
                    if (hasContent) {
                        // _content has sibling keys, so pass as an array (edge case).
                        // E.g. { foo: 'bar', _content: { baz: 2 } } -> <foo>bar</foo><baz>2</baz>
                        if (Object.keys(obj[key]).length > 1) {
                            const newContentObj = Object.assign({}, obj[key]);
                            delete newContentObj._content;

                            outputObj._content = [...objToArray(newContentObj), obj[key]._content];
                        }
                    }
                }

                // Fallthrough: just pass the key as the content for the new special-object.
                if (typeof outputObj._content === 'undefined') outputObj._content = obj[key];

                const xml = toXML(outputObj, newConfig, key);

                return xml;
            }, config);

            outputStr = outputArr.join('');
            break;
        }

        case DATA_TYPES.FUNCTION: {
            // Executes a user-defined function and returns output.

            const fnResult = obj(config);

            outputStr = toXML(fnResult, config);
            break;
        }

        case DATA_TYPES.ARRAY: {
            // Iterates and converts each value in an array.
            const outputArr = obj.map((singleVal, index) => {
                const newConfig = {
                    ...config,
                    _isFirstItem: index === 0,
                    _isLastItem: index + 1 === obj.length,
                    _isOutputStart: isOutputStart
                };
                return toXML(singleVal, newConfig);
            });

            outputStr = outputArr.join('');

            break;
        }

        // number, string, boolean, date, null, etc
        default: {
            outputStr = mapStr(obj, contentReplacements);
            break;
        }
    }

    return `${headerStr}${outputStr}`;
};

export default {
    toXML
};
