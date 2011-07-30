var toXML = function(obj, addHeader, indent){
  // include XML header
  var out = addHeader ? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';
  
  var origIndent = indent || '';
  indent = '';
  
  // helper function to push a new line to the output
  var push = function(string){
    out += string + '\n';
  }
  
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
    if(tag.text){
      outputString += tag.text + '</' + tag.name + '>';
    }
    
    push(outputString);
  }
  
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
    
    // object
    for(var key in obj){
      if(obj.hasOwnProperty(key) && obj[key]){
        // 
        fn({_name: key, _content: obj[key]}, indent);
      } else if(!obj[key]) {   // null value (foo:'')
        fn(key, indent);       // output the keyname as a string ('foo')
      }
    }
  }
  
  var convert = function convert(input, indent){
    var type = typeof input;
    
    if(!indent) indent = '';
    
    if(Array.isArray(input)) type = 'array';
    
    var path = {
      'string': function(){
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
        }
      
        if(!input._content){
          outputTagObj.selfCloseTag = true;
          outputTag(outputTagObj);
          return;
        }
        
        var type = typeof input._content;
        
        var objContents = {
          'string': function(){
            outputTagObj.text = input._content;
            outputTag(outputTagObj);
          },
          
          'object': function(){
            outputTag(outputTagObj);
            
            every(input._content, convert, indent + origIndent);
            
            outputTagObj.closeTag = true;
            outputTag(outputTagObj);
          },
          
          'function': function(){
            outputTagObj.text = input._content();
            outputTag(outputTagObj);
          }
        }
        
        objContents[type] && objContents[type]();
      },
      
    }
    
    path[type] && path[type]();
  }
  
  convert(obj, indent);
  
  return out;
};

exports.toXML = toXML;