jstoxml
=========

### Convert native JavaScript objects (JSON) to XML

Everyone loves JSON, and the world is moving that direction, but we still need things outputted in XML!  Particularly for [RSS feeds](http://www.rssboard.org/rss-specification) and [Podcasts](http://www.apple.com/itunes/podcasts/specs.html).

This is inspired by [node-jsontoxml](https://github.com/soldair/node-jsontoxml), which was found to be a bit too rough around the edges.  jstoxml attempts to fix that by being more flexible.

### Features
* supports a variety of inputs: objects, arrays, strings, 
* tabbed output (optional)

### Installation
* npm install jstoxml

### Examples
First you'll want to require jstoxml in your script, and assign the result to the namespace variable you want to use (in this case jstoxml):
```javascript
var jstoxml = require('jstoxml');
```

#### Interface
jstoxml has a very simple interface: jstoxml.toXML(input, addHeader [Boolean], indent [String]);

* input: accepts objects, arrays, strings, and even functions
* addHeader (optional): pass in true to include the XML header (&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;)
* indent (optional): string which is used as an indent (i.e. '  ')


#### Example 1: Simple object
```javascript
jstoxml.toXML({
  foo: 'bar',
  foo2: 'bar2'
});
```
Output:

```
<foo>bar</foo><foo2>bar2</foo2>
```


#### Example 2: Simple array
```javascript
jstoxml.toXML([
  {foo: 'bar'},
  {foo2: 'bar2'}
]);
```
Output:

```
<foo>bar</foo><foo2>bar2</foo2>
```


#### Example 3: Duplicate tag names
Because we can't have duplicate keys in objects, we have to take advantage of arrays to get duplicate tag names:

```javascript
jstoxml.toXML([
  {foo: 'bar'},
  {foo: 'bar2'}
]);
```
Output:

```
<foo>bar</foo><foo>bar2</foo>
```


#### Example 4: Attributes
```javascript
jstoxml.toXML({
  _name: 'foo',
  _content: 'bar',
  _attrs: {
    a: 'b',
    c: 'd'
  }
});
```
Output:

```
<foo a="b" c="d">bar</foo>
```


#### Example 5: Tags mixed with text content
To output text content, set a key to an empty string value:

```javascript
jstoxml.toXML({
  'text1': '',
  foo: 'bar',
  'text2': ''
});

```
Output:

```
text1<foo>bar</foo>text2
```


#### Example 6: Nested tags (with indenting)

```javascript
jstoxml.toXML({
  a: {
    foo: 'bar',
    foo2: 'bar2'
  }
}, false, '  ');
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
jstoxml.toXML({
  ooo: [
    {
      _name: 'foo',
      _attrs: {
        a: 'b'
      },
      _content: [
        {
          _name: 'bar',
          _attrs: {
            c: 'd'
          }
        }
      ]
    }
  ]
}, false, '  ');
```
Output:

```
<ooo>
  <foo a="b">
    <bar c="d"/>
  </foo>
</ooo>
```


#### Example 8: Functions
```javascript
jstoxml.toXML({
  onePlusTwo: function(){
    return 1 + 2;
  },
  date: function(){
    return new Date();
  }
});
```
Output:

```
<onePlusTwo>3</onePlusTwo><date>Sat Jul 30 2011 17:49:52 GMT+0900 (JST)</date>
```

#### Example 9: RSS Feed
```javascript
jstoxml.toXML({
  _name: 'rss',
  _attrs: {
    version: '2.0'
  },
  _content: {
    channel: [
      {title: 'RSS Example'},
      {description: 'Description'},
      {link: 'google.com'},
      {lastBuildDate: function(){
        return new Date();
      }},
      {pubDate: function(){
        return new Date();
      }},
      {language: 'en'},
      {item: {
        title: 'Item title',
        link: 'Item link',
        description: 'Item Description',
        pubDate: function(){
          return new Date();
        }
      }},
      {item: {
        title: 'Item2 title',
        link: 'Item2 link',
        description: 'Item2 Description',
        pubDate: function(){
          return new Date();
        }
      }}
    ]
  }
}, true, '  ');
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