App.PlayerComponent = Ember.Component.extend({
  layoutName: 'player',

  program: null,
  programData: null,

  currentTime: 0,
  duration: 0,

  callPlay: false,
  isLoaded: false,
  isPlaying: false,
  isInteractingTimeline: false,

  controls: {
    scrubber: {
      thumb: null
    }
  },

  styleVisibility: function(){
    if (this.get('isPlaying'))
      return 'visibility: visible';
    else
      return 'visibility: hidden';
  }.property('isPlaying'),

  play: function(){
    this.set('callPlay', true);
    if (!this.get('isLoaded')) return;

    var program = this.get('program'),
        mpxId = program.guid,
        source = program.content[0].url;

    this.set('isPlaying', true);
    this.setSMIL('http://foxplayasialive-i.akamaihd.net/hls/live/214660/fsp_iOSlive4/index.m3u8');
    this.setProgramData(mpxId);
  },

  didInsertElement: function(){
    // this.initTimeline();

    $pdk.controller.addEventListener('OnPlayerLoaded', this.handlePlayerLoaded.bind(this));
    // $pdk.controller.addEventListener('OnMediaStart', this.handleMediaStart.bind(this));
    // $pdk.controller.addEventListener('OnMediaPlaying', this.handleMediaPlaying.bind(this));
    $pdk.controller.addEventListener('OnResetPlayer', this.handleResetPlayer.bind(this));
  },

  // initTimeline: function(){
  //   var $thumb = this.$('.thumb'),
  //       $timeline = this.$('.scrubber'),
  //       self = this;

  //   $thumb.on('mousedown', function(){
  //     self.isInteractingTimeline = true;
  //     self.width = $timeline.width();
  //   });

  //   $timeline.on('mousemove', function(e){
  //     offsetX = (e.pageX - $(this).offset().left) * 100 / self.width;
  //     offsetX = offsetX.toFixed(1);
  //     if (!self.isInteractingTimeline) return;
  //     if (offsetX < 0) offsetX = 0;
  //     if (offsetX > 100) offsetX = 100;
  //     $thumb.css('left', offsetX + '%');
  //   });

  //   $timeline.on('mouseup', function(){
  //     self.isInteractingTimeline = false;
  //   });

  //   $timeline.on('click', function(e){
  //     offsetX = (e.pageX - $(this).offset().left) * 100 / $(this).width();
  //     $thumb.css('left', offsetX + '%');
  //     console.log(self.get('duration'));
  //     console.log(self.get('duration') * offsetX / 100);
  //     self.send('jumpTo', self.get('duration') * offsetX / 100);
  //   });
  // },

  handlePlayerLoaded: function(){
    this.set('isLoaded', true);
    if (this.get('callPlay')) this.play();
  },

  handleMediaStart: function(){

  },

  // handleMediaPlaying: function(timeObj){
  //   var currentTime = timeObj.data.currentTime,
  //       duration = timeObj.data.duration,
  //       offsetX = (currentTime * 100 / duration).toFixed(1),
  //       $thumb = this.$('.thumb');

  //   this.set('currentTime', currentTime);
  //   this.set('duration', duration);

  //   if (!this.isInteractingTimeline) {
  //     $thumb.css('left', offsetX + '%');
  //   }
  // },

  handleResetPlayer: function(){
    this.set('isPlaying', false);
  },

  setSMIL: function(source){
    var smil = '<smil xmlns="http://www.w3.org/2005/SMIL21/Language"><body><ref src="' + source + '"/></body></smil>';
    $pdk.controller.setSmil(smil);
    // $pdk.controller.setReleaseURL('http://link.theplatform.com/s/ZwuVLC/b8a4yngPXArx?mbr=true&feed=SG_VOD', true);
  },

  setProgramData: function(mpxId){
    // get program markers by mpx_id from FoxSport server
    // http://fox-sport-staging.herokuapp.com/api/v1/programs/search.json?mpx_id=mpx_id_1
    Ember.$.get('/sample-program.json', function(programData){
      console.log(programData);
      this.set('programData', programData);
    }.bind(this));
  },

  jumpTo: function(milliseconds){
    $pdk.controller.seekToPosition(milliseconds);
  },

  actions: {
    closePlayer: function(){
      $pdk.controller.clearCurrentRelease();
    }
  }
});
