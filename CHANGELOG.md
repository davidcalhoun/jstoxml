# Changelog

#### Version 2.2.0
* Initial support for XML comments ([#47](https://github.com/davidcalhoun/jstoxml/issues/47))

#### Version 2.1.1
* Fix for [#48](https://github.com/davidcalhoun/jstoxml/issues/48) (various 0-depth issues, bad "is output start" logic)

#### Version 2.0.0 (breaking)

- New: automatic entity escaping for `&`, `<`, and `>` characters. In addition, quotes `"` in attributes are also escaped (see [#41](/../../issues/41)). Prior to this, users [had to provide their own filter manually](https://github.com/davidcalhoun/jstoxml/issues/4#issuecomment-19165730). Note that `jstoxml` makes an effort not to escape entities that appear to have already been encoded, to prevent double-encoding issues.
  - E.g. `toXML({ foo: '1 < 2 & 2 > 1' }); // -> "<foo>1 &lt; 2 &amp; 2 &gt; 1</foo>"`
  - To restore the default behavior from `v1.x.x`, simply pass in `false` to `filter` and `attributesFilter` options:
    `toXML({ foo: '1 < 2 & 2 > 1' }, { filter: false, attributesFilter: false }); // -> "<foo>1 < 2 & 2 > 1</foo>"`

#### Version 1.6.9

- fix for [#40](https://github.com/davidcalhoun/jstoxml/issues/47). Previously top-level objects and arrays were concatenated without proper line breaks.

#### Version 1.4.2

- support for handling arrays of primitives, instead of simply concatenating [#33](/../../issues/33)

#### Version 1.3.0

- restored `default` module export [#31](/../../issues/31)

#### Version 1.2.0

- refactoring and cleanup

#### Version 1.1.0

- Added support for attribute filtering (see Example 11b below).

#### Version 1.0.0

- Complete rewrite! The code should now be easier to understand and maintain.
- now supports emoji/UTF8 tag attributes (needed for AMP pages - e.g. `<html ⚡ lang="en">`) (see example 14)
- now supports duplicate attribute key names (see example 15)
- Fixed: functions returning objects now have now that output passed through toXML for XML conversion
- Fixed: empty text strings now properly output self-closing tags
- Migrated tests to mocha