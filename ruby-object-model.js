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

    p(name, args, this.singleton_class.ancestors)

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
  this.singleton_class = Object;

  this.define_singleton_method('new', function(superclass, builder){
    var new_class = new RubyClass(builder);
//    new_class.class = Class;

    new_class.superclass = superclass;
    new_class.ancestors = new_class.ancestors.concat(superclass.ancestors);
    if (superclass != Object){
      new_class.singleton_class = Class.send('new', superclass.singleton_class, function(){});
    }else{
      new_class.singleton_class = Object;
    }




    p('define new')

    new_class.define_singleton_method('new', function(){
      singleton = this;
      return new RubyObject(function(){

        p('instance')
        p(new_class)


        // хз как туда new_class передать, он в рекурсию уходит
//        this.singleton_class = Class.send('new', new_class, function(){});

        p('end')
      });
    });

    return new_class;
  });
});





p('define TestClass')
var TestClass = Class.send('new', Object, function(){
  this.define_method('foo', function(){
    return 'foo';
  });
});



var test = TestClass.send('new');



//ХАК!!!
test.singleton_class = TestClass;

//p(test.ancestors)

p(test.send('foo'));


