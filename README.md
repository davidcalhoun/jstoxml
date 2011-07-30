{
  foo: 'bar',
  foo2: 'bar2'
}

<foo>bar</foo>
<foo2>bar2</foo2>




[
  {foo: 'bar'},
  {foo2: 'bar2'}
]

<foo>bar</foo>
<foo2>bar2</foo2>



[
  {name: 'foo', content: 'bar'},
  {name: 'foo2', content: 'bar2'}
];

<foo>bar</foo>
<foo2>bar2</foo2>




{
  'blah': '',
  foo: 'bar',
  'more blah': ''
}

blah
<foo>bar</foo>
more blah



{
  a: {
    foo: 'bar',
    foo2: 'bar2'
  }
}

<a>
  <foo>bar</foo>
  <foo2>bar2</foo2>
</a>


{
  date: function(){
    return new Date();
  }
}

<date>Sat Jul 30 2011 05:14:02 GMT+0900 (JST)</date>