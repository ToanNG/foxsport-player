(function(){
  if(window.console && console.log){
    var old = console.log;
    console.debug = function(){
      var args = ['%c'+arguments[0], 'color:#bada55; background-color:#222;'];
      old.apply(this, args);
    }

    console.highlight = function(){
      var args = ['%c'+arguments[0], 'color:black; background-color:yellow;'];
      old.apply(this, args);
    }
  }  
})();

Ember.Handlebars.registerBoundHelper('parseTime', function(value) {
  // var val = Ember.Handlebars.get(this, value);
  // console.log(value);
  var timeObj = moment.duration(value, 'milliseconds');
  return new Handlebars.SafeString(timeObj.format('HH:mm:ss'));
});