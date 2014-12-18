var App = require('app');

App.HomeController = Em.Controller.extend({
  actions: {
    openPlayer: function(){
      App.player = App.PlayerComponent.create();
      App.player.appendTo("#container");
    }
  }
});


App.HomeView = Em.View.extend({
	didInsertElement:function(){
    // this.get('controller').send('openPlayer');
	}
});