var toXML = function(obj, config){
  // include XML header
  config = config || {};
  var out = '';
  if(config.header) {
    if(typeof config.header == 'string') {
      out = config.header;
    } else {
      out = '<?xml version="1.0" encoding="UTF-8"?>\n';
    }
  }
  
  var origIndent = config.indent || '';
  var indent = '';

  var filter = function customFilter(txt) {
    if(!config.filter) return txt;
    var mappings = config.filter;
    var replacements = [];
    for(var map in mappings) {
      if(!mappings.hasOwnProperty(map)) continue;
      replacements.push(map);
    }
    return String(txt).replace(new RegExp('(' + replacements.join('|') + ')', 'g'), function(str, entity) {
      return mappings[entity] || '';
    });
  };
  
  // helper function to push a new line to the output
  var push = function(string){
    out += string + (origIndent ? '\n' : '');
  };
  
  /* create a tag and add it to the output
     Example:
     outputTag({
       name: 'myTag',      // creates a tag <myTag>
       indent: '  ',       // indent string to prepend
       closeTag: true,     // starts and closes a tag on the same line
       selfCloseTag: true,
       attrs: {            // attributes
         foo: 'bar',       // results in <myTag foo="bar">
         foo2: 'bar2'
       }
     });
  */
  var outputTag = function(tag){
    var attrsString = '';
    var outputString = '';
    var attrs = tag.attrs || '';
    
    // turn the attributes object into a string with key="value" pairs
    for(var attr in attrs){
      if(attrs.hasOwnProperty(attr)) {
        attrsString += ' ' + attr + '="' + attrs[attr] + '"';
      }
    }

    // assemble the tag
    outputString += (tag.indent || '') + '<' + (tag.closeTag ? '/' : '') + tag.name + (!tag.closeTag ? attrsString : '') + (tag.selfCloseTag ? '/' : '') + '>';
    
    // if the tag only contains a text string, output it and close the tag
    if(tag.text || tag.text === ''){
      outputString += filter(tag.text) + '</' + tag.name + '>';
    }
    
    push(outputString);
  };
  
  // custom-tailored iterator for input arrays/objects (NOT a general purpose iterator)
  var every = function(obj, fn, indent){
    // array
    if(Array.isArray(obj)){
      obj.every(function(elt){  // for each element in the array
        fn(elt, indent);
        return true;            // continue to iterate
      });
      
      return;
    }
    
    // object with tag name
    if(obj._name){
      fn(obj, indent);
      return;
    }
    
    // iterable object
    for(var key in obj){
      var type = typeof obj[key];

      if(obj.hasOwnProperty(key) && (obj[key] || type === 'boolean' || type === 'number')){
        fn({_name: key, _content: obj[key]}, indent);
      //} else if(!obj[key]) {   // null value (foo:'')
      } else if(obj.hasOwnProperty(key) && obj[key] === null) {   // null value (foo:null)
        fn(key, indent);       // output the keyname as a string ('foo')
      } else if(obj.hasOwnProperty(key) && obj[key] === '') {
        // blank string
        outputTag({
          name: key,
          text: ''
        });
      }
    }
  };
  
  var convert = function convert(input, indent){
    var type = typeof input;
    
    if(!indent) indent = '';
    
    if(Array.isArray(input)) type = 'array';
    
    var path = {
      'string': function(){
        push(indent + filter(input));
      },

      'boolean': function(){
        push(indent + (input ? 'true' : 'false'));
      },
      
      'number': function(){
        push(indent + input);
      },
      
      'array': function(){
        every(input, convert, indent);
      },
      
      'function': function(){
        push(indent + input());
      },
      
      'object': function(){
        if(!input._name){
          every(input, convert, indent);
          return;
        }
        
        var outputTagObj = {
          name: input._name,
          indent: indent,
          attrs: input._attrs
        };
        
        var type = typeof input._content;

        if(type === 'undefined' || input._content._selfCloseTag === true){
          if (input._content && input._content._attrs) {
            outputTagObj.attrs = input._content._attrs;
          }
          outputTagObj.selfCloseTag = true;
          outputTag(outputTagObj);
          return;
        }
        
        var objContents = {
          'string': function(){
            outputTagObj.text = input._content;
            outputTag(outputTagObj);
          },

          'boolean': function(){
            outputTagObj.text = (input._content ? 'true' : 'false');
            outputTag(outputTagObj);
          },
          
          'number': function(){
            outputTagObj.text = input._content.toString();
            outputTag(outputTagObj);
          },
          
          'object': function(){  // or Array
            outputTag(outputTagObj);
            
            every(input._content, convert, indent + origIndent);
            
            outputTagObj.closeTag = true;
            outputTag(outputTagObj);
          },
          
          'function': function(){
            outputTagObj.text = input._content();  // () to execute the fn
            outputTag(outputTagObj);
          }
        };
        
        if(objContents[type]) objContents[type]();
      }
      
    };
    
    if(path[type]) path[type]();
  };
  
  convert(obj, indent);
  
  return out;
};

exports.toXML = toXML;
