jstoxml
=========

### Convert native JavaScript objects (JSON) to XML

Everyone loves JSON, and the world is moving that direction, but we still need things outputted in XML!  Particularly for [RSS](http://www.rssboard.org/rss-specification) and [Podcasts](http://www.apple.com/itunes/podcasts/specs.html).

This is inspired by [node-jsontoxml](https://github.com/soldair/node-jsontoxml), which was found to be a bit too rough around the edges.  jstoxml attempts to fix that by being more flexible.

```javascript
{
  foo: 'bar',
  foo2: 'bar2'
}
```

```xml
<foo>bar</foo>
<foo2>bar2</foo2>
```


```javascript
[
  {foo: 'bar'},
  {foo2: 'bar2'}
]
```

```xml
<foo>bar</foo>
<foo2>bar2</foo2>
```

```javascript
[
  {name: 'foo', content: 'bar'},
  {name: 'foo2', content: 'bar2'}
];
```

```xml
<foo>bar</foo>
<foo2>bar2</foo2>
```


```javascript
{
  'blah': '',
  foo: 'bar',
  'more blah': ''
}
```

```xml
blah
<foo>bar</foo>
more blah
```

```javascript
{
  a: {
    foo: 'bar',
    foo2: 'bar2'
  }
}
```

```xml
<a>
  <foo>bar</foo>
  <foo2>bar2</foo2>
</a>
```

```javascript
{
  date: function(){
    return new Date();
  }
}
```

```xml
<date>Sat Jul 30 2011 05:14:02 GMT+0900 (JST)</date>
```