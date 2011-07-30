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
    expectedOutput: 'foo\n'
  });
  
  addTest({
    name: 'function',
    input: function(){
      return jstoxml.toXML(function(){
        return 999;
      })
    },
    expectedOutput: '999\n'
  });
  
  addTest({
    name: 'array',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ])
    },
    expectedOutput: '<foo>bar</foo>\n<foo2>bar2</foo2>\n'
  });
  
  addTest({
    name: 'array-advanced',
    input: function(){
      return jstoxml.toXML([
        {foo: 'bar'},
        {foo2: 'bar2'}
      ])
    },
    expectedOutput: '<foo>bar</foo>\n<foo2>bar2</foo2>\n'
  });
  
  addTest({
    name: 'object',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      })
    },
    expectedOutput: '<foo>bar</foo>\n<foo2>bar2</foo2>\n'
  });
  
  addTest({
    name: 'object-xml-header',
    input: function(){
      return jstoxml.toXML({
        foo: 'bar',
        foo2: 'bar2'
      }, true)
    },
    expectedOutput: '<?xml version="1.0" encoding="UTF-8"?>\n<foo>bar</foo>\n<foo2>bar2</foo2>\n'
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
    expectedOutput: '<a foo="bar" foo2="bar2"/>\n'
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
    expectedOutput: '<a foo="bar" foo2="bar2">la dee da</a>\n'
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
    expectedOutput: 'blah\n<foo>bar</foo>\nmore blah\n'
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
    expectedOutput: '<a>\n<foo>bar</foo>\n<foo2>bar2</foo2>\n</a>\n'
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
    expectedOutput: '<a>\n<b>\n<c>\n<d>\n<e>\n<f>\n<g>\n<h>\n<i>\n<j>\n<k>\n<l>\n<m>\n<foo>bar</foo>\n</m>\n</l>\n</k>\n</j>\n</i>\n</h>\n</g>\n</f>\n</e>\n</d>\n</c>\n</b>\n</a>\n'
  });
  
  runTests();
  showReport();
  
})();