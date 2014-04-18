var _ = require('lodash');

function p(){
  console.log(arguments);
}

function RubyObject(builder){
  this.class = undefined;
  this.singleton_class = undefined;
  this.send = function(){
    var name = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    var klass_with_method = _.find(this.singleton_class.ancestors, function(klass){ return klass.methods[name] });
    return klass_with_method.methods[name].apply(this, args);
  };

  this.define_singleton_method = function(name, func){
    this.singleton_class.define_method(name, func);
  };

  builder.call(this);
}

function RubyClass(builder){
  this.ancestors = [this];
  this.methods = {};
  this.define_method = function(name, func){
    this.methods[name] = func;
  };

  builder.call(this);
}

RubyClass.prototype = new RubyObject(function(){

});


var Object = new RubyClass(function(){
});

//Адское допущение
Object.singleton_class = Object;

var Class = new RubyClass(function(){
//  this.class = Class;
//  this.singleton_class = Object;
  this.singleton_class = new RubyClass(function(){});

  this.define_singleton_method('new', function(superclass, builder){


    var new_class = new RubyClass(function(){});

//    new_class.class = Class;
    new_class.superclass = superclass;
    new_class.ancestors = new_class.ancestors.concat(superclass.ancestors);
    if (superclass != Object){
      new_class.singleton_class = Class.send('new', superclass.singleton_class, function(){});
    }else{
      new_class.singleton_class = Object;
    }

    new_class.define_singleton_method('new', function(){
      return new RubyObject(function(){
        this.singleton_class = Class.send('new', new_class, function(){
          this.define_singleton_method('new', function(){
            throw "Singleton haven't instances";
          });
        });
      });
    });

    builder.call(new_class);

    return new_class;
  });
});

Object.class = Class;
Class.class = Class;


var TestClass = Class.send('new', Object, function(){
  this.define_method('foo', function(){
    return 'foo';
  });

  this.define_singleton_method('bar', function(){
    return 'bar';
  })

});

var test = TestClass.send('new');

console.log(test.send('foo'));
console.log(TestClass.send('bar'));


