Ember.Handlebars.registerBoundHelper('parseTime', function(value) {
  // var val = Ember.Handlebars.get(this, value);
  // console.log(value);
  var timeObj = moment.duration(value, 'milliseconds');
  return new Handlebars.SafeString(timeObj.format('HH:mm:ss'));
});