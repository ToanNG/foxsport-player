App.PlayerComponent = Ember.Component.extend({
  layoutName: 'player',

  eventData: null,
  currentTime: 0,
  duration: 0,
  interactionTimeline: false,
  soccerTimebar: [
    [ 0, 5,10,15,20,25,30,35,40,45],
    [45,50,55,60,65,70,75,80,85,90]
  ],

  setEventData: function(){
    var self = this;

    Ember.$.get('http://private-9c54-foxplay.apiary-mock.com/fox/media/1', function(data){
      data = data[0];
      data.time_bar = self.get('soccerTimebar');
      self.set('eventData', data);
      console.log(data);
    });
  },
  
  didInsertElement: function(){
    this.setEventData();
    this.initTimeline();

    $pdk.controller.addEventListener('OnPlayerLoaded', this.handlePlayerLoaded.bind(this));
    // $pdk.controller.addEventListener('OnMediaStart', this.handleMediaStart.bind(this));
    $pdk.controller.addEventListener('OnMediaPlaying', this.handleMediaPlaying.bind(this));
  },

  controls: {
    scrubber: {
      thumb: null
    }
  },

  initTimeline: function(){
    var $thumb = this.$('.thumb'),
        $timeline = this.$('.scrubber'),
        self = this;

    $thumb.on('mousedown', function(){
      self.interactionTimeline = true;
      self.width = $timeline.width();
    });

    $timeline.on('mousemove', function(e){
      offsetX = (e.pageX - $(this).offset().left) * 100 / self.width;
      offsetX = offsetX.toFixed(1);
      if (!self.interactionTimeline) return;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > 100) offsetX = 100;
      $thumb.css('left', offsetX + '%');
    });

    $timeline.on('mouseup', function(){
      self.interactionTimeline = false;
    });

    $timeline.on('click', function(e){
      offsetX = (e.pageX - $(this).offset().left) * 100 / $(this).width();
      $thumb.css('left', offsetX + '%');
      console.log(self.get('duration'));
      console.log(self.get('duration') * offsetX / 100);
      self.send('jumpTo', self.get('duration') * offsetX / 100);
    });
  },

  handlePlayerLoaded: function(){
    this.send('setSMIL', 'http://foxplayasialive-i.akamaihd.net/hls/live/214660/fsp_iOSlive4/index.m3u8');
    // this.send('setSMIL', 'http://foxplayasia-vh.akamaihd.net/i/vod/,FOX_SPORTS_Asia_Dev_CP/2014-10-25T16-00-39.767Z--6536.266__244101.mp4,.csmil/master.m3u8');
  },

  handleMediaStart: function(){

  },

  handleMediaPlaying: function(timeObj){
    var currentTime = timeObj.data.currentTime,
        duration = timeObj.data.duration,
        offsetX = (currentTime * 100 / duration).toFixed(1),
        $thumb = this.$('.thumb');

    this.set('currentTime', currentTime);
    this.set('duration', duration);

    if (!this.interactionTimeline) {
      $thumb.css('left', offsetX + '%');
    }
  },

  actions: {
    closePlayer: function(){
      $pdk.controller.clearCurrentRelease();
    },

    jumpTo: function(milliseconds){
      $pdk.controller.seekToPosition(milliseconds);
    },

    setSMIL: function(source){
      var smil = '<smil xmlns="http://www.w3.org/2005/SMIL21/Language"><body><ref src="' + source + '"/></body></smil>';
      $pdk.controller.setSmil(smil);
    }
  }
});
