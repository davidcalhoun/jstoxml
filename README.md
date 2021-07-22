# jstoxml

[![npm downloads](https://img.shields.io/npm/dm/jstoxml.svg)](https://www.npmjs.com/package/jstoxml)

### Convert JavaScript objects (and JSON) to XML (for RSS, Podcasts, etc.)

Everyone loves JSON, and more and more folks want to move that direction, but we still need things outputted in XML! Particularly for [RSS feeds](http://www.rssboard.org/rss-specification) and [Podcasts](http://www.apple.com/itunes/podcasts/specs.html).

This is inspired by [node-jsontoxml](https://github.com/soldair/node-jsontoxml), which was found to be a bit too rough around the edges. jstoxml attempts to fix that by being more flexible.

### Installation

- npm install jstoxml

### Changelog

#### Version 2.2.0
* Initial support for XML comments ([#47](https://github.com/davidcalhoun/jstoxml/issues/47))

#### Version 2.1.1
* Fix for [#48](https://github.com/davidcalhoun/jstoxml/issues/48) (various 0-depth issues, bad "is output start" logic)

#### Version 2.0.0 (breaking)

- New: automatic entity escaping for `&`, `<`, and `>` characters. In addition, quotes `"` in attributes are also escaped (see [#41](/../../issues/41)). Prior to this, users [had to provide their own filter manually](https://github.com/davidcalhoun/jstoxml/issues/4#issuecomment-19165730). Note that `jstoxml` makes an effort not to escape entities that appear to have already been encoded, to prevent double-encoding issues.
  - E.g. `toXML({ foo: '1 < 2 & 2 > 1' }); // -> "<foo>1 &lt; 2 &amp; 2 &gt; 1</foo>"`
  - To restore the default behavior from `v1.x.x`, simply pass in `false` to `filter` and `attributesFilter` options:
    `toXML({ foo: '1 < 2 & 2 > 1' }, { filter: false, attributesFilter: false }); // -> "<foo>1 < 2 & 2 > 1</foo>"`

#### Past changes
- See CHANGELOG.md for a full history of changes.

### Examples

First you'll want to require jstoxml in your script, and assign the result to the namespace variable you want to use (in this case jstoxml):

```javascript
// Node
const { toXML } = require("jstoxml");

// Browser (with the help of something like Webpack or Rollup)
import { toXML } from "jstoxml";

// Browser global fallback (requires no bundler)
var toXML = window.jstoxml.toXML;
```

#### Example 1: Simple object

```javascript
toXML({
  foo: "bar",
  foo2: "bar2",
});
```

Output:

```
<foo>bar</foo><foo2>bar2</foo2>
```

Note: because JavaScript doesn't allow duplicate key names, only the last defined key will be outputted. If you need duplicate keys, please use an array instead (see Example 2 below).

#### Example 2: Simple array (needed for duplicate keys)

```javascript
toXML([
  {
    foo: "bar",
  },
  {
    foo: "bar2",
  },
]);
```

Output:

```
<foo>bar</foo><foo>bar2</foo>
```

#### Example 3: Simple functions

```javascript
toXML({ currentTime: () => new Date() });
```

Output:

```
<currentTime>Mon Oct 02 2017 09:34:54 GMT-0700 (PDT)</currentTime>
```

#### Example 4: XML tag attributes

```javascript
toXML({
  _name: "foo",
  _content: "bar",
  _attrs: {
    a: "b",
    c: "d",
  },
});
```

Output:

```
<foo a="b" c="d">bar</foo>
```

#### Example 5: Tags mixed with text content

To output text content, set a key to null:

```javascript
toXML({
  text1: null,
  foo: "bar",
  text2: null,
});
```

Output:

```
text1<foo>bar</foo>text2
```

#### Example 6: Nested tags (with indenting)

```javascript
const xmlOptions = {
  header: false,
  indent: "  ",
};

toXML(
  {
    a: {
      foo: "bar",
      foo2: "bar2",
    },
  },
  xmlOptions
);
```

Output:

```
<a>
  <foo>bar</foo>
  <foo2>bar2</foo2>
</a>
```

#### Example 7: Nested tags with attributes (with indenting)

```javascript
const xmlOptions = {
  header: false,
  indent: "  ",
};

toXML(
  {
    ooo: {
      _name: "foo",
      _attrs: {
        a: "b",
      },
      _content: {
        _name: "bar",
        _attrs: {
          c: "d",
        },
      },
    },
  },
  xmlOptions
);
```

Output:

```
<ooo>
  <foo a="b">
    <bar c="d"/>
  </foo>
</ooo>
```

Note that cases like this might be especially hard to read because of the deep nesting, so it's recommend you use something like this pattern instead, which breaks it up into more readable pieces:

```javascript
const bar = {
  _name: "bar",
  _attrs: {
    c: "d",
  },
};

const foo = {
  _name: "foo",
  _attrs: {
    a: "b",
  },
  _content: bar,
};

const xmlOptions = {
  header: false,
  indent: "  ",
};

return toXML(
  {
    ooo: foo,
  },
  xmlOptions
);
```

#### Example 8: Complex functions

Function outputs will be processed (fed back into toXML), meaning that you can output objects that will in turn be converted to XML.

```javascript
toXML({
  someNestedXML: () => {
    return {
      foo: "bar",
    };
  },
});
```

Output:

```
<someNestedXML><foo>bar</foo></someNestedXML>
```

#### Example 9: RSS Feed

```javascript
const xmlOptions = {
  header: true,
  indent: "  ",
};

toXML(
  {
    _name: "rss",
    _attrs: {
      version: "2.0",
    },
    _content: {
      channel: [
        {
          title: "RSS Example",
        },
        {
          description: "Description",
        },
        {
          link: "google.com",
        },
        {
          lastBuildDate: () => new Date(),
        },
        {
          pubDate: () => new Date(),
        },
        {
          language: "en",
        },
        {
          item: {
            title: "Item title",
            link: "Item link",
            description: "Item Description",
            pubDate: () => new Date(),
          },
        },
        {
          item: {
            title: "Item2 title",
            link: "Item2 link",
            description: "Item2 Description",
            pubDate: () => new Date(),
          },
        },
      ],
    },
  },
  xmlOptions
);
```

Output:

```
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Example</title>
    <description>Description</description>
    <link>google.com</link>
    <lastBuildDate>Sat Jul 30 2011 18:14:25 GMT+0900 (JST)</lastBuildDate>
    <pubDate>Sat Jul 30 2011 18:14:25 GMT+0900 (JST)</pubDate>
    <language>en</language>
    <item>
      <title>Item title</title>
      <link>Item link</link>
      <description>Item Description</description>
      <pubDate>Sat Jul 30 2011 18:33:47 GMT+0900 (JST)</pubDate>
    </item>
    <item>
      <title>Item2 title</title>
      <link>Item2 link</link>
      <description>Item2 Description</description>
      <pubDate>Sat Jul 30 2011 18:33:47 GMT+0900 (JST)</pubDate>
    </item>
  </channel>
</rss>
```

#### Example 10: Podcast RSS Feed

(see the [Apple docs](http://www.apple.com/itunes/podcasts/specs.html) for more information)

```javascript
const xmlOptions = {
  header: true,
  indent: "  ",
};

toXML(
  {
    _name: "rss",
    _attrs: {
      "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
      version: "2.0",
    },
    _content: {
      channel: [
        {
          title: "Title",
        },
        {
          link: "google.com",
        },
        {
          language: "en-us",
        },
        {
          copyright: "Copyright 2011",
        },
        {
          "itunes:subtitle": "Subtitle",
        },
        {
          "itunes:author": "Author",
        },
        {
          "itunes:summary": "Summary",
        },
        {
          description: "Description",
        },
        {
          "itunes:owner": {
            "itunes:name": "Name",
            "itunes:email": "Email",
          },
        },
        {
          _name: "itunes:image",
          _attrs: {
            href: "image.jpg",
          },
        },
        {
          _name: "itunes:category",
          _attrs: {
            text: "Technology",
          },
          _content: {
            _name: "itunes:category",
            _attrs: {
              text: "Gadgets",
            },
          },
        },
        {
          _name: "itunes:category",
          _attrs: {
            text: "TV &amp; Film",
          },
        },
        {
          item: [
            {
              title: "Podcast Title",
            },
            {
              "itunes:author": "Author",
            },
            {
              "itunes:subtitle": "Subtitle",
            },
            {
              "itunes:summary": "Summary",
            },
            {
              "itunes:image": "image.jpg",
            },
            {
              _name: "enclosure",
              _attrs: {
                url: "http://example.com/podcast.m4a",
                length: "8727310",
                type: "audio/x-m4a",
              },
            },
            {
              guid: "http://example.com/archive/aae20050615.m4a",
            },
            {
              pubDate: "Wed, 15 Jun 2011 19:00:00 GMT",
            },
            {
              "itunes:duration": "7:04",
            },
            {
              "itunes:keywords": "salt, pepper, shaker, exciting",
            },
          ],
        },
        {
          item: [
            {
              title: "Podcast2 Title",
            },
            {
              "itunes:author": "Author2",
            },
            {
              "itunes:subtitle": "Subtitle2",
            },
            {
              "itunes:summary": "Summary2",
            },
            {
              "itunes:image": "image2.jpg",
            },
            {
              _name: "enclosure",
              _attrs: {
                url: "http://example.com/podcast2.m4a",
                length: "655555",
                type: "audio/x-m4a",
              },
            },
            {
              guid: "http://example.com/archive/aae2.m4a",
            },
            {
              pubDate: "Wed, 15 Jul 2011 19:00:00 GMT",
            },
            {
              "itunes:duration": "11:20",
            },
            {
              "itunes:keywords": "foo, bar",
            },
          ],
        },
      ],
    },
  },
  xmlOptions
);
```

Output:

```
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
  <channel>
    <title>Title</title>
    <link>google.com</link>
    <language>en-us</language>
    <copyright>Copyright 2011</copyright>
    <itunes:subtitle>Subtitle</itunes:subtitle>
    <itunes:author>Author</itunes:author>
    <itunes:summary>Summary</itunes:summary>
    <description>Description</description>
    <itunes:owner>
      <itunes:name>Name</itunes:name>
      <itunes:email>Email</itunes:email>
    </itunes:owner>
    <itunes:image href="image.jpg"/>
    <itunes:category text="Technology">
      <itunes:category text="Gadgets"/>
    </itunes:category>
    <itunes:category text="TV &amp; Film"/>
    <item>
      <title>Podcast Title</title>
      <itunes:author>Author</itunes:author>
      <itunes:subtitle>Subtitle</itunes:subtitle>
      <itunes:summary>Summary</itunes:summary>
      <itunes:image>image.jpg</itunes:image>
      <enclosure url="http://example.com/podcast.m4a" length="8727310" type="audio/x-m4a"/>
      <guid>http://example.com/archive/aae20050615.m4a</guid>
      <pubDate>Wed, 15 Jun 2011 19:00:00 GMT</pubDate>
      <itunes:duration>7:04</itunes:duration>
      <itunes:keywords>salt, pepper, shaker, exciting</itunes:keywords>
    </item>
    <item>
      <title>Podcast2 Title</title>
      <itunes:author>Author2</itunes:author>
      <itunes:subtitle>Subtitle2</itunes:subtitle>
      <itunes:summary>Summary2</itunes:summary>
      <itunes:image>image2.jpg</itunes:image>
      <enclosure url="http://example.com/podcast2.m4a" length="655555" type="audio/x-m4a"/>
      <guid>http://example.com/archive/aae2.m4a</guid>
      <pubDate>Wed, 15 Jul 2011 19:00:00 GMT</pubDate>
      <itunes:duration>11:20</itunes:duration>
      <itunes:keywords>foo, bar</itunes:keywords>
    </item>
  </channel>
</rss>
```

#### Example 11: Custom filter for XML entities, or whatever

```javascript
const xmlOptions = {
  filter: {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
    "&": "&amp;",
  },
};

toXML(
  {
    foo: "<a>",
    bar: '"b"',
    baz: "'&whee'",
  },
  xmlOptions
);
```

Output:

```
<foo>&lt;a&gt;</foo><bar>&quot;b&quot;</bar><baz>&apos;&amp;whee&apos;</baz>
```

#### Example 11b: Custom filter for XML attributes

```javascript
const xmlOptions = {
  attributesFilter: {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
    "&": "&amp;",
  },
};

toXML(
  {
    _name: "foo",
    _attrs: { a: '<"\'&"foo>' },
  },
  xmlOptions
);
```

Output:

```
<foo a="&lt;&quot;&apos;&amp;&quot;foo&gt;"/>
```

#### Example 12: Avoiding self-closing tags

If for some reason you want to avoid self-closing tags, you can pass in a special config option `_selfCloseTag`:

```javascript
const xmlOptions = {
  _selfCloseTag: false,
};

toXML(
  {
    foo: "",
    bar: undefined,
  },
  xmlOptions
);
```

Output:

```
<foo></foo><bar>whee</bar>
```

#### Example 13: Custom XML header

```javascript
const xmlOptions = {
  header: '<?xml version="1.0" encoding="UTF-16" standalone="yes"?>',
};

toXML(
  {
    foo: "bar",
  },
  xmlOptions
);
```

Output:

```
<?xml version="1.0" encoding="UTF-16" standalone="yes"?><foo>bar</foo><foo2>bar2</foo2>
```

#### Example 14: Emoji attribute support (needed for AMP)

```javascript
toXML({
  html: {
    _attrs: {
      "⚡": true,
    },
  },
});
```

Output:

```
<html ⚡/>
```

#### Example 15: Duplicate attribute key support

```javascript
toXML({
  html: {
    _attrs: [
      {
        lang: "en",
      },
      {
        lang: "klingon",
      },
    ],
  },
});
```

Output:

```
<html lang="en" lang="klingon"/>
```

#### Example 16: XML comments

```javascript
toXML({
  _comment: 'Some important comment',
  a: {
    b: [1, 2, 3]
  }
}, { indent: '    ' });
```

Output:

```
<!-- Some important comment -->
<a>
    <b>1</b>
    <b>2</b>
    <b>3</b>
</a>
```

#### Example 17: Multiple XML comments

```javascript
toXML([
  { _comment: 'Some important comment' },
  { _comment: 'This is a very long comment!' },
  { _comment: 'More important exposition!' },
  { a: { b: [1, 2, 3] } }
], { indent: '    ' });
```

Output:

```
<!-- Some important comment -->
<!-- This is a very long comment! -->
<!-- More important exposition! -->
<a>
    <b>1</b>
    <b>2</b>
    <b>3</b>
</a>
```

### License

MIT
