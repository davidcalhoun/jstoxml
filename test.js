var jstoxml = require('jstoxml');

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
      
      if(output !== test.expectedOutput){
        console.log(output + '\n !== \n' + test.expectedOutput);
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
    name: 'basic1',
    input: function(){
      jstoxml({
        foo: 'bar',
        foo2: 'bar2'
      })
    },
    expectedOutput: '<foo>bar</foo>\n<foo2>bar2</foo2>\n'
  });
  
  runTests();
  showReport();
  
})();