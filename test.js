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
  };
  
  var showReport = function(){
    console.log(results);
  };
  
  var passFail = function(test){
    var output;
    
    try {
      output = test.input();
      
      results.testsRun++;
      
      if(output !== test.expectedOutput){
        console.log('OUTPUT:\n' + output + '\n\nEXPECTED OUTPUT:\n' + test.expectedOutput);
        console.log(test.name + ' \033[1;31mFAILED\033[0m\n  ' + results.testsRun + '/' + tests.length);
        results.fail++;
      } else {
        console.log(test.name + ' passed.  ' + results.testsRun + '/' + tests.length);
        results.pass++;
      }
    } catch(e) {
      console.log(test.name + ' failed.  ' + results.testsRun + '/' + tests.length);
      console.log(e);
    }
  };
  
  var runTests = function(){
    for(var i=0, len=tests.length; i<len; i++){
      passFail(tests[i]);
    }
  };
  
  addTest({
    name: 'string',
    input: function(){
      return jstoxml.toXML('foo');
    },
    expectedOutput: 'foo'
  });

  addTest({
    name: 'boolean',
    input: function(){
      return jstoxml.toXML(true);
    },
    expectedOutput: 'true'
  });
  
  addTest({
    name: 'number',
    input: function(){
      return jstoxml.toXML(5);
    },
    expectedOutput: '5'
  });
  
  addTest({
    name: 'function',
    input: function(){
      return jstoxml.toXML(function(){
        return 999;
      });
    },
    expectedOutput: '999'
  });
  
  addTest({
    name: 'array',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ]);
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'array-advanced',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ]);
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'object',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      });
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'object-xml-header',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      }, {header: true});
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
      }, {header: false, indent: '  '});
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
      });
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
      });
    },
    expectedOutput: '<a foo="bar" foo2="bar2">la dee da</a>'
  });
  
  addTest({
    name: 'object-mixed',
    input: function(){
      return jstoxml.toXML({
        'blah': null,
        foo: 'bar',
        'more blah': null,
        bar: 0,
        'more more blah': null,
        baz: false
      });
    },
    expectedOutput: 'blah<foo>bar</foo>more blah<bar>0</bar>more more blah<baz>false</baz>'
  });
  
  addTest({
    name: 'object-nested',
    input: function(){
      return jstoxml.toXML({
        a: {
          foo: 'bar',
          foo2: 'bar2'
        }
      });
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
      });
    },
    expectedOutput: '<a><b><c><d><e><f><g><h><i><j><k><l><m><foo>bar</foo></m></l></k></j></i></h></g></f></e></d></c></b></a>'
  });

  addTest({
    name: 'entities',
    input: function(){
      return jstoxml.toXML({
        foo: '<a>',
        bar: '"b"',
        baz: '\'&whee\''
      },
      {
        filter: {
          '<': '&lt;', 
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&apos;',
          '&': '&amp;'
        }
      });
    },
    expectedOutput: '<foo>&lt;a&gt;</foo><bar>&quot;b&quot;</bar><baz>&apos;&amp;whee&apos;</baz>'
  });
  
  addTest({
    name: 'example1-simple-object',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      });
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'example2-simple-array',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ]);
    },
    expectedOutput: '<foo>bar</foo><foo2>bar2</foo2>'
  });
  
  addTest({
    name: 'example3-duplicate-tag-names',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo: 'bar2'}
      ]);
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
      });
    },
    expectedOutput: '<foo a="b" c="d">bar</foo>'
  });
  
  addTest({
    name: 'example5-tags-with-text-nodes',
    input: function(){
      return jstoxml.toXML({
        'text1': null,
        foo: 'bar',
        'text2': null
      });
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
      }, {header: false, indent: '  '});
    },
    expectedOutput: '<a>\n  <foo>bar</foo>\n  <foo2>bar2</foo2>\n</a>\n'
  });
  
  addTest({
    name: 'example7-nested-tags-with-attributes',
    input: function(){
      return jstoxml.toXML({
        ooo: {
          _name: 'foo',
          _attrs: {
            a: 'b'
          },
          _content: {
            _name: 'bar',
            _attrs: {
              c: 'd'
            }
          }
        }
      }, {header: false, indent: '  '});
    },
    expectedOutput: '<ooo>\n  <foo a="b">\n    <bar c="d"/>\n  </foo>\n</ooo>\n'
  });
  
  addTest({
    name: 'example7b',
    input: function(){
      var bar = {
        _name: 'bar',
        _attrs: {
          c: 'd'
        }
      };
      
      var foo = {
        _name: 'foo',
        _attrs: {
          a: 'b'
        },
        _content: bar
      };
      
      return jstoxml.toXML({
        ooo: foo
      }, {header: false, indent: '  '});
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
      });
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
      }, {header: true, indent: '  '});
    },
    expectedOutput: '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>RSS Example</title>\n    <description>Description</description>\n    <link>google.com</link>\n    <lastBuildDate>Sat Jul 30 2011 18:14:25 GMT+0900 (JST)</lastBuildDate>\n    <pubDate>Sat Jul 30 2011 18:14:25 GMT+0900 (JST)</pubDate>\n    <language>en</language>\n    <item>\n      <title>Item title</title>\n      <link>Item link</link>\n      <description>Item Description</description>\n      <pubDate>Sat Jul 30 2011 18:33:47 GMT+0900 (JST)</pubDate>\n    </item>\n    <item>\n      <title>Item2 title</title>\n      <link>Item2 link</link>\n      <description>Item2 Description</description>\n      <pubDate>Sat Jul 30 2011 18:33:47 GMT+0900 (JST)</pubDate>\n    </item>\n  </channel>\n</rss>\n'
  });
  
  addTest({
    name: 'example10-podcast',
    input: function(){
      return jstoxml.toXML({
        _name: 'rss',
        _attrs: {
          'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
          version: '2.0'
        },
        _content: {
          channel: [
            {title: 'Title'},
            {link: 'google.com'},
            {language: 'en-us'},
            {copyright: 'Copyright 2011'},
            {'itunes:subtitle': 'Subtitle'},
            {'itunes:author': 'Author'},
            {'itunes:summary': 'Summary'},
            {description: 'Description'},
            {'itunes:owner': {
              'itunes:name': 'Name',
              'itunes:email': 'Email'
            }},
            {
              _name: 'itunes:image',
              _attrs: {
                href: 'image.jpg'
              }
            },
            {
              _name: 'itunes:category',
              _attrs: {
                text: 'Technology'
              },
              _content: {
                _name: 'itunes:category',
                _attrs: {
                  text: 'Gadgets'
                } 
              }
            },
            {
              _name: 'itunes:category',
              _attrs: {
                text: 'TV &amp; Film'
              }
            },
            {
              item: [
                {title: 'Podcast Title'},
                {'itunes:author': 'Author'},
                {'itunes:subtitle': 'Subtitle'},
                {'itunes:summary': 'Summary'},
                {'itunes:image': 'image.jpg'},
                {
                  _name: 'enclosure',
                  _attrs: {
                    url: 'http://example.com/podcast.m4a',
                    length: '8727310',
                    type: 'audio/x-m4a'
                  }
                },
                {guid: 'http://example.com/archive/aae20050615.m4a'},
                {pubDate: 'Wed, 15 Jun 2011 19:00:00 GMT'},
                {'itunes:duration': '7:04'},
                {'itunes:keywords': 'salt, pepper, shaker, exciting'}
              ]
            },
            {
              item: [
                {title: 'Podcast2 Title'},
                {'itunes:author': 'Author2'},
                {'itunes:subtitle': 'Subtitle2'},
                {'itunes:summary': 'Summary2'},
                {'itunes:image': 'image2.jpg'},
                {
                  _name: 'enclosure',
                  _attrs: {
                    url: 'http://example.com/podcast2.m4a',
                    length: '655555',
                    type: 'audio/x-m4a'
                  }
                },
                {guid: 'http://example.com/archive/aae2.m4a'},
                {pubDate: 'Wed, 15 Jul 2011 19:00:00 GMT'},
                {'itunes:duration': '11:20'},
                {'itunes:keywords': 'foo, bar'}
              ]
            }
          ]
        }
      }, {header: true, indent: '  '});
    },
    expectedOutput: '<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">\n  <channel>\n    <title>Title</title>\n    <link>google.com</link>\n    <language>en-us</language>\n    <copyright>Copyright 2011</copyright>\n    <itunes:subtitle>Subtitle</itunes:subtitle>\n    <itunes:author>Author</itunes:author>\n    <itunes:summary>Summary</itunes:summary>\n    <description>Description</description>\n    <itunes:owner>\n      <itunes:name>Name</itunes:name>\n      <itunes:email>Email</itunes:email>\n    </itunes:owner>\n    <itunes:image href="image.jpg"/>\n    <itunes:category text="Technology">\n      <itunes:category text="Gadgets"/>\n    </itunes:category>\n    <itunes:category text="TV &amp; Film"/>\n    <item>\n      <title>Podcast Title</title>\n      <itunes:author>Author</itunes:author>\n      <itunes:subtitle>Subtitle</itunes:subtitle>\n      <itunes:summary>Summary</itunes:summary>\n      <itunes:image>image.jpg</itunes:image>\n      <enclosure url="http://example.com/podcast.m4a" length="8727310" type="audio/x-m4a"/>\n      <guid>http://example.com/archive/aae20050615.m4a</guid>\n      <pubDate>Wed, 15 Jun 2011 19:00:00 GMT</pubDate>\n      <itunes:duration>7:04</itunes:duration>\n      <itunes:keywords>salt, pepper, shaker, exciting</itunes:keywords>\n    </item>\n    <item>\n      <title>Podcast2 Title</title>\n      <itunes:author>Author2</itunes:author>\n      <itunes:subtitle>Subtitle2</itunes:subtitle>\n      <itunes:summary>Summary2</itunes:summary>\n      <itunes:image>image2.jpg</itunes:image>\n      <enclosure url="http://example.com/podcast2.m4a" length="655555" type="audio/x-m4a"/>\n      <guid>http://example.com/archive/aae2.m4a</guid>\n      <pubDate>Wed, 15 Jul 2011 19:00:00 GMT</pubDate>\n      <itunes:duration>11:20</itunes:duration>\n      <itunes:keywords>foo, bar</itunes:keywords>\n    </item>\n  </channel>\n</rss>\n'
  });

  addTest({
    name: 'bug3',
    input: function(){
      return jstoxml.toXML({
        foo: true,
        bar: '',
        foo2: false,
        ok: 'This is ok',
        ok2: 'false',
        ok3: 'true'
      });
    },
    expectedOutput: '<foo>true</foo><bar></bar><foo2>false</foo2><ok>This is ok</ok><ok2>false</ok2><ok3>true</ok3>'
  });

  addTest({
    name: 'bug4a',
    input: function(){
      return jstoxml.toXML({
        foo: 4,
        bar: '&'
      });
    },
    expectedOutput: '<foo>4</foo><bar>&</bar>'
  });

  addTest({
    name: 'bug4b',
    input: function(){
      return jstoxml.toXML({
        foo: '&'
      },
      {
        filter: {
          '&': '&amp;'
        }
      });
    },
    expectedOutput: '<foo>&amp;</foo>'
  });   

  addTest({
    name: 'headerNone',
    input: function(){
      return jstoxml.toXML({
        foo: 4
      },
      {
        header: false
      });
    },
    expectedOutput: '<foo>4</foo>'
  });

  addTest({
    name: 'headerDefault',
    input: function(){
      return jstoxml.toXML({
        foo: 4
      },
      {
        header: true
      });
    },
    expectedOutput: '<?xml version="1.0" encoding="UTF-8"?>\n<foo>4</foo>'
  });

  addTest({
    name: 'headerCustom',
    input: function(){
      return jstoxml.toXML({
        foo: 4
      },
      {
        header: '<Hooray For Captain Spaulding, the African Explorer>\n'
      });
    },
    expectedOutput: '<Hooray For Captain Spaulding, the African Explorer>\n<foo>4</foo>'
  });

  addTest({
    name: 'nested-elements-with-self-closing-sibling',
    input: function(){
      return jstoxml.toXML({
        people: {
          students: [
            {
              student: { name: 'Joe' }
            },
            {
              student: { name: 'Jane' }
            }
          ],
          teacher: {
            _selfCloseTag: true,
            _attrs: {
              'name': 'Yoda'
            }
          }
        }
      });
    },
    expectedOutput: [
      '<people>',
      '<students>',
      '<student><name>Joe</name></student>',
      '<student><name>Jane</name></student>',
      '</students>',
      '<teacher name="Yoda"/>',
      '</people>'
    ].join('')
  });
  
  runTests();
  showReport();

  // Exit with 1 to signal a failed build
  if(results.fail > 0) {
    process.exit(1);
  }
  
})();
