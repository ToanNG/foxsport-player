var App = require('app');

App.HomeController = Em.Controller.extend({
  actions: {
    openPlayer: function(){
      if (!App.player) {
        App.player = App.PlayerComponent.create();
        App.player.appendTo("#container");
      }

      // program fetched from mpx feed, has unique GUID
      var program = {
        guid: "mpx_id_1",
        title: "Federer v.s. Nadal",
        description: "",
        availableDate: 1418918400000,
        content: [
          {
            audioChannels: 0,
            audioSampleRate: 0,
            bitrate: 0,
            checksums: { },
            contentType: "video",
            duration: 0,
            expression: "full",
            fileSize: 0,
            frameRate: 0,
            format: "MPEG4",
            height: 0,
            isDefault: false,
            language: "",
            sourceTime: 0,
            url: "http://link.theplatform.com/s/ZwuVLC/b8a4yngPXArx?mbr=true&feed=SG_VOD",
            width: 0,
            displayAspectRatio: ""
          }
        ]
      };

      App.player.set('program', program);
      App.player.play();
    }
  }
});


App.HomeView = Em.View.extend({
	didInsertElement:function(){
    // this.get('controller').send('openPlayer');
	}
});