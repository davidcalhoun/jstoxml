var jstoxml = function(obj, addHeader, indent){
  var out = addHeader ? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';
  var origIndent = indent || '';
  indent = '';
  
  var push = function(string){
    out += string + '\n';
  }
  
  var outputTag = function(tag){
    var attrsString = '';
    var outputString = '';
    var attrs = tag.attrs || '';
    
    for(var attr in attrs){
      if(attrs.hasOwnProperty(attr)) {
        attrsString += ' ' + attr + '="' + attrs[attr] + '"';
      }
    }
    
    outputString += (tag.indent || '') + '<' + (tag.closeTag ? '/' : '') + tag.name + (!tag.closeTag ? attrsString : '') + (tag.selfCloseTag ? '/' : '') + '>';
    
    if(tag.text){
      outputString += tag.text + '</' + tag.name + '>';
    }
    
    push(outputString);
  }
  
  var every = function(obj, fn, indent){
    if(Array.isArray(obj)){
      obj.every(function(elt){
        fn(elt, indent);
        return true;
      });
      
      return;
    }
    
    for(var key in obj){
      if(obj.hasOwnProperty(key) && obj[key]){
        fn({name: key, content: obj[key]}, indent);
      } else if(!obj[key]) {
        fn(key, indent);  //string
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
        if(!input.name){
          every(input, convert, indent);
          return;
        }
        
        var outputTagObj = {
          name: input.name,
          indent: indent,
          attrs: input.attrs
        }
      
        if(!input.content){
          outputTagObj.selfCloseTag = true;
          outputTag(outputTagObj);
          return;
        }
        
        var type = typeof input.content;
        
        var objContents = {
          'string': function(){
            outputTagObj.text = input.content;
            outputTag(outputTagObj);
          },
          
          'object': function(){
            outputTag(outputTagObj);
            
            every(input.content, convert, indent + origIndent);
            
            outputTagObj.closeTag = true;
            outputTag(outputTagObj);
          },
          
          'function': function(){
            outputTagObj.text = input.content();
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

exports.jstoxml = jstoxml;