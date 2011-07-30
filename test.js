var jstoxml = require('./jstoxml.js');

(function(){
  var tests = [];
  var results = {
    testsRun: 0,
    pass: 0,
    fail: 0
  };
  
  var addTest = function(obj){
    tests.push(obj);
  }
  
  var showReport = function(){
    console.log(results);
  }
  
  var passFail = function(test){
    var output;
    
    try {
      output = test.input();
      
      results.testsRun++;
      
      if(output !== test.expectedOutput){
        console.log(output + '\n!==\n\n' + test.expectedOutput);
        console.log(test.name + ' failed.  ' + results.testsRun + '/' + tests.length);
        results.fail++;
      } else {
        console.log(test.name + ' passed.  ' + results.testsRun + '/' + tests.length);
        results.pass++;
      }
    } catch(e) {
      console.log(test.name + ' failed.  ' + results.testsRun + '/' + tests.length);
      console.log(e);
    }
  }
  
  var runTests = function(){
    for(var i=0, len=tests.length; i<len; i++){
      passFail(tests[i]);
    }
  }
  
  addTest({
    name: 'string',
    input: function(){
      return jstoxml.toXML('foo')
    },
    expectedOutput: 'foo'
  });
  
  addTest({
    name: 'number',
    input: function(){
      return jstoxml.toXML(5)
    },
    expectedOutput: '5'
  });
  
  addTest({
    name: 'function',
    input: function(){
      return jstoxml.toXML(function(){
        return 999;
      })
    },
    expectedOutput: '999'
  });
  
  addTest({
    name: 'array',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ])
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'array-advanced',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ])
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'object',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      })
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'object-xml-header',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      }, true)
    },
    expectedOutput: '<?xml version="1.0" encoding="UTF-8"?>\n<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'object-with-tabs',
    input: function(){
      return jstoxml.toXML({
        a: {
          foo: 'bar',
          foo2: 'bar2'
        }
      }, false, '  ')
    },
    expectedOutput: '<a>\n  <foo>bar</foo>\n  <foo2>bar2</foo2>\n</a>\n'
  });
  
  addTest({
    name: 'object-with-attributes',
    input: function(){
      return jstoxml.toXML({
        _name: 'a',
        _attrs: {
          foo: 'bar',
          foo2: 'bar2'
        }
      })
    },
    expectedOutput: '<a foo="bar" foo2="bar2"/>'
  });
  
  addTest({
    name: 'object-with-attributes2',
    input: function(){
      return jstoxml.toXML({
        _name: 'a',
        _attrs: {
          foo: 'bar',
          foo2: 'bar2'
        },
        _content: 'la dee da'
      })
    },
    expectedOutput: '<a foo="bar" foo2="bar2">la dee da</a>'
  });
  
  addTest({
    name: 'object-mixed',
    input: function(){
      return jstoxml.toXML({
        'blah': '',
        foo: 'bar',
        'more blah': ''
      })
    },
    expectedOutput: 'blah<foo>bar</foo>more blah'
  });
  
  addTest({
    name: 'object-nested',
    input: function(){
      return jstoxml.toXML({
        a: {
          foo: 'bar',
          foo2: 'bar2'
        }
      })
    },
    expectedOutput: '<a><foo>bar</foo><foo2>bar2</foo2></a>'
  });
  
  addTest({
    name: 'object-deep-nesting',
    input: function(){
      return jstoxml.toXML({
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    g: {
                      h: {
                        i: {
                          j: {
                            k: {
                              l: {
                                m: {
                                  foo: 'bar'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    },
    expectedOutput: '<a><b><c><d><e><f><g><h><i><j><k><l><m><foo>bar</foo></m></l></k></j></i></h></g></f></e></d></c></b></a>'
  });
  
  addTest({
    name: 'example1-simple-object',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      })
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'example2-simple-array',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ])
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'example3-duplicate-tag-names',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo: 'bar2'}
      ])
    },
    expectedOutput: '<foo>bar</foo><foo>bar2</foo>'
  });
  
  addTest({
    name: 'example4-attributes',
    input: function(){
      return jstoxml.toXML({
        _name: 'foo',
        _content: 'bar',
        _attrs: {
          a: 'b',
          c: 'd'
        }
      })
    },
    expectedOutput: '<foo a="b" c="d">bar</foo>'
  });
  
  addTest({
    name: 'example5-tags-with-text-nodes',
    input: function(){
      return jstoxml.toXML({
        'text1': '',
        foo: 'bar',
        'text2': ''
      })
    },
    expectedOutput: 'text1<foo>bar</foo>text2'
  });
  
  addTest({
    name: 'example6-nested-tags-with-indenting',
    input: function(){
      return jstoxml.toXML({
        a: {
          foo: 'bar',
          foo2: 'bar2'
        }
      }, false, '  ')
    },
    expectedOutput: '<a>\n  <foo>bar</foo>\n  <foo2>bar2</foo2>\n</a>\n'
  });
  
  addTest({
    name: 'example7-nested-tags-with-attributes',
    input: function(){
      return jstoxml.toXML({
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
      }, false, '  ')
    },
    expectedOutput: '<ooo>\n  <foo a="b">\n    <bar c="d"/>\n  </foo>\n</ooo>\n'
  });
  
  addTest({
    name: 'example8-functions',
    input: function(){
      return jstoxml.toXML({
        onePlusTwo: function(){
          return 1 + 2;
        }
      })
    },
    expectedOutput: '<onePlusTwo>3</onePlusTwo>'
  });
  
  addTest({
    name: 'example9-rss-feed',
    input: function(){
      return jstoxml.toXML({
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
              return 'Sat Jul 30 2011 18:14:25 GMT+0900 (JST)';
            }},
            {pubDate: function(){
              return 'Sat Jul 30 2011 18:14:25 GMT+0900 (JST)';
            }},
            {language: 'en'},
            {item: {
              title: 'Item title',
              link: 'Item link',
              description: 'Item Description',
              pubDate: function(){
                return 'Sat Jul 30 2011 18:33:47 GMT+0900 (JST)';
              }
            }},
            {item: {
              title: 'Item2 title',
              link: 'Item2 link',
              description: 'Item2 Description',
              pubDate: function(){
                return 'Sat Jul 30 2011 18:33:47 GMT+0900 (JST)';
              }
            }}
          ]
        }
      }, true, '  ')
    },
    expectedOutput: '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>RSS Example</title>\n    <description>Description</description>\n    <link>google.com</link>\n    <lastBuildDate>Sat Jul 30 2011 18:14:25 GMT+0900 (JST)</lastBuildDate>\n    <pubDate>Sat Jul 30 2011 18:14:25 GMT+0900 (JST)</pubDate>\n    <language>en</language>\n    <item>\n      <title>Item title</title>\n      <link>Item link</link>\n      <description>Item Description</description>\n      <pubDate>Sat Jul 30 2011 18:33:47 GMT+0900 (JST)</pubDate>\n    </item>\n    <item>\n      <title>Item2 title</title>\n      <link>Item2 link</link>\n      <description>Item2 Description</description>\n      <pubDate>Sat Jul 30 2011 18:33:47 GMT+0900 (JST)</pubDate>\n    </item>\n  </channel>\n</rss>\n'
  });
  
  runTests();
  showReport();
  
})();