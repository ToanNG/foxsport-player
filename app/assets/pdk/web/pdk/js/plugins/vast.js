//this can probably be static
VastParser = Class.extend({
    init:function()
    {
        tpDebug("VastPlugin instantiated.", "", "VAST");
    },
    parse:function(xml)
    {
        var vastXml;
        if (xml instanceof window.Document)
        {
            tpRemoveWhiteSpace(xml);
            vastXml = xml;
        }
        else if (xml['xml'] !== undefined)
        {
            vastXml = tpParseXml(xml.xml);
        }
        else
        {
            vastXml = tpParseXml(xml);
        }
        //vast = vast.replace(/[\n\r]/g, "");
        // tpDebug(vastXml);
        //this would be the first ad node(s)
        return this.parseVast(vastXml.childNodes[0].childNodes);
    },
    parseVast:function(nodes)
    {
        var result = new Object();
        result.ads = new Array();

        for (var i = 0; i < nodes.length; i++)
        {
            if (nodes[i] instanceof Element)
            {
                result.ads.push(this.parseAd(nodes[i]));
            }
        }
        return result;
    },
    parseUrls:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var results = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                results.push(this.parseUrl(xml.childNodes[i]));
            }
            return results;
        }
        return null;
    },
    parseUrl:function(xml)
    {
        var result = new Object();
        result.url = this.parseSimpleUrl(xml);
        if (xml.attributes && xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        else
        {
            result.id = null;
        }
        return result;
    },
    parseSimpleUrl:function(xml)
    {
        if (xml && xml.nodeValue != null)
        {
            return xml.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, "$2");
        }
        else if (xml && xml.childNodes[0])
        {
            return xml.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, "$2");;
        }
        else
        {
            return null;
        }
    },
    parseAd:function(xml)
    {
        var subXml = xml.childNodes[0];
        if (!(subXml instanceof Element))
        {
            return null;
        }
        if (subXml.tagName == "InLine")
        {
            var result = this.parseInLine(subXml);

            if (xml.attributes['sequence'])
            {
                result.sequence = parseInt(xml.attributes['sequence'].nodeValue);
            }

            if (!result)
                return null;
            result.adType = "InLine";
            return result;
        }
        else if (subXml.tagName == "Wrapper")
        {
            var result = new Object();
            result.id = xml.attributes.getNamedItem("id").nodeValue;

            var adSystem = subXml.getElementsByTagName("AdSystem")[0];
            //some bogus-ish xml won't have this
            if (adSystem!==undefined)
                result.adSystem = adSystem.childNodes.nodeValue;
            result.error = this.parseSimpleUrl(subXml.getElementsByTagName("Error")[0]);
            result.extensions = subXml.getElementsByTagName("Extensions")[0];
            try {
                result.impressions = this.parseImpressions(subXml.getElementsByTagName("Impression"));
            }
            catch(e)
            {
                console.error(e);
            }
            //TODO: this stuff
            result.trackingEvents = this.parseTrackingEvents(subXml.getElementsByTagName("TrackingEvents")[0]);
            result.adType = "Wrapper";
            return this.parseWrapper(subXml, result);
        }
        else
        {
            throw new Error("Unrecognized ad type: \"" + subXml.tagName + "\"");
        }
        return null;
    },

    parseImpressions: function(xmllist)
    {

        if (!xmllist)
            return null;

        var ret = [];

        var len = xmllist.length;

        var i=0;

        for (;i<len;i++)
        {
           ret = ret.concat(this.parseUrls(xmllist[i]));
        }

        return ret;


    },

    parseTrackingEvents:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseTrackingEvent(xml.childNodes[i]));
            }
            return result;
        }
        return null;
    },
    parseTrackingEvent:function(xml)
    {
        var result = new Object();
        if (xml.attributes["event"])
        {
            result.event = xml.attributes["event"].nodeValue;
        }
        result.urls = this.parseUrls(xml);
        return result;
    },
    parseWrapper:function(xml, ad)
    {
        var result = ad ? ad : new Object();
        result.vastAdTagURL = this.parseSimpleUrl(xml.getElementsByTagName("VASTAdTagURI")[0]);
        result.videoClicks = this.parseVideoClicks(xml.getElementsByTagName("VideoClicks")[0]);
        return result;
    },
    parseInLine:function(xml)
    {
        var ad = new Object();
        if (xml.attributes["id"])
        {
            ad.id = xml.attributes["id"].nodeValue;
        }
        ad.adSystem = xml.getElementsByTagName("AdSystem")[0].childNodes[0].nodeValue;
        ad.error = this.parseSimpleUrl(xml.getElementsByTagName("Error")[0]);
        ad.extensions = xml.getElementsByTagName("Extensions")[0];
        try
        {
            ad.impressions = this.parseImpressions(xml.getElementsByTagName("Impression"));
        }
        catch(e)
        {
            console.error(e);
        }
        var result = this.parseCreatives(xml, ad);
        return result;
    },
    parseCreatives:function(xml, ad)
    {
        var result = ad;//we just dynamicall add extra props to it
        if (xml.getElementsByTagName("AdTitle")[0] && xml.getElementsByTagName("AdTitle")[0].childNodes[0])
        {
            result.adTitle = xml.getElementsByTagName("AdTitle")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("Description")[0] && xml.getElementsByTagName("Description")[0].childNodes[0])
        {
            result.description = xml.getElementsByTagName("Description")[0].childNodes[0].nodeValue;
        }
        var creativesXML = xml.getElementsByTagName("Creatives")[0];
        if (!creativesXML)
            return null;

        for (var i = 0; i < creativesXML.childNodes.length; i++)
        {
            var creativeXML = creativesXML.childNodes[i];
            if (creativeXML.getElementsByTagName("CompanionAds").length > 0)
            {
                var companionAdsXML = creativeXML.getElementsByTagName("CompanionAds")[0];
                if (companionAdsXML != null)
                {
                    result.companionAds = this.parseCompanionAds(companionAdsXML);
                }
            }
            if (creativeXML.getElementsByTagName("Linear")[0] != null)
            {
                var linearXML = creativeXML.getElementsByTagName("Linear")[0];
                if (linearXML != null)
                {
                    result.video = this.parseVideo(linearXML);
                }
            }
            if (creativeXML.getElementsByTagName("NonLinearAds").length > 0)
            {
                var nonLinearAdsXML = creativeXML.getElementsByTagName("NonLinearAds")[0];
                if (nonLinearAdsXML != null)
                {
                    result.nonLinearAds = this.parseNonLinearAds(nonLinearAdsXML);
                }
            }
        }

        if (!result.video) result.video = {};

        return result;
    },
    parseCompanionAds:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseCompanion(xml.childNodes[i]));
            }
            return result;
        }
        return null;
    },
    parseCompanion:function(xml)
    {
        var result = new Object();
        if (xml.getElementsByTagName("AltText")[0] && xml.getElementsByTagName("AltText")[0].childNodes[0])
        {
            result.altText = xml.getElementsByTagName("AltText")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("adParameters")[0])
        {
            result.adParameters = this.parseAdParameters(xml.getElementsByTagName("AdParameters")[0]);
        }
        if (xml.getElementsByTagName("Code")[0] && xml.getElementsByTagName("Code")[0].childNodes[0])
        {
            result.code = xml.getElementsByTagName("Code")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("CompanionClickThrough")[0])
        {
            result.companionClickThrough = this.parseSimpleUrl(xml.getElementsByTagName("CompanionClickThrough")[0]);
        }
        if (xml.attributes["creativeType"])
        {
            result.creativeType = xml.attributes["creativeType"].nodeValue;
        }
        if (xml.attributes["expandedHeight"] != null)
        {
            result.expandedHeight = xml.attributes["expandedHeight"].nodeValue;
        }
        if (xml.attributes["expandedWidth"] != null)
        {
            result.expandedWidth = xml.attributes["expandedWidth"].nodeValue;
        }
        if (xml.attributes["height"] != null)
        {
            result.height = xml.attributes["height"].nodeValue;
        }
        if (xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        if (xml.attributes["resourceType"])
        {
            result.resourceType = xml.attributes["resourceType"].nodeValue;
        }
        if (xml.getElementsByTagName("StaticResource")[0])
        {
            result.staticResource = this.parseSimpleUrl(xml.getElementsByTagName("StaticResource")[0]);
        }
        if (xml.getElementsByTagName("IFrameResource")[0])
        {
            result.iFrameResource = this.parseSimpleUrl(xml.getElementsByTagName("IFrameResource")[0]);
        }
        if (xml.getElementsByTagName("HTMLResource")[0])
        {
            result.HTMLResource = xml.getElementsByTagName("HTMLResource")[0];
        }
        if (xml.attributes["width"] != null)
        {
            result.width = xml.attributes["width"].nodeValue;
        }
        return result;
    },
    parseVideo:function(xml)
    {
        var result = new Object();
        if (xml.getElementsByTagName("Duration")[0])
        {
            result.duration = tpTimeToMillis(xml.getElementsByTagName("Duration")[0].childNodes[0].nodeValue);
        }
        if (xml.getElementsByTagName("AdID")[0])
        {
            result.adId = xml.getElementsByTagName("AdID")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("AdID")[0])
        {
            result.adParameters = this.parseAdParameters(xml.getElementsByTagName("AdParameters")[0]);
        }
        if (xml.getElementsByTagName("VideoClicks")[0])
        {
            result.videoClicks = this.parseVideoClicks(xml.getElementsByTagName("VideoClicks")[0]);
        }
        if (xml.getElementsByTagName("MediaFiles")[0])
        {
            result.mediaFiles = this.parseMediaFiles(xml.getElementsByTagName("MediaFiles")[0]);
        }
        //need to get tracking events
        if (xml.getElementsByTagName("TrackingEvents")[0])
        {
            result.trackingEvents = this.parseTrackingEvents(xml.getElementsByTagName("TrackingEvents")[0]);
        }
        return result;
    },
    parseAdParameters:function(xml)
    {
        if (xml != null)
        {
            var result = new Object();
            result.apiFramework = xml.attributes["apiFramework"];
            result.parameters = xml.childNodes;
            return result;
        }
        return null;
    },
    parseVideoClicks:function(xml)
    {
        if (xml != null)
        {
            var result = new Object();
            result.clickThrough = this.parseUrls(xml.getElementsByTagName("ClickThrough")[0]);
            result.clickTracking = this.parseUrls(xml.getElementsByTagName("ClickTracking")[0]);
            result.customClick = this.parseUrls(xml.getElementsByTagName("CustomClick")[0]);
            return result;
        }
        return null;
    },
    parseMediaFiles:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseMediaFile(xml.childNodes[i]));
            }
            return result;
        }
        return null;
    },
    parseMediaFile:function(xml)
    {
        var result = new Object();
        if (xml.attributes["bitrate"] != null)
        {
            result.bitrate = xml.attributes["bitrate"].nodeValue * 1000;
        }
        result.delivery = xml.attributes["delivery"].nodeValue;
        if (xml.attributes["height"] != null)
        {
            result.height = xml.attributes["height"].nodeValue;
        }
        if (xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        if (xml.attributes["type"])
        {
            result.type = xml.attributes["type"].nodeValue;
        }
        result.url = this.parseSimpleUrl(xml);
        if (xml.attributes["width"] != null)
        {
            result.width = xml.attributes["width"].nodeValue;
        }
        return result;
    },
    parseNonLinearAds:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var trackingEvents;
            if (xml.getElementsByTagName("TrackingEvents")!=null)
                trackingEvents = this.parseTrackingEvents(xml.getElementsByTagName("TrackingEvents")[0]);

            var result = new Array();
            var nonLinearXml = xml.getElementsByTagName("NonLinear");
            for (var i = 0; i < nonLinearXml.length; i++)
            {
                result.push(this.parseNonLinear(nonLinearXml[i],trackingEvents));
                //only the first nonLinear gets the events
                trackingEvents = null;
            }
            return result;
        }
        return null;
    },
    parseNonLinear:function(xml, trackingEvents)
    {
        var result = new Object();
        if (xml.attributes["apiFramework"])
        {
            result.apiFramework = xml.attributes["apiFramework"].nodeValue;
        }
        //this was removed for vast 2.0
//        if (xml.getElementsByTagName("Code")[0])
//            result.code = xml.getElementsByTagName("Code")[0].childNodes[0].nodeValue;
//        if (xml.attributes["creativeType"])
//        result.creativeType = xml.attributes["creativeType"].nodeValue
        if (xml.attributes["expandedHeight"] != null)
        {
            result.expandedHeight = xml.attributes["expandedHeight"].nodeValue;
        }
        if (xml.attributes["expandedWidth"] != null)
        {
            result.expandedWidth = xml.attributes["expandedWidth"].nodeValue;
        }
        if (xml.attributes["height"] != null)
        {
            result.height = xml.attributes["height"].nodeValue;
        }
        if (xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        if (xml.attributes["maintainAspectRatio"] != null)
        {
            result.maintainAspectRatio = xml.attributes["maintainAspectRatio"].nodeValue;
        }
        result.nonLinearClickThrough = this.parseSimpleUrl(xml.getElementsByTagName("NonLinearClickThrough")[0]);
        result.adParameters = this.parseAdParameters(xml.getElementsByTagName("AdParameters")[0]);
        if (xml.attributes["resourceType"] != null)
        {
            result.resourceType = xml.attributes["resourceType"].nodeValue;
        }
        if (xml.attributes["scalable"] != null)
        {
            result.scalable = xml.attributes["scalable"].nodeValue;
        }
        if (xml.getElementsByTagName("StaticResource")[0])
        {
            result.staticResource = this.parseSimpleUrl(xml.getElementsByTagName("StaticResource")[0]);
        }
        if (xml.getElementsByTagName("IFrameResource")[0])
        {
            result.iFrameResource = this.parseSimpleUrl(xml.getElementsByTagName("IFrameResource")[0]);
        }
        if (xml.getElementsByTagName("HTMLResource")[0])
        {
            result.HTMLResource = xml.getElementsByTagName("HTMLResource")[0];
        }
        //was removed for vast 2.0
        //result.url = this.parseSimpleUrl(xml.getElementsByTagName("URL")[0]);
        if (xml.attributes["width"] != null)
        {
            result.width = xml.attributes["width"].nodeValue;
        }

        if (trackingEvents)
        {
            result.trackingEvents = trackingEvents;
        }

        return result;
    }
});
tpVastParser = new VastParser();
VastPlugIn = Class.extend({

    TRIGGER_TYPE_PERCENTAGE:   0,
    TRIGGER_TYPE_MILLISECONDS: 1,
    TRIGGER_TYPE_EVENT:        2,
    EVENT_MUTE:                0,
    EVENT_PAUSE:               1,
    EVENT_REPLAY:              2,
    EVENT_FULL_SCREEN:         3,
    EVENT_STOP:                4,
    EVENT_START:               5,
    EVENT_UNPAUSE:             6,
    EVENT_CLOSE:               7,
    EVENT_UNMUTE:              8,
    EVENT_ACCEPTINVITATION:    9,

    // 2013-05-16 - video ad skip handling
    nextPercentage: null,
    // support for VAST 3.0 pods
    _enablePods: false,

    init:function()
    {
        this.container = document.createElement("div");
        this.container.style.display = "";
        this.container.style.width = "100%";
        this.createPlayer();
    },
    createPlayer:function()
    {
        this.video = document.createElement("video");
        this.container.style.display = "";
        var me = this;
        this.overlayLayer = document.createElement("div");
        this.overlayLayer.id = "overlaylayer";
        this.overlayLayer.style.height = "100%";
        this.overlayLayer.style.width = "100%";
        this.overlayLayer.style['position'] = "relative";
        this.overlayLayer.style.display = "";
        //this.overlayLayer.style.backgroundColor = "red";
        this.container.appendChild(this.overlayLayer);
        // this.background = document.createElement("div");
        // this.background.id = "adbackground";
        // this.background.style.width = "100%";
        // this.background.style.height = "100%";
        // this.background.style.position = "absolute";
        // this.background.style.backgroundColor = "black";
        // this.background.style.display = "";
        var me = this;
        // this.container.appendChild(this.background);
    },
    // TODO: port to trackingUrls
    videoClicked:function()
    {
        if (this.videoClicks)
        {
            //should open the href and sendUrl the tracking
            this.processClickThroughs(this.videoClicks.clickThrough);
            this.processClickTracking(this.videoClicks.clickTracking);
        }
    },
    processClickTracking:function(clicktracking)
    {
        //this is potentially spammy but maybe we have spammy customers
        for (var i = 0; i < clicktracking.length; i++)
        {
            this.sendTrackingUrl(clicktracking[i].url);
        }
    },
    processClickThroughs:function(clickthroughs)
    {
        //this is potentially spammy but maybe we have spammy customers
        for (var i = 0; i < clickthroughs.length; i++)
        {
            window.open(clickthroughs[i].url, "_blank");
        }
    },
    handleOnMediaPlaying:function(e)
    {
        if (this.currentClip && this.currentClip.baseClip.isAd)
        {
            this.handleAdPlaying(e);
            return;
        }
    },
    handleMute:function(e)
    {
        if (this.currentClip&&this.currentClip.baseClip.isAd)
        {

            var urls = this.currentClip.baseClip.trackingURLs;
            var eventName = (e.data ? this.EVENT_MUTE : this.EVENT_UNMUTE);

            //should send pause tracking event
            for (var i = 0; urls && i < urls.length; i++)
            {
                //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
                var currenturl = urls[i];

                if (currenturl && currenturl.triggerType == this.TRIGGER_TYPE_EVENT && currenturl.triggerValue === eventName)
                {
                    this.sendTrackingUrl(currenturl.URL);
                }
            }
        }
    },
    handleFullScreen:function(e)
    {
        var fullscreen = e.data;
        if (fullscreen && this.currentClip && this.currentClip.baseClip.isAd)
        {
            var urls = this.currentClip.baseClip.trackingURLs;

            //should send pause tracking event
            for (var i = 0; urls && i < urls.length; i++)
            {
                //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
                var currenturl = urls[i];

                if (currenturl && currenturl.triggerType == this.TRIGGER_TYPE_EVENT && currenturl.triggerValue===this.EVENT_FULL_SCREEN)
                    this.sendTrackingUrl(currenturl.URL);

            }
        }

    },
    handlePause:function(e)
    {
        var clip = e.data.clip;
        if (clip && clip.baseClip.isAd)
        {
            var urls = this.currentClip.baseClip.trackingURLs;

            //should send pause tracking event
            for (var i = 0; urls && i < urls.length; i++)
            {
                //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
                var currenturl = urls[i];

                if (currenturl && currenturl.triggerType == this.TRIGGER_TYPE_EVENT && currenturl.triggerValue === this.EVENT_PAUSE)
                    this.sendTrackingUrl(currenturl.URL);

            }
        }

    },
    handleUnPause:function(e)
    {
        var clip = e.data.clip;
        if (clip && clip.baseClip.isAd)
        {
            var urls = this.currentClip.baseClip.trackingURLs;

            //should send pause tracking event
            for (var i = 0; urls && i < urls.length; i++)
            {
                //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
                var currenturl = urls[i];

                if (currenturl && currenturl.triggerType == this.TRIGGER_TYPE_EVENT && currenturl.triggerValue===this.EVENT_UNPAUSE)
                    this.sendTrackingUrl(currenturl.URL);

            }
        }

    },
    handleAdPlaying:function(e)
    {
        //also need to manage tracking events
        var percentComplete = e.data.currentTime / e.data.duration * 100;
        var urls = this.currentClip.baseClip.trackingURLs;

        // 2013-05-16 - video ad skip handling
        if (!this.nextPercentage || percentComplete >= this.nextPercentage) {

            //TODO: we should probably sort the array by timevalue first, it would be good to use a timer to prevent this loop from occuring so much
            //but in flash it happens onmediaplaying so we'll do the same here
            for (var i = 0; urls && i < urls.length; i++) {
                //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
                var currenturl = urls[i];

                if (currenturl && currenturl.URL && !currenturl.hasFired && currenturl.triggerType == this.TRIGGER_TYPE_PERCENTAGE)
                {
                    if ( (currenturl.triggerValue < percentComplete) && (!this.nextPercentage || currenturl.triggerValue == this.nextPercentage))
                    {
                        this.sendTrackingUrl(currenturl.URL);
                        currenturl.hasFired = true;
                    }
                }
            }

            // Determine what is the next percentage event
            this.nextPercentage = null;
            for (var i = 0; urls && i < urls.length; i++) {
                var currenturl = urls[i];
                if (currenturl && currenturl.triggerType == this.TRIGGER_TYPE_PERCENTAGE) {
                    if (!currenturl.hasFired) {
                        if (!this.nextPercentage) {
                            this.nextPercentage = currenturl.triggerValue;
                        } else {
                            // As this.trackingURLs is not sorted, we set the next percentage
                            // if it is smaller than the previously scanned one.
                            if (currenturl.triggerValue < this.nextPercentage) {
                                this.nextPercentage = currenturl.triggerValue;
                            }
                        }
                    }
                }
            }
        }
    },
    onEnded:function(e)
    {
        var urls = this.currentClip.baseClip.trackingURLs;
        if (!urls)
        {
            return;
        }
        //TODO: we should probably sort the array by timevalue first, it would be good to use a timer to prevent this loop from occuring so much
        //apparently this isn't actually needed, since the timer will fire when we pass the end
        for (var i = 0; urls && i < urls.length; i++)
        {
            //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
            var currenturl = urls[i];
            if (currenturl && !currenturl.hasFired && currenturl.triggerType == this.TRIGGER_TYPE_PERCENTAGE && currenturl.triggerValue == 100 && (!this.nextPercentage || currenturl.triggerValue == this.nextPercentage))
            {
                this.sendTrackingUrl(currenturl.URL);
                currenturl.hasFired = true;
//                  urls.splice(i,1);
//                  i--;
            }
        }
        // this.player.src="";
//        this.player.load();
        this.done();
    },
    onCanPlayThrough:function(e)
    {
        //check if video has been buffered
        tpDebug("got canplaythrough", this.controller.id, "VAST");
        this.sendImpressions();
    },
    showPlayer:function()
    {
        // this.container.style.display="";
//        this.background.style.display = "none";
        this.player.style.display = "";
        this.playerVisible = true;
    },
    hidePlayer:function()
    {
        //this.container.style.display="none";
//        this.player.style.display = "none";
//        this.background.style.display = "";
//        this.playerVisible=false;
    },
    clearTimeOut: function()
    {
        clearTimeout(this.timeoutInterval);
    },
    initialize: function(loadObj)
    {
        var me = this;
        this.controller = loadObj.controller;
        this.controller.registerAdPlugIn(this);
        this.priority = loadObj.priority;
        var hosts = loadObj.vars["hosts"]; // could be array or string
        if (hosts && hosts.length)
        {
            this.hosts = hosts.split(",");
        }
        else
        {
            tpDebug("No hosts parameter, using mime-type for ad recognition", this.controller.id, "VAST", tpConsts.INFO);
            //return;
        }
        var mimeType = loadObj.vars["mimeType"];
        if (mimeType)
        {
            this.mimeTypes.push(mimeType)
        }
        else
        {
            mimeType = loadObj.vars["mimeTypes"];
            if (mimeType)
            {
                this.mimeTypes = mimeType.split(",");
            }
        }
        var callback = loadObj.vars["callback"];
        if (callback)
        {
            this.callback = callback;
        }
        else
        {
            this.callback = "vastJSONHandler"
        }
        window[this.callback] = function(json)
        {
            me.JSONHandler(json);
        };


        var enablePods = loadObj.vars["enablePods"];
        if (enablePods && enablePods.toLowerCase() === "true")
        {
            this._enablePods = true;
        }

        var allowClicks = loadObj.vars["allowClicks"];
        if (allowClicks && allowClicks.toLowerCase() === "false")
        {
            this.allowClicks = false;
        }
        else
        {
            this.allowClicks = true;
        }

        this.controller.addEventListener("OnShowFullScreen", function(e)
        {
            me.handleFullScreen(e);
        });
        this.controller.addEventListener("OnMediaLoadStart", function(e)
        {
            me.currentClip = e.data;
            me.nextPercentage = null;
        });
        this.controller.addEventListener("OnMute", function(e)
        {
            me.handleMute(e);
        });
        this.controller.addEventListener("OnMediaPause", function(e)
        {
            me.handlePause(e);
        });
        this.controller.addEventListener("OnMediaUnpause", function(e)
        {
            me.handleUnPause(e);
        });
        this.controller.addEventListener("OnMediaEnd", function(e)
        {
            me.onEnded(e);
            me.currentClip = null;
        });
        this.controller.addEventListener("OnMediaStart", function(e)
        {
            me.onMediaStart.apply(me, [e]);
            // me.onCanPlayThrough.apply(me,[e]);
        });
        this.controller.addEventListener("OnMediaEnd", function(e)
        {
            me.onMediaEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnReleaseStart", function(e)
        {
            me.onReleaseStart.apply(me, [e]);
        });
        this.controller.addEventListener("OnReleaseEnd", function(e)
        {
            me.onReleaseEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnSetRelease", function(e)
        {
            me.onReleaseEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnSetReleaseUrl", function(e)
        {
            me.onReleaseEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnLoadReleaseUrl", function(e)
        {
            me.onReleaseEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnSetRelease", function(e) {
            me.onReleaseEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnSetReleaseUrl", function(e) {
            me.onReleaseEnd.apply(me, [e]);
        });
        this.controller.addEventListener("OnLoadReleaseUrl", function(e) {
            me.onReleaseEnd.apply(me, [e]);
        });


        this.controller.addEventListener("OnMediaPlaying", function(e)
        {
            me.handleOnMediaPlaying.apply(me, [e]);
        });
        tpDebug("*** VAST plugin LOADED! ***");
    },
    destroy:function()
    {
        //should kill global listeners and local ones
    },

    onMediaStart:function(e)
    {
        var clip = e.data.baseClip;
        var lastbc = this.lastAdBaseClip;
        if (!clip.isAd&&this.currentOverlays)
        {
            for (var i = 0; i < this.currentOverlays.length; i++)
            {
                var overlay = this.currentOverlays[i];
                this.showOverlay(overlay);

                var me = this;

                setTimeout(function(){
                   me.removeOverlay(overlay);
                },10000);

            }
        }

        this.onCanPlayThrough(e);
    },

    onMediaEnd:function(e){
        var clip=e.data.baseClip;


        if (!clip.isAd)
        {

            this.currentOverlays = [];
        }
    },

    onReleaseStart:function(e){
        this.currentPlaylist = e.data;
    },

    onReleaseEnd:function(e){
        this.overlayLayer.innerHTML = "";
        this.currentOverlays = [];
    },

    //default behavior is just to show overlay, not worry about time or clicks
    showOverlay:function(overlay)
    {
        //we stick it into this container
        if (!this.overlays) this.overlays = new Array();
        var oldiv = document.createElement("div");
        if (overlay.guid)
        {
            oldiv.id = "tpVastPlugInoverlay"+overlay.guid;
        }
        var ola = document.createElement("a");
        var olimg = document.createElement("img");

        if (overlay.url)
        {
            olimg.src = overlay.url;
        }
        if (overlay.stretchToFit && !overlay.maintainAspectRatio)
        {
            olimg.style.height = "100%";
            olimg.style.width = "100%";
        }
        else if (overlay.stretchToFit && overlay.bannerHeight > overlay.bannerWidth)
        {
            olimg.style.height = "100%";
        }
        else if (overlay.stretchToFit)
        {
            olimg.style.width = "100%";
        }

        oldiv.style['position'] = "absolute";
        oldiv.style['text-align'] = "center";

        //what about click?
        var me = this;

        ola.href = overlay.href;
        ola.target = "_blank";
        ola.style.position = "relative";
        ola.appendChild(olimg);
        oldiv.appendChild(ola);
         if (overlay.bannerHeight)
         {
             oldiv.style.height = overlay.bannerHeight + "px";
             ola.style.height = overlay.bannerHeight + "px";
             ola.style.display = "block";
         }
         if (overlay.bannerWidth)
         {
             oldiv.style.width = overlay.bannerWidth + "px";
             ola.style.width = overlay.bannerWidth + "px";
         }
         ola.style.marginLeft = "auto";
         ola.style.marginRight = "auto";
        oldiv.style.width = "100%";

        if (overlay.impressionUrls)
        {
            var len = overlay.impressionUrls.length;
            var i=0;
            for (;i<len;i++)
            {
                this.sendTrackingUrl(overlay.impressionUrls[i]);
            }
        }

        var area = this.controller.getOverlayArea();

        oldiv.style.top = ((area.height - overlay.bannerHeight))+"px";

        //overlay.div = oldiv;
        this.overlays.push(overlay);//keeps track of overlay for deletion purposes
        this.overlayLayer.appendChild(oldiv);

        var olclose = document.createElement("canvas");
        if (olclose && olclose.getContext && olclose.getContext("2d"))
        {
            olclose.width = 15;
            olclose.height = 15;

            olclose.style.position = "absolute";
            olclose.style.top = "0";
            olclose.style.right = "0";

            ola.onclick = function(e){ if (e.target != olclose) me.controller.pause(true);};
            olclose.onclick = function(){me.removeOverlay(overlay);return false;}

            this.drawCloseButton(olclose,   "#"+this.controller.getProperty("controlframecolor").substr(2),
                                            "#"+this.controller.getProperty("controlbackgroundcolor").substr(2),
                                            "#"+this.controller.getProperty("controlcolor").substr(2));

            ola.appendChild(olclose);
        }
    },
    drawCloseButton: function(myButton, borderColor, fillColor, iconColor)
    {
        //create the graphics layer
        var g = myButton.getContext("2d");
        g.clearRect(0, 0, 15, 15);

        //rectangle
        g.fillStyle = fillColor;
        g.strokeStyle = borderColor;
        //g.drawRoundRect(0,0,15,15,0,0);//make a rectangle 15 pix to the side
        g.fillRect(0,0,15,15);//make a rectangle 15 pix to the side
//        g.strokeRect(0,0,15,15);

        // // yeah, silly. Removes a softEdge on bottomRight
        g.strokeStyle = borderColor;
        g.moveTo(0,0);
        g.lineTo(15,0);
        g.lineTo(15,15);
        g.lineTo(0,15);
        g.lineTo(0,0);
        g.stroke();

        //x lines
        g.strokeStyle = iconColor;
        g.lineWidth = 3;
        g.moveTo(4,4);
        g.lineTo(11,11);
        g.moveTo(4,11);
        g.lineTo(11,4);
        g.stroke();
    },
    removeOverlay:function(overlay)
    {
        var oldiv;

        if (overlay.id)
            oldiv = document.getElementById(overlay.id);
        else
            oldiv = document.getElementById("tpVastPlugInoverlay"+overlay.guid);

        if (oldiv)
            this.overlayLayer.removeChild(oldiv);

        for (var i = 0; this.overlays&& i < this.overlays.length; i++)
        {
            if (this.overlays[i] == overlay)
            {
                this.overlays.splice(i, 1);
                break;
            }
        }
    },
    removeAllOverlays:function()
    {
        this.overlays = undefined;
        this.overlayLayer.innerHTML = "";//nuke the children
    },
    isAd:function(bc)
    {
        return (this.isVastUrl(bc.URL) || this.isVastUrl(bc.baseURL));
    },
    checkAd:function(clip)
    {
        var isHandled = (!clip.mediaLength || clip.mediaLength <= 0) && (this.isVastUrl(clip.baseClip.URL) || clip.baseClip.type=="application/vast+xml");
        if (isHandled)
        {
            //var isHandled=true;
            if (clip.baseClip.type && (clip.baseClip.type.toLowerCase() === "text/javascript" || clip.baseClip.type.toLowerCase() === "application/json"))
            {
                this.currentClip = clip;
                this.loadAdJSON(clip.baseClip.URL);
            }
            else if (!clip.baseClip.type || clip.baseClip.type && (clip.baseClip.type.toLowerCase() === "application/xml" || clip.baseClip.type.toLowerCase() === "application/vast+xml"
                    || clip.baseClip.type.toLowerCase() === "text/xml"))//if clip is ad, try anyway
            {
                this.currentClip = clip;
                this.parentWrappers = [];
                this.loadAdXML(this.doUrlSubstitutions(clip.baseClip.URL));
            }
            else
            {
                return false;
            }

        }
        return isHandled;
    },

    doUrlSubstitutions: function(url)
    {
        var pageUrl = document.location.href;

        if ($pdk.parentUrl)
        {
            pageUrl = $pdk.parentUrl;
        }

        url = url.replace(/\[timestamp\]/gi, (new Date()).getTime());
        url = url.replace(/\[page_url\]/gi, escape(pageUrl));

        return url;
    },

    loadAdJSON:function(url)
    {
        //TODO: sadly, this calls a global function, we'll try to improve that
        //let's append the callback param, just in case
        if (url.indexOf('?') >= 0)
        {
            url += "&callback=" + this.callback;
        }
        else
        {
            url += "?callback=" + this.callback;
        }
        tpLoadScript(url);
        return true;
    },
    loadAdXML:function(url)
    {
        this.xmlHandled = false;
        tpDebug("Trying to load VAST XML From url:"+url);
        var useXdomain;
        if (typeof XDomainRequest !== "undefined" && url.indexOf(document.domain) < 0)
        {
            useXdomain = true;
        }
        if (typeof XMLHttpRequest === "undefined")
        {
            XMLHttpRequest = function ()
            {
                try
                {
                    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                }
                catch (e)
                {
                }
                try
                {
                    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                }
                catch (e)
                {
                }
                try
                {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch (e)
                {
                }
                //Microsoft.XMLHTTP points to Msxml2.XMLHTTP.3.0 and is redundant
                throw new Error("This browser does not support XMLHttpRequest.");
            };
        }
        var xhr;
        if (useXdomain)
        {
            xhr = new XDomainRequest();
        }
        else
        {
            xhr = new XMLHttpRequest();
        }
        var me = this;

        var errCallback = function()
        {
            me.currentClip = null;
            me.vastError();
        };

        var onload = function()
        {
            if (this.readyState === 4&& this.status===200 && !me.xmlHandled)
            {
                me.xmlHandled=true;
                var xml = xhr.responseXML;
                if (xml==null)
                    xml = xhr.responseText;
                try
                {
                    var result = tpVastParser.parse(xml);
                    me.processVast(result);
                }
                catch(e)
                {
                    tpDebug("Error parsing Vast XML: " + xml, "Vast", tpConsts.WARN);
                    errCallback();
                    if (tpLogLevel == "debug")
                    {
                        throw e;
                    }
                }
            }
            else if (this.readyState === 4&&this.status===404&&!me.xmlHandled)
            {
                me.xmlHandled = true;
                errCallback();
            }
            else if (useXdomain&&!me.xmlHandled)
            {
                me.xmlHandled=true;

                try
                {
                    var result = tpVastParser.parse(xhr.responseText);
                    me.processVast(result);
                }
                catch(e)
                {
                    tpDebug("Error parsing Vast XML: "+ xml, "Vast", tpConsts.WARN);
                    errCallback();
                    if (tpLogLevel == "debug")
                    {
                        throw e;
                    }
                }
            }
        };
        if ($pdk.isIE)
        {
            xhr.onload = onload;
        }
        else
        {
            xhr.onreadystatechange = onload;
        }

        xhr.onerror = function(){
            tpDebug("Error loading Vast XML from url:"+url, me.controller.id, "Vast", tpConsts.WARN);
            // me.processAd(null);
            me.xmlHandled = true;
            errCallback();
        }
        try
        {
//            me.xmlHandled=false;
            xhr.open("GET", url);
            xhr.send(null);

            setTimeout(function(){
                if (!me.xmlHandled)
                {
                    me.xmlHandled = true;
                    errCallback();
                }
            },5000);

        }
        catch(e)
        {
            tpDebug(e.message, this.controller.id, "VAST");
            //console.error(e.message);
            //we need to get out of here and skip the ad
            this.vastError();
        }
    },
    addTracking:function(tracking)
    {
    },
    sendImpressions:function()
    {
        tpDebug("sending impressions", this.controller.id, "VAST");
        if (this.currentClip.baseClip.impressionUrls)
        {
            for (var i = 0; i < this.currentClip.baseClip.impressionUrls.length; i++)
            {
                var url = this.currentClip.baseClip.impressionUrls[i];

                // 2013-05-21 - cache buster for impression URLs
                // some VAST urls don't have cache buster params and on some iOS the impression won't be triggered when the ad is viewed again
                if (url.indexOf('ord=') === -1) {
                    var randomNumber = 100000 + Math.floor(Math.random() * 900001);

                    url += (url.indexOf('?') === -1 ? '?' : '&');
                    url += 'ord=' + randomNumber;
                }

                //send an http get for each?
                tpSendUrl(url);
            }
            this.currentClip.baseClip.impressionUrls = undefined;
        }
    },
    //not an event listener
    getTrackingUrl:function (event)
    {
        var eventType = event.event;
        var url = event.urls[0].url;

        switch (eventType.toLowerCase())
        {
            // moved to impressions: case "creativeView":  return this.setTracking(url, "percentage", 0);
            case "start":               return this.setTracking(url, this.TRIGGER_TYPE_PERCENTAGE, 0);
            case "firstquartile":       return this.setTracking(url, this.TRIGGER_TYPE_PERCENTAGE, 25);
            case "midpoint":            return this.setTracking(url, this.TRIGGER_TYPE_PERCENTAGE, 50);
            case "thirdquartile":       return this.setTracking(url, this.TRIGGER_TYPE_PERCENTAGE, 75);
            case "mute":                return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_MUTE);
            case "unmute":              return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_UNMUTE);
            case "pause":               return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_PAUSE);
            case "unpause":             return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_UNPAUSE);
            case "replay":              return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_REPLAY);
            case "stop":                return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_STOP);
            case "resume":              return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_UNPAUSE);
            case "close":               return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_CLOSE);
            case "complete":            return this.setTracking(url, this.TRIGGER_TYPE_PERCENTAGE, 100);
            case "acceptinvitation":    return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_ACCEPTINVITATION);
            case "expand":
            case "fullscreen":          return this.setTracking(url, this.TRIGGER_TYPE_EVENT, this.EVENT_FULL_SCREEN);
            default:
                return null;
        }
    },
    setTracking:function(url, type, value)
    {
        var trackingUrl = new Object();
        trackingUrl.triggerType = type;
        trackingUrl.triggerValue = value;
        trackingUrl.URL = url;
        trackingUrl.hasFired = false;
        trackingUrl.globalDataType = "com.theplatform.pdk.data::TrackingUrl";
        return trackingUrl;
    },

    processCompanions:function(companions, bc)
    {
        //do we even have any?
        if (!(companions && companions.length))
        {
            return;
        }

        //need to figure out when to dispatch events
        if (!bc.banners)
        {
            bc.banners = new Array();
        }

        tpDebug("adding companions", this.controller.id, "VAST");
        var banner, src, href, content, target, width, height, region, guid, alt, bannerType;

        for (var i = 0; i < companions.length; i++)
        {
            if (companions[i].staticResource) // TODO: add bannerSizes? && companions[i].height == 60 && companions[i].width == 300)
            {
                if (companions[i].staticResource)
                {
                    src = companions[i].staticResource;
                }
                else if (ads[i].iFrameResource)
                {
                    //we're probably wanting to pop up an iframe in this case?
                    src = companions[i].iFrameResource;
                }
                //what about click?
                href = companions[i].companionClickThrough;
                target = "_blank";
                width = parseInt(companions[i].width);
                height = parseInt(companions[i].height);

                if (companions[i].creativeType)
                    bannerType = companions[i].creativeType;
                if (companions[i].altText)
                    alt = companions[i].altText;

                region = companions[i].id;
                guid = companions[i].id;

                banner =
                {
                    globalDataType: "com.theplatform.pdk.data::Banner",
                    guid: guid,
                    region: region,
                    src: src,
                    href: href,
                    target: target,
                    alt: alt,
                    bannerType: bannerType,
                    bannerWidth: width,
                    bannerHeight: height,
                    bannerSize: (width*height)
                }

                bc.banners.push(banner);
            }
        }
    },

    processOverlays:function(overlays, bc)
    {
        //do we even have any?
        if (!(overlays && overlays.length))
        {
            return;
        }

        //need to figure out when to dispatch events
        if (!bc.overlays)
        {
            //bc.overlays = new Array();
        }

        tpDebug("adding overlays", this.controller.id, "VAST");
        var banner, src, href, content, target, width, height, region;

        for (var i = 0; i < overlays.length; i++)
        {
            if (overlays[i].staticResource) // TODO: add bannerSizes? && overlays[i].height == 60 && overlays[i].width == 300)
            {
                if (overlays[i].staticResource)
                {
                    src = overlays[i].staticResource;
                }
                else if (ads[i].iFrameResource)
                {
                    //we're probably wanting to pop up an iframe in this case?
                    src = overlays[i].iFrameResource;
                }
                //what about click?
                href = overlays[i].nonLinearClickThrough;
                target = "_blank";
                width = overlays[i].width;
                height = overlays[i].height;

//                if (!bc.overlays)
//                    bc.overlays = [];

                overlay =
                {
                    globalDataType: "com.theplatform.pdk.data::Overlay",
                    src: src,
                    href: href,
                    target: target,
                    bannerWidth: width,
                    bannerHeight: height,
                    bannerSize: (width*height)
                }

//                bc.overlays.push(overlay);
            }
        }
    },

    processImpressions:function(impressions, bc)
    {
        if (bc && impressions && impressions.length)
        {
            if (!bc.impressionUrls)
            {
                bc.impressionUrls = [];
            }

            for (var i=0; i<impressions.length; i++)
            {
                if (impressions[i].url)
                {
                    bc.impressionUrls.push(impressions[i].url);
                }
            }
        }
    },

    processMediaTrackingEvents:function(video, bc)
    {
        tpDebug("adding Tracking URLs", this.controller.id, "VAST");
        //do we even have any?
        if (!(video.trackingEvents && video.trackingEvents.length))
        {
            return;
        }
        //need to figure out when to dispatch events
        if (!bc.trackingURLs)
        {
            bc.trackingURLs = new Array();
        }
        for (var i = 0; i < video.trackingEvents.length; i++)
        {
            if (video.trackingEvents[i].event=="creativeView")
            {
               if (video.trackingEvents[i].urls!=null)
               {
                    if (bc.impressionUrls==null)
                        bc.impressionUrls = [];

                    var ulen = video.trackingEvents[i].urls.length;
                    var j = 0;

                    for (;j<ulen;j++)
                    {
                        var url = video.trackingEvents[i].urls[j];
                        if (url)
                        {

                            bc.impressionUrls.push(url.url);
                        }
                    }
                }
            }

            var trackingUrl = this.getTrackingUrl(video.trackingEvents[i]);
            if (trackingUrl)
            {
                bc.trackingURLs.push(trackingUrl);
            }
            else
            {
                tpDebug("TrackingEvent \"" + video.trackingEvents[i].event +  "\" not supported. Ignoring.", this.controller.id, "VAST");
            }
        }
        //up to a media player event to worry about sending the tracking
    },
    processVideoClicks:function(video, bc)
    {
        var videoClicks = video.videoClicks;

        if (videoClicks)
        {
            if (!bc.moreInfo)
            {
                bc.moreInfo = {globalDataType:"com.theplatform.pdk.data::HyperLink"};
                bc.moreInfo.clickTrackingUrls = [];
            }

            if (this.allowClicks && videoClicks.clickThrough && videoClicks.clickThrough.length>0)
            {
                bc.moreInfo.href = videoClicks.clickThrough[0].url;
            }
            else
            {
                bc.moreInfo.href = null;
            }

            if (this.allowClicks && videoClicks.clickTracking)
            {
                var i=0;
                var len = videoClicks.clickTracking.length;
                var url;
                for (;i<len;i++)
                {
                    url = videoClicks.clickTracking[i].url;
                    if (url.indexOf('ord=') === -1) {
                        var randomNumber = 100000 + Math.floor(Math.random() * 900001);

                        url += (url.indexOf('?') === -1 ? '?' : '&');
                        url += 'ord=' + randomNumber;
                    }
                    bc.moreInfo.clickTrackingUrls.push(url);
                }
            }
        }
    },

    _playlist: null,

    processMediaFiles:function (video, companions, overlays, impressions)
    {
        var format = null;
        var isPlaying = false;
        var bc = {};

        // get the tracking events from the wrapper
        var wrapper;
        for (var i=0; i<this.parentWrappers.length; i++)
        {
            wrapper = this.parentWrappers[i];
            this.processMediaTrackingEvents(wrapper, bc);
            this.processVideoClicks(wrapper, bc);
            this.processImpressions(wrapper.impressions, bc);
        }

        // var formatArr = $pdk.env.Detect.getInstance()._supported_runtimes;
        // var formats = "";

        // for (var i=0; i<formatArr.length; i++)
        // {
        //     if (formatArr[i].indexOf("html5:") == 0 && formatArr[i].indexOf(":javascript") == -1)
        //     {
        //         formats += ( formats.length > 0 ? "|" : "" ) + formatArr[i].split(":")[1];
        //     }
        // }

        // if (formats)
        // {
        //     feedUrl += "&byContent=byFormat%3D" + formats;
        // }

        var bestFile;
        if (video && video.mediaFiles && video.mediaFiles.length)
        {
            for (var i = 0; i < video.mediaFiles.length; i++)
            {
                //TODO: should prioritize a preferred media type
                if (this.video.canPlayType(video.mediaFiles[i].type)||this.controller.component.videoengineruntime==="flash")
                {
                    bestFile = video.mediaFiles[i];
                    if (bestFile.type=="video/mp4")
                        break;
                }
            }
        }

        if (bestFile)
        {
            isPlaying = true;
            bc.isAd = true;
            bc.noSkip = this.currentClip && this.currentClip.baseClip ? this.currentClip.baseClip.noSkip : true;
            bc.streamType = "flashVideoUnknownMP4";
            bc.URL = bestFile.url;
            bc.description = this.currentDescription;
//            bc.overlays = this.currentOverlays;
            bc.globalDataType = "com.theplatform.pdk.data::BaseClip";

            this.processImpressions(impressions, bc);
            this.processMediaTrackingEvents(video, bc);
            this.processVideoClicks(video, bc);
            this.processCompanions(companions, bc);
//            this.processOverlays(overlays, bc);


            var clip = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(bc);
            this._playlist.clips.push(clip);
            this._playlist.baseClips.push(bc);

            clip.chapter = {globalDataType: this.controller.getDataTypeName("Chapter")};
            clip.chapter.index = this._playlist.clips.length - 1;
            clip.chapter.startTime = 0;
            clip.chapter.endTime = video.duration;
            clip.chapter.length = video.duration;
            clip.chapter.aggregateLength = video.duration;
            clip.chapter.globalDataType = "com.theplatform.pdk.data::Chapter";
            clip.title = this.currentTitle;

            if (this._playlist.clips.length > 1)
            {
                var lastClip = this._playlist.clips[this._playlist.clips.length-2];
                clip.chapter.aggregateStartTime = lastClip.chapter.aggregateStartTime + lastClip.chapter.endTime;
                clip.chapter.chapters = lastClip.chapter.chapters;
                clip.chapter.chapters.isAggregate = true;
            }
            else
            {
                clip.chapter.chapters = {globalDataType: this.controller.getDataTypeName("ChapterList"), chapters: [], aggregateStartTime: 0, aggregateLength: 0}
                clip.chapter.aggregateStartTime = 0;
            }
            clip.chapter.chapters.chapters.push(clip.chapter);
            clip.chapter.chapters.aggregateLength += video.duration;
            clip.chapter.endTime = clip.chapter.startTime + video.duration;
        }
        else
        {
            this.processCompanions(companions, bc);

            var startLooking = false;
            if (this.currentPlaylist && this.currentPlaylist.clips && this.currentPlaylist.clips.length)
            {
                for (var i=0; i<this.currentPlaylist.clips.length; i++)
                {
                    if (this.currentPlaylist.clips[i].URL == this.currentClip.URL &&
                        this.currentPlaylist.clips[i].clipIndex == this.currentClip.clipIndex)
                    {
                        startLooking = true;
                        continue;
                    }
                    else if (startLooking && !this.currentPlaylist.clips[i].baseClip.isAd)
                    {
                        if (!this.currentPlaylist.clips[i].baseClip.banners)
                            this.currentPlaylist.clips[i].baseClip.banners = [];
                        this.currentPlaylist.clips[i].baseClip.banners = this.currentPlaylist.clips[i].baseClip.banners.concat(bc.banners);
                        this.controller.updateClip(this.currentPlaylist.clips[i])
                        break;
                    }
                }
            }
        }
    },
    processAd:function(ad)
    {
        if (ad==null)
        {
            this.currentClip = null;
            return;
        }

        if (ad.adType == "InLine")
        {
            this.processInline(ad);
        }
        else if (ad.adType == "Wrapper")
        {
            //all we're supposed to do here is load the vastTagurl
            //must assume it'll be jsonp or json like how we want it
            this.processWrapperAdEvent(ad);
            this.loadAdXML(ad.vastAdTagURL);
        }
    },
    // 2013-05-15 - support for originator's tracking events
    processWrapperAdEvent: function(wrapper) {
        tpDebug('Processing wrapper tracking events');

        this.parentWrappers.push(wrapper);
    },
    //TODO: this will probably only handle an inline ad... need to do wrappers too(?)
    processInline:function(inline)
    {
        // our sample has a hard coded duration of 3 seconds, so we'll call done then
        var me = this;
        //TODO: there's a bunch more stuff that needs to happen here for banners/overlays
        //we should probably decorate the base clip with this stuff, even though it may not be used yet
        if (inline.adTitle) this.currentTitle = inline.adTitle;
        if (inline.description) this.currentDescription = inline.description;
        //may need to implement a proper ad plugin api for it
        //vast 2.0 doesn't have a concept of top level tracking, only tracking for each creative
        //var tracking = inline.ads[0]
        var video = inline.video;
        var companions = inline.companionAds;
        var impressions = inline.impressions;
        var overlays;

        // get the impressions  from the wrapper
        if (!inline.impressions)
        {
            inline.impressions = [];
        }

        var wrapper;
        for (var i=0; i<this.parentWrappers.length; i++)
        {
            wrapper = this.parentWrappers[i];
            inline.impressions = inline.impressions.concat(wrapper.impressions);
        }

        this.showCompanions(companions);
        //need to deal with non-linears (overlays)
        this.addOverlays(inline);
        //we do this last in case other stuff needs to handle the start of playback
        if (video)
        {
            //this also handles tracking events
            this.processMediaFiles(video, companions, overlays, impressions);
            //don't do anything, need to use flash
        }
        else
        {
            //we should send back a playlist with the overlays, but the phase 1 pdk doesn't support that anyway
            this.vastError();
        }
    },

    processVast:function(vast)
    {
        if (!vast || !vast.ads || vast.ads.length == 0)
        {
            tpDebug("No ads found", this.controller.id, "VAST");
            this.vastError();
            return;
        }

        this._playlist = {};
        this._playlist.baseClips = [];
        this._playlist.clips = [];
        this._playlist.globalDataType = "com.theplatform.pdk.data::Playlist";

        var wrapperCount = 0;
        var inLineCount = 0;
        var sequenceCount = 0;
        var wrapperSequenceCount = 0;

        // count ad types
        for (var i = 0; i < vast.ads.length; i++)
        {
            var ad = vast.ads[i];

            if (!ad)
                continue;

            if (ad.adType === "Wrapper")
            {
                wrapperCount++;
                if (ad.sequence && !isNaN(ad.sequence))
                {
                    wrapperSequenceCount++;
                }
            }
            else if (ad.adType === "InLine")
            {
                inLineCount++;
                if (ad.sequence && !isNaN(ad.sequence))
                {
                    sequenceCount++;
                }
            }
            else
            {
                tpDebug("Unknown ad type: \"" + Class(getDefinitionByName(getQualifiedClassName(ad))) + "\"; ignoring", this.controller.id, "VAST");
            }
        }

        // Warn about unsupported scenarios
        if (wrapperCount > 1)
        {
            tpDebug("This playlist has multiple wrappers; not supported", this.controller.id, "VAST");
            this.vastError();
            return;
        }
        if (wrapperCount > 0 && inLineCount > 0)
        {
            tpDebug("This playlist has a mix of wrappers and inline ads; not supported", this.controller.id, "VAST");
            this.vastError();
            return;
        }

        // Handle VAST 3.0 sequence ids
        if (this._enablePods && (sequenceCount > 0))
        {
            tpDebug("Detected VAST 3.0 sequence attributes", this.controller.id, "VAST");
            var pod = [];
            var ads = [];

            for (i = 0; i < vast.ads.length; i++ )
            {
                if (vast.ads[i].sequence && !isNaN(vast.ads[i].sequence))
                {
                    ads.push(vast.ads[i]);
                }
            }

            while(ads.length > 0)
            {
                var lowestSequence = Number.MAX_VALUE;
                var lowestIndex = -1;
                var sequence = 0;

                for (i = 0; i < ads.length; i++ )
                {
                    sequence = Number(vast.ads[i].sequence);
                    if (sequence < lowestSequence)
                    {
                        lowestSequence = sequence;
                        lowestIndex = i;
                    }
                }
                pod.push(ads[lowestIndex]);
                ads.splice(lowestIndex, 1);
            }

            for (i = 0; i < pod.length; i++ )
            {
                this.processAd(pod[i]);
            }

            this.vastSuccess();
            return;
        }
        // Handle single wrapper
        else if (wrapperCount == 1)
        {
            tpDebug("Detected VAST 2.0 wrapper", this.controller.id, "VAST");
            this.processAd(vast.ads[0]);
            return; //dont call success, or error
        }
        else if (inLineCount > 0)
        {
            tpDebug("Detected VAST 2.0 inline", this.controller.id, "VAST");
            // if pods are turned on, we only play one Ad when there's no sequence attributes
            if (this._enablePods)
            {
                if (vast.ads.length > 1)
                {
                    tpDebug("Playing only first inline, since VAST 3.0 was triggered", this.controller.id, "VAST");
                }
                this.processAd(vast.ads[0]);
            }
            else
            {
                tpDebug("Playing all inlines, since VAST 2.0 was triggered", this.controller.id, "VAST");
                for (i = 0; i < vast.ads.length; i++ )
                {
                    this.processAd(vast.ads[i]);
                }
            }

            this.vastSuccess();
            return;
        }

        if (this._playlist.clips.length > 0)
        {
            this.vastSuccess();
        }
        else
        {
            this.vastError();
        }
    },

    vastError:function()
    {
        this.controller.setAds(null);
    },

    vastSuccess:function()
    {
        this.controller.setAds(this._playlist);
    },

    addOverlays:function(inLine)
    {
        if (inLine.nonLinearAds)
        {
            for (var i = 0; i < inLine.nonLinearAds.length; i++)
            {
                var nonLinearAd = inLine.nonLinearAds[i];
                var overlay = new Object();
                overlay.guid = nonLinearAd.id;

                if (!overlay.guid)
                {
                    overlay.guid = "tpVASTOverlay" + Math.floor(Math.random() * 100000);
                }

                overlay.globalDataType = "com.theplatform.pdk.data::Overlay";
                if (nonLinearAd.staticResource)
                {
                    overlay.url = nonLinearAd.staticResource;
                }
                else if (nonLinearAd.iFrameResource)
                {
                    overlay.url = nonLinearAd.iFrameResource;
                }
                if (nonLinearAd.nonLinearClickThrough != null) overlay.href = nonLinearAd.nonLinearClickThrough;
                overlay.bannerHeight = nonLinearAd.height;
                if (nonLinearAd.creativeType != null) overlay.bannerType = nonLinearAd.creativeType;
                overlay.stretchToFit = nonLinearAd.scalable;
                if (nonLinearAd.url != null) overlay.src = nonLinearAd.url;
                overlay.bannerWidth = nonLinearAd.width;
                if (nonLinearAd.maintainAspectRatio)
                {
                    overlay.maintainAspectRatio = ! (nonLinearAd.maintainAspectRatio == "false");
                }
                if (this.currentOverlays == null)
                {
                    this.currentOverlays = new Array();
                }

                if (nonLinearAd.trackingEvents)
                {
                   var len =  nonLinearAd.trackingEvents.length;
                   var i =0;

                   for (;i<len;i++)
                   {
                       var te = nonLinearAd.trackingEvents[i];
                       if (te.event=="creativeView")
                       {
                           if (te.urls!=null)
                           {
                               if (overlay.impressionUrls==null)
                                   overlay.impressionUrls = new Array();

                               var ulen = te.urls.length;
                               var j = 0;

                               for (;j<ulen;j++)
                               {
                                   var url = te.urls[j];
                                   overlay.impressionUrls.push(url.url);
                               }
                           }
                       }

                   }
               }



                this.currentOverlays.push(overlay);
            }
        }
    },
    showCompanions:function(ads)
    {
        //we should really have an api for this, right now it's hardcoded to the id for our default html5 canvas
        //actually, we need for the element id to be the same as the id in the companion tag4
        if (!this.bannerImg)
        {
            var banner300x60 = document.getElementById("comp_300x60");
            if (banner300x60)
            {
                this.bannerLink = document.createElement("a");
                this.bannerImg = document.createElement("img");
                this.bannerLink.appendChild(this.bannerImg);
                banner300x60.appendChild(this.bannerLink);
            }
            else
            {
                return;
            }
        }
        for (var i = 0; i < ads.length; i++)
        {
            if (ads[i].staticResource && ads[i].height == 60 && ads[i].width == 300)
            {
                if (ads[i].staticResource)
                {
                    this.bannerImg.src = ads[i].staticResource;
                }
                else if (ads[i].iFrameResource)
                {
                    //we're probably wanting to pop up an iframe in this case?
                    this.bannerImg.src = ads[i].iFrameResource;
                }
                //what about click?
                this.bannerLink.href = ads[i].companionClickThrough;
                this.bannerLink.target = "_blank";
                tpDebug("banner loaded, sending impressions", this.controller.id, "VAST");
                //spec says we can send impressions as soon as one creative has been loaded
                this.sendImpressions();
                break;
            }
        }
        //TODO: this shouldn't be hard-coded, we should let the developer choose the proper size
    },
    sendTrackingUrl: function(url)
    {
        if (url.indexOf('ord=') === -1) {
            var randomNumber = 100000 + Math.floor(Math.random() * 900001);

            url += (url.indexOf('?') === -1 ? '?' : '&');
            url += 'ord=' + randomNumber;
        }
        tpSendUrl(url);
    },
    done: function()
    {
        //this.hidePlugin();
        this.removeAllOverlays();
        //this.controller.dispatchEvent("OnMediaEnd", this.currentClip);
    },
    //"private"/util type functions
    isVastUrl:function(checkURL)
    {
        if (!checkURL||!this.hosts||this.hosts.length===0) return false;
        for (var i = 0; i < this.hosts.length; i++)
        {
            if (checkURL.match(this.hosts[i]))
            {
                return true;
            }
        }
        return false;
    },
    JSONHandler:function(json)
    {
        var result = tpVastParser.parse(json);
        //now we have our json, let's play the actual ad
        //TODO: need to fix this to proccess the ad first, inline is lower down
        this.processAd(result.ads[0]);
    }
});
var vastPlugIn = new VastPlugIn();
$pdk.controller.plugInLoaded(vastPlugIn, vastPlugIn.container);
