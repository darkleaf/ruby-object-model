```javascript
var TestClass = Class.send('new', Object, function(){
  this.define_method('foo', function(){
    return 'foo';
  });
});

var test = TestClass.send('new');

console.log(test.send('foo'));
//#=> foo
```