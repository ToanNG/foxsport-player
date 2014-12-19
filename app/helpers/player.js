App.PlayerComponent = Ember.Component.extend({
  layoutName: 'player',

  program: null,
  programData: null,
  currentTime: 0,
  duration: 0,

  isLoaded: false,
  isPlaying: false,
  isInteractingTimeline: false,
  registeredFunctions: Ember.A(),

  controls: {
    thumb: null
  },

  styleVisibility: function(){
    return this.get('isPlaying') ? 'visibility:visible;' : 'visibility:hidden;';
  }.property('isPlaying'),

  /**
   * run:
   * If the player is loaded, run the specific method
   * If not, store the method name into registeredFunctions
   */
  run: function(fncName){
    if (!this.get('isLoaded'))
      this.registeredFunctions.pushObject(fncName);
    else
      this.get(fncName).bind(this)();
  },

  /**
   * Initialize the timeline first
   * Then bind handlers to the player's events
   */
  didInsertElement: function(){
    this.initTimeline();

    $pdk.controller.addEventListener('OnPlayerLoaded', this.handlePlayerLoaded.bind(this));
    $pdk.controller.addEventListener('OnMediaStart', this.handleMediaStart.bind(this));
    $pdk.controller.addEventListener('OnMediaPlaying', this.handleMediaPlaying.bind(this));
    $pdk.controller.addEventListener('OnResetPlayer', this.handleResetPlayer.bind(this));
  },

  /**
   * initTimeline:
   */
  initTimeline: function(){
    var $thumb = this.$('.thumb'),
        $scrubber = this.$('.scrubber'),
        self = this;

    this.set('controls.thumb', $thumb);

    $thumb.on('mousedown', function(){
      self.isInteractingTimeline = true;
    });

    $scrubber.on('mousemove', function(e){
      if (!self.isInteractingTimeline) return;
      offsetX = ((e.pageX - $(this).offset().left) * 100 / $(this).width()).toFixed(1);
      if (offsetX < 0) offsetX = 0;
      if (offsetX > 100) offsetX = 100;
      $thumb.css('left', offsetX + '%');
    });

    $scrubber.on('mouseup', function(){
      self.isInteractingTimeline = false;
    });

    $scrubber.on('click', function(e){
      offsetX = ((e.pageX - $(this).offset().left) * 100 / $(this).width()).toFixed(1);
      $thumb.css('left', offsetX + '%');
      self.jumpTo(self.get('duration') * offsetX / 100);
    });
  },

  /**
   * handlePlayerLoaded:
   * After loaded, if registeredFunctions is not empty, run the registered functions
   */
  handlePlayerLoaded: function(){
    this.set('isLoaded', true);

    var self = this;
    if (this.registeredFunctions.length)
      this.registeredFunctions.forEach(function(fncName){
        self.get(fncName).bind(self)();
      });
  },

  /**
   * handleMediaStart:
   */
  handleMediaStart: function(){

  },

  /**
   * handleMediaPlaying:
   */
  handleMediaPlaying: function(timeObj){
    var currentTime = timeObj.data.currentTime,
        duration = timeObj.data.duration;

    this.set('currentTime', currentTime);
    this.set('duration', duration);

    if (!this.isInteractingTimeline) {
      var $thumb = this.get('controls.thumb');
          offsetX = (currentTime * 100 / duration).toFixed(1);

      $thumb.css('left', offsetX + '%');
    }
  },

  /**
   * handleResetPlayer:
   * Only hide the player after clearing current release
   */
  handleResetPlayer: function(){
    this.set('isPlaying', false);
  },

  /**
   * play:
   * Set isPlaying to true to show the player
   * Get the program source and set to the player
   * Get the program GUID and use it to get program data
   */
  play: function(){
    var program = this.get('program'),
        source = program.content[0].url,
        mpxId = program.guid;

    this.set('isPlaying', true);
    this.setSMIL('http://foxplayasialive-i.akamaihd.net/hls/live/214660/fsp_iOSlive4/index.m3u8');
    this.setProgramData(mpxId);
  },

  /**
   * setSMIL:
   * Wrap the program source and call the PDK's setSmil
   */
  setSMIL: function(source){
    var smil = '<smil xmlns="http://www.w3.org/2005/SMIL21/Language"><body><ref src="' + source + '"/></body></smil>';
    $pdk.controller.setSmil(smil);
  },

  /**
   * setProgramData:
   * Get program data from FoxSport server by mpx_id
   * Ex: http://fox-sport-staging.herokuapp.com/api/v1/programs/search.json?mpx_id=mpx_id_1
   */
  setProgramData: function(mpxId){
    Ember.$.get('/sample-program.json', function(programData){
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
