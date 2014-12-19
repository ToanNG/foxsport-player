(function(){var a=false,b=/xyz/.test(function(){xyz
})?/\b_super\b/:/.*/;
this.Class=function(){};
Class.extend=function(g){var f=this.prototype;
a=true;
var e=new this();
a=false;
for(var d in g){e[d]=typeof g[d]=="function"&&typeof f[d]=="function"&&b.test(g[d])?(function(h,i){return function(){var k=this._super;
this._super=f[h];
var j=i.apply(this,arguments);
this._super=k;
return j
}
})(d,g[d]):g[d]
}function c(){if(!a&&this.init){this.init.apply(this,arguments)
}this.instanceOf=function(j){for(var i in j){if(typeof j[i]==="function"&&typeof this[i]!="function"){return false
}return true
}};
if(this["implements"]&&this["implements"].length>0){for(var h=0;
h<this["implements"].length;
h++){if(!this.instanceOf(this["implements"][h])){throw new Error("Interface not fully implemented")
}}}}c.prototype=e;
c.constructor=c;
c.extend=arguments.callee;
return c
}
})();
EventDispatcher=Class.extend({buildListenerChain:function(){if(!this.listenerChain){this.listenerChain={}
}},addEventListener:function(a,b){if(!b instanceof Function){throw {message:"Listener isn't a function"}
}this.buildListenerChain();
if(!this.listenerChain[a]){this.listenerChain[a]=[b]
}else{this.listenerChain[a].push(b)
}},hasEventListener:function(a){if(this.listenerChain){return(typeof this.listenerChain[a]!="undefined")
}else{return false
}},removeEventListener:function(b,c){if(!this.hasEventListener(b)){return false
}for(var a=0;
a<this.listenerChain[b].length;
a++){if(this.listenerChain[b][a]==c){this.listenerChain[b].splice(a,1)
}}},dispatchEvent:function(c,a){this.buildListenerChain();
if(!this.hasEventListener(c)){return false
}for(var b=0;
b<this.listenerChain[c].length;
b++){var d=this.listenerChain[c][b];
if(d.call){d.call(this,a)
}}}});
PDKComponent=Class.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'"></div>'
},write:function(){document.write(this._generateExportedMarkup(this.id));
try{var a=document.getElementById(this.id);
return this._bindElement(a)
}catch(b){}},bind:function(d){try{var c=document.getElementById(d);
c.innerHTML=this._generateExportedMarkup();
var a=document.getElementById(this.id);
return this._bindElement(a)
}catch(b){}},_bindElement:function(a){return this.container=a
},init:function(){},doPluginStuff:function(){this.pluginManager=new PlugInManager(this.controller);
for(prop in this){if(!prop.toLowerCase().match(/plugin|wrapper/)){continue
}var n=this[prop];
if(typeof n!="string"){continue
}var d;
if(prop.toLowerCase().indexOf("plugin")==0){d=prop.substr(6)
}else{if(prop.toLowerCase().indexOf("wrapper")==0){d=prop.substr(7)
}}var l;
var m=Number.MAX_VALUE;
var a;
var h;
var f;
var j=new Object();
var c=n.split("|");
for(var g=0;
g<c.length;
g++){var e=c[g];
if(e.indexOf("=")==-1){continue
}var b=[e.substr(0,e.indexOf("=")),e.substr(e.indexOf("=")+1)];
var k=b[0];
var o=b[1];
o=unescape(o);
switch(k.toLowerCase()){case"type":l=o;
break;
case"priority":m=parseInt(o);
break;
case"url":a=o;
break;
case"suburl":h=o;
break;
case"runtime":f=o;
break;
default:j[k]=o;
break
}}if(!a){return null
}this.pluginManager.addPlugIn(d,l,m,a,h,j,null,f)
}this.pluginManager.ready()
},ready:function(){this.controller.registerFunction("getComponentSize",this,this.getComponentSize);
this.controller.registerFunction("addChild",this,this.addChild);
var a=this;
setTimeout(function(){a.doPluginStuff()
},1)
},getComponentSize:function(){return{width:this.container.offsetWidth,height:this.container.offsetHeight,id:this.id}
},addChild:function(a){if(this.pluginLayer){this.pluginLayer.appendChild(a)
}else{if(this.container){this.container.appendChild(a)
}}},addPlugIn:function(h,c,b,a,g,f,e){if(!this.plugins){this.plugins=new Array()
}var d={id:h,type:c,priority:b,url:a,subUrl:g,vars:f,plugIn:e};
this.pluginManager.addPlugIn(d)
}});
oldController=EventDispatcher.extend({init:function(){this.functions=new Object();
this.objects=new Object();
this.pluginQueue=new Array();
this.pluginScopes=new Array();
this.waitingForPlugIn=false
},dispatchEvent:function(b,a){this._super(b,{type:b,data:a})
},doDispatchEvent:function(a){this.dispatchEvent(a.type,a.data)
},removeEventListener:function(a,b){this._super(a,b)
},addEventListener:function(a,b){this._super(a,b)
},loadPlugIn:function(b,a){b.controller=a;
this.pluginQueue.push(b);
this.pluginScopes.push(a.componentId);
if(this.waitingForPlugIn){return
}this.loadNextPlugIn()
},loadNextPlugIn:function(){this.currentPlugIn=this.pluginQueue.shift();
if(!this.queuedControllers){this.queuedControllers=[]
}if(this.currentPlugIn){this.waitingForPlugIn=true;
tpDebug("Trying to load plugin at "+this.currentPlugIn.url);
var b=document.getElementsByTagName("head")[0];
var c=document.createElement("script");
c.type="text/javascript";
c.src=this.currentPlugIn.url;
b.appendChild(c)
}else{var d=0;
var a=this.queuedControllers.length;
for(;
d<a;
d++){this.queuedControllers[d].dispatchEvent("OnPlugInsComplete",null,this.pluginScopes)
}this.dispatchEvent("OnPlugInsComplete",null,this.pluginScopes);
if(tpController){tpController.ready()
}var d=0;
for(;
d<a;
d++){this.queuedControllers[d].initializePlayback()
}var e=this;
setTimeout(function(){e.initializePlayback()
},1)
}},addChild:function(b,a){return this.callFunction("addChild",[b],a)
},plugInLoaded:function(c,d){if(!this.queuedControllers){this.queuedControllers=[]
}var b=false;
for(var a in this.queuedControllers){if(this.currentPlugIn.controller.id==a.id){b=true;
break
}}if(b){this.queuedControllers.push(this.currentPlugIn.controller)
}c.initialize({controller:this.currentPlugIn.controller,vars:this.currentPlugIn.vars,priority:this.currentPlugIn.priority});
if(d){this.addChild(d,[this.currentPlugIn.controller.componentId])
}this.dispatchEvent("OnPlugInLoaded",c,[this.currentPlugIn.controller.componentId]);
this.waitingForPlugIn=false;
this.loadNextPlugIn()
},clickPlayButton:function(a){return this.callFunction("clickPlayButton",[],a)
},clickPlayButtonNative:function(a){return this.callFunction("clickPlayButtonNative",[],a)
},doParsePlaylist:function(a,c,b){return this.callFunction("doParsePlaylist",[a,c],b)
},firstRange:function(b,a){this.callFunction("firstRange",[b],a)
},getCurrentRange:function(a){this.callFunction("getCurrentRange",[],a)
},getRelease:function(a,c,b){return this.callFunction("getRelease",[a,c],b)
},getSubtitleLanguage:function(a,b){this.callFunction("getSubtitleLanguage",[a],b)
},loadRelease:function(a,b,c){a=this.modRelease(a);
return this.callFunction("loadRelease",[a,b],c)
},loadReleaseURL:function(a,b,c){return this.callFunction("loadReleaseURL",[a,b],c)
},loadReleaseURLNative:function(a,b,c){return this.callFunction("loadReleaseURLNative",[a,b],c)
},parseRelease:function(c,a,b,d){return this.callFunction("parseRelease",[c,a,b],d)
},loadJSON:function(a,d,b,c){return this.callFunction("loadJSON",[a,d,b],c)
},supportsFullScreen:function(a){return this.callFunction("supportsFullScreen",[],a)
},supportsSeek:function(a){return this.callFunction("supportsSeek",[],a)
},supportsMute:function(a){return this.callFunction("supportsMute",[],a)
},supportsVolume:function(a){return this.callFunction("supportsVolume",[],a)
},mute:function(b,a){return this.callFunction("mute",[b],a)
},setVolume:function(b,a){return this.callFunction("setVolume",[b],a)
},nextClip:function(a){return this.callFunction("nextClip",[],a)
},nextRange:function(b,a){this.callFunction("nextRange",[b],a)
},tryWritePlayer:function(a){return this.callFunction("tryWritePlayer",[],a)
},pause:function(b,a){return this.callFunction("pause",[b],a)
},pauseNative:function(b,a){return this.callFunction("pauseNative",[b],a)
},playNext:function(c,a,b){return this.callFunction("playNext",[c,a],b)
},playPrevious:function(b,a){this.callFunction("playPrevious",[b],a)
},sendError:function(a,b){this.callFunction("sendError",[a],b)
},previousClip:function(a){return this.callFunction("previousClip",[],a)
},previousRange:function(b,a){this.callFunction("previousRange",[b],a)
},refreshReleaseModel:function(a,i,c,d,b,g,h,e,f){if(c){c.globalDataType=this.getDataTypeName("Sort")
}if(d){d.globalDataType=this.getDataTypeName("Range")
}return this.callFunction("refreshReleaseModel",[a,i,c,d,b,g,e,f],h)
},setAudioTrackByIndex:function(a,b){this.callFunction("setAudioTrackByIndex",[a],b)
},setAudioTrackByLanguage:function(b,a){this.callFunction("setAudioTrackByLanguage",[b],a)
},seekToPercentage:function(a,b){return this.callFunction("seekToPercentage",[a],b)
},seekToPosition:function(a,b){return this.callFunction("seekToPosition",[a],b)
},playPlaylist:function(b,a){return this.callFunction("playPlaylist",[b],a)
},setRelease:function(a,b,c){a=this.modRelease(a);
return this.callFunction("setRelease",[a,b],c)
},setReleaseURL:function(a,b,c){return this.callFunction("setReleaseURL",[a,b],c)
},setReleaseURLNative:function(a,b,c){return this.callFunction("setReleaseURLNative",[a,b],c)
},setShowSubtitles:function(a,b){this.callFunction("setShowSubtitles",[a],b)
},setSmil:function(a,b){this.callFunction("setSmil",[a],b)
},setSubtitleLanguage:function(b,a){this.callFunction("setSubtitleLanguage",[b],a)
},setToken:function(a,c,b){this.callFunction("setToken",[a,c],b)
},showFullScreen:function(b,a){return this.callFunction("showFullScreen",[b],a)
},endRelease:function(a){return this.callFunction("endRelease",[],a)
},getMediaArea:function(){var a=null;
return this.callFunction("getMediaArea",[],a)
},setMediaArea:function(b,a){this.callFunction("setMediaArea",[b],a)
},getOverlayArea:function(a){return this.callFunction("getOverlayArea",[],a)
},setOverlayArea:function(b,a){this.callFunction("setOverlayArea",[b],a)
},getReleaseState:function(){return this.callFunction("getReleaseState",[])
},getTimeSinceLastAd:function(a){return this.callFunction("getTimeSinceLastAd",[],a)
},injectPlaylist:function(b,a){return this.callFunction("injectPlaylist",[b],a)
},insertPlaylist:function(b,a){return this.callFunction("insertPlaylist",[b],a)
},insertClip:function(b,a){return this.callFunction("insertClip",[b],a)
},registerAdPlugIn:function(b){var a=null;
return this.callFunction("registerAdPlugIn",[b],a)
},registerClipWrapperPlugIn:function(b){var a=null;
return this.callFunction("registerClipWrapperPlugIn",[b],a)
},registerMetadataUrlPlugIn:function(c,a,b){return this.callFunction("registerMetadataUrlPlugIn",[c,a],b)
},registerURLPlugIn:function(d,c,a){var b=null;
return this.callFunction("registerURLPlugIn",[d,c,a],b)
},setAds:function(b,a){return this.callFunction("setAds",[b],a)
},addPlayerCard:function(d,h,b,g,a,f,c,e){this.callFunction("addPlayerCard",[d,h,b,g,a,f,c,e],e)
},showPlayerCard:function(b,e,a,d,c){return this.callFunction("showPlayerCard",[b,e,a,d],c)
},hidePlayerCard:function(a,c,b){this.callFunction("hidePlayerCard",[a,c],b)
},showMenuCard:function(a,b){return this.callFunction("showMenuCard",[a],b)
},checkIfEndCardExists:function(a){return this.callFunction("checkIfEndCardExists",[],a)
},setClip:function(b){var a=null;
return this.callFunction("setClip",[b],a)
},setMetadataUrl:function(a,b){return this.callFunction("setMetadataUrl",[a],b)
},setPlayerLayoutUrl:function(a,b){return this.callFunction("setPlayerLayoutUrl",[a],b)
},setPlayerLayoutXml:function(a,b){return this.callFunction("setPlayerLayoutXml",[a],b)
},setOverlayArea:function(b,a){return this.callFunction("setOverlayArea",[b],a)
},setClipWrapper:function(a,b){return this.callFunction("setClipWrapper",[a],b)
},wrapClip:function(c,b,a){return this.callFunction("wrapClip",[c,b],a)
},initializePlayback:function(a){return this.callFunction("initializePlayback",[],a)
},endMedia:function(a,b){return this.callFunction("endMedia",[a,b])
},getVideoProxy:function(a){return this.callFunction("getVideoProxy",[],a)
},isFlashPlayer:function(b){var a=this.callFunction("isFlashPlayer",[],b);
if(a===undefined){return true
}else{return a
}},isStandbyMode:function(){return this.callFunction("isStandbyMode",[])
},isPrefetch:function(){return this.callFunction("isPrefetch",[])
},markOffset:function(c,a,b){return this.callFunction("markOffset",[c,a,b])
},resetRelease:function(a){return this.callFunction("resetRelease",[],a)
},updateMediaTime:function(a,b){this.callFunction("updateMediaTime",[a],b)
},updateClip:function(b,a){this.callFunction("updateClip",[b],a)
},updatePlaylist:function(b,a){this.callFunction("updatePlaylist",[b],a)
},writePlayer:function(b,a,c){return this.callFunction("writePlayer",[b,a],c)
},setShowControls:function(b,c,a){this.callFunction("setShowControls",[b,c],a)
},getDataTypeName:function(a){switch(a){case"AdPattern":return"com.theplatform.pdk.data::AdPattern";
case"Banner":return"com.theplatform.pdk.data::Banner";
case"BaseClip":return"com.theplatform.pdk.data::BaseClip";
case"CallInfo":return"com.theplatform.pdk.communication::CallInfo";
case"CategoryInfo":return"com.theplatform.pdk.data::CategoryInfo";
case"Clip":return"com.theplatform.pdk.data::Clip";
case"CommInfo":return"com.theplatform.pdk.communication::CommInfo";
case"CustomData":return"com.theplatform.pdk.data::CustomData";
case"CustomValue":return"com.theplatform.pdk.data::CustomValue";
case"DispatchInfo":return"com.theplatform.pdk.communication::DispatchInfo";
case"FunctionInfo":return"com.theplatform.pdk.communication::FunctionInfo";
case"HandlerInfo":return"com.theplatform.pdk.communication::HandlerInfo";
case"HyperLink":return"com.theplatform.pdk.data::HyperLink";
case"MediaClick":return"com.theplatform.pdk.data::MediaClick";
case"MediaFile":return"com.theplatform.pdk.data::MediaFile";
case"MessageInfo":return"com.theplatform.pdk.communication::MessageInfo";
case"MetricInfo":return"com.theplatform.pdk.data::MetricInfo";
case"Overlay":return"com.theplatform.pdk.data::Overlay";
case"PdkEvent":return"com.theplatform.pdk.events::PdkEvent";
case"ProviderInfo":return"com.theplatform.pdk.data::ProviderInfo";
case"Range":return"com.theplatform.pdk.data::Range";
case"Rating":return"com.theplatform.pdk.data::Rating";
case"Release":return"com.theplatform.pdk.data::Release";
case"ReleaseInfo":return"com.theplatform.pdk.data::ReleaseInfo";
case"ScopeInfo":return"com.theplatform.pdk.communication::ScopeInfo";
case"Sort":return"com.theplatform.pdk.data::Sort";
case"Subtitles":return"com.theplatform.pdk.data::Subtitles";
case"TrackingUrl":return"com.theplatform.pdk.data::TrackingUrl";
case"BandwidthPreferences":return"com.theplatform.pdk.data::BandwidthPreferences";
case"Annotation":return"com.theplatform.pdk.data::Annotation"
}},ready:function(){this.isHTML5Loading=false;
this.checkMessageQueue()
},callFunction:function(b,e,c,d){if(c==null&&this.scopes!=undefined){c=this.scopes.concat()
}var a=this.functions[b];
if(a){return this.functions[b].apply(this.objects[b],e)
}else{if(tpController&&!d){return tpController.callFunction(b,e,c)
}else{return null
}}},doCallFunction:function(a){this.callFunction(a.name,a.args,a.scope)
},registerFunction:function(b,a,d){var c=this.functions[b]===undefined;
this.functions[b]=d;
this.objects[b]=a;
if(tpController){tpController.registerFunction(b,function(){return d.apply(a,arguments)
},(this.scopes?this.scopes.concat():undefined),c)
}},modRelease:function(a){if(a){a.globalDataType=this.getDataTypeName("Release");
if(a.categories){a.categories=this.modCategories(a.categories)
}if(a.thumbnails){for(var b=0;
b<a.thumbnails.length;
b++){a.thumbnails[b].globalDataType=this.getDataTypeName("MediaFile");
if(a.thumbnails[b].customValues){a.thumbnails[b].customValues=this.modCustomValues(a.thumbnails[b].customValues)
}}}if(a.customValues){a.customValues=this.modCustomValues(a.customValues)
}if(a.metrics){for(var b=0;
b<a.metrics.length;
b++){a.metrics[b].globalDataType=this.getDataTypeName("MetricInfo")
}}if(a.provider){a.provider.globalDataType=this.getDataTypeName("ProviderInfo");
if(a.provider.customValues){a.provider.customValues=this.modCustomValues(a.provider.customValues)
}}if(a.ratings){for(var b=0;
b<a.ratings.length;
b++){a.ratings[b].globalDataType=this.getDataTypeName("Rating")
}}if(a.URL){a.url=a.URL
}a.mediaPID=a.mediaPid?a.mediaPid:"";
delete a.mediaPid
}return a
},modCustomValues:function(a){for(var b=0;
b<a.length;
b++){a[b].globalDataType=this.getDataTypeName("CustomValue")
}return a
},modCategories:function(a){for(var b=0;
b<a.length;
b++){a[b].globalDataType=this.getDataTypeName("CategoryInfo")
}return a
},modClip:function(a){if(a){a.globalDataType=this.getDataTypeName("Clip");
var b=a.baseClip;
if(!b){b=new Object()
}if(a.banners){b.banners=a.banners
}if(a.overlays){b.overlays=a.overlays
}a.baseClip=this.modBaseClip(b);
if(a.chapter){a.chapter.globalDataType=this.getDataTypeName("Chapter")
}}return a
},modBaseClip:function(b){if(!b){b=new Object()
}b.globalDataType=this.getDataTypeName("BaseClip");
if(b.moreInfo){b.moreInfo.globalDataType=this.getDataTypeName("HyperLink");
if(b.moreInfo.clickTrackingUrls){b.moreInfo.clickTrackingUrls=this.modTracking(b.moreInfo.clickTrackingUrls)
}}if(b.banners){for(var a=0;
a<b.banners.length;
a++){b.banners[a].globalDataType=this.getDataTypeName("Banner");
if(b.banners[a].clickTrackingUrls){b.banners[a].clickTrackingUrls=this.modTracking(b.banners[a].clickTrackingUrls)
}}}if(b.overlays){for(var a=0;
a<b.overlays.length;
a++){b.overlays[a].globalDataType=this.getDataTypeName("Overlay");
if(b.overlays[a].clickTrackingUrls){b.overlays[a].clickTrackingUrls=this.modTracking(b.overlays[a].clickTrackingUrls)
}}}if(b.availableSubtitles){for(var a=0;
a<b.availableSubtitles;
a++){b.availableSubtitles[a].globalDataType=this.getDataTypeName("Subtitles")
}}if(b.categories){b.categories=this.modCategories(b.categories)
}if(b.adPattern){b.adPattern.globalDataType=this.getDataTypeName("AdPattern")
}if(b.trackingURLs){b.trackingURLs=this.modTracking(b.trackingURLs)
}if(b.contentCustomData){b.contentCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(b.ownerCustomData){b.ownerCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(b.outletCustomData){b.outletCustomData.globalDataType=this.getDataTypeName("CustomData")
}return b
},modTracking:function(a){for(var b=0;
b<a.length;
b++){a.globalDataType=this.getDataTypeName("TrackingUrl")
}return a
}});
if(window.tpController===undefined){tpController=new oldController()
}else{var tempController=tpController;
tpController=new oldController();
for(var prop in tempController){tpController[prop]=tempController[prop]
}if(window["$pdk"]!==undefined){$pdk.controller=tpController
}}ComponentController=oldController.extend({init:function(c,a,b){this.id=c;
this.component=a;
this.widgetId=this.component&&this.component.widgetId?this.component.widgetId:this.id;
if(typeof(b)==="object"){this.scopes=[c].concat(b)
}else{if(typeof(b)==="string"){this.scopes=[c,b]
}else{this.scopes=[c,"default"]
}}this._super()
},getComponentSize:function(a){return this.callFunction("getComponentSize",[],a)
},dispatchEvent:function(b,a){if(this.scopes&&this.scopes.length){tpController.dispatchEvent(b,a,this.scopes.concat(),this.widgetId)
}else{tpController.dispatchEvent(b,a,null,this.widgetId)
}},removeEventListener:function(a,b){if(this.scopes&&this.scopes.length){tpController.removeEventListener(a,b,this.scopes.concat())
}else{tpController.removeEventListener(a,b)
}},addEventListener:function(a,b){if(this.scopes&&this.scopes.length){tpController.addEventListener(a,b,this.scopes.concat())
}else{tpController.addEventListener(a,b)
}},getProperty:function(b){var a=this.component[b];
if(a===undefined){a=this.component[b.toLowerCase()]
}return a
},setProperty:function(a,b){this.component[a]=b
}});
function printStackTrace(){var k=[];
var c=false;
try{d.dont.exist+=0
}catch(g){if(g.stack){var l=g.stack.split("\n");
for(var d=0,f=l.length;
d<f;
d++){if(l[d].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){k.push(l[d])
}}k.shift();
c=true
}else{if(window.opera&&g.message){var l=g.message.split("\n");
for(var d=0,f=l.length;
d<f;
d++){if(l[d].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){var j=l[d];
if(l[d+1]){j+="at"+l[d+1];
d++
}k.push(j)
}}k.shift();
c=true
}}}if(!c){var b=arguments.callee.caller;
while(b){var h=b.toString();
var a=h.substring(h.indexOf("function")+8,h.indexOf("("))||"anonymous";
k.push(a);
b=b.caller
}}output(k)
}function output(a){alert(a.join("\n\n"))
}ViewController=ComponentController.extend({init:function(b,c,a){this._super(c,a)
},instantiateCard:function(a){return this.callFunction("instantiateCard",[a])
},showCard:function(c,e,f,b,d,a){this.callFunction("showCard",[c,e,f,b,d,a])
},hideCard:function(a,b){this.callFunction("hideCard",[a,b])
},getCard:function(a,b){return this.callFunction("getCard",[a,b])
},getCurrentCard:function(a){return this.callFunction("getCurrentCard",[a])
}});
PlayerController=ViewController.extend({init:function(b,a){this._super("player",b,a)
},getReleaseState:function(){return this.callFunction("getReleaseState",[])
},getMuteState:function(){return this.callFunction("getMuteState",[])
},getFullScreenState:function(){return this.callFunction("getFullScreenState",[])
},loadLayer:function(c,e,b,d,a){return this.callFunction("loadLayer",[c,e,b])
},callLayerFunction:function(c,a,b){return this.callFunction("callLayerFunction",[c,a,b])
}});
if($pdk.bootloaderVersion!==null&&typeof($pdk.bootloaderVersion)==="object"){if("5"!=$pdk.bootloaderVersion.major||"5"!=$pdk.bootloaderVersion.minor||"9"!=$pdk.bootloaderVersion.revision){alert("Error: Bootloader Version and PDK-JS Version do not match.\n\nSomething is seriously wrong.")
}}ComponentTypes=new Object();
ComponentTypes.CATEGORY_LIST="categoryList";
ComponentTypes.CATEGORY_MODEL="categoryModel";
ComponentTypes.CLIP_INFO="clipInfo";
ComponentTypes.COMM_MANAGER="commManager";
ComponentTypes.HEADER="header";
ComponentTypes.JAVASCRIPT="javascript";
ComponentTypes.NAVIGATION="navigation";
ComponentTypes.PLAYER="player";
ComponentTypes.RELEASE_LIST="releaseList";
ComponentTypes.RELEASE_MODEL="releaseModel";
ComponentTypes.SEARCH="search";
ComponentTypes.EXTERNAL="external";
ComponentTypes.LOCAL_ALL="localAll";
ComponentTypes.GLOBAL_ALL="globalAll";
Rectangle=Class.extend({init:function(b,d,c,a){this._x=b?b:0;
this._y=d?d:0;
this._width=c?c:0;
this._height=a?a:0;
this._top=this._y;
this._bottom=this._y+this._height;
this._left=this._x;
this._right=this._x+this._width
},clone:function(){return new Rectangle(this._x,this._y,this._width,this._height)
},x:function(a){if(a!=undefined){if(a<0){a=0
}this._x=a;
this._left=a;
this._right=a+this._width
}return this._x
},y:function(a){if(a!=undefined){if(a<0){a=0
}this._y=a;
this._top=a;
this._bottom=a+this._height
}return this._y
},width:function(a){if(a!=undefined){if(a<0){a=0
}this._width=a;
this._right=a+this._x
}return this._width
},height:function(a){if(a!=undefined){if(a<0){a=0
}this._height=a;
this._bottom=a+this._y
}return this._height
},top:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._y){this._height=0
}else{this._height=this._bottom-a
}this._top=this._y=a
}return this._top
},left:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._x){this._width=0
}else{this._width=this._right-a
}this._left=this._x=a
}return this._left
},bottom:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._y){this._bottom=this._y=a;
this._height=0
}else{this._bottom=a;
this._height=a-this._y
}}return this._bottom
},right:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._x){this._right=this._x=a;
this._width=0
}else{this._right=a;
this._width=a-this._x
}}return this._right
}});
var PlayerEvent=new Object();
PlayerEvent.OnUpdateOverlays="OnUpdateOverlays";
PlayerEvent.OnCheckAdFailed="OnCheckAdFailed";
PlayerEvent.OnStandbyRelease="OnStandbyRelease";
PlayerEvent.OnMediaAreaChanged="OnMediaAreaChanged";
PlayerEvent.onContentAreaChanged="onContentAreaChanged";
PlayerEvent.OnOverlayAreaChanged="OnOverlayAreaChanged";
PlayerEvent.OnReleaseStop="OnReleaseStop";
PlayerEvent.OnBandwidthPreferencesSet="OnBandwidthPreferencesSet";
PlayerEvent.OnFormShown="OnFormShown";
PlayerEvent.OnFlashFullScreen="OnPlayerFullScreen";
PlayerEvent.OnExternalFullScreen="OnExternalFullScreen";
PlayerEvent.OnPlayerPause="OnPlayerPause";
PlayerEvent.OnPlayerUnPause="OnPlayerUnPause";
PlayerEvent.OnNetConnectionClosed="OnNetConnectionClosed";
PlayerEvent.OnTrackActivated="OnTrackActivated";
PlayerEvent.OnPlugInsAboveControlsChanged="OnPlugInsAboveControlsChanged";
PlayerEvent.OnDebug="OnDebug";
PlayerEvent.OnVideoSized="OnVideoSized";
PlayerEvent.OnRelatedContentIdsReceived="OnRelatedContentIdsReceived";
FullScreenManager=Class.extend({init:function(b,a,d){this._controller=b;
this._pbm=a;
this._controller.registerFunction("showFullScreen",this,this.doShowFullScreen);
this._controller.registerFunction("getFullScreenState",this,this.getFullScreenState);
var c=this;
this.flashFullScreenListener=function(f){c.flashFullScreen(f)
};
this._controller.addEventListener("OnFlashFullScreen",this.flashFullScreenListener);
this._controller.addEventListener("OnReleaseStart",function(f){c.onReleaseStart(f)
});
this._controller.addEventListener("OnMediaError",function(){c.doShowFullScreen(false)
});
this._controller.addEventListener("OnMediaAreaChanged",function(){c.onMediaArea(false)
});
window.addEventListener("keydown",function(f){if(f.keyCode===27&&c._isFullWindow){c.doShowFullScreen(false)
}},false);
this._isFullScreen=false;
this._enableFullWindow=d;
this._allowFullScreen=this._controller.getProperty("allowFullScreen")=="false"?false:true
},onReleaseStart:function(a){if(tpIsIOS()&&(this._pbm.videoEngine)&&(this._pbm.videoEngine.isFullScreen()!=this._isFullScreen)){this._isFullScreen=this._pbm.videoEngine.isFullScreen();
this.sendEvt()
}},onMediaArea:function(a){if(this._isFullScreen!=this.isFullScreen()){this._isFullScreen=this.isFullScreen();
this.sendEvt()
}},doShowFullScreen:function(a){if(!this._allowFullScreen&&a){return
}if(this.isFullScreen()!=a){this._isFullScreen=a;
var b=new Object();
b.data=this._isFullScreen;
tpDebug("Going fullscreen");
this.setWebkitFullScreen(b)
}},isFullScreen:function(){var a=this._pbm.video;
var b=a.parentNode.parentNode;
if(this._isFullWindow||(document.webkitIsFullScreen&&this._requestedFullScreen)||b.webkitDisplayingFullscreen||a.webkitDisplayingFullscreen||(document.mozFullScreen&&this._requestedFullScreen)){return true
}else{return this._requestedFullScreen&&this._pbm.videoEngine.isFullScreen()
}},fullscreenChange:function(a){if(!a.isFullScreen){this._isFullScreen=false;
this.sendEvt()
}},setWebkitFullScreen:function(i){var c=i.data;
this._isFullScreen=c;
tpDebug("Trying to set fullscreen to "+c);
var a=(navigator.userAgent.indexOf("Windows")>-1&&navigator.userAgent.indexOf("AppleWebKit")>-1&&navigator.userAgent.toLowerCase().indexOf("chrome")===-1);
var f=this._pbm.video;
var h=this._pbm.videoEngine;
var g=f.parentNode.parentNode;
if(g.webkitRequestFullScreen&&!a){tpDebug("WebKit fullscreen API is apparently supported");
if((document.webkitIsFullScreen||g.webkitDisplayingFullscreen)&&!c){document.webkitCancelFullScreen()
}else{if(c){try{this.handlerFired=false;
if(!this.fsChangeHandler){this.fsChangeHandler=function(){d._isFullScreen=((document.webkitIsFullScreen&&d._requestedFullScreen)||f.webkitDisplayingFullscreen||g.webkitDisplayingFullscreen)==true;
tpDebug("got webkitfullscreenchange event, isFullscreen is "+d._isFullScreen);
if(!d._isFullScreen){g.removeEventListener("webkitfullscreenchange",this.fsChangeHandler)
}if(d._requestedFullScreen){if(!d._isFullScreen){d._requestedFullScreen=false
}d.sendEvt()
}}
}var d=this;
this._requestedFullScreen=true;
g.removeEventListener("webkitfullscreenchange",this.fsChangeHandler);
g.addEventListener("webkitfullscreenchange",this.fsChangeHandler);
setTimeout(this.fsChangeHandler,3000);
g.webkitRequestFullScreen();
d.sendEvt()
}catch(i){this._requestedFullScreen=false;
g.removeChild(blocker);
tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error");
return
}}}return
}else{if(g.mozRequestFullScreen){tpDebug("Moz fullscreen API is apparently supported");
if(document.mozFullScreen&&!c){try{document.mozCancelFullScreen()
}finally{if(document.mozFullScreen){tpDebug("Couldn't exit with mozCancelFullScreen trying to hack the DOM");
var b=g.parentNode;
b.removeChild(g);
b.appendChild(g);
tpDebug("Done trying to hack DOM");
document.removeEventListener("mozfullscreenchange",this.callback);
this.callback=undefined;
this.sendEvt()
}}}else{if(c){try{this._requestedFullScreen=true;
g.mozRequestFullScreen()
}catch(i){tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error");
return
}this.sendEvt();
var d=this;
document.removeEventListener("mozfullscreenchange",this.callback);
this.callback=function(){d._isFullScreen=document.mozFullScreen&&d._requestedFullScreen;
if(!d._isFullScreen){document.removeEventListener("mozfullscreenchange",d.callback);
d.callback=undefined
}if(d._requestedFullScreen){if(!d._isFullScreen){d._requestedFullScreen=false
}d.sendEvt()
}};
document.addEventListener("mozfullscreenchange",this.callback)
}}return
}}if(g.msRequestFullScreen){tpDebug("MS fullscreen API is apparently supported");
if((document.msIsFullScreen||g.msDisplayingFullscreen)&&!c){document.msCancelFullScreen()
}else{if(c){try{this.handlerFired=false;
if(!this.fsChangeHandler){this.fsChangeHandler=function(){d._isFullScreen=(document.msIsFullScreen||f.msDisplayingFullscreen||g.msDisplayingFullscreen)==true;
tpDebug("got msfullscreenchange event, isFullscreen is "+d._isFullScreen);
if(!d._isFullScreen){g.removeEventListener("msfullscreenchange",this.fsChangeHandler)
}if(d._requestedFullScreen){if(!d._isFullScreen){d._requestedFullScreen=false
}d.sendEvt()
}}
}var d=this;
this._requestedFullScreen=true;
g.removeEventListener("msfullscreenchange",this.fsChangeHandler);
g.addEventListener("msfullscreenchange",this.fsChangeHandler);
setTimeout(this.fsChangeHandler,3000);
g.msRequestFullScreen();
d.sendEvt()
}catch(i){g.removeChild(blocker);
tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error");
return
}}}return
}else{if(this._enableFullWindow){tpDebug("No fullscreen API available, using full window");
if(!this.playerContainerStyle){this.playerContainerStyle={}
}this._isFullWindow=false;
if(c){this.playerContainerStyle.position=g.style.position;
this.playerContainerStyle.top=g.style.top;
this.playerContainerStyle.left=g.style.left;
this.playerContainerStyle.bottom=g.style.bottom;
this.playerContainerStyle.right=g.style.right;
this.playerContainerStyle.marginTop=g.style.marginTop;
this.playerContainerStyle.marginLeft=g.style.marginLeft;
this.playerContainerStyle.marginBottom=g.style.marginBottom;
this.playerContainerStyle.marginRight=g.style.marginRight;
this.playerContainerStyle.zIndex=$pdk.jQuery(g).parents(".tpPlayer")[0].style.zIndex;
this.playerContainerStyle.overflowX=$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowX;
this.playerContainerStyle.overflowY=$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowY;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.zIndex=10000;
g.style.position="fixed";
g.style.top="0px";
g.style.left="0px";
g.style.bottom="0px";
g.style.right="0px";
g.style.marginTop="0px";
g.style.marginLeft="0px";
g.style.marginBottom="0px";
g.style.marginRight="0px";
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowX="visible";
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowY="visible";
this._isFullWindow=true
}else{g.style.position=this.playerContainerStyle.position;
g.style.top=this.playerContainerStyle.top;
g.style.left=this.playerContainerStyle.left;
g.style.bottom=this.playerContainerStyle.bottom;
g.style.right=this.playerContainerStyle.right;
g.style.marginTop=this.playerContainerStyle.marginTop;
g.style.marginLeft=this.playerContainerStyle.marginLeft;
g.style.marginBottom=this.playerContainerStyle.marginBottom;
g.style.marginRight=this.playerContainerStyle.marginRight;
g.style.zIndex=this.playerContainerStyle.zIndex;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.zIndex=this.playerContainerStyle.zIndex;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowX=this.playerContainerStyle.overflowX;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowY=this.playerContainerStyle.overflowY
}this._isFullScreen=c;
var d=this;
setTimeout(function(){d.sendEvt()
},10);
return
}else{try{tpDebug("Trying to set VideoEngine fullscreen to "+c);
if(!this.changeListener){var d=this;
this.changeListener=function(j){d.fullscreenChange(j)
};
this._pbm.videoEngine.addEventListener("FULLSCREEN",this.changeListener)
}this._requestedFullScreen=c;
h.setFullScreen(c)
}catch(i){tpDebug("VideoEngine won't support fullscreen");
return
}}}this.sendEvt()
},sendEvt:function(){tpDebug("FullScreen is now:"+this._isFullScreen);
this._controller.dispatchEvent("OnShowFullScreen",this._isFullScreen)
},getFullScreenState:function(){var a;
if(tpIsAndroid()||this._pbm.video.webkitDisplayingFullscreen||this._isFullWindow){a=true
}else{a=false
}if(a!=this._isFullScreen){this._isFullScreen=a;
this.sendEvt()
}return this._isFullScreen
}});
$pdk.ns("$pdk.plugin");
$pdk.plugin.MetadataUrlManager=$pdk.extend(function(){},{constructor:function(a){this._plugins=[];
this._currentQueue=[];
this._context={complete:false,found:false};
this._controller=a;
this._controller.registerFunction("registerMetadataUrlPlugIn",this,this.registerMetadataUrlPlugIn);
this._controller.registerFunction("setMetadataUrl",this,this.setMetadataUrl);
this._controller.registerFunction("setUrl",this,this.setUrl)
},setUrl:function(c,a,b){this._context={releaseUrl:c,isPreview:a,callback:b,complete:false,found:false};
this._currentQueue=this._plugins.concat();
if(this._currentQueue.length===0){b(c);
return true
}else{if(!this._processNextPlugin()){b(c);
return true
}else{return false
}}},setMetadataUrl:function(a){if(this._currentQueue.length===0){if(!this._context.complete){this._context.releaseUrl=a;
this._context.callback(a);
this._context.complete=true
}}else{this._context.releaseUrl=a;
if(!this._processNextPlugin()){this._context.callback(this._context.releaseUrl);
this._context.complete=true
}}},registerMetadataUrlPlugIn:function(b,a){if(typeof(b.rewriteMetadataUrl)!=="function"){throw new Error('Attempt to register MetadataUrlPlugIn with non-conforming interface (plugin method "rewriteMetadataUrl" does not exist or is not a real method)')
}else{if(b.rewriteMetadataUrl.length!==2){throw new Error('Attempt to register MetadataUrlPlugIn with non-conforming interface ("rewriteMetadataUrl" method does not take 2 parameters)')
}}this._plugins.push({plugin:b,priority:Number(a)});
this._plugins=this._sortPluginsByPriority(this._plugins)
},_processNextPlugin:function(){var b=false,a;
while(!b&&this._currentQueue.length>0){a=this._currentQueue.shift();
b=a.plugin.rewriteMetadataUrl(this._context.releaseUrl,this._context.isPreview)
}this._context.found=b?true:this._context.found;
return b
},_sortPluginsByPriority:function(a){return a.sort(function(d,c){return d.priority-c.priority
})
}});
AdManager=Class.extend({adPatternInfo:{cookieName:"",cookiePrefix:"tpPdk",adPolicy:0,mediaCount:0,chapterCount:0},countedRelease:false,init:function(a){this.controller=a;
a.registerFunction("setAds",this,this.setAds);
a.registerFunction("registerAdPlugIn",this,this.registerAdPlugIn);
a.registerFunction("getTimeSinceLastAd",this,this.getTimeSinceLastAd);
this.defaultAdPattern=a.getProperty("adPattern");
this.timeSinceLastAd=0;
this.plugins=new Array();
var b=this;
this.getAdPolicy(a.component.releaseUrl);
this.controller.addEventListener("OnMediaStart",function(c){b.onMediaStart.apply(b,[c])
});
this.controller.addEventListener("OnReleaseStart",function(c){b.onReleaseStart.apply(b,[c])
})
},setAds:function(a){if(a&&(tpIsIOS()||tpIsAndroid()&&this.controller.isPrefetch())){a.isAd=true
}this.controller.insertPlaylist(a)
},registerAdPlugIn:function(a,b,c){this.plugins.push({adPlugIn:a,adType:b,priority:c});
function d(f,e){if(f.priority<e.priority){return -1
}else{if(f.priority>e.priority){return 1
}else{return 0
}}}this.plugins.sort(d)
},getTimeSinceLastAd:function(){return this.timeSinceLastAd
},isAd:function(b){if(b.baseClip.isAd){return true
}else{var a=this.adPlugInsIsAd(b);
b.baseClip.isAd=a;
return a
}},checkAd:function(b){tpDebug("We have "+this.plugins.length+" ad plugins to check");
for(var a=0;
a<this.plugins.length;
a++){var c=this.plugins[a].adPlugIn.checkAd.apply(this.plugins[a].adPlugIn,[b]);
if(c){return true
}}return false
},adPlugInsIsAd:function(b){for(var a=0;
a<this.plugins.length;
a++){if(this.plugins[a].adPlugIn.isAd(b)){return true
}}return false
},validateAd:function(a){if(a.hasPlayed){return false
}var c;
if(a.baseClip.hasOwnProperty("contentCustomData")&&a.baseClip.contentCustomData.hasOwnProperty("adPattern")){c=a.baseClip.contentCustomData.adPattern
}else{c=this.defaultAdPattern
}if(c&&c!=""){var b=this.processAdPattern(c,a.baseClip.isMid);
if(!b){return false
}}return true
},onMediaStart:function(b){var a=b.data.baseClip.isAd?"adplay":"videoplay";
if(a=="videoplay"&&this.adPatternInfo.cookieName!=""){if(!this.countedRelease){this.adPatternInfo.mediaCount++;
this.countedRelease=true
}this.adPatternInfo.chapterCount++;
this.setCookie(this.adPatternInfo.cookieName,this.adPatternInfo.mediaCount+"|"+this.adPatternInfo.chapterCount,null,"/")
}},onReleaseStart:function(a){this.countedRelease=false
},getAdPolicy:function(c){var a=new RegExp("[\\?&]policy=([^&#]*)");
var b=a.exec(c);
if(b){this.adPatternInfo.adPolicy=b[1]
}},processAdPattern:function(c,e){var h=new RegExp("count:([0-9]*)[|]([0-9]*)");
var d=h.exec(c);
if(d){var i=d[1];
var a=d[2];
this.adPatternInfo.cookieName=this.adPatternInfo.cookiePrefix+"_"+this.adPatternInfo.adPolicy;
var b=this.getCookie(this.adPatternInfo.cookieName);
if(b){b=b.split("|")
}if(b&&b.length>1){this.adPatternInfo.mediaCount=b[0];
this.adPatternInfo.chapterCount=b[1]
}if(isNaN(this.adPatternInfo.chapterCount)){this.adPatternInfo.chapterCount=0
}var g=a;
if(!e&&!this.adPatternInfo.mediaCount){this.adPatternInfo.mediaCount=0;
g=i
}if(e&&!this.adPatternInfo.chapterCount){this.adPatternInfo.chapterCount=0;
g=i
}var f=(e?this.adPatternInfo.chapterCount:this.adPatternInfo.mediaCount);
if(f<g){return false
}}if(e){this.adPatternInfo.chapterCount=0
}else{this.adPatternInfo.mediaCount=0
}return true
},setCookie:function(a,d,b,f){var e=new Date();
e.setTime(e.getTime()+(b*3600*1000));
var c=escape(d)+((b==null)?"":"; expires="+e.toUTCString())+((f==null)?"":"; path="+f);
document.cookie=a+"="+c
},getCookie:function(b){var c=document.cookie;
var d=c.indexOf(" "+b+"=");
if(d==-1){d=c.indexOf(b+"=")
}if(d==-1){c=null
}else{d=c.indexOf("=",d)+1;
var a=c.indexOf(";",d);
if(a==-1){a=c.length
}c=unescape(c.substring(d,a))
}return c
}});
tpCategoryList=PDKComponent.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'" class="categoryList"></div>'
},init:function(c,b,a){this.width=b;
this.height=a;
this.id=c;
this.pretty=!navigator.userAgent.match(/MSIE 8/)&&!navigator.userAgent.match(/MSIE 7/)&&!navigator.userAgent.match(/MSIE 6/);
this.ALL={id:"",value:"all",order:"1",title:"All",fullTitle:"All"};
this.MOST_POPULAR={id:"",value:"mostPopular",order:"2",title:"Most Popular",fullTitle:"MostPopular"};
this.FAVORITES={id:"",value:"favorites",order:"3",title:"Favorites",fullTitle:"Favorites"};
this.TOP_RATED={id:"",value:"topRated",order:"4",title:"Top Rated",fullTitle:"TopRated"};
this.RELATED={id:"",value:"related",order:"5",title:"Related Items",fullTitle:"Related"};
if($pdk._isDevMode){this.pretty=false
}this.controller=new ComponentController(c);
this.deferredController=$pdk.shell.Registry.getInstance().getShells().get(c)._deferredController;
this.eventQueue=[]
},initialize:function(){var a=this;
if(this.scopes){this.controller.scopes=[this.id].concat(this.scopes.split(","))
}else{this.controller.scopes=[this.id,"default"]
}if(this.allChoiceLabel){this.ALL.title=this.allChoiceLabel
}if(this.mostPopularChoiceLabel){this.MOST_POPULAR.title=this.mostPopularChoiceLabel
}if(this.favoritesChoiceLabel){this.FAVORITES.title=this.favoritesChoiceLabel
}if(this.topRatedChoiceLabel){this.TOP_RATED.title=this.topRatedChoiceLabel
}if(this.relatedChoiceLabel){this.RELATED.title=this.relatedChoiceLabel
}this.controller.addEventListener("OnRefreshCategoryModel",function(){a.handleCategoryModelRefreshed.apply(a,arguments)
});
this.deferredController.addEventListener("OnRefreshCategoryModel",function(){a.handleCategoryModelRefreshed.apply(a,arguments)
});
this.controller.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.deferredController.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.currentIndex=-1
},write:function(b){if(this.autoLoad===undefined){this.autoLoad=true
}if(b){this.container=b
}else{document.write('<div id="'+this.id+'" class="categoryList"></div>');
this.container=document.getElementById(this.id);
this.container.style.width=this.width;
this.container.style.height=this.height
}this.style=document.createElement("style");
var a=document.getElementsByTagName("head")[0];
this.style.setAttribute("type","text/css");
a.appendChild(this.style);
this.initialize()
},_bindElement:function(a){if(this.autoLoad==null){this.autoLoad=true
}this.container=a;
this.container.style.width=this.width;
this.container.style.height=this.height;
tpController.ready();
return this.container
},categoryUrlsAreEqual:function(b,a,c){b=b.replace(/(.*)\?.*/,"$1");
a=a.replace(/(.*)\?.*/,"$1");
return b===a||b.indexOf(c)>=0
},setTileSelected:function(a){var b=-1;
this.currentCategory=a;
if(!this.sortedEntries){return
}for(var c=0;
c<this.sortedEntries.length;
c++){if(a==this.sortedEntries[c].title){b=c;
var d=this.items[c];
if(d!==undefined){d.className="tpCategory tpCategorySelected"
}}else{var d=this.items[c];
if(d!==undefined){d.className="tpCategory"
}}}return b
},refresh:function(){var d=document.createElement("div");
var c=document.createElement("div");
var b=this.framecolor?this.framecolor:"#000000";
var a=this.backgroundcolor?this.backgroundcolor:"#ffffff";
b=b.replace("0x","#");
a=a.replace("0x","#");
d.className="tpBackground";
d.style.backgroundColor=a;
d.style.borderColor=b;
c.className="tpBackgroundShine tpGradient";
this.container.innerHTML="";
this.container.appendChild(d);
this.container.appendChild(c)
},isPrefetch:function(){return this.controller.isPrefetch()
},isMostPopularRequest:function(a){if(a.indexOf("&sort=updated%7Cdesc")>=0||a.indexOf("?sort=updated%7Cdesc")>=0){return true
}else{return false
}},handleReleaseModelRefreshed:function(a){if(a.data.category){this.setTileSelected(a.data.category)
}else{if(a.data.search){this.setTileSelected(null)
}else{if(a.data.requestUrl&&this.isMostPopularRequest(a.data.requestUrl)){this.setTileSelected(this.mostPopularChoiceLabel)
}else{this.setTileSelected(this.allChoiceLabel)
}}}},handleCategoryModelRefreshed:function(p){if(this.paging){this.eventQueue.push(p);
return
}this.loading=false;
$pdk.jQuery(this.loadingIndicator).stop();
$pdk.jQuery(this.loadingIndicator).remove();
var c=p.data;
var y=(this.feed&&this.feed.search!==c.search?true:false);
var B;
var d;
var C;
var z;
if(this.feed&&this.feed.range&&c&&c.range){if(c.entries.length>0){this.paging=true
}if(this.feed.range.startIndex<c.range.startIndex){this.animateForward=true
}else{if(this.feed.range.startIndex>c.range.startIndex){this.animateForward=false
}}}else{this.animateForward=false
}this.feed=c;
this.loadedTiles=[];
this.numTiles=c.entries.length;
if(!this.currentPage||y||!this.pretty){this.refresh();
this.currentPage=null;
this.previousPage=null
}var b=-1;
var n=-1;
var k=0;
if(this.hasoverlay=="true"){var m=document.createElement("div");
m.className="tpCategoryListOverlay";
this.container.appendChild(m);
k=m.clientHeight
}var u=document.createElement("ul");
if(this.flow=="horizontal"){u.className="tpMenu"
}else{u.className="tpList"
}this.container.appendChild(u);
$pdk.jQuery(u).css("margin-top",parseInt($pdk.jQuery(u).css("margin-top"))+k);
u.ontouchstart=function(a){this.startX=a.changedTouches[0].pageX;
this.startY=a.changedTouches[0].pageY
};
u.ontouchend=function(a){if(this.startX&&((this.startX-a.changedTouches[0].pageX)>100)){$pdk.controller.nextRange()
}else{if(this.startX&&((a.changedTouches[0].pageX-this.startX)>100)){$pdk.controller.previousRange()
}}};
this.items=[];
var x,t,z,v,s,j,e,C,o;
var f=($pdk.jQuery(u).innerWidth());
var r=($pdk.jQuery(u).innerHeight());
var l={};
for(var q=0;
q<c.entries.length;
q++){l[c.entries[q].id]=c.entries[q]
}this.sortedEntries=[];
for(var q=0;
q<c.entries.length;
q++){if(l[c.entries[q].parentId]){console.log("skipping non root cat: "+c.entries[q].title)
}else{this.sortedEntries.push(c.entries[q])
}}this.sortedEntries.sort(function(i,h){if(parseInt(i.order,10)==parseInt(h.order,10)){if(i.title<h.title){return -1
}else{if(i.title>h.title){return 1
}else{return 0
}}}else{return parseInt(i.order,10)-parseInt(h.order,10)
}});
if(this.allChoiceIndex>0){this.sortedEntries.splice(this.allChoiceIndex-1,0,this.ALL)
}if(this.mostPopularChoiceIndex>0){this.sortedEntries.splice(this.mostPopularChoiceIndex-1,0,this.MOST_POPULAR)
}if(this.favoritesChoiceIndex>0){this.sortedEntries.splice(this.favoritesChoiceIndex-1,0,this.FAVORITES)
}if(this.topRatedChoiceIndex>0){this.sortedEntries.splice(this.topRatedChoiceIndex-1,0,this.TOP_RATED)
}for(var q=0;
q<this.sortedEntries.length;
q++){x=document.createElement("li");
t=document.createElement("div");
z=document.createElement("a");
v=document.createElement("div");
j=document.createElement("div");
e=document.createElement("div");
C=document.createElement("h2");
x.className="tpCategory";
if(this.pretty){t.className="tpShine"
}v.className="tpInfo";
j.className="tpMetadata";
e.className="tpGroup";
C.className="tpTitle";
x.appendChild(t);
x.appendChild(z);
z.appendChild(v);
if(this.showTitle){this.showMetadata=true;
v.appendChild(j);
j.appendChild(e);
e.appendChild(C)
}u.appendChild(x);
this.items.push(x);
if(this.flow=="horizontal"){x.style.height=r+"px"
}else{x.style.width=f+"px"
}z.style.borderBottomWidth="0px";
z.href="#";
z.category=this.sortedEntries[q];
z.index=q;
var A=this;
z.onclick=function(){if(A.currentClip&&A.currentClip.baseClip&&A.currentClip.baseClip.noSkip){return
}A.wasSetByCategoryList=true;
A.currentIndex=this.index;
A.controller.dispatchEvent("OnCategorySelected",this.category.fullTitle);
if(this.category.fullTitle==A.MOST_POPULAR.fullTitle){A.controller.refreshReleaseModel("",null,null,null)
}else{if(this.category.fullTitle=="Favorites"||this.category.fullTitle=="TopRated"||this.category.fullTitle=="Related"){}else{if(this.category.fullTitle=="All"){A.controller.refreshReleaseModel("",null,null,null)
}else{A.controller.refreshReleaseModel(this.category.title,null,null,null,null,null,null,null,"")
}}}return false
};
if(this.showTitle){C.innerHTML+=this.sortedEntries[q].title
}if($pdk.jQuery(x).offset().top+$pdk.jQuery(x).height()>$pdk.jQuery(u).offset().top+$pdk.jQuery(u).innerHeight()){this.items.pop();
u.removeChild(x);
break
}else{if($pdk.jQuery(x).offset().left+$pdk.jQuery(x).width()>$pdk.jQuery(u).offset().left+$pdk.jQuery(u).innerWidth()){this.items.pop();
u.removeChild(x);
break;
if(!this.more){}}}}var A=this;
setTimeout(function(){A.doInitialLoad(c)
},1);
if(this.style&&!this.createdColorizationStyles){this.createdColorizationStyles=true;
var g="";
if(this.itembackgroundcolor){g+="#"+this.id+".tpCategoryList>ul .tpCategory, ul#"+this.id+".tpCategoryList .tpCategory { background-color: #"+this.itembackgroundcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList>ul .tpCategory .tpMetadata, ul#"+this.id+".tpCategoryList .tpCategory { background-color: #"+this.itembackgroundcolor.substr(2)+"; }"
}if(this.itemframecolor){g+="#"+this.id+".tpCategoryList .tpCategory { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory a { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory .tpShine { background-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory .tpShine { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList ul { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList ol { border-color: #"+this.itemframecolor.substr(2)+"; }"
}if(this.textframecolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpMetadata { border-color: #"+this.textframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory a .tpMetadata .tpGroup { border-color: #"+this.textframecolor.substr(2)+"; }"
}if(this.textframeselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected .tpMetadata { border-color: #"+this.textframeselectedcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategorySelected a .tpMetadata .tpGroup { border-color: #"+this.textframeselectedcolor.substr(2)+"; }"
}if(this.textcolor){g+="#"+this.id+".tpCategoryList .tpCategory a { color: #"+this.textcolor.substr(2)+"; }"
}if(this.thumbnailframecolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail { border-color: #"+this.thumbnailframecolor.substr(2)+"; }"
}if(this.thumbnailbackgroundcolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail { background-color: #"+this.thumbnailbackgroundcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail img { background-color: #"+this.thumbnailbackgroundcolor.substr(2)+"; }"
}if(this.thumbnailpaddingcolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail { background-color: #"+this.thumbnailpaddingcolor.substr(2)+"; }"
}if(this.framecolor){}if(this.texthighlighthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover .tpShine { background-color: #"+this.texthighlighthovercolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory:hover .tpShine { border-color: #"+this.texthighlighthovercolor.substr(2)+"; }"
}if(this.texthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover a { color: #"+this.texthovercolor.substr(2)+"; }"
}if(this.texthighlighthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover a .tpMetadata .tpGroup { border-color: #"+this.texthighlighthovercolor.substr(2)+" !important; }"
}if(this.thumbnailhighlighthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover a .tpThumbnail { border-color: #"+this.thumbnailhighlighthovercolor.substr(2)+" !important; }"
}if(this.itemshineselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected .tpShine { background-color: #"+this.itemshineselectedcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategorySelected .tpShine { border-color: #"+this.itemshineselectedcolor.substr(2)+"; }"
}if(this.textselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected a { color: #"+this.textselectedcolor.substr(2)+"; }"
}if(this.texthighlightselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected a .tpMetadata .tpGroup { border-color: #"+this.texthighlightselectedcolor.substr(2)+" !important; }"
}if(this.thumbnailhighlightselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected a .tpThumbnail { border-color: #"+this.thumbnailhighlightselectedcolor.substr(2)+" !important; }"
}if(this.itemshineselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected:hover .tpShine { background-color: #"+this.itemshineselectedcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategorySelected:hover .tpShine { border-color: #"+this.itemshineselectedcolor.substr(2)+"; }"
}if(this.textselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected:hover a { color: #"+this.textselectedcolor.substr(2)+"; }"
}if(this.backgroundcolor&&this.itembackgroundcolor&&this.framecolor){g+=".tpCategoryList ::-webkit-scrollbar                     { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-webkit-scrollbar-track               { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-webkit-scrollbar-thumb               { background-color: #"+this.itembackgroundcolor.substr(2)+"; border-color: #"+this.framecolor.substr(2)+"}\n";
g+=".tpCategoryList ::-moz-scrollbar                     { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-moz-scrollbar-track               { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-moz-scrollbar-thumb               { background-color: #"+this.itembackgroundcolor.substr(2)+"; border-color: #"+this.framecolor.substr(2)+"}\n"
}if(this.style.styleSheet){this.style.styleSheet.cssText=g
}else{this.style.appendChild(document.createTextNode(g))
}}if(this.currentCategory){this.currentIndex=this.setTileSelected(this.currentCategory)
}},doInitialLoad:function(a){},disable:function(){if(tpIsIPhone()||tpIsAndroid()){return
}if(!this.blocker){this.blocker=document.createElement("div");
this.blocker.style.width="100%";
this.blocker.style.height="100%";
this.blocker.style.position="absolute";
this.blocker.style.top="0";
this.blocker.style.left="0";
this.blocker.style.background="black";
this.blocker.style.opacity="0.75";
this.blocker.style.filter="alpha(opacity=75)";
this.blocker.innerHTML="&nbsp;";
this.blocker.style.zIndex="500";
this.container.appendChild(this.blocker)
}this.blocker.style.display="";
var a=this.container.childNodes;
for(child in a){if(child.style){child.style.opacity="0.75";
child.style.filter="alpha(opacity=75)"
}}},enable:function(){tpDebug("Doing enable");
try{if(this.blocker){this.blocker.style.display="none"
}var b=this.container.childNodes;
for(child in b){if(child.style){child.style.opacity="";
child.style.filter=""
}}}catch(a){tpDebug("enabled() threw an error with "+a.message+" on "+a.lineNumber)
}},output:function(b){var a="";
for(prop in b){a+=prop+": "+b[prop]+"\n"
}alert(a)
}});
CategoryList=tpCategoryList;
ClipWrapperManager=Class.extend({init:function(a){this.controller=a;
this.initialize()
},initialize:function(){this.controller.registerFunction("registerClipWrapperPlugIn",this,this.registerCWPlugin);
this.controller.registerFunction("setClipWrapper",this,this.setClipWrapper)
},registerCWPlugin:function(d,b){if(!b){b=0
}if(!this.plugIns){this.plugIns=new Array()
}var f={plugin:d,priority:b};
var c=false;
for(var a=0;
a<this.plugIns.length;
a++){var e=this.plugIns[a];
if(f.priority<=e.priority){this.plugIns.splice(a,0,f);
c=true;
break
}}if(!c){this.plugIns.push(f)
}},processClip:function(b){if(this.currentClip){throw"the clipWrapperManager did not complete wrapping one clip before another was started"
}if(b.isWrappingClip||!this.plugIns){return false
}if(b.wasWrapped){b.wasWrapped=false;
return false
}var d=false;
var e={clip:b};
this.currentClip=b;
for(var a=0;
a<this.plugIns.length;
a++){var c=this.plugIns[a];
if(c.plugin.wrapClip(e)){d=true;
break
}}if(!d){this.currentClip=null
}return d
},setClipWrapper:function(a){if(this.currentClip){this.currentClip.wasWrapped=true;
this.currentClip=null;
this.controller.wrapClip(a.preRolls,a.postRolls)
}}});
ControlsManager=EventDispatcher.extend({init:function(a,b,c){this.controller=a;
this._controllerDeferred=b;
this.controlsManager=c;
this.releaseStarted=false;
this._buildListeners()
},initialize:function(b,c){this.successCallback=b;
this.errorCallback=c;
var h=this.controller.getProperty("skinUrl");
if(h&&(h.indexOf(location.hostname)!=-1||h.indexOf("http")!=-1)){this.skinUrl=h
}else{this.skinUrl=h?$pdk.scriptRoot+h:$pdk.scriptRoot+"/../../pdk/skins/cinematic/cinematic.json"
}this.parentNode=document.getElementById(this.controller.id+".controls");
this.isPreview=true;
var g=this;
this.endCardID=this.controller.getProperty("endCard");
var d=this.controller.getProperty("layoutUrl");
var e=this.controller.getProperty("layout");
var a=this.controller.getProperty("useNativeControls")=="true";
var f=this.controller.getProperty("useDefaultPlayOverlay")=="true"||this.controller.getProperty("showControlsBeforeVideo")=="false";
if(f&&!a){setTimeout(function(){c(false,a)
},1)
}if(!a){setTimeout(function(){g.parseMetaLayout(d,e)
},1)
}else{setTimeout(function(){c(false,true)
},1)
}},_buildListeners:function(){this.listeners={};
var a=this;
this.listeners.end=function(b){a.onMediaEnd(b)
};
this.listeners.fullscreen=function(b){a.onShowFullScreen(b)
};
this.listeners.getlanguage=function(b){a.onGetSubtitleLanguage(b)
};
this.listeners.loadStart=function(b){a.onMediaLoadStart(b)
};
this.listeners.loading=function(b){a.onMediaLoading(b)
};
this.listeners.loadrelease=function(b){a.onLoadRelease(b)
};
this.listeners.loadreleaseurl=function(b){a.onLoadRelease(b)
};
this.listeners.mute=function(b){a.onMute(b)
};
this.listeners.paused=function(b){a.onMediaPause(b)
};
this.listeners.playing=function(b){a.onMediaPlaying(b)
};
this.listeners.releaseend=function(b){a.onReleaseEnd(b)
};
this.listeners.releasestart=function(b){a.onReleaseStart(b)
};
this.listeners.resize=function(b){a.onResize(b)
};
this.listeners.seek=function(b){a.onMediaSeek(b)
};
this.listeners.setreleaseurl=function(b){a.onSetReleaseURL(b)
};
this.listeners.showcard=function(b){a.onShowCard(b)
};
this.listeners.hidecard=function(b){a.onHideCard(b)
};
this.listeners.showplayoverlay=function(b){a.onShowPlayOverlay(b)
};
this.listeners.start=function(b){a.onMediaStart(b)
};
this.listeners.unpaused=function(b){a.onMediaUnpause(b)
};
this.listeners.volumechange=function(b){a.onVolumeChange(b)
};
this.listeners.noSkipChanged=function(b){a.onNoSkipChanged(b)
};
this.listeners.setShowControls=function(b,c){a.setShowControls(b,c)
};
this.listeners.setPlayerLayoutUrl=function(b){a.setPlayerLayoutUrl(b)
};
this.listeners.setPlayerLayoutXml=function(b){a.setPlayerLayoutXml(b)
};
this.listeners.clearcurrentrelease=function(b){a.onClearCurrentRelease(b)
};
this._controllerDeferred.addEventListener("OnGetSubtitleLanguage",this.listeners.getlanguage);
this._controllerDeferred.addEventListener("OnLoadRelease",this.listeners.loadrelease);
this._controllerDeferred.addEventListener("OnLoadReleaseUrl",this.listeners.loadreleaseurl);
this._controllerDeferred.addEventListener("OnMediaEnd",this.listeners.end);
this._controllerDeferred.addEventListener("OnMediaLoadStart",this.listeners.loadStart);
this._controllerDeferred.addEventListener("OnMediaLoading",this.listeners.loading);
this._controllerDeferred.addEventListener("OnMediaPause",this.listeners.paused);
this._controllerDeferred.addEventListener("OnMediaPlaying",this.listeners.playing);
this._controllerDeferred.addEventListener("OnMediaSeek",this.listeners.seek);
this._controllerDeferred.addEventListener("OnMediaStart",this.listeners.start);
this._controllerDeferred.addEventListener("OnMediaUnpause",this.listeners.unpaused);
this._controllerDeferred.addEventListener("OnMute",this.listeners.mute);
this._controllerDeferred.addEventListener("OnReleaseEnd",this.listeners.releaseend);
this._controllerDeferred.addEventListener("OnClearCurrentRelease",this.listeners.clearcurrentrelease);
this._controllerDeferred.addEventListener("OnReleaseStart",this.listeners.releasestart);
this._controllerDeferred.addEventListener("OnResize",this.listeners.resize);
this._controllerDeferred.addEventListener("OnSetReleaseUrl",this.listeners.setreleaseurl);
this._controllerDeferred.addEventListener("OnShowCard",this.listeners.showcard);
this._controllerDeferred.addEventListener("OnHideCard",this.listeners.hidecard);
this._controllerDeferred.addEventListener("OnShowFullScreen",this.listeners.fullscreen);
this._controllerDeferred.addEventListener("OnShowPlayOverlay",this.listeners.showplayoverlay);
this._controllerDeferred.addEventListener("OnVolumeChange",this.listeners.volumechange);
this._controllerDeferred.addEventListener("OnNoSkipChanged",this.listeners.noSkipChanged);
this._controllerDeferred.registerFunction("setShowControls",this,this.listeners.setShowControls);
this._controllerDeferred.registerFunction("setPlayerLayoutUrl",this,this.listeners.setPlayerLayoutUrl);
this._controllerDeferred.registerFunction("setPlayerLayoutXml",this,this.listeners.setPlayerLayoutXml)
},addListeners:function(){var a=this;
this.controller.addEventListener("OnGetSubtitleLanguage",this.listeners.getlanguage);
this.controller.addEventListener("OnLoadRelease",this.listeners.loadrelease);
this.controller.addEventListener("OnLoadReleaseUrl",this.listeners.loadreleaseurl);
this.controller.addEventListener("OnMediaEnd",this.listeners.end);
this.controller.addEventListener("OnMediaLoadStart",this.listeners.loadStart);
this.controller.addEventListener("OnMediaLoading",this.listeners.loading);
this.controller.addEventListener("OnMediaPause",this.listeners.paused);
this.controller.addEventListener("OnMediaPlaying",this.listeners.playing);
this.controller.addEventListener("OnMediaSeek",this.listeners.seek);
this.controller.addEventListener("OnMediaStart",this.listeners.start);
this.controller.addEventListener("OnMediaUnpause",this.listeners.unpaused);
this.controller.addEventListener("OnMute",this.listeners.mute);
this.controller.addEventListener("OnReleaseEnd",this.listeners.releaseend);
this.controller.addEventListener("OnClearCurrentRelease",this.listeners.clearcurrentrelease);
this.controller.addEventListener("OnReleaseStart",this.listeners.releasestart);
this.controller.addEventListener("OnResize",this.listeners.resize);
this.controller.addEventListener("OnSetReleaseUrl",this.listeners.setreleaseurl);
this.controller.addEventListener("OnShowCard",this.listeners.showcard);
this.controller.addEventListener("OnHideCard",this.listeners.hidecard);
this.controller.addEventListener("OnShowFullScreen",this.listeners.fullscreen);
this.controller.addEventListener("OnShowPlayOverlay",this.listeners.showplayoverlay);
this.controller.addEventListener("OnVolumeChange",this.listeners.volumechange);
this.controller.addEventListener("OnNoSkipChanged",this.listeners.noSkipChanged);
this.controller.registerFunction("setShowControls",this,this.listeners.setShowControls);
this.controller.registerFunction("setPlayerLayoutUrl",this,this.listeners.setPlayerLayoutUrl);
this.controller.registerFunction("setPlayerLayoutXml",this,this.listeners.setPlayerLayoutXml)
},setPlayerLayoutUrl:function(a){this.controlsManager.setPlayerLayoutUrl(a)
},setPlayerLayoutXml:function(a){this.controlsManager.setPlayerLayoutXml(a)
},onNoSkipChanged:function(b){var a=b.data;
if(a.baseClip.isAd&&!a.baseClip.noSkip){this.controlsManager.enableNext(true);
this.enableNextOnControlsChanged=true
}},parseMetaLayout:function(c,d){var g=this;
if(this.skinUrl.indexOf(".swf")!=-1){tpDebug("You're trying to use a swf skin with an HTML5 player, this won't work. Use a JSON skin",this.controller.id,"ControlsManager",tpConsts.WARN);
this.errorCallback();
return
}g.addListeners();
tpDebug("Parsed metalayout, controls should appear");
var a=g.controller.supportsFullScreen()!=false&&g.controller.getProperty("allowFullScreen")!="false";
var f=g.controller.supportsMute()!=false;
var e=g.controller.supportsVolume()!=false;
var h=g.controller.checkIfEndCardExists()!=false;
tpDebug("SupportsFullScreen is "+a);
g.controller.hidePlayerCard("none");
g.controlsManager.supportsMute(f);
g.controlsManager.supportsVolume(e);
g.controlsManager.supportsFullScreen(a);
g.controlsManager.supportsMenuCard(h);
g.controlsManager.setIsFullScreen(false);
g.controlsManager.setIsPreview(g.isPreview);
g.controlsManager.setFullScreen(false);
g.controlsManager.hasCC(false);
var b=this.releaseStarted;
g.controlsManager.releaseStarted(b);
g.controlsManager.syncState();
g.releaseStarted=b;
g.controller.getSubtitleLanguage();
g.successCallback()
},onSetReleaseURL:function(a){this.releaseStarted=false;
this.controlsManager.releaseStarted(false);
this.controlsManager.hasCC(false);
this.controlsManager.releaseLoaded()
},onLoadRelease:function(c){this.releaseStarted=false;
this.controlsManager.releaseStarted(false);
this.controlsManager.releaseLoaded();
this.setTimes(0,c.data.duration);
this.controlsManager.setPercentLoaded(0);
this.controlsManager.setClipTitle(c.data.title);
if(c.data&&c.data.captions&&c.data.captions.length>0){var b=c.data.captions;
var f=[];
for(var a=0;
a<b.length;
a++){var d=b[a].lang?b[a].lang:b[a].language;
if(d){f.push(d)
}}if(f.length){this.controlsManager.setSubtitleLanguages(f)
}}},onShowPlayOverlay:function(a){if(!this.releaseStarted){this.controlsManager.releaseStarted(false);
tpDebug("onShowPlayOverlay Setting isPreview "+a.data);
this.controlsManager.setIsPreview(a.data);
this.isPreview=a.data
}},onHideCard:function(b){var a=b.data;
this.controlsManager.cardShowing(false,a.card,a.deck)
},onShowCard:function(b){var a=b.data;
this.controlsManager.cardShowing(true,a.card,a.deck)
},onReleaseStart:function(d){var a=d.data;
if(!a){return
}this.releaseStarted=true;
this.releaseLength=a.chapters.aggregateLength;
var c=[];
for(var b=1;
b<a.chapters.chapters.length;
b++){c.push(a.chapters.chapters[b].aggregateStartTime/this.releaseLength)
}this.currentChapters=c;
this.controlsManager.setPercentLoaded(0);
this.controlsManager.releaseStarted(true);
if(a.clips&&a.clips.length>0){if(a.clips.isAd){this.controlsManager.setClipTitle("")
}else{this.controlsManager.setClipTitle(a.clips[0].title)
}}tpDebug("Setting isPreview false");
this.controlsManager.setIsPreview(false);
this.isPreview=false
},onClearCurrentRelease:function(a){this.onReleaseEnd(a);
this.controlsManager.releaseCleared()
},onReleaseEnd:function(a){this.controlsManager.clearImageTracks();
this.releaseStarted=false;
this.controlsManager.setSubtitleLanguages([]);
this.controlsManager.setPercentLoaded(0);
this.setTimes(0,1);
this.controlsManager.releaseStarted(false);
this.controlsManager.pause();
this.controlsManager.hasCC(false);
this.controlsManager.setChapterPoints([]);
this.currentChapters=[]
},onMediaLoadStart:function(d){var c=d.data;
this.controlsManager.mediaNoSkip(c.baseClip.noSkip);
this.controlsManager.setIsAd(c.baseClip.isAd);
this.controlsManager.isAd(c.baseClip.isAd);
if(c.baseClip.isAd){this.controlsManager.setClipTitle("")
}else{this.controlsManager.setClipTitle(c.title)
}if(c.chapter&&c.chapter.chapters){this.setTimes(c.chapter.aggregateStartTime+c.offset,c.chapter.chapters.aggregateLength);
if(!c.baseClip.isAd&&!c.baseClip.noSkip&&this.controller.supportsSeek()){this.controlsManager.setChapterPoints(!this.currentChapters?[]:this.currentChapters)
}else{this.controlsManager.setChapterPoints([])
}}else{if(c.baseClip.trueLength>0){this.setTimes(c.startTime+c.offset,c.baseClip.trueLength)
}else{if(c.baseClip.isAd){this.setTimes(0,c.length)
}else{this.setTimes(c.startTime+c.offset,this.releaseLength)
}}this.controlsManager.setChapterPoints([])
}if(c.baseClip.availableImageTracks&&typeof(c.baseClip.availableImageTracks)&&c.baseClip.availableImageTracks.length>0&&!c.baseClip.isAd){for(var a=0;
a<c.baseClip.availableImageTracks.length;
a++){var b=c.baseClip.availableImageTracks[a]
}this.controlsManager.setAvailableImageTracks(c.baseClip.availableImageTracks)
}if(c.baseClip.isAd){this.controlsManager.setPercentLoaded(0)
}this.controlsManager.syncState()
},onMediaStart:function(g){tpDebug("Setting isPreview false");
this.controlsManager.setIsPreview(false);
this.isPreview=false;
var d=g.data;
var c=d.baseClip.availableSubtitles!==null&&typeof(d.baseClip.availableSubtitles)&&d.baseClip.availableSubtitles.length>0;
this.controlsManager.setIsAd(d.baseClip.isAd);
var a=this.controller.supportsFullScreen();
this.controlsManager.supportsFullScreen(a);
this.controlsManager.hasCC(c);
this.controlsManager.mediaStarted();
this.controlsManager.mediaNoSkip(d.baseClip.noSkip);
this.controlsManager.isAd(d.baseClip.isAd);
if(d.baseClip.isAd){this.controlsManager.setClipTitle("")
}else{this.controlsManager.setClipTitle(d.title)
}if(!d.baseClip.isAd&&!d.baseClip.noSkip&&this.controller.supportsSeek()){this.controlsManager.setChapterPoints(!this.currentChapters?[]:this.currentChapters)
}var f=d.baseClip.availableSubtitles;
var h=[];
for(var b=0;
b<f.length;
b++){h.push(f[b].language)
}this.controlsManager.setSubtitleLanguages(h)
},onMediaSeek:function(a){this.isPlaying=false;
if(a.data.end.durationAggregate){this.setTimes(a.data.end.currentTimeAggregate,a.data.end.durationAggregate)
}else{if(a.data.clip.chapter){this.setTimes(a.data.end.currentTimeAggregate,a.data.clip.chapter.chapters.aggregateLength)
}else{this.setTimes(a.data.end.currentTimeAggregate,this.releaseLength)
}}},setTimes:function(b,a){this.controlsManager.setTimes(b,a)
},onMediaLoading:function(a){this.controlsManager.setPercentLoaded(a.data.ratioLoaded)
},onMediaEnd:function(c){var b=c.data;
if((b.baseClip.isAd||b.baseClip.noSkip)&&b.currentMediaTime>0){this.setTimes(0,0)
}this.isPlaying=false;
var a=this;
this.controlsManager.clearImageTracks();
if(this.enableNextOnControlsChanged){this.controlsManager.enableNext(false);
this.enableNextOnControlsChanged=false
}},onMediaPlaying:function(a){if(!this.releaseStarted){this.releaseStarted=true;
this.controlsManager.releaseStarted(false);
this.controlsManager.releaseStarted(this.releaseStarted)
}this.controlsManager.setIsPreview(false);
if(!this.isPlaying){this.isPlaying=true;
this.controlsManager.play()
}if(a.data.currentTimeAggregate!==undefined){if(a.data.durationAggregate>0){this.setTimes(a.data.currentTimeAggregate,a.data.durationAggregate)
}else{this.setTimes(a.data.currentTimeAggregate,this.releaseLength)
}}else{if(a.data.duration>0){this.setTimes(a.data.currentTime,a.data.duration)
}else{this.setTimes(a.data.currentTime,this.releaseLength)
}}},onMediaPause:function(a){this.isPlaying=false;
this.controlsManager.pause()
},onMediaUnpause:function(a){this.isPlaying=true;
this.controlsManager.play()
},onMute:function(a){this.controlsManager.mute(a.data)
},onVolumeChange:function(a){this.controlsManager.setVolume(a.data/100)
},onShowFullScreen:function(a){this.controlsManager.setIsFullScreen(a.data);
this.controlsManager.setFullScreen(a.data)
},onGetSubtitleLanguage:function(a){var b=a.data.langCode;
this.controlsManager.setSubtitleLanguage(b)
},onResize:function(a){this.controlsManager.setSize(a.data.width+"px",a.data.height+"px")
},setShowControls:function(a,b){this.controller.dispatchEvent("OnShowControls",{visible:a,regionId:b})
}});
ErrorManager=Class.extend({init:function(a,b){this.controller=a;
this.player=b;
this.controller.registerFunction("sendError",this,this.sendError)
},sendError:function(b){var e=b.clip;
if(e&&e.baseClip.failOverClips.length>0){var d=e.baseClip.failOverClips[0];
var c=com.theplatform.pdk.SelectorExported.clipFromBaseClip(d);
if(e.baseClip.failOverClips.length>1){var a=e.baseClip.failOverClips;
a.splice(0,1);
c.baseClip.failOverClips=a
}else{c.baseClip.failOverClips=[]
}var f=$.extend(true,{},e);
f.URL=c.URL;
f.baseClip=c.baseClip;
f.id=c.id;
this.player.doMediaLoadStart(f)
}else{this.controller.dispatchEvent("OnMediaError",b)
}}});
var tpJsonContexts=new Object();
function tpRegisterJsonContext(b){var a=(((1+Math.random())*65536)|0).toString(16).substring(1);
tpJsonContexts[a]=b;
return a
}function tpJSONLoaderCallback(b,a){tpJsonContexts[a](b)
}JSONLoader=Class.extend({init:function(){},load:function(a,i,b,g,e,f){if(!b){b="callback"
}if(!e){e="context"
}if(!g){g="tpJSONLoaderCallback"
}var c=tpRegisterJsonContext(function(){i(arguments[0],a)
});
if(a.indexOf("?")>=0){a+="&"+b+"="+g+"&"+e+"="+c
}else{a+="?"+b+"="+g+"&"+e+"="+c
}var d=document.getElementsByTagName("head")[0];
var h=document.createElement("script");
h.type="text/javascript";
h.src=a;
h.onerror=function(j){tpDebug("Failed to load "+h.src);
if(typeof(f)==="function"){f(j)
}};
d.appendChild(h)
}});
OverlayManager=Class.extend({init:function(a,b){this.controller=a;
this.playerElement=b;
var c=this;
this.controller.registerFunction("getOverlayArea",this,this.getOverlayArea);
this.controller.registerFunction("setOverlayArea",this,this.setOverlayArea);
this.controller.addEventListener("OnMediaAreaChanged",function(d){c.mediaAreaChanged(d)
})
},getBrowserOffset:function(){if(this.controller.component.videoengineruntime&&this.controller.component.videoengineruntime==="silverlight"){return 38
}if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){return 32
}if(navigator.userAgent.toLowerCase().indexOf("msie")>-1){return 42
}if(tpIsIOS()){return 54
}if(navigator.userAgent.toLowerCase().indexOf("safari")>-1){return 24
}if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){return 28
}return 35
},setOverlayArea:function(a){this.useNativeDefaults=false;
this.overlayArea=a;
this.controller.dispatchEvent("OnOverlayAreaChanged",this.getOverlayArea())
},getOverlayArea:function(b){if(this.overlayArea){return this.overlayArea
}var a={};
var c=!this.useNativeDefaults?this.getBrowserOffset():0;
a.height=this.playerElement.clientHeight-c;
a.width=this.playerElement.clientWidth;
a.top=this.playerElement.clientTop;
a.left=this.playerElement.clientLeft;
a.bottom=a.top+a.height;
a.right=a.left+a.width;
a.topLeft={x:a.left,y:a.top};
a.bottomRight={x:a.right,y:a.bottom};
a.size={x:a.width,y:a.height};
a.x=a.left;
a.y=a.top;
if(b){a.x+=$pdk.jQuery(this.playerElement).offset().left;
a.y+=$pdk.jQuery(this.playerElement).offset().top
}this.controller.dispatchEvent("OnOverlayAreaChanged",a);
return a
},mediaAreaChanged:function(a){}});
var PdkEvent=new Object();
PdkEvent.OnPlayerLoaded="OnPlayerLoaded";
PdkEvent.OnResetPlayer="OnResetPlayer";
PdkEvent.OnPlugInLoaded="OnPlugInLoaded";
PdkEvent.OnPlugInsComplete="OnPlugInsComplete";
PdkEvent.OnMediaLoadStart="OnMediaLoadStart";
PdkEvent.OnMediaPlay="OnMediaPlay";
PdkEvent.OnMediaClick="OnMediaClick";
PdkEvent.OnMediaBuffer="OnMediaBuffer";
PdkEvent.OnMediaEnd="OnMediaEnd";
PdkEvent.OnMediaError="OnMediaError";
PdkEvent.OnMediaComplete="OnMediaComplete";
PdkEvent.OnMediaLoading="OnMediaLoading";
PdkEvent.OnMediaPause="OnMediaPause";
PdkEvent.OnMediaTime="OnMediaTime";
PdkEvent.OnMediaPlaying="OnMediaPlaying";
PdkEvent.OnMediaStart="OnMediaStart";
PdkEvent.OnMediaUnpause="OnMediaUnpause";
PdkEvent.OnReleaseEnd="OnReleaseEnd";
PdkEvent.OnReleaseStart="OnReleaseStart";
PdkEvent.OnReleaseSelected="OnReleaseSelected";
PdkEvent.OnMediaSeek="OnMediaSeek";
PdkEvent.OnMute="OnMute";
PdkEvent.OnSetVolume="OnSetVolume";
PdkEvent.OnSetRelease="OnSetRelease";
PdkEvent.OnSetReleaseUrl="OnSetReleaseUrl";
PdkEvent.OnLoadRelease="OnLoadRelease";
PdkEvent.OnLoadReleaseUrl="OnLoadReleaseUrl";
PdkEvent.OnSetSmil="OnSetSmil";
PdkEvent.OnLoadSmil="OnLoadSmil";
PdkEvent.OnShowFullScreen="OnShowFullScreen";
PdkEvent.OnShowPlayOverlay="OnShowPlayOverlay";
PdkEvent.OnShowPreviewImageOverlay="OnShowPreviewImageOverlay";
PdkEvent.OnShowControls="OnShowControls";
PdkEvent.OnStreamSwitched="OnStreamSwitched";
PdkEvent.OnGetSubtitleLanguage="OnGetSubtitleLanguage";
PdkEvent.OnRefreshCategoryModel="OnRefreshCategoryModel";
PdkEvent.OnRefreshReleaseModel="OnRefreshReleaseModel";
PdkEvent.OnLoadReleaseModel="OnLoadReleaseModel";
PdkEvent.OnRefreshReleaseModelStarted="OnRefreshReleaseModelStarted";
PdkEvent.OnCategorySelected="OnCategorySelected";
PlaybackManager=Class.extend({init:function(c,b){this.player=c;
this.controller=b;
var h={fontFamily:"Calibri, Helvetica, Arial",fontColor:"white",textAlign:"left",textAlignVertical:"top"};
var g={fontFamily:"Calibri, Helvetica, Arial",fontColor:"white",fontEdge:"dropshadow",textAlign:"center",textAlignVertical:"bottom"};
var f="tp_subtitles_settings";
this.subtitlesLoader=new $pdk.queue.deferred.loader.Subtitles(this.controller,this.controller.getOverlayArea(),document.getElementById(this.controller.id+".subtitles"),f,20,h,g,true,this.controller.getProperty("enableDynamicSubtitleFonts"));
this.subtitlesSettingsManagerLoader=new $pdk.queue.deferred.loader.SubtitlesSettingsManager(this.controller,f);
var e=this;
b.addEventListener("OnLoadReleaseUrl",function(){e.handleLoadReleaseUrl.apply(e,arguments)
});
b.addEventListener("OnShowPreviewImageOverlay",function(i){e.handleShowPreviewImageOverlay(i)
});
this.mediaSeekHandler=function(){e.handleMediaSeek.apply(e,arguments)
};
b.addEventListener("OnMediaSeek",this.mediaSeekHandler);
this.mediaErrorHandler=function(){e.handleMediaError.apply(e,arguments)
};
b.addEventListener("OnMediaError",this.mediaErrorHandler);
this.mediaStartHandler=function(){e.handleMediaStart.apply(e,arguments)
};
b.addEventListener("OnMediaStart",this.mediaStartHandler);
this.releaseSelectedHandler=function(){e.handleReleaseSelected.apply(e,arguments)
};
b.addEventListener("OnReleaseSelected",this.releaseSelectedHandler);
this._metadataUrlManager=new $pdk.plugin.MetadataUrlManager(this.controller);
this.urlManager=new UrlManager(this.controller);
this.errorManager=new ErrorManager(this.controller,this.player);
var a=this.controller.getProperty("useNativeControls")=="true";
var d=this.controller.getProperty("useDefaultPlayOverlay")=="true"||this.controller.getProperty("showControlsBeforeVideo")=="false";
if(d||a){setTimeout(function(){e.controlsLoaded=true;
e.player.controlsLoaded(false,a)
},1)
}if(!a){this.controlsLoader=new $pdk.queue.deferred.loader.ControlsLoader(this.controller,document.getElementById(this.controller.id).parentElement.id,function(){e.controlsLoaded=true;
e.player.controlsLoaded(true,false);
if(e.controlsLoadedCallback){e.controlsLoadedCallback()
}},function(j,i){e.controlsLoaded=true;
e.player.controlsLoaded(j,i)
})
}this.releaseUrl=this.player.releaseUrl;
this.tokenManager=new TokenManager(this.controller);
this.overlayManager=new OverlayManager(this.controller,this.player.container);
if(self.StandbyManager){this.standbyManager=new StandbyManager(this.controller,this)
}this.plugins=new Array();
this.pluginsComplete=false;
b.addEventListener("OnPlugInsComplete",function(){e.pluginsComplete=true
});
b.registerFunction("setRelease",this,this.setRelease);
b.registerFunction("setReleaseURL",this,this.setReleaseURL);
b.registerFunction("doParsePlaylist",this,this.doParsePlaylist);
b.registerFunction("tryWritePlayer",this,this.tryWritePlayer);
b.registerFunction("pause",this,this.pause);
b.registerFunction("endRelease",this,this.endRelease);
b.registerFunction("endCurrentRelease",this,this.endRelease);
b.registerFunction("clearCurrentRelease",this,this.clearCurrentRelease);
b.registerFunction("resetRelease",this,this.resetRelease);
b.registerFunction("getCurrentRelease",this,this.getCurrentRelease);
b.registerFunction("injectPlaylist",this,this.injectPlaylist);
b.registerFunction("insertPlaylist",this,this.insertPlaylist);
b.registerFunction("wrapClip",this,this.wrapClip);
b.registerFunction("insertClip",this,this.insertClip);
b.registerFunction("mute",this,this.doMute);
b.registerFunction("setVolume",this,this.setVolume);
b.registerFunction("setSmil",this,this.setSmil);
b.registerFunction("updateMediaTime",this,this.updateMediaTime);
b.registerFunction("updateClip",this,this.updateClip);
b.registerFunction("updatePlaylist",this,this.updatePlaylist);
b.registerFunction("endMedia",this,this.endMedia);
b.registerFunction("markOffset",this,this.markOffset);
b.registerFunction("playPlaylist",this,this.playPlaylist);
b.registerFunction("loadReleaseURL",this,this.loadReleaseURL);
b.registerFunction("loadRelease",this,this.loadRelease);
b.registerFunction("nextClip",this,this.nextClipExternal);
b.registerFunction("previousClip",this,this.previousClip);
var e=this;
b.registerFunction("initializePlayback",this,this.initializePlayback);
this.adManager=new AdManager(b);
this.clipWrapperManager=new ClipWrapperManager(b);
this.fullScreenManager=new FullScreenManager(b,this,c.enableFullWindow);
this.advanceClipFromExternalCall=false
},handleReleaseSelected:function(a){if(a.originator.controlId!=this.controller.componentId&&a.originator.controlId.indexOf("player")<0){this.currentReleaseList=a.originator.controlId
}this.tryingToAdvance=false
},initializePlayback:function(){this.pluginsComplete=true;
if(this.waitReleaseCall){if(this.waitReleaseCall.url){this.setReleaseURL(this.waitReleaseCall.url,this.waitReleaseCall.replaceDefault)
}else{if(this.waitReleaseCall.release){this.setRelease(this.waitReleaseCall.release,this.waitReleaseCall.replaceDefault)
}}this.waitReleaseCall=null
}else{if(this.waitSmil){this.setSmil(this.waitSmil);
this.waitSmil=null
}}},handleMediaStart:function(b){var a=b.data;
a.offset=0;
this.clipStarted=true;
this.updateClip(a)
},handleShowPreviewImageOverlay:function(a){if(this.isError){this.controller.showPlayerCard("forms","tpErrorCard",null,{title:this.error.title,message:this.error.description});
this.isError=false
}},handleLoadReleaseUrl:function(a){this.tryingToAdvance=false;
if(this.releaseProcess&&this.playlist){this.endRelease();
this.destroyReleaseProcess(this.releaseProcess);
this.releaseProcess=undefined;
this.playlist=undefined
}if(!this.currentRelease||this.currentRelease.pid!=a.data.pid){this.currentRelease=this.convertRawRelease(a.data)
}else{this.appendRawDataToRelease(this.currentRelease,a.data)
}if((tpIsIOS()||tpIsAndroid())&&this.isPrefetch()){release.url=this.releaseUrl;
this.setRelease(release)
}},convertRawRelease:function(a){if(a.pubDate){a.airdate=new Date(a.pubDate)
}return a
},appendRawDataToRelease:function(a,b){if(b.captions){a.captions=b.captions
}if(b.categories){a.categories=b.categories
}if(b.chapters){a.chapters=b.chapters
}if(b.copyright){a.copyright=b.copyright
}if(b.provider){a.provider=b.provider
}if(b.mediaPID){a.mediaPID=b.mediaPID
}else{if(b.mediaPid){a.mediaPID=b.mediaPid
}}},isPrefetch:function(){return this.controller.isPrefetch()
},getCurrentRelease:function(){return this.currentRelease
},getChapterFromOffset:function(b,d){if(d<=b.aggregateLength){for(var a=0;
a<b.chapters.length;
a++){var e=b.chapters[a];
if(e.aggregateStartTime+e.length>=d){e.offset=d-e.aggregateStartTime;
return e
}}}if(b.chapters.length==1){return b.chapters[0]
}return null
},markOffset:function(e,a,b){if(b===undefined){b=true
}var c=this.getChapterFromOffset(e.chapters,a);
var d;
if(!c||c.contentIndex==e.currentIndex){}else{e.currentIndex=c.contentIndex
}d=e.clips[e.currentIndex];
if(c){d.offset=c.offset;
if(c.adIndex>=0&&b){e.currentIndex=c.adIndex
}}else{if(a<d.length){d.offset=a
}else{d.offset=d.length
}}},playCurrentRelease:function(){if(this.playlist&&this.playlist.releaseURL==this.releaseUrl){this.playlist.currentClipIndex=-1;
this.clipEnded=false;
this.controller.dispatchEvent("OnReleaseStart",this.playlist);
this.releaseProcess.setPlaylist(this.playlist)
}else{if(this.playlist&&this.playlist.isAd===true&&this.isPrefetch()&&(tpIsIOS()||tpIsAndroid())){tpDebug("playCurrentRelease.isAd");
this.nextClip(false);
this.clipEnded=false
}else{if(this.releaseUrl){if(!this.clipEnded){}this.currentClip=undefined;
this.playlist=undefined;
this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.releaseUrl,userInitiated:true});
this.setReleaseURL(this.releaseUrl)
}else{tpDebug("ERROR: No release to play!","PlaybackManager",tpConsts.ERROR)
}}}},setRelease:function(a,b){if(!this.pluginsComplete){this.waitReleaseCall={url:null,release:a,replaceDefault:b};
return
}var d=this;
if(this.isNoSkipPlaying()||this.defaultBlocksPlayback(b)){return
}if(this.currentClip&&!this.clipEnded){this.controller.dispatchEvent("OnMediaEnd",this.currentClip)
}var c={};
$pdk.apply(c,a);
this.currentRelease=c;
d.currentRelease.url=c.url;
this.tryingToAdvance=false;
d.controller.callFunction("setReleaseGwt",[c]);
return
},setReleaseURL:function(b,a){if(!this.pluginsComplete){this.waitReleaseCall={url:b,release:null,replaceDefault:a};
return
}if(this.isNoSkipPlaying()||this.defaultBlocksPlayback(a)){return
}this.currentRelease=null;
this.tryingToAdvance=false;
this.controller.callFunction("setReleaseURLGwt",[b]);
return
},loadReleaseURL:function(b,a){if(!b){tpDebug("This release has no URL","LoadReleaseManager",tpConsts.ERROR);
return
}if(a===false){var c=this.controller.getProperty("releaseUrl");
if(c!==undefined){return
}}this.currentRelease=null;
this.controller.callFunction("loadReleaseUrlGwt",[b])
},loadRelease:function(a,b){var c=a.url;
if(!c){tpDebug("This release has no URL","LoadReleaseManager",tpConsts.ERROR);
return
}if(b===false){var d=this.controller.getProperty("releaseUrl");
if(d!==undefined){return
}}this.currentRelease=a;
this.controller.callFunction("loadReleaseGwt",[c])
},tryWritePlayer:function(){if((tpIsIOS()||tpIsAndroid())){tpDebug("doSetReleaseUrl: calling writePlayer()");
this.controller.writePlayer("",true)
}},isNoSkipPlaying:function(){return this.currentClip&&this.currentClip.baseClip&&this.currentClip.baseClip.noSkip
},defaultBlocksPlayback:function(a){if(a===false&&this.player.releaseUrl){return true
}return false
},qs:function(a){return a.indexOf("?")>=0?"&":"?"
},dispatchReleaseError:function(b,a){tpDebug("Error loading SMIL XML");
if(b){this.isError=true;
this.error=b;
this.controller.loadReleaseURL(a)
}this.controller.dispatchEvent("OnReleaseError",{url:a,title:b.title,description:b.description,exception:b.exception,responseCode:b.responseCode,alternateSrc:b.alternateSrc})
},setSmil:function(a){if(!this.player.iOSEnabled){if(this.pluginsComplete===false){var b=this;
this.waitSmil=a;
setTimeout(function(){if(b.pluginsComplete){return
}b.pluginsComplete=true;
b.setSmil(a)
},2000);
return
}}if((this.currentClip&&this.currentClip.baseClip&&this.currentClip.baseClip.noSkip)||this.pluginsComplete===false){return
}if(this.playlist){this.endRelease()
}this.doParseSelector(a)
},pause:function(a){if(this.video){if(a){this.doPauseVideo()
}else{this.doUnPauseVideo()
}}},doPauseVideo:function(){if(this.currentClip&&this.currentClip.streamType==="empty"){if(!this.isNoopClip(this.currentClip)){this.controller.getVideoProxy().pause()
}this.controller.dispatchEvent("OnPlayerPause")
}else{if(this.videoEngine.isPaused()==false){this.videoEngine.pause();
this.controller.dispatchEvent("OnPlayerPause")
}}},doUnPauseVideo:function(){this.play();
this.controller.dispatchEvent("OnPlayerUnPause");
if(this.clipStarted){this.player.onPlay()
}},play:function(){if(this.isNoopClip(this.currentClip)){return
}if(this.currentClip&&this.currentClip.streamType==="empty"){this.controller.getVideoProxy().play()
}else{tpDebug("PBM calling play!");
this.videoEngine.play()
}},setVolume:function(a){this.videoEngine.setVolume(a/100);
this.controller.dispatchEvent("OnVolumeChange",a);
this._oldVolume=a
},doMute:function(a){if(this._isMuted==undefined){this._isMuted=false
}if(a!=this._isMuted){this._isMuted=a;
this.videoEngine.mute(this._isMuted);
if(this._isMuted){this._oldVolume=this.videoEngine.getVolume();
this.videoEngine.setVolume(0)
}else{if(this._oldVolume){if(this._oldVolume>=0){this.videoEngine.setVolume(this._oldVolume)
}this.oldVolume=undefined
}}this.controller.dispatchEvent("OnMute",this._isMuted)
}},selector:function(a){this.doParseSelector(a)
},stripM3U:function(d){var a=0;
var e=0;
var c;
var b=false;
for(;
a<d.clips.length;
a++){if(!d.clips[a].isAd&&d.baseClips[a].URL.indexOf("m3u")!=-1){if(!b){b=true;
e=a;
c=d.baseClips[a].URL;
d.clips[a].endTime=d.clips[a].mediaLength;
d.chapters.chapters=[d.chapters.chapters[0]];
d.chapters.chapters[0].length=d.clips[0].mediaLength
}else{if(d.baseClips[a].URL==c){d.baseClips.splice(a,1);
d.clips.splice(a,1);
a--
}}}else{if(b&&d.baseClips[a].URL!=c&&a>0&&a<(d.clips.length-1)){d.baseClips.splice(a,1);
d.clips.splice(a,1);
a--
}else{if(b){d.clips[a].clipIndex=a
}}}}},doParseSelector:function(a,c){var b=this.doParsePlaylist(a,c);
this.playPlaylist(b)
},doParsePlaylist:function(a,d){tpDebug("selector: parsing smil");
if(d){this.releaseUrl=d
}var c=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString());
var b=c.parsePlaylist(a,this.releaseUrl);
if(b.baseClips&&b.baseClips.length==1&&b.baseClips[0].contentCustomData&&b.baseClips[0].contentCustomData.isException=="true"){b.isError=true
}return b
},playPlaylist:function(b){if(this.releaseProcess){this.controller.dispatchEvent("OnReleaseEnd",this.playlist);
this.destroyReleaseProcess(this.releaseProcess);
this.releaseProcess=undefined;
var a=this;
setTimeout(function(){a.playPlaylist(b)
},1);
return
}if(!b||b.isError){this.dispatchReleaseError({title:b.baseClips[0].title,description:b.baseClips[0].description,exception:b.baseClips[0].contentCustomData.exception,responseCode:b.baseClips[0].contentCustomData.responseCode,alternateSrc:b.baseClips[0].URL},this.releaseUrl);
return
}if(tpIsAndroid()){this.stripM3U(b)
}this.releaseProcess=this.createReleaseProcess();
this.playlist=b;
if(!(this.isPrefetch()&&(tpIsIOS()||tpIsAndroid()))){tpDebug("selector: playing current release");
if(this.currentRelease){b.release=this.currentRelease;
b.release.mediaPID=b.mediaPID
}else{b.release=this.getReleaseFromPlaylist(b)
}this.controller.dispatchEvent("OnReleaseStart",b);
this.releaseProcess.setPlaylist(b)
}else{this.player.videoEngine.load(this.player.createMediaFileFromClip(this.playlist.baseClips[0]),0);
this.player.currentURL=this.playlist.baseClips[0].URL
}},getReleaseFromPlaylist:function(f){if(f.release){return f.release
}var b;
var c=0;
var a=f.baseClips.length;
var e;
var d;
for(;
c<a;
c++){if(!f.baseClips[c].isAd){e=f.baseClips[c];
d=f.clips[c];
break
}}if(!e){return undefined
}b={globalDataType:"com.theplatform.pdk.data::Release",title:f.title?f.title:e.title,author:e.author,duration:e.releaseLength,length:e.releaseLength,bitrate:e.bitrate,description:e.description,categories:e.categories,copyright:e.copyright,countries:[f.countryCode],keywords:e.keywords,link:e.moreInfo,pid:f.releasePID,provider:e.provider,ratings:e.ratings,text:e.description,chapters:d.chapter?d.chapter.chapters:[],url:f.releaseURL,mediaPID:f.mediaPID,airdate:f.airdate};
return b
},createReleaseProcess:function(){var a=com.theplatform.pdk.ReleaseProcessExported.getReleaseProcess(this.controller.id,this.controller.scopes.toString());
a.addEventListener("OnClipFromPlaylist",this,this.clipFromPlaylist);
a.addEventListener("OnNoSkipChanged",this,this.noSkipChanged);
return a
},destroyReleaseProcess:function(a){if(a){a.removeEventListener("OnClipFromPlaylist",this.clipFromPlaylist);
a.removeEventListener("OnNoSkipChanged",this.noSkipChanged);
a.destroy()
}},noSkipChanged:function(a){this.controller.dispatchEvent("OnNoSkipChanged",a.data)
},clipFromPlaylist:function(c){var b=c.data;
if(!b){if(!this.clipEnded&&this.currentClip&&this.currentClip.streamType!="empty"){this.doEndMedia(this.currentClip)
}this.endRelease();
this.playlist=undefined;
var a=this.currentReleaseList?[this.currentReleaseList]:null;
var d=this.advanceClipFromExternalCall;
this.advanceClipFromExternalCall=false;
if(!this.wantPrevious){this.advanceToNextRelease(false,!d,a)
}else{this.wantPrevious=false;
this.controller.playPrevious(false,a)
}}else{if(this.currentClip&&!this.currentClip.baseClip.isAd){this.currentClip.offset=0;
this.releaseProcess.updateClip(this.currentClip)
}this.wantPrevious=false;
tpDebug("release process is telling us to play clip with clipIndex "+b.clipIndex+" and src:"+b.URL);
this.processClip(b)
}},advanceToNextRelease:function(c,a,b){this.tryingToAdvance=true;
this.controller.playNext(c,a,b);
var d=this;
setTimeout(function(){if(d.tryingToAdvance){d.tryingToAdvance=false;
d.controller.loadReleaseURL(d.releaseUrl)
}},300)
},endRelease:function(){if(tpIsAndroidLegacy()){this.controller.showFullScreen(false)
}this.controller.dispatchEvent("OnReleaseEnd",this.playlist);
this.releaseProcess=undefined;
this.currentClip=null
},clearCurrentRelease:function(){if(this.releaseProcess){this.destroyReleaseProcess(this.releaseProcess);
this.controller.callFunction("clearReleaseGwt");
this.endRelease()
}this.controller.dispatchEvent("OnClearCurrentRelease");
this.controller.dispatchEvent("OnResetPlayer")
},resetRelease:function(){var a=this.player.resetVideoElement();
this.video=a.video;
this.videoEngine=a.videoEngine;
this.endRelease()
},handleMediaError:function(a){var b=a.data;
this.wasError=true;
if(b&&b.endRelease){this.endRelease();
this.advanceToNextRelease(false,true)
}else{if(this.releaseProcess){this.advanceClipFromExternalCall=false;
this.releaseProcess.nextClip()
}}},handleMediaSeek:function(d){var c=d.data;
tpDebug("Got OnMediaSeek");
if(!this.currentClip){tpDebug("PBM ignoring seek");
return
}var a=c.end.mediaTime;
tpDebug("Seek time is:"+a);
if(a>=this.currentClip.endTime||a<(this.currentClip.startTime-500)){tpDebug("Telling releaseProcess to seek to "+c.end.currentTimeAggregate);
if(this.releaseProcess.seekToPosition(c.end.currentTimeAggregate)){tpDebug("ReleaseProcess is providing a new clip")
}else{tpDebug("releaseProcess.seekToPosition returned false");
tpDebug("Endtime is "+this.currentClip.endTime+" duration is "+this.currentClip.duration);
if(this.currentClip.duration>1){this.endMedia()
}else{tpDebug("Continuing to play because we don't know the duration")
}}}else{if(a<=this.currentClip.startTime&&Math.abs(this.videoEngine.getCurrentTime()-this.currentClip.startTime)>300){var b=this;
tpDebug("targetTime is "+a+", need to seek to "+this.currentClip.startTime);
setTimeout(function(){b.controller.seekToPosition(b.currentClip.startTime)
},1)
}else{tpDebug("seekObj was within clip boundaries: "+this.currentClip.startTime+"<"+c.end.mediaTime+"<"+this.currentClip.endTime)
}}},nextClipExternal:function(){this.nextClip(true)
},nextClip:function(a){this.advanceClipFromExternalCall=a===true;
if(this.isNoopClip(this.currentClip)||this.isProxyClip(this.currentClip)){this.controller.dispatchEvent("OnMediaEnd",this.currentClip)
}if(this.releaseProcess){tpDebug("PBM calling releaseProcess.nextClip");
this.releaseProcess.nextClip()
}else{this.advanceToNextRelease(false,false)
}},previousClip:function(){this.wantPrevious=true;
this.advanceClipFromExternalCall=true;
if(this.releaseProcess){tpDebug("PBM calling releaseProcess.nextClip");
this.releaseProcess.previousClip()
}else{this.controller.playPrevious(false)
}},processClip:function(g,a){var c=this.adManager.isAd(g);
var h=false;
if(c){if(!this.adManager.validateAd(g)){this.nextClip(this.advanceClipFromExternalCall);
return
}h=this.adManager.checkAd(g);
g.hasPlayed=true;
this.updateClip(g);
this.lastAdClip=g;
tpDebug("CheckAd returns "+h)
}var d=false;
if(this.currentClip){d=g.clipIndex<this.currentClip.clipIndex
}this.currentClip=g;
if(!h){var b=false;
if(!d){b=this.clipWrapperManager.processClip(g)
}var e=false;
var f=this;
e=this.urlManager.checkClip(g,function(i){if(g.id===i.id){if(!b&&a!==true){tpDebug("processClip.!wrapped: "+g.URL);
f.urlRewritten(i)
}}});
g.wasProcessed=true
}},urlRewritten:function(a){this.updateClip(a);
if(a.baseClip.type!=="application/vast+xml"&&a.baseClip.type!=="text/plain"){if(a.baseClip.isAd){this.lastAdClip=a
}this.clipStarted=false;
tpDebug("urlreWrtten for clip with URL:"+a.URL);
this.player.doMediaLoadStart(a);
this.releaseProcess.updateClip(a)
}else{this.endMedia(a)
}},insertPlaylist:function(a){if(this.releaseProcess){this.releaseProcess.insertPlaylist(a)
}},insertClip:function(a){if(this.releaseProcess){this.releaseProcess.insertClip(a)
}},injectPlaylist:function(b){if(this.releaseProcess){var a=this.currentClip.currentMediaTime==0&&this.currentClip.startTime>0?this.currentClip.startTime:this.currentClip.currentMediaTime;
this.releaseProcess.injectPlaylist(b,a)
}},updateMediaTime:function(a){if(this.releaseProcess){this.releaseProcess.updateMediaTime(a)
}},updateClip:function(a){if(this.releaseProcess){this.releaseProcess.updateClip(a)
}},updatePlaylist:function(a){if(this.releaseProcess){this.releaseProcess.updatePlaylist(a)
}},endMedia:function(b,c){if(!b){b=this.currentClip
}b.offset=0;
this.releaseProcess.updateClip(b);
if(b&&b.mediaLength-1000<=b.currentMediaTime){var a=b
}this.doEndMedia(b);
if(a){this.controller.dispatchEvent("OnMediaComplete",a)
}if(this.releaseProcess&&!c){tpDebug("Media ended for clip with url: "+b.baseClip.URL+" and index "+b.clipIndex+" , PBM calling nextClip()");
this.advanceClipFromExternalCall=false;
this.releaseProcess.nextClip()
}},doEndMedia:function(a){this.currentClip=null;
if(!this.wasError){tpDebug("doEndMedia dispatching OnMediaEnd for clip:"+a.baseClip.URL);
this.controller.dispatchEvent("OnMediaEnd",a)
}this.wasError=false
},wrapClip:function(b,a){this.releaseProcess.wrapClip(b,a)
},executeCurrentRelease:function(){},isNoopClip:function(a){if(!a){return false
}return(a.URL==""&&a.baseClip.isAd&&a.streamType=="empty")
},isProxyClip:function(a){if(!a){return false
}return(a.baseClip.isAd&&a.streamType=="empty")
}});
tpPlayer=PDKComponent.extend({_generateExportedMarkup:function(){var a="";
a+='<div id="'+this.id+'" >';
a+='  <div id="'+this.id+'.player" ></div>';
a+='  <div id="'+this.id+'.controlBlocker" ></div>';
a+='  <div id="'+this.id+'.blocker" ></div>';
a+='  <div id="'+this.id+'.plugins" ></div>';
a+='  <div id="'+this.id+'.subtitles" class="tpSubtitles" style="pointer-events:none" ></div>';
a+='  <div id="'+this.id+'.cards" style="pointer-events:none;z-index:802;-webkit-touch-callout: text;-webkit-user-select: text;-khtml-user-select: text;-moz-user-select: text;-ms-user-select: text;user-select: text;left:0px;top:0px" ></div>';
a+="</div>";
a+='  <div id="'+this.id+'.overlays" style="z-index:801;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
a+='  <div id="'+this.id+'.controls" style="z-index:800;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
return a
},init:function(f,b,a,d,e){var c=this;
this.id=f;
this._resizeTimout=0;
this._tryResizeAttempts=0;
this.pluginsComplete=false;
this.videoEngine=e;
this.stayInFullScreen=true;
this.controller=new PlayerController(f,this);
if(tpIsIOS()||tpIsAndroid()){this.stayInFullScreen=false
}if(d===undefined){d=f
}this.widgetId=d;
this.unloaded=true;
this.controller.addEventListener("OnMediaAreaChanged",function(){c.handleOnMediaAreaChanged.apply(c,arguments)
});
this.controller.addEventListener("OnOverlayAreaChanged",function(){c.handleOnOverlayAreaChanged.apply(c,arguments)
})
},setProperty:function(a,b){if(this.controller){this.controller.setProperty(a,b)
}},getProperty:function(a){if(this.controller){return this.controller.getProperty(a)
}else{return null
}},attach:function(a){this.initialize();
this.video=document.getElementById(a);
this.ready()
},setSeekHandler:function(){if(this.seekHandler){this.seekHandler.destroy()
}this.seekHandler=new SeekHandler(this.videoEngine);
var a=this;
this.userSeekedListener=function(b){a.userSeeked(b)
};
this.seekErrorListener=function(b){a.seekFailed(b)
};
this.seekHandler.addEventListener(SeekEvents.USERSEEKED,this.userSeekedListener);
this.seekHandler.addEventListener(SeekEvents.SEEKFAILED,this.seekErrorListener)
},seekFailed:function(a){this.onError(a)
},userSeeked:function(a){if(this.currentClip.baseClip.noSkip&&!tpIsIOS()){this.seekHandler.doSeek(this.currentClip.startTime/1000)
}else{if(this.currentClip.baseClip.noSkip&&tpIsIOS()){}else{tpDebug("got userSeeked: showing controls");
this.showControls(true);
this.onSeeked()
}}},progSeeked:function(a){tpDebug("progSeeked fired");
this.onSeeked()
},resetVideoElement:function(){var a=document.createElement("div");
a.setAttribute("id",this.video.getAttribute("id"));
a.setAttribute("class",this.video.getAttribute("class"));
a.setAttribute("style",this.video.getAttribute("style"));
a.setAttribute("x-webkit-airplay","allow");
this.video.parentNode.replaceChild(a,this.video);
this.video=a;
this.videoEngine.setParentElement(this.video);
if(this.videoengineruntime&&this.videoengineruntime.toLowerCase()==="flash"){this.videoEngine.setRuntime("FLASH")
}else{this.videoEngine.setRuntime("HTML5")
}this.startedPlaying=false;
this.currentClip=undefined;
this.attachListeners();
return{video:this.video,videoEngine:this.videoEngine}
},createContainer:function(c){var e=this.framecolor?this.framecolor:"#000000";
var b=this.backgroundcolor?this.backgroundcolor:"#ffffff";
this.bdcolor=e.replace("0x","#");
this.bgcolor=b.replace("0x","#");
var a="";
a+="<div class='tpBackground' style=\"background-color: "+this.bgcolor+"; border-color: "+this.bdcolor+'"></div>';
a+='<div id="'+this.id+'" >';
a+='  <div id="'+this.id+'.player" ></div>';
a+='  <div id="'+this.id+'.controlBlocker" ></div>';
a+='  <div id="'+this.id+'.blocker" ></div>';
a+='  <div id="'+this.id+'.plugins" ></div>';
a+='  <div id="'+this.id+'.subtitles" class="tpSubtitles" style="pointer-events:none" ></div>';
a+='  <div id="'+this.id+'.cards" style="pointer-events:none;z-index:802;-webkit-touch-callout: text;-webkit-user-select: text;-khtml-user-select: text;-moz-user-select: text;-ms-user-select: text;user-select: text;" ></div>';
a+='  <div id="'+this.id+'.overlays" style="z-index:801;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
a+='  <div id="'+this.id+'.controls" style="z-index:800;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
a+="</div>";
if(c){c.innerHTML=a
}else{document.write(a)
}this.container=document.getElementById(this.id);
this.pluginLayer=document.getElementById(this.id+".plugins");
this.player=document.getElementById(this.id+".player");
this.controlBlocker=document.getElementById(this.id+".controlBlocker");
if(this.videoengineruntime&&this.videoengineruntime.toLowerCase()==="flash"){this.container.removeChild(this.controlBlocker)
}var f=this;
var h=function(j){if(!f.clipStarted){return false
}var i=f.videoClicked(j);
if(i){if(!j){var j=window.event
}j.cancelBubble=true;
if(j.stopPropagation){j.stopPropagation()
}if(j.preventDefault){j.preventDefault()
}}return false
};
if($pdk.isIE){this.player.onclick=h
}else{anchor=document.createElement("a");
anchor.style.width="100%";
anchor.style.height="100%";
anchor.style.background="transparent";
anchor.style.display="block";
anchor.style.cursor="default";
anchor.href="#";
anchor.onclick=h;
this.controlBlocker.appendChild(anchor);
this.videoClickAnchor=anchor
}this.blocker=document.getElementById(this.id+".blocker");
var d=this.backgroundcolor;
if(d){idx=d.indexOf("0x");
if(idx!==-1){d=d.substring(idx+2);
d="#"+d
}this.blocker.style.backgroundColor=d
}else{this.blocker.style.backgroundColor="black"
}this.blocker.style.position="absolute";
this.blocker.top=0;
this.blocker.left=0;
this.blocker.style.display="";
this.blocker.style.overflow="hidden";
this.blocker.style.height="100%";
this.blocker.style.width="100%";
this.blocker.style.display="none";
this.controlsLayer=document.getElementById(this.id+".controls");
this.controlsLayer.className="controlsLayer";
this.controlsLayer.style.backgroundColor="transparent";
this.controlsLayer.style.cssFloat="left";
this.controlsLayer.style["float"]="left";
this.controlsLayer.style.left="0px";
this.controlsLayer.style.top="0px";
this.controlBlocker.style.position="absolute";
this.controlBlocker.style.display="none";
this.blocker.top=0;
this.blocker.left=0;
this.controlBlocker.style.backgroundColor="transparent";
this.controlBlocker.style.height="100%";
this.controlBlocker.style.width="100%";
this.controlBlocker.style.overflow="hidden";
this.player.style.width="100%";
this.player.style.height="100%";
this.player.style.position="absolute";
this.player.style.overflow="hidden";
this.pluginLayer.style.width="100%";
this.pluginLayer.style.position="absolute";
this.controlsLayer.style.width="100%";
this.controlsLayer.style.height="100%";
this.container.className="player";
if($pdk._phase1Controllers===null||typeof($pdk._phase1Controllers)!=="object"){$pdk._phase1Controllers={}
}var g=document.getElementById(this.controller.id).parentElement.id;
this.controller.componentId=g;
$pdk._phase1Controllers[g]=this.controller;
return c
},isStandbyMode:function(){return this.standbyMode||(tpIsAndroid&&!tpIsChrome())
},isPrefetch:function(){return !this.standbyMode&&(tpIsIOS()||tpIsAndroid())
},isFlashPlayer:function(){return false
},writePlayer:function(b,a){if(b===""&&a&&this.iOSEnabled){return
}var h=b;
if(!a){tpDebug("writePlayer calling pause()");
tpDebug("writing player src="+b+"&format=redirect");
tpDebug("writePlayer original url:"+b);
var f=h.indexOf("format=");
tpDebug("formatIndex="+f);
if(f>=0){tpDebug("found a format in original");
var c=h.substring(f+7,h.length);
var g="format=";
var e=c.indexOf("&");
if(e>=0){tpDebug("found & at index:"+e);
c=c.substring(0,e)
}g=g+c;
tpDebug("target="+g);
h=h.replace(g,"format=redirect")
}else{if(h.indexOf("?")>=0){h=h+"&format=redirect"
}else{h=h+"?format=redirect"
}}}tpDebug("writePlayer newUrl:"+h);
this.ignoreErrors=h==="";
var d={url:h,isAd:false,mimeType:"unknown"};
this.videoEngine.load(d,0);
if(!this.iOSEnabled){this.iOSEnabled=true
}},createVideo:function(){if(this.video){this.destroyVideo()
}this.video=document.createElement("div");
this._hideNativeControls=this.controller.getProperty("overrideNativeControls")=="true"||(this.controller.getProperty("skinUrl")!=null&&this.controller.getProperty("skinUrl").indexOf(".swf")==-1);
this._useDefaultPlayOverlay=this.controller.getProperty("useDefaultPlayOverlay");
if(this._useDefaultPlayOverlay===undefined){this._useDefaultPlayOverlay=false;
this.controller.setProperty("useDefaultPlayOverlay",this._useDefaultPlayOverlay.toString())
}else{this._useDefaultPlayOverlay=this._useDefaultPlayOverlay=="true"
}this._showControlsBeforeVideo=this.controller.getProperty("showControlsBeforeVideo");
if(this._showControlsBeforeVideo===undefined){this._showControlsBeforeVideo=true;
this.controller.setProperty("showControlsBeforeVideo",this._showControlsBeforeVideo.toString())
}else{this._showControlsBeforeVideo=this._showControlsBeforeVideo=="true"
}this.video.id=this.id+".content";
this.video.style.width="100%";
this.video.style.height="100%";
if(this.backgroundcolor){this.video.style.backgroundColor="#"+this.backgroundcolor.substr(2)
}this.player.appendChild(this.video);
this.videoLayer=this.controller.getProperty("videoLayer");
if(!this.videoLayer){this.videoLayer="test-context"
}this.videoEngine.setParentElement(this.video);
if(tpIsAndroid()){tpDebug("showing controls");
this.showControls(true)
}if(this._hideNativeControls){this.showControls(false)
}},getVideoProxy:function(){return new $pdk.connection.VideoProxy(this.videoEngine)
},loadLayer:function(c,e,b,d,a){if(this.videoEngine){return this.videoEngine.loadLayer(c,e,b)
}else{tpDebug("Trying to call loadLayer without a VideoEngine")
}},callLayerFunction:function(c,b,a){if(this.videoEngine){return this.videoEngine.callLayerFunction(c,b,a)
}else{tpDebug("Trying to call callLayerFunction without a VideoEngine")
}},setAudioTrackByIndex:function(a){this.videoEngine.setAudioTrackByIndex(a)
},setAudioTrackByLanguage:function(a){this.videoEngine.setAudioTrackByLanguage(a)
},getCurrentAudioTrack:function(){return this.videoEngine.getCurrentAudioTrack()
},getPauseState:function(){return this.paused
},getCurrentPosition:function(){return this.currentTimeObject
},destroyVideo:function(){if(this.video){this.videoEngine.unload();
this.player.removeChild(this.video);
this.video=null
}},videoClicked:function(g){if(this.currentClip&&this.currentClip.baseClip.moreInfo){if(this.currentClip.baseClip.moreInfo.href){window.open(this.currentClip.baseClip.moreInfo.href,"_blank");
this.controller.pause(true);
this.paused=true
}var f=$(this.container).parent().offset();
var d=g.pageX-f.left;
var c=g.pageY-f.top;
this.controller.dispatchEvent("OnMediaClick",{ctrlKey:g.ctrlKey,shiftKey:g.shiftKey,localX:d,localY:c,stageX:g.pageX,stageY:g.pageY,position:this.currentClip.currentMediaTime});
var h=this.currentClip.baseClip.moreInfo.clickTrackingUrls;
if(h){var b=0;
var a=h.length;
for(;
b<a;
b++){this.track(h[b])
}}return true
}return false
},track:function(b){var c=this,a=new Image();
tpDebug("Tracking click: "+b);
a.src=b
},attachListeners:function(){if(!this.listeners){this.listeners=new Object()
}var a=this;
if($pdk.jQuery.isIE){this.video.addEventListener("click",this.listeners.clickHandler=function(c){var b=a.videoClicked(c);
if(b){if(!c){var c=window.event
}c.cancelBubble=true;
if(c.stopPropagation){c.stopPropagation()
}if(c.preventDefault){c.preventDefault()
}return false
}},false)
}this.videoEngine.addEventListener("LAYER_LOADED",this.listeners.layerLoaded=function(b){tpDebug("Video tag dispatched "+b.type+" with "+b.data)
},false);
this.videoEngine.addEventListener("MEDIA_LOAD_START",this.listeners.loadstart=function(b){tpDebug("Video tag dispatched "+b.type+" with "+b.media.url)
},false);
this.videoEngine.addEventListener("MEDIA_START",this.listeners.start=function(b){tpDebug("Video tag dispatched "+b.type);
a.onMediaStart(b)
},false);
this.videoEngine.addEventListener("MEDIA_SEEKED",this.listeners.seeked=function(b){tpDebug("Video tag dispatched "+b.type);
a.onSeeked(b)
},false);
this.videoEngine.addEventListener("MEDIA_END",this.listeners.ended=function(b){tpDebug("Video tag dispatched "+b.type);
a.onEnded(b)
},false);
this.videoEngine.addEventListener("MEDIA_UNPAUSED",this.listeners.unpause=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPlay(b)
},false);
this.videoEngine.addEventListener("MEDIA_PAUSED",this.listeners.pause=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPause(b)
},false);
this.videoEngine.addEventListener("MUTE",this.listeners.mute=function(b){tpDebug("Video tag dispatched "+b.type);
a.onMuteChange(b)
},false);
this.videoEngine.addEventListener("MEDIA_PLAYING",this.listeners.playing=function(b){},false);
this.videoEngine.addEventListener("MEDIA_LOADING",this.listeners.progress=function(b){tpDebug("Video tag dispatched "+b.type);
a.onProgress(b)
},false);
this.videoEngine.addEventListener("MEDIA_ERROR",this.listeners.error=function(b){tpDebug("Video tag dispatched "+b.type);
a.onError(b)
},false);
this.videoEngine.addEventListener("PLAYBACK_ERROR",this.listeners.playbackerror=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPlaybackError(b)
},false);
this.videoEngine.addEventListener("MEDIA_UNLOADED",this.listeners.unloaded=function(b){tpDebug("Video tag dispatched "+b.type);
a.unloaded=true
},false);
this.videoEngine.addEventListener("AUDIO_TRACK_SWITCHED",this.listeners.audioTrackSwitched=function(b){a.onAudioTrackSwitched(b)
},false)
},removeListeners:function(){var a=this;
this.videoEngine.removeEventListener("MEDIA_LOAD_START",this.listeners.loadstart);
this.videoEngine.removeEventListener("MEDIA_START",this.listeners.start);
this.videoEngine.removeEventListener("MEDIA_SEEKED",this.listeners.seeked);
this.videoEngine.removeEventListener("MEDIA_END",this.listeners.ended);
this.videoEngine.removeEventListener("MEDIA_UNPAUSED",this.listeners.unpause);
this.videoEngine.removeEventListener("MEDIA_PAUSED",this.listeners.pause);
this.videoEngine.removeEventListener("MEDIA_ERROR",this.listeners.error);
this.videoEngine.removeEventListener("PLAYBACK_ERROR",this.listeners.playbackerror);
this.videoEngine.removeEventListener("MEDIA_UNLOADED",this.listeners.unloaded);
this.videoEngine.removeEventListener("MEDIA_PLAYING",this.listeners.playing);
this.videoEngine.removeEventListener("MEDIA_LOADING",this.listeners.progress);
this.videoEngine.removeEventListener("MUTE",this.listeners.mute);
this.videoEngine.removeEventListener("AUDIO_TRACK_SWITCHED",this.listeners.audioTrackSwitched)
},_bindElement:function(a){this.createContainer(a);
this.createVideo();
this.attachListeners();
var c=this;
var b=function(){c.onResize()
};
if(window.attachEvent){window.attachEvent("onresize",b)
}else{window.addEventListener("resize",b)
}this.ready()
},write:function(a){this.createContainer(a);
this.createVideo();
this.attachListeners();
var c=this;
var b=function(){c.onResize()
};
if(window.attachEvent){window.attachEvent("onresize",b)
}else{window.addEventListener("resize",b)
}this.initialize();
var c=this;
this.ready()
},initialize:function(){if(this.scopes){this.controller.scopes=[this.controller.componentId].concat(this.scopes.split(","))
}else{this.controller.scopes=[this.controller.componentId,"default"]
}this.standbyMode=this.standbymode;
if(this.standbyMode==="true"||tpIsAndroid()){this.controller.setProperty("standbyMode",true);
this.standbyMode=true
}else{if(this.standbyMode==="prefetch"){this.controller.setProperty("standbyMode","prefetch");
this.prefetch=true;
this.standbyMode=false
}else{if(tpIsIOS()||tpIsAndroid()){this.controller.setProperty("standbyMode",true);
this.standbyMode=true
}else{this.controller.setProperty("standbyMode",false);
this.standbyMode=false
}}}var a=this;
this.controller.addEventListener("OnPluginsComplete",function(){a.pluginsComplete=true;
a.controller.removeEventListener("OnPluginsComplete",this)
});
this.enableFullWindow=false;
if(this.controller.getProperty("enablefullwindow")==="true"){this.enableFullWindow=true
}else{if(this.controller.getProperty("enablefullwindow")!=="false"){if($pdk.isIE){this.enableFullWindow=true
}}}this.playbackManager=new PlaybackManager(this,this.controller);
this.controller.registerFunction("getMediaArea",this,this.getMediaArea);
this.controller.registerFunction("setMediaArea",this,this.setMediaArea);
this.controller.registerFunction("writePlayer",this,this.writePlayer);
this.controller.registerFunction("isPrefetch",this,this.isPrefetch);
this.controller.registerFunction("isStandbyMode",this,this.isStandbyMode);
this.controller.registerFunction("isFlashPlayer",this,this.isFlashPlayer);
this.controller.registerFunction("supportsFullScreen",this,this.supportsFullScreen);
this.controller.registerFunction("supportsSeek",this,this.supportsSeek);
this.controller.registerFunction("supportsMute",this,this.supportsMute);
this.controller.registerFunction("supportsVolume",this,this.supportsVolume);
this.controller.registerFunction("getVideoProxy",this,this.getVideoProxy);
this.controller.registerFunction("loadLayer",this,this.loadLayer);
this.controller.registerFunction("callLayerFunction",this,this.callLayerFunction);
this.controller.registerFunction("setAudioTrackByIndex",this,this.setAudioTrackByIndex);
this.controller.registerFunction("setAudioTrackByLanguage",this,this.setAudioTrackByLanguage);
this.controller.registerFunction("getCurrentAudioTrack",this,this.getCurrentAudioTrack);
this.controller.registerFunction("getPauseState",this,this.getPauseState);
this.controller.registerFunction("getCurrentPosition",this,this.getCurrentPosition)
},ready:function(){this._super();
this.playbackManager.video=this.video;
this.playbackManager.videoEngine=this.videoEngine;
if(this.layout||this.layoutUrl){this.controls=document.createElement("div");
this.controls.className="controlLayoutArea";
this.controls.style.height="40px";
this.controls.style.width="100%";
this.controls.style.background="#555555"
}this.video.style.padding="0";
this.video.style.margin="0";
var a=this.controller.getProperty("endCard");
if(self.CardMediator&&a=="HelloWorldEndCard"){this.cardHolder=new oldCardMediator(a,this.controller)
}if(this.controller.getProperty("overlayImageURL")){var d=this;
setTimeout(function(){d.controller.addPlayerCard("overlays","tpOverlayCard","<div class='tpOverlayCard'><img style='position: absolute; bottom: 5px; right: 5px'/></div>","urn:theplatform:pdk:area:overlay",{},{show:function(e){$pdk.jQuery(e.card).find("img")[0].src=e.player.overlayimageurl
},hide:function(){}});
d.controller.showPlayerCard("overlays","tpOverlayCard")
},1)
}if(this.controller.getProperty("relatedItemsURL")){}var d=this;
this.controller.addEventListener("OnPlayerLoaded",function(){d.handlePlayerLoaded.apply(d,arguments)
});
this.controller.addEventListener("OnShowFullScreen",function(){d.onShowFullScreen.apply(d,arguments)
});
this.controller.addEventListener("OnMediaPlaying",function(){d.showVideo();
d.showBlocker(false)
});
this.controller.addEventListener("OnSetRelease",function(){d.handleSetRelease.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseSelected",function(){d.handleSetRelease.apply(d,arguments)
});
this.controller.addEventListener("OnSetReleaseUrl",function(){d.handleSetReleaseUrl.apply(d,arguments)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(){d.handleLoadRelease.apply(d,arguments)
});
this.controller.addEventListener("OnMediaLoadStart",function(){});
this.controller.addEventListener("OnMediaStart",function(){d.showVideo()
});
this.controller.addEventListener("OnReleaseStart",function(){d.handleReleaseStart.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){d.handleReleaseEnd.apply(d,arguments)
});
this.controller.addEventListener("OnClearCurrentRelease",function(){d.handleClearCurrentRelease.apply(d,arguments)
});
this.controller.addEventListener("OnShowCard",function(){d.onShowCard.apply(d,arguments)
});
this.controller.addEventListener("OnHideCard",function(){d.onHideCard.apply(d,arguments)
});
this.controller.registerFunction("seekToPosition",this,this.seekToPosition);
this.controller.registerFunction("seekToPercentage",this,this.seekToPercentage);
if(this.pluginsComplete===false){var c=d;
var b=function(){if(c.pluginsComplete){return
}c.pluginsComplete=true;
c.controller.removeEventListener("OnPlugInsComplete",b);
c.controller.dispatchEvent("OnPlayerLoaded",[c.id])
};
this.controller.addEventListener("OnPlugInsComplete",b);
return
}else{this.controller.dispatchEvent("OnPlayerLoaded",[this.id])
}},handleShowPlayOverlay:function(a){if(a.data){if(this.videoEngine&&this.videoEngine.isFullScreen()){if(!this.stayInFullScreen){tpDebug("Exiting fullscreen");
this.controller.showFullScreen(false)
}}}},onShowCard:function(a){if(tpIsIPhone()){this.player.style.left="-10000px"
}},onHideCard:function(a){if(tpIsIPhone()){this.player.style.left="0px"
}},handlePlayerLoaded:function(a){if(!this.releaseUrl){return
}if(this.autoPlay&&!(tpIsIOS()||tpIsAndroid())){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.releaseUrl,userInitiated:false});
tpDebug("Autoplaying releaseUrl:"+this.releaseUrl);
this.controller.setReleaseURL(this.releaseUrl)
}else{this.controller.loadReleaseURL(this.releaseUrl)
}},onShowFullScreen:function(a){if(a.data){this.container.style.backgroundColor=this.bgcolor
}else{this.container.style.backgroundColor=""
}this.onResize()
},supportsFullScreen:function(){try{var a=this.allowfullscreen==="true"&&(this.videoEngine.isFullScreenSupported()||typeof(this.container.webkitRequestFullScreen)==="function"||typeof(this.container.mozRequestFullScreen)==="function"||typeof(this.container.msRequestFullScreen)==="function"||this.enableFullWindow);
return a
}catch(b){return false
}},supportsSeek:function(){return this.videoEngine.isSeekSupported()
},supportsMute:function(){return this.videoEngine.isMuteSupported()
},supportsVolume:function(){return this.videoEngine.isSetVolumeSupported()
},seekToPosition:function(a){this.doSeek(a)
},controlsLoaded:function(b,a){if(!b){if(a){this._hideNativeControls=this.controller.getProperty("overrideNativeControls")=="true";
this.videoEngine.setUseNativeControls(!this._hideNativeControls)
}}},doSeek:function(a){if(this.currentClip&&(!this._lastSeekTime||Date.now()-this._lastSeekTime>500)){if(a>=this.currentClip.mediaLength){a=this.currentClip.mediaLength-100
}this._lastSeekTime=Date.now();
var b=this;
this.seekTimeObject=this.createCurrentTimeObject();
if(!this.currentClip.chapter||!this.currentClip.chapter.chapters.isAggregate){this.isSeeking=true;
setTimeout(function(){b.videoEngine.seek(a)
},1)
}else{if(this.currentClip.chapter.aggregateStartTime<a&&this.currentClip.chapter.aggregateStartTime+this.currentClip.length>a){this.isSeeking=true;
var c=this.getClipTime(a);
setTimeout(function(){b.videoEngine.seek(c)
},1)
}else{clearInterval(this.timeUpdateTimer);
this.controller.dispatchEvent("OnMediaEnd",this.currentClip);
if(!this.playbackManager.releaseProcess.seekToPosition(a)){tpDebug("seekToPosition returned false so calling ve.end() on clipIndex "+this.currentClip.clipIndex);
if(!this.clipEndedDueToSeek){this.clipEndedDueToSeek=true;
this.videoEngine.end()
}else{tpDebug("Clip hasn't started yet so ignoring seek")
}}else{this.clipEndedDueToSeek=true;
tpDebug("seekToPosition returned true, so not doing anything.")
}}}}},getClipTime:function(a){var e=this.playlist.chapters.chapters;
var f=0;
var d=a;
for(var b=0;
b<e.length;
b++){var g=e[b];
if(g.aggregateStartTime+g.length>d){f=g.startTime+d;
break
}d-=g.length
}return f
},seekToPercentage:function(b){if(!this.currentClip){return
}b=isNaN(b)?0:b;
b=b<0?0:b;
b=b>100?100:b;
var c=this.videoEngine.getTotalTime();
if(this.currentClip.chapter&&this.currentClip.chapter.chapters){c=this.currentClip.chapter.chapters.aggregateLength
}if(isNaN(c)&&this.currentClip){return this.doSeek(this.currentClip.baseClip.trueLength*(b/100))
}else{if(!isNaN(c)){var a=c*(b/100);
return this.doSeek(a)
}else{this.delaySeekPercentage=b;
return false
}}},createMediaFileFromClip:function(a){return{url:a.URL,isAd:a.baseClip.isAd,mimeType:a.baseClip.type?a.baseClip.type:a.streamType}
},handleLoadRelease:function(b){clearTimeout(this.nextClipTimerId);
this.clipEnded=false;
var a=b.data;
this.currentReleaseUrl=a.url;
if(!this.stayInFullScreen){try{this.controller.showFullScreen(false)
}catch(c){}}if(tpIsIOS()){this.hideVideo()
}},handleSetRelease:function(c){if(tpIsAndroid()&&(tpIsChrome()||true)&&!this._androidReady){var b=this;
this._fixAndroidChrome(function(){b.handleSetRelease(c)
})
}var a=c.data;
this.currentReleaseUrl=a.url;
this.releaseSet=true;
clearTimeout(this.nextClipTimerId);
tpDebug("handleSetRelease setting release with url "+a.url)
},handleSetReleaseUrl:function(b){var a=b.data;
tpDebug("handleSetReleaseUrl setting release url to "+a);
clearInterval(this.timeUpdateTimer);
this.currentReleaseUrl=a
},handleReleaseStart:function(a){this.newRelease=true;
this.currentVideoTime=0;
this.wasPaused=false;
this.percentLoaded=0;
this.playlist=a.data
},doMediaLoadStart:function(d){tpDebug("doMediaLoadStart called for for url "+d.URL);
this.clipEnded=false;
this.startedPlaying=false;
this.percentLoaded=0;
clearTimeout(this.nextClipTimerId);
clearInterval(this.timeUpdateTimer);
this.jumpTime=undefined;
this.needsJump=false;
this.startedBuffer=false;
tpDebug("handleMediaLoadStart fired, newRelease="+this.newRelease);
this.wasPaused=(this.currentClip&&this.currentClip.streamType!="empty"&&!this.currentClip.baseClip.isAd)&&this.paused&&this.newRelease==false;
this.currentClip=d;
this.clipEndedDueToSeek=false;
if(d.URL.toLowerCase().indexOf("mp3")==-1){this.videoEngine.setPoster("")
}this.removeListeners();
if((this.currentURL!=d.URL||this.newRelease||this.hasError)&&d.streamType!=="empty"){this.isSeeking=false;
this.suppressPause=true;
var c=this;
var b=d.startTime+d.offset;
var a=function(){c.videoEngine.removeEventListener("MEDIA_UNLOADED",a);
c.hasError=false;
c.ignoreErrors=false;
c.isComplete=false;
c.newRelease=false;
c.attachListeners();
tpDebug("Starting clip #"+d.clipIndex+" with src:"+d.URL+" at offset:"+(b));
setTimeout(function(){if(d.streamType!=="empty"){c.unloaded=false;
c.loading=true;
tpDebug("Doing ve.load() for "+d.URL+" to offset "+b);
var e=c.createMediaFileFromClip(d);
c.videoEngine.load(e,b);
c.loading=false;
c.releaseSet=false
}else{c.showBlocker(false)
}if(!c.wasPaused||d.baseClip.noSkip){tpDebug("Calling play again because it was paused");
c.videoEngine.play()
}},1);
c.clipEnded=false;
c.currentURL=d.URL;
if(d.baseClip.noSkip){c.showControls(false)
}else{tpDebug("showing controls");
c.showControls(true)
}setTimeout(function(){tpDebug("Firing OnMediaLoadStart");
c.controller.dispatchEvent("OnMediaLoadStart",d)
},1)
};
this.isComplete=false;
a();
return
}else{if(this.playbackManager.isNoopClip(d)||this.playbackManager.isProxyClip(d)){tpDebug("NoOp case");
this.isSeeking=false;
var c=this;
var a=function(){c.videoEngine.removeEventListener("MEDIA_UNLOADED",a);
if(d.baseClip.noSkip===true){c.showControls(false)
}setTimeout(function(){c.unloaded=false;
tpDebug("Firing OnMediaLoadStart");
c.controller.dispatchEvent("OnMediaLoadStart",d);
c.showBlocker(false)
},1)
};
this.videoEngine.load(this.createMediaFileFromClip(d));
a();
return
}else{this.clipEnded=true;
this.suppressPause=true
}}this.newRelease=false;
this.attachListeners();
tpDebug("Starting clip #"+d.clipIndex+" with src:"+d.URL+" at offset:"+(d.startTime+d.offset));
if(d.streamType!=="empty"){this.videoEngine.load(this.createMediaFileFromClip(d),d.startTime+d.offset)
}else{this.showBlocker(false)
}this.clipEnded=false;
this.currentURL=d.URL;
var c=this;
if(d.baseClip.noSkip){c.showControls(false)
}else{tpDebug("showing controls");
c.showControls(true)
}setTimeout(function(){tpDebug("Firing OnMediaLoadStart");
c.controller.dispatchEvent("OnMediaLoadStart",d)
},1)
},handleReleaseEnd:function(c){var b=c.data;
var a=this;
this.clipEnded=true;
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}this.videoEngine.unload();
this.showBlocker(true);
var e;
if(b){e=b.releaseURL
}function d(){if(!this.stayInFullScreen){tpDebug("Exiting fullscreen");
a.controller.showFullScreen(false)
}if(e&&e===a.currentReleaseUrl){a.controller.loadReleaseURL(a.currentReleaseUrl)
}}this.nextClipTimerId=setTimeout(function(){d()
},1000);
this.hideVideo();
this.currentClip=null
},handleClearCurrentRelease:function(){clearTimeout(this.nextClipTimerId)
},showControls:function(a){if(tpIsSafari()&&!tpIsIOS()){this.showControlBlocker(!a)
}else{this.showControlBlocker(!a)
}},onResize:function(){var a=this;
if(!this._tryResize()){if(this._resizeTimout<=0&&this._tryResizeAttempts<20){this._resizeTimout=setTimeout(function(){a._resizeTimout=0;
a.onResize()
},100)
}}},_tryResize:function(){if(this.container){if(this._containerWidth!==this.container.offsetWidth||this._containerHeight!==this.container.offsetHeight){this._tryResizeAttempts=0;
this._containerWidth=this.container.offsetWidth;
this._containerHeight=this.container.offsetHeight;
this.controller.dispatchEvent("OnResize",{width:this._containerWidth,height:this._containerHeight});
this.controller.dispatchEvent("OnPlayerComponentAreaChanged",{width:this._containerWidth,height:this._containerHeight});
return true
}}this._tryResizeAttempts++;
return false
},setTimer:function(){tpDebug("Setting timeUpdateTimer");
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}var a=this;
this.timeUpdateTimer=setInterval(function(){a.onTimeUpdate()
},250)
},onMediaStart:function(c){this.clipStarted=true;
this.showVideo();
if(c.media.hasAudioTracks){var b=this.videoEngine.getAudioTracks();
for(var a in b){b[a].globalDataType="com.theplatform.pdk.data::AudioTrack"
}this.currentClip.baseClip.availableAudioTracks=b
}if(c.media.url.toLowerCase().indexOf(".mp3")>0){this.loadPoster(this.currentReleaseUrl)
}if(!this.videoEngine.isPaused()){tpDebug("In onMediaStart but ve.isPaused is false");
this.suppressPause=false;
this.setTimer()
}else{this.startedPlaying=false;
this.controller.dispatchEvent("OnMediaStart",this.currentClip)
}},onPlay:function(b){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}var a=this;
this.suppressPause=false;
if(this.paused){if(this.currentClip.baseClip.isAd&&tpIsIOS()){this.showControls(false)
}this.paused=false;
if(!this.suppressPause){this.controller.dispatchEvent("OnMediaUnpause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:false})
}else{this.suppressPause=false
}}tpDebug("onPlay calling setTimer");
this.setTimer()
},onPlaying:function(a){if(!this.currentClip){return
}if(this.needsJump){}else{if(this.currentClip&&this.currentClip.baseClip.isAd==false){this.showVideo()
}else{if(this.currentClip&&this.currentClip.streamType=="empty"){this.showVideo()
}}}},onPause:function(a){if(!this.currentClip||(this.currentClip.endTime>0&&Math.abs(this.videoEngine.getCurrentTime()-this.currentClip.endTime)<300)||this.suppressPause){tpDebug("Ignoring native pause event suppressPause:"+this.suppressPause);
if(this.clipStarted&&!this.isSeeking&&this.suppressPause){this.videoEngine.play();
this.suppressPause=false
}return
}this.paused=true;
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}tpDebug("Dispatching OnMediaPause");
this.controller.dispatchEvent("OnMediaPause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:false});
tpDebug("isAd:"+this.currentClip.baseClip.isAd);
if(this.currentClip.baseClip.isAd&&(tpIsIOS()||tpIsAndroid())){this.controller.dispatchEvent("OnShowPlayOverlay",true)
}},onMuteChange:function(a){this.controller.dispatchEvent("OnMute",a.isMute)
},onVolumeChange:function(a){his.controller.dispatchEvent("OnVolumeChange",a.volume)
},onSeeked:function(c){if(!this.isSeeking&&(!tpIsIPhone()&&tpIsIOS())&&!this.videoEngine.isFullScreen()&&!this.videoEngine.isPaused()){tpDebug("this is a bogus seek, ignoring");
return
}this.isSeeking=false;
if(!this.currentClip||this.currentClip.streamType=="empty"||this.currentClip.baseClip.noSkip){tpDebug("Ignoring seek!");
return
}if(!this.seekTimeObject&&this.currentTimeObject&&this.currentTimeObject.currentTime!=this.videoEngine.getTotalTime()){this.seekTimeObject=this.cloneTimeObject(this.currentTimeObject)
}var b={globalDataType:"com.theplatform.pdk.data::SeekObject"};
b.end=this.createCurrentTimeObject();
if(b.end!=undefined&&this.seekTimeObject!=undefined&&b.end.currentTime!=this.seekTimeObject.currentTime){b.start=this.seekTimeObject
}else{var a=this.previousTime;
var f=b.end.duration;
b.start={globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:a,currentTime:a,currentTimeAggregate:a,duration:b.end.duration,durationAggregate:b.end.durationAggregate,percentComplete:(a/f)*100,percentCompleteAggregate:(a/f)*100,isAggregate:false,isLive:false}
}b.clip=this.currentClip;
b.clip.currentMediaTime=b.end.mediaTime;
b.clip.mediaTime=b.end.mediaTime;
this.controller.dispatchEvent("OnMediaSeek",b);
this.seekTimeObject=undefined;
if(!this.paused){this.videoEngine.play()
}},onSeeking:function(a){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}this.seekTimeObject=this.cloneTimeObject(this.currentTimeObject)
},onProgress:function(c){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(!this.startedBuffer){this.startedBuffer=true;
this.controller.dispatchEvent("OnMediaBuffering",this.currentClip)
}var b=c.percentLoaded;
var a=b*this.videoEngine.getTotalTime();
if(b>=1){clearInterval(this.progressUpdateTimer)
}this.controller.dispatchEvent("OnMediaLoading",{ratioLoaded:b,isLoadComplete:b>=1,globalDataType:"com.theplatform.pdk.data::LoadMediaData",loadedMilliseconds:-1,bytesLoaded:-1,bytesTotal:-1})
},onEnded:function(b){if(b){tpDebug("MEDIA_END event for "+b.media.url+" with clipIndex: "+this.currentClip?this.currentClip.clipIndex:"none, currentClip is null");
if(this.currentClip&&b.media.url!==this.currentClip.URL){tpDebug("This was a stale onEnded event, we'll ignore it");
return
}}if(!this.currentClip||this.currentClip.streamType=="empty"||this.clipEnded===true){return
}if(this.currentClip.baseClip.isAd){this.currentClip.hasPlayed=true;
this.playbackManager.updateClip(this.currentClip)
}tpDebug("onEnded called for for url "+this.currentClip.URL);
tpDebug("Clearing timeUpdateTimer");
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}this.jumpTime=undefined;
this.needsJump=false;
this.currentVideoTime=undefined;
var a=this.videoEngine.getCurrentTime();
tpDebug("Dispatching OnMediaEnd at "+a+" for src:"+this.currentClip.URL);
if(this.startedPlaying&&!this.clipEnded){tpDebug("Calling endMedia()");
this.endMedia()
}else{tpDebug("Never started Playing or clipEnded is already true","tpPlayer");
if(!this.releaseSet&&!this.loading){this.playbackManager.nextClip()
}}this.releaseSet=false
},onAudioTrackSwitched:function(c){tpDebug("audioTrackSwitched from VE new:"+c.newAudioTrackIndex,"tpPlayer");
var a=this.videoEngine.getAudioTrackByIndex(c.newAudioTrackIndex);
var d=this.videoEngine.getAudioTrackByIndex(c.oldAudioTrackIndex);
if(a){a.globalDataType="com.theplatform.com.data::AudioTrack"
}if(d){d.globalDataType="com.theplatform.com.data::AudioTrack"
}var b={oldAudioTrack:d,newAudioTrack:a};
if(this.startedPlaying){this.controller.dispatchEvent("OnAudioTrackSwitched",b)
}else{this.standbySwitchedAudio=b
}},endMedia:function(){this.clipEnded=true;
this.playbackManager.endMedia(this.currentClip);
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}},onTimeUpdate:function(g){if(this.currentClip===undefined){return
}if(this.isSeeking){tpDebug("We're still seeking so we'll suppress onTimeUpdate");
return
}if(this.clipEnded){tpDebug("onTimeUpdate fired somehow even though clipEnded is true");
clearInterval(this.timeUpdateTimer);
return
}if(this.currentClip&&!this.startedPlaying){this.startedPlaying=true;
var b=tpGetPid(this.currentReleaseUrl);
this.currentClip.releasePID=b;
this.currentClip.trueLength=Math.floor(this.videoEngine.getTotalTime());
this.currentClip.baseClip.loadTime=0;
if(this.currentClip.baseClip.isAd){this.currentClip.mediaLength=this.currentClip.trueLength;
this.currentClip.length=this.currentClip.trueLength;
this.currentClip.baseClip.trueLength=this.currentClip.trueLength
}this.currentClip.currentMediaTime=this.videoEngine.getCurrentTime();
this.currentClip.mediaTime=this.currentClip.currentMediaTime;
this.previousTime=this.currentClip.currentMediaTime;
tpDebug("Player dispatching OnMediaStart paused="+this.videoEngine.isPaused()+" for clip with index "+this.currentClip.clipIndex+" and url "+this.currentClip.URL);
this.suppressPause=false;
this.startedPlaying=true;
this.controller.dispatchEvent("OnMediaStart",this.currentClip);
if(this.standbySwitchedAudio){this.controller.dispatchEvent("OnAudioTrackSwitched",this.standbySwitchedAudio);
this.standbySwitchedAudio=null
}}if(this.jumpTime){}else{if(this.delaySeek){if(this.doSeek(this.delaySeek)){this.delaySeek=undefined;
this.delaySeekPercentage=undefined
}}else{if(this.delaySeekPercentage){if(this.seekToPercentage(this.delaySeekPercentage)){this.delaySeekPercentage=undefined
}}else{if(this.currentVideoTime&&Math.abs(this.currentVideoTime-(this.videoEngine.getCurrentTime()))<250){}else{if(!this.clipEnded){var a=true;
if(this.currentClip&&!this.currentClip.isAd){a=false
}if(!this.videoEngine.isPaused()){this.showBlocker(false)
}else{if(this.blockerShowing===true){this.showBlocker(false)
}}if(this.videoEngine.getCurrentTime()===0&&this.currentClip&&this.currentClip.currentMediaTime>0&&Math.abs(this.currentClip.currentMediaTime-this.currentClip.endTime)<1000){this.onEnded();
return
}else{if(this.videoEngine.getCurrentTime()===0){return
}}var f=this.currentTimeObject;
this.currentTimeObject=this.createCurrentTimeObject();
if(this.currentClip){this.currentClip.currentMediaTime=Math.floor(this.videoEngine.getCurrentTime());
this.currentClip.mediaTime=this.currentClip.currentMediaTime;
this.currentClip.mediaLength=!isNaN(this.videoEngine.getTotalTime())?Math.round(this.videoEngine.getTotalTime()):this.currentClip.mediaLength;
if(!this.currentClip.chapter||!this.currentClip.chapter.chapters.isAggregate){this.currentClip.endTime=!isNaN(this.videoEngine.getTotalTime())?Math.round(this.videoEngine.getTotalTime()):this.currentClip.mediaLength;
this.currentClip.mediaLength=!isNaN(this.videoEngine.getTotalTime())?Math.round(this.videoEngine.getTotalTime()):this.currentClip.mediaLength;
if(this.currentClip.chapter){this.currentClip.chapter.chapters.aggregateLength=!isNaN(this.videoEngine.getTotalTime())?Math.round(this.videoEngine.getTotalTime()):this.currentClip.mediaLength
}}this.controller.updateMediaTime(this.currentClip.currentMediaTime)
}if(this.percentLoaded<1&&this.percentLoaded!=this.videoEngine.getPercentLoaded()){this.percentLoaded=this.videoEngine.getPercentLoaded();
this.onProgress({percentLoaded:this.percentLoaded})
}if(f==null||(f.currentTime!==this.currentTimeObject.currentTime)){this.controller.dispatchEvent("OnMediaPlaying",this.currentTimeObject)
}this.showVideo();
this.showBlocker(false);
var d=this.videoEngine.getCurrentTime();
if(this.currentVideoTime){d=this.currentVideoTime
}this.currentVideoTime=undefined;
var c=this.videoEngine.getTotalTime();
if(this.currentClip&&this.currentClip.endTime&&this.currentClip.endTime>0&&Math.abs(d-this.currentClip.endTime)<300&&Math.abs(d-c)>1000){this.currentVideoTime=this.videoEngine.getCurrentTime();
if(this.currentClip.baseClip.isAd){this.currentClip.hasPlayed=true
}this.playbackManager.updateClip(this.currentClip);
tpDebug("Calling onEnded() at "+this.videoEngine.getCurrentTime());
this.onEnded()
}else{if(this.currentClip.endTime>0&&d>this.currentClip.endTime||d<(this.currentClip.startTime-1)){tpDebug("We're outside of the clip boundaries for clipIndex "+this.currentClip.clipIndex+" of "+this.currentClip.startTime+" to "+this.currentClip.endTime+" , so sending a seek event at currentTime:"+d)
}}this.previousTime=d
}}}}}},createCurrentTimeObject:function(){if(!this.video){return undefined
}var f=Math.round(this.videoEngine.getCurrentTime());
var a=this.currentClip.chapter;
var g=false;
if(a&&!this.currentClip.baseClip.isAd&&(f<a.startTime||f>a.endTime)){var c=0;
var h=this.playlist.chapters.chapters.length;
for(;
c<h;
c++){var k=this.playlist.chapters.chapters[c];
var e=this.playlist.chapters.chapters[c+1];
if(k&&f>=k.startTime&&f<=k.endTime){tpDebug("selecting chapter "+c);
g=true;
a=k;
break
}else{if(e&&f>=k.endTime&&f<=e.startTime){g=true;
tpDebug("selecting chapter "+(c+1));
a=e;
f=a.startTime;
break
}}}}if(a&&a.chapters&&(a.chapters.isAggregate||a.chapters.isRelative)){var b={globalDataType:"com.theplatform.pdk.data::TimeObject"};
b.mediaTime=f;
b.currentTime=f-a.startTime;
b.currentTimeAggregate=a.aggregateStartTime+b.currentTime;
b.duration=a.length;
b.durationAggregate=a.chapters.aggregateLength;
b.percentComplete=(b.currentTime/a.length)*100;
b.percentCompleteAggregate=(b.currentTimeAggregate/b.durationAggregate)*100,b.isAggregate=a.chapters.isAggregate,b.isLive=false;
return b
}else{var l=Math.round(this.videoEngine.getCurrentTime());
var j=Math.round(this.videoEngine.getTotalTime());
return{globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:l,currentTime:l,currentTimeAggregate:l,duration:j,durationAggregate:j,percentComplete:(l/j)*100,percentCompleteAggregate:(l/j)*100,isAggregate:false,isLive:false}
}},cloneTimeObject:function(a){return a?{globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:a.mediaTime,currentTime:a.currentTime,currentTimeAggregate:a.currentTimeAggregate,duration:a.duration,durationAggregate:a.durationAggregate,percentComplete:a.percentComplete,percentCompleteAggregate:a.percentCompleteAggregate,isAggregate:a.isAggregate,isLive:a.isLive}:undefined
},onPlaybackError:function(a){if(this.ignoreErrors||!this.currentClip||this.currentClip.streamType=="empty"){tpDebug("Ignoring playback error");
return
}tpDebug("Got a playback error from the video engine, the call to play media must not have orginated from a user click.");
if(this.currentReleaseUrl){tpDebug("Calling loadReleaseUrl for "+this.currentReleaseUrl);
this.controller.loadReleaseURL(this.currentReleaseUrl)
}else{tpDebug("We don't have a releaseurl to load")
}},onError:function(a){if(this.ignoreErrors||!this.currentClip||this.currentClip.streamType=="empty"){return
}clearTimeout(this.nextClipTimerId);
this.showControls(false);
this.showBlocker(true);
if(true){if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}if(true){this.hasError=true;
var b={location:this.id,context:null,clip:this.currentClip,endRelease:!this.currentClip.baseClip.isAd,message:"The media cannot be played",friendlyMessage:"The media cannot be played",globalDataType:"com.theplatform.pdk.data::PlaybackError"};
if(this.currentClip.baseClip.isAd){this.currentClip.hasPlayed=true;
this.playbackManager.updateClip(this.currentClip)
}this.suppressPause=false;
this.controller.sendError(b)
}}else{tpDebug("But it's an ignorable error!")
}},showVideo:function(){if(this.isShowing){return
}if(this.waitToShowVideoFunction){tpDebug("showVideo triggered by timeout");
clearTimeout(this.waitToShowVideoFunction);
this.waitToShowVideoFunction=undefined
}tpDebug("showing main video");
this.player.style.marginLeft="";
this.player.style.display="";
this.player.style.top="0px";
this.player.style.zIndex="auto";
this.player.style.width="100%";
this.player.style.height="100%";
this.videoEngine.show(true);
this.waitforcanplay=false;
if(!tpIsIOS()){this.controller.dispatchEvent("OnForceShowVideo",null)
}this.isShowing=true
},hideVideo:function(){if(this.isShowing===false){return
}tpDebug("hiding video");
if(tpIsIOS()){this.player.style.marginLeft="-10000px"
}else{this.player.style.top="10px";
this.player.style.width="1px";
this.player.style.height="8px";
this.player.style.zIndex="8888"
}this.isShowing=false
},loadPoster:function(b){if(!b){return
}if(!this.standby){this.standby=document.getElementById(this.id+".standby")
}var a=b.split("?")[0]+"?format=poster&width="+this.standby.offsetWidth+"&height="+this.standby.offsetHeight;
this.videoEngine.setPoster(a)
},simulateClick:function(d){tpDebug("simulateClick");
var c=document.createElement("a");
c.id="clickSimulator";
c.href="#";
document.body.appendChild(c);
c.addEventListener("click",function(a){a.preventDefault();
d()
},false);
var b;
if(document.createEvent){b=document.createEvent("MouseEvents");
if(b.initMouseEvent){b.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
c.dispatchEvent(b)
}}document.body.removeChild(c)
},setMediaArea:function(a){if(a.width>0&&a.height>0){this._mediaArea=a;
this.blocker.style.height=a.height+"px";
this.controller.dispatchEvent("OnMediaAreaChanged",this.getMediaArea())
}},getMediaArea:function(){if(!this.standby){this.standby=document.getElementById(this.id+".standby")
}if(this._mediaArea===null||typeof(this._mediaArea)!=="object"){return{top:0,left:0,x:0,y:0,width:this.standby.offsetWidth,height:this.standby.offsetHeight}
}return{top:this._mediaArea.y,left:this._mediaArea.x,x:this._mediaArea.x,y:this._mediaArea.y,width:this._mediaArea.width,height:this._mediaArea.height}
},getComponentSize:function(){return tpGetComponentSize(this.container)
},_fixAndroidChrome:function(d){if(this._androidReady){d();
return
}this.removeListeners();
this.videoEngine.load("",0);
this._androidReady=true;
var a=this;
var c=false;
var b=function(f){if(c){return
}a.videoEngine.removeEventListener("MEDIA_ERROR",b);
if(f){a.videoEngine.unload();
d()
}c=true
};
this.videoEngine.addEventListener("MEDIA_ERROR",b);
setTimeout(b,1000)
},showControlBlocker:function(a){this.controlBlockerShowing=a;
a?this.controlBlocker.style.display="":this.controlBlocker.style.display="none"
},showBlocker:function(a){this.blockerShowing=a;
a?this.blocker.style.display="":this.blocker.style.display="none"
},handleOnMediaAreaChanged:function(a){this.video.style.top=a.data.y+"px";
this.video.style.left=a.data.x+"px";
this.video.style.width=a.data.width+"px";
this.video.style.height=a.data.height+"px";
this.video.style.position="absolute";
this.blocker.style.top=a.data.y+"px";
this.blocker.style.left=a.data.x+"px";
this.blocker.style.width=a.data.width+"px";
this.blocker.style.height=a.data.height+"px";
this.blocker.style.position="absolute"
},handleOnOverlayAreaChanged:function(a){if(this.videoengineruntime==="silverlight"){this.controlBlocker.style.width=a.data.width+"px";
this.controlBlocker.style.height=a.data.height+"px"
}}});
if(typeof(Player)==="undefined"){Player=tpPlayer
}PlugInManager=Class.extend({init:function(a){this.controller=a;
this.plugins=new Array()
},addPlugIn:function(b,h,i,a,e,f,g,c){if((c==undefined&&a.indexOf(".swf")<0)||(c&&c.toLowerCase().indexOf("html")>=0)){var d={id:b,type:h,priority:i,url:a,subUrl:e,vars:f,plugIn:g};
this.plugins.push(d)
}},ready:function(){if(!this.plugins||this.plugins.length===0){var b=this;
setTimeout(function(){b.controller.dispatchEvent("OnPlugInsComplete",null)
},1)
}for(var a=0;
a<this.plugins.length;
a++){tpController.loadPlugIn(this.plugins[a],this.controller)
}}});
tpReleaseList=PDKComponent.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'" class="releaseList"></div>'
},init:function(d,c,a){this.width=c;
this.height=a;
this.id=d;
this.pretty=!navigator.userAgent.match(/MSIE 8/)&&!navigator.userAgent.match(/MSIE 7/)&&!navigator.userAgent.match(/MSIE 6/);
if($pdk._isDevMode){this.pretty=false
}this.controller=new ComponentController(d);
var b=$pdk.shell.Registry.getInstance().getShells().get(d);
this.deferredController=b?b._deferredController:null;
this.hasAutoPlayed=false;
this.hasAutoLoaded=false;
this.eventQueue=[];
this.playing=false
},initialize:function(){var a=this;
if(this.scopes){this.controller.scopes=[this.id].concat(this.scopes.split(","))
}else{this.controller.scopes=[this.id,"default"]
}if(this.deferredController){this.deferredController.addEventListener("OnRefreshReleaseModelStarted",function(){a.handleRefreshStarted.apply(a,arguments)
});
this.deferredController.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.deferredController.addEventListener("OnLoadRelease",function(){a.handleLoadRelease.apply(a,arguments)
});
this.deferredController.addEventListener("OnLoadReleaseUrl",function(){a.handleLoadRelease.apply(a,arguments)
});
this.deferredController.addEventListener("OnFetchReleaseData",function(){a.handleLoadRelease.apply(a,arguments)
})
}this.controller.addEventListener("OnRefreshReleaseModelStarted",function(){a.handleRefreshStarted.apply(a,arguments)
});
this.controller.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.controller.addEventListener("OnSetReleaseUrl",function(){a.handleSetReleaseUrl.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseSelected",function(){a.handleOnReleaseSelected.apply(a,arguments)
});
this.controller.addEventListener("OnLoadRelease",function(){a.handleLoadRelease.apply(a,arguments)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(){a.handleLoadRelease.apply(a,arguments)
});
this.controller.addEventListener("OnFetchReleaseData",function(){a.handleLoadRelease.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseStart",function(){a.handleReleaseStart.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){a.handleReleaseEnd.apply(a,arguments)
});
this.controller.addEventListener("OnMediaStart",function(){a.handleMediaStart.apply(a,arguments)
});
this.controller.addEventListener("OnMediaEnd",function(){a.handleMediaEnd.apply(a,arguments)
});
this.controller.registerFunction("playNext",this,this.playNext);
this.controller.registerFunction("playPrevious",this,this.playPrevious);
this.currentIndex=-1;
this.createdThumbnailStyles=false;
if(this.showtitle===undefined){this.showtitle=true
}if(this.showdescription===undefined){this.showdescription=true
}if(this.showlength===undefined){this.showlength=true
}if(this.showthumbnail===undefined){this.showthumbnail=true
}if(this.defaultthumbnailheight===undefined){this.defaultthumbnailheight=100
}if(this.thumbnailwidth===undefined){this.thumbnailwidth=160
}if(this.thumbnailheight===undefined){this.thumbnailheight=90
}if(this.showtitle==="false"){this.showtitle=false
}if(this.showdescription==="false"){this.showdescription=false
}if(this.showlength==="false"){this.showlength=false
}if(this.showthumbnail==="false"){this.showthumbnail=false
}this.showTitle=this.showtitle;
this.showDescription=this.showdescription;
this.showLength=this.showlength;
this.showThumbnail=this.showthumbnail;
this.thumbnailWidth=this.thumbnailwidth;
this.thumbnailHeight=this.thumbnailheight;
this.defaultThumbnailHeight=this.defaultthumbnailheight
},write:function(b){if(this.autoLoad===undefined){this.autoLoad=true
}if(this.autoPlay===undefined&&!(tpIsAndroid()||tpIsIOS())){this.autoPlay=true
}else{if(tpIsAndroid()||tpIsIOS()){this.autoPlay=false;
if(this.autoLoad==false){this.autoLoad=true
}}}if(this.playAll===undefined){this.playAll=true
}if(!this.columns){this.columns=2
}else{this.columns=parseInt(this.columns)
}if(!this.rows&&this.itemsPerPage!==undefined){this.rows=this.itemsPerPage/this.columns
}else{if(!this.rows){this.rows=2
}}if(tpIsIOS()){}if(b){this.container=b
}else{document.write('<div id="'+this.id+'" class="releaseList"></div>');
this.container=document.getElementById(this.id);
this.container.style.width=this.width;
this.container.style.height=this.height
}this.style=document.createElement("style");
var a=document.getElementsByTagName("head")[0];
this.style.setAttribute("type","text/css");
a.appendChild(this.style);
this.initialize()
},_bindElement:function(a){if(this.autoLoad==null){this.autoLoad=true
}if(this.autoPlay===undefined&&!(tpIsAndroid()||tpIsIOS())){this.autoPlay=true
}else{if(tpIsAndroid()||tpIsIOS()){this.autoPlay=false
}}if(this.playAll==null){this.playAll=true
}this.container=a;
this.container.style.width=this.width;
this.container.style.height=this.height;
tpController.ready();
return this.container
},handleReleaseStart:function(b){var c;
for(var a=0;
a<b.data.baseClips.length;
a++){if(!b.data.baseClips[a].isAd){c=b.data.baseClips[a].contentID;
break
}}this.doSelectTile(c,b.data.releaseURL)
},setCurrentReleaseUrl:function(a){if(!a){return
}var b=a.search(/[\?\&]format=/);
if(b>0){a=a.substring(0,b)
}this.currentReleaseUrl=a
},handleReleaseEnd:function(a){this.currentClip=undefined;
this.enable()
},getCurrentIndex:function(){var a=-1;
var b=this.currentReleaseUrl;
for(var c=0;
c<this.feed.entries.length;
c++){if(typeof(b)==="string"&&this.releaseUrlsAreEqual(b,this.feed.entries[c].url,this.feed.entries[c].pid)){a=c
}}return a
},playNext:function(c,a){this.currentIndex=this.getCurrentIndex();
this.currentIndex++;
if(this["feed"]===undefined||this.feed.entries.length<=0){if(typeof(this.currentReleaseUrl)==="string"){this.controller.loadReleaseURL(this.currentReleaseUrl,true)
}return
}var b=this.feed.entries[this.currentIndex];
if(c==undefined){c=false
}if(a==undefined){a=false
}this.wasSetByReleaseList=true;
if(a==false||this.playAll){if(b){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.setRelease(b,true);
return
}else{this.controller.loadReleaseURL(this.currentReleaseUrl,true)
}}else{if(b){var d=this.currentClip;
if(!this.playing||a||!d||!(d.noSkip||(d.baseClip&&d.baseClip.noSkip))){if(this.playing===true){this.controller.pause(true);
this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:true});
this.controller.setRelease(b,true);
return
}else{if((tpIsIOS()||tpIsAndroid())||this.playAll===false&&a===false){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.loadReleaseURL(b.url,true);
return
}else{if(this.playAll===true&&a===false){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.setRelease(b,true);
return
}else{if(this.playAll===true&&a===true){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.loadReleaseURL(b.url,true);
return
}else{if(typeof(this.currentReleaseUrl)==="string"){this.controller.loadReleaseURL(this.currentReleaseUrl,true)
}}}}}this.wasSetByReleaseList=true
}else{return
}}else{this.currentIndex--;
this.controller.loadReleaseURL(this.feed.entries[this.currentIndex].url,true)
}}},playPrevious:function(a){if(this.currentIndex>0){this.currentIndex--
}else{if(this.currentIndex==0&&a){this.currentIndex=this.feed.entries.length-1
}}var c=this.feed.entries[this.currentIndex];
if(!c){return
}if(this.autoPlay){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:c.url,userInitiated:false});
this.controller.setRelease(c,true);
return
}else{var b=this.currentClip;
if(!this.playing||!b||!(b.noSkip||(b.baseClip&&b.baseClip.noSkip))){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:c.url,userInitiated:false});
this.controller.setRelease(c,true)
}}},handleLoadRelease:function(a){this.doSelectTile(a.data.id,a.data.url)
},releaseUrlsAreEqual:function(b,a,c){b=b?b.replace(/(.*)\?.*/,"$1"):null;
a=a?a.replace(/(.*)\?.*/,"$1"):null;
return b===a||(b!=null?b.indexOf(c)>=0:false)
},doSelectTile:function(b,a){this.setCurrentReleaseUrl(a);
if(!this.feed){this.currentMediaId=b;
this.currentReleaseUrl=a;
this.currentIndex=-1;
return
}this.currentIndex=-1;
if(b){this.currentIndex=this.setTileSelectedMediaId(b)
}if(this.currentIndex==-1){this.currentIndex=this.setTileSelectedReleasePid(a)
}},setTileSelected:function(a){},setTileSelectedMediaId:function(e){var a=-1;
if(e.indexOf("/")>=0){e=e.split("/").pop()
}var c;
for(var b=0;
b<this.feed.entries.length;
b++){c=this.feed.entries[b].id;
if(c&&c.indexOf("/")>=0){c=c.split("/").pop()
}if(e==c){a=b;
var d=this.items[b];
if(d!==undefined){d.className="tpRelease tpReleaseSelected"
}}else{var d=this.items[b];
if(d!==undefined){d.className="tpRelease"
}}}return a
},setTileSelectedReleasePid:function(b){var a=-1;
for(var c=0;
c<this.feed.entries.length;
c++){if(this.releaseUrlsAreEqual(b,this.feed.entries[c].url,this.feed.entries[c].pid)){a=c;
var d=this.items[c];
if(d!==undefined){d.className="tpRelease tpReleaseSelected"
}}else{var d=this.items[c];
if(d!==undefined){d.className="tpRelease"
}}}return a
},handleOnReleaseSelected:function(b){var a=b.data.releaseUrl;
if(this["feed"]===undefined){return
}this.setCurrentReleaseUrl(a);
this.currentIndex=null;
if(b.data.id){this.currentIndex=this.setTileSelectedMediaId(b.data.id)
}if(this.currentIndex==null){this.currentIndex=this.setTileSelectedReleasePid(b.data.url)
}},handleSetReleaseUrl:function(b){var a=b.data;
this.setCurrentReleaseUrl(a)
},handleRefreshStarted:function(b){if(this.loading||this.paging){return
}var a=this;
this.loading=true;
if(!this.feed){this.refresh()
}if(this.pretty){setTimeout(function(){if(a.loading&&!a.loadingIndicator){a.loadingIndicator=document.createElement("div");
a.loadingIndicator.className="tpFeedLoadingIndicator";
a.container.appendChild(a.loadingIndicator);
$pdk.jQuery(a.loadingIndicator).animate({rotation:720},{easing:"linear",step:function(c,d){$(this).css("transform","rotate("+c+"deg)");
$(this).css("-ms-transform","rotate("+c+"deg)");
$(this).css("-webkit-transform","rotate("+c+"deg)")
},complete:function(){$pdk.jQuery(a.loadingIndicator).remove();
a.loadingIndicator=null
},duration:4000})
}},1000)
}},refresh:function(){var d=document.createElement("div");
var c=document.createElement("div");
var b=this.framecolor?this.framecolor:"#000000";
var a=this.backgroundcolor?this.backgroundcolor:"#ffffff";
b=b.replace("0x","#");
a=a.replace("0x","#");
d.className="tpBackground";
d.style.backgroundColor=a;
d.style.borderColor=b;
c.className="tpBackgroundShine tpGradient";
this.container.innerHTML="";
this.container.appendChild(d);
this.container.appendChild(c)
},isPrefetch:function(){return this.controller.isPrefetch()
},handleReleaseModelRefreshed:function(N){if(this.paging){this.eventQueue.push(N);
return
}this.loading=false;
$pdk.jQuery(this.loadingIndicator).stop();
$pdk.jQuery(this.loadingIndicator).remove();
var j=N.data;
var E=(this.feed&&this.feed.search!==j.search?true:false);
var g;
var f;
var e;
var t;
var A;
var y;
var M;
if(this.feed&&this.feed.range&&j&&j.range){if(j.entries.length>0){this.paging=true
}if(this.feed.range.startIndex<j.range.startIndex){this.animateForward=true
}else{if(this.feed.range.startIndex>j.range.startIndex){this.animateForward=false
}}}else{this.animateForward=false
}this.feed=j;
this.loadedTiles=[];
this.numTiles=j.entries.length;
if(!this.currentPage||E||!this.pretty){this.refresh();
this.currentPage=null;
this.previousPage=null
}var c=-1;
var K=-1;
var x=0;
if(this.hasoverlay=="true"){var b=document.createElement("div");
b.className="tpReleaseListOverlay";
this.container.appendChild(b);
x=b.clientHeight
}var r=document.createElement("ul");
r.className="tpGrid";
this.container.appendChild(r);
$pdk.jQuery(r).css("margin-top",parseInt($pdk.jQuery(r).css("margin-top"))+x);
r.ontouchstart=function(a){this.startX=a.changedTouches[0].pageX;
this.startY=a.changedTouches[0].pageY
};
r.ontouchend=function(a){if(this.startX&&((this.startX-a.changedTouches[0].pageX)>100)){$pdk.controller.nextRange()
}else{if(this.startX&&((a.changedTouches[0].pageX-this.startX)>100)){$pdk.controller.previousRange()
}}};
this.items=[];
var u,d,M,J,F,H,k,q,y,n,e;
var C=($pdk.jQuery(r).innerWidth())/this.columns;
var I=($pdk.jQuery(r).innerHeight())/this.rows;
var B,v,s,m;
var D=16/9;
if(this.allowscrolling=="true"){$(r).append("<li class='tpRelease'><a href='#'><div class='tpInfo'><div class='tpThumbnail'><img></div><div class='tpMetadata'></div></div></a></li>");
I=parseInt(this.thumbnailheight)+parseInt($(r).find(".tpRelease").css("margin-top"))+parseInt($(r).find(".tpRelease").css("margin-bottom"))+parseInt($(r).find(".tpRelease").css("padding-top"))+parseInt($(r).find(".tpRelease").css("padding-bottom"))+parseInt($(r).find(".tpRelease").css("border-top-width"))+parseInt($(r).find(".tpRelease").css("border-bottom-width"))+parseInt($(r).find("a").css("margin-top"))+parseInt($(r).find("a").css("margin-bottom"))+parseInt($(r).find("a").css("border-top-width"))+parseInt($(r).find("a").css("border-bottom-width"))+parseInt($(r).find("a").css("padding-top"))+parseInt($(r).find("a").css("padding-bottom"))+parseInt($(r).find(".tpThumbnail").css("margin-top"))+parseInt($(r).find(".tpThumbnail").css("margin-bottom"))+parseInt($(r).find(".tpThumbnail").css("border-top-width"))+parseInt($(r).find(".tpThumbnail").css("border-bottom-width"))+parseInt($(r).find(".tpThumbnail").css("padding-top"))+parseInt($(r).find(".tpThumbnail").css("padding-bottom"))+parseInt($(r).find(".tpThumbnail img").css("margin-top"))+parseInt($(r).find(".tpThumbnail img").css("margin-bottom"))+parseInt($(r).find(".tpThumbnail img").css("border-top-width"))+parseInt($(r).find(".tpThumbnail img").css("border-bottom-width"))+parseInt($(r).find(".tpThumbnail img").css("padding-top"))+parseInt($(r).find(".tpThumbnail img").css("padding-bottom"));
$(r).children().first().remove();
C-=10;
$pdk.jQuery(r).css("overflow-y","auto")
}if(this.thumbnailwidth&&this.thumbnailheight){D=this.thumbnailwidth/this.thumbnailheight
}for(var G=0;
G<j.entries.length;
G++){u=document.createElement("li");
d=document.createElement("div");
M=document.createElement("a");
J=document.createElement("div");
F=document.createElement("div");
H=document.createElement("div");
k=document.createElement("div");
q=document.createElement("div");
y=document.createElement("h2");
u.className="tpRelease";
if(this.pretty){d.className="tpShine"
}J.className="tpInfo";
F.className="tpThumbnail";
H.className="tpThumbnailOverlay";
k.className="tpMetadata";
q.className="tpGroup";
y.className="tpTitle";
u.appendChild(d);
u.appendChild(M);
M.appendChild(J);
if(this.showThumbnail){J.appendChild(F);
F.appendChild(H)
}else{B=0
}if(this.showTitle||this.showDescription||this.showLength){this.showMetadata=true;
J.appendChild(k);
k.appendChild(q);
q.appendChild(y)
}else{m=0
}r.appendChild(u);
this.items.push(u);
u.style.width=((G+1)%this.columns==0?Math.ceil(C):Math.floor(C))+"px";
u.style.height=((Math.floor(G/this.columns)+1)%this.rows==0?Math.floor(I):Math.ceil(I))+"px";
if((G+1)%this.columns!=0){M.style.borderRightWidth="0px"
}if((Math.floor(G/this.columns)+1)%this.rows!=0){M.style.borderBottomWidth="0px"
}if(this.showThumbnail&&!B){B=$(u).find("a").innerHeight()-($(F).outerHeight(true)-$(F).innerHeight())-($(J).outerHeight(true)-$(J).innerHeight());
if(!this.showMetadata){v=Math.min(Math.floor(B*D),$(u).find(".tpInfo").innerWidth()-parseInt($(u).find(".tpThumbnail").css("border-left-width"))-parseInt($(u).find(".tpThumbnail").css("border-right-width")));
$(F).css("margin-right","0px")
}}if(this.showMetadata&&!m){m=$(u).find("a").innerWidth()-($(F).outerWidth(true)-$(F).innerWidth()+(B*D))-($(k).outerWidth(true)-$(k).innerWidth())-($(J).outerWidth(true)-$(J).innerWidth())-1;
if(!this.showThumbnail){s=$(u).find(".tpInfo").innerHeight()-parseInt($(u).find(".tpMetadata").css("border-top-width"))-parseInt($(u).find(".tpMetadata").css("border-top-width"))
}}B=Math.max(0,B);
v=Math.max(0,v);
s=Math.max(0,s);
m=Math.max(0,m);
if(J){F.style.height=B+"px";
if(this.showMetadata){F.style.width=(B*D)+"px"
}else{F.style.width=(v)+"px"
}k.style.width=m+"px";
if(this.showThumbnail){k.style.height=B+"px"
}else{k.style.height=s+"px"
}}M.href="#";
M.release=j.entries[G];
M.index=G;
var o=this;
var l=document.createElement("canvas");
if(!this.createdThumbnailStyles){var H=$pdk.jQuery(M).find(".tpThumbnailOverlay")[0];
this.createdThumbnailStyles=true;
tpCreateColorizedStateStyles(H,".tpReleaseList .tpRelease{state} .tpThumbnail .tpThumbnailOverlay { background-image: {url}; }",o.thumbnailframecolor,this.thumbnailhighlightselectedcolor,this.thumbnailhighlighthovercolor,this.style,"Selected")
}M.onclick=function(){if(o.currentClip&&o.currentClip.baseClip&&o.currentClip.baseClip.noSkip){return
}o.wasSetByReleaseList=true;
o.currentIndex=this.index;
if(o.isPrefetch()){o.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.release.url,userInitiated:true});
o.controller.loadReleaseURL(this.release.url,true)
}else{o.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.release.url,userInitiated:true});
o.controller.setRelease(this.release,true)
}return false
};
if(this.showTitle){y.innerHTML+=j.entries[G].title
}if(this.showLength){var p=j.entries[G].length;
if(p>0){y.innerHTML+='<span class="tpDuration"> ('+tpMillisToStr(p)+")</span>"
}}if(this.showDescription){n=document.createElement("p");
n.innerHTML=j.entries[G].description;
q.appendChild(n)
}if(this.showThumbnail){e=document.createElement("img");
e.style.display="none";
e.style.visibility="hidden";
e.tile=u;
e.onload=e.onerror=function(T){this.style.display="";
this.style.visibility="visible";
var U=$pdk.jQuery(F).width();
var Y=$pdk.jQuery(F).height();
var P=parseInt($pdk.jQuery(this).css("margin-left"));
var O=parseInt($pdk.jQuery(this).css("margin-right"));
var a=parseInt($pdk.jQuery(this).css("margin-top"));
var W=parseInt($pdk.jQuery(this).css("margin-bottom"));
P=(P?P:0);
O=(P?P:0);
a=(P?P:0);
W=(P?P:0);
var X=U-P-O;
var S=Y-a-W;
if(T!==true){tpScaleImage(this,X,S);
var V=this.newWidth;
var R=this.newHeight;
if(!V){V=X
}if(!R){R=S
}}else{V=0;
R=0;
this.style.display="none"
}var Q=(S-R)/2;
var i=(X-V)/2;
if(V<X){this.style.paddingLeft=Math.floor(i)+"px";
this.style.paddingRight=Math.floor(i)+"px"
}else{if(R<S){this.style.paddingTop=Math.floor(Q)+"px";
this.style.paddingBottom=Math.floor(Q)+"px"
}}o.handleTileLoaded(this.tile)
};
e.tile.style.display="none";
F.appendChild(e);
if(j.entries[G].media$thumbnails&&j.entries[G].media$thumbnails.length==1){e.src=j.entries[G].media$thumbnails[0].plfile$url
}if(j.entries[G].defaultThumbnailUrl){e.src=j.entries[G].defaultThumbnailUrl
}else{e.onload(true)
}}else{this.handleTileLoaded(u)
}}if(this.currentPage){this.previousPage=this.currentPage;
var C=$pdk.jQuery(r).width();
if(this.animateForward){$pdk.jQuery(r).find(".tpRelease").css("left",C+"px")
}else{$pdk.jQuery(r).find(".tpRelease").css("left",(-C)+"px")
}}this.currentPage=r;
var o=this;
setTimeout(function(){o.doInitialLoad(j)
},1);
if(this.style&&!this.createdColorizationStyles){this.createdColorizationStyles=true;
var L="";
if(this.itembackgroundcolor){L+="#"+this.id+".tpReleaseList>ul .tpRelease a, ul#"+this.id+".tpReleaseList .tpRelease a { background-color: #"+this.itembackgroundcolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList>ul .tpRelease a .tpMetadata, ul#"+this.id+".tpReleaseList .tpRelease a .tpMetadata { background-color: #"+this.itembackgroundcolor.substr(2)+"; }"
}if(this.itemframecolor){L+="#"+this.id+".tpReleaseList .tpRelease a { border-color: #"+this.itemframecolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpRelease .tpShine { background-color: #"+this.itemframecolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpRelease .tpShine { border-color: #"+this.itemframecolor.substr(2)+"; }"
}if(this.textframecolor){L+="#"+this.id+".tpReleaseList .tpRelease .tpMetadata { border-color: #"+this.textframecolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpRelease a .tpMetadata .tpGroup { border-color: #"+this.textframecolor.substr(2)+"; }"
}if(this.textcolor){L+="#"+this.id+".tpReleaseList .tpRelease a { color: #"+this.textcolor.substr(2)+"; }"
}if(this.thumbnailframecolor){L+="#"+this.id+".tpReleaseList .tpRelease .tpThumbnail { border-color: #"+this.thumbnailframecolor.substr(2)+"; }"
}if(this.thumbnailbackgroundcolor){L+="#"+this.id+".tpReleaseList .tpRelease .tpThumbnail { background-color: #"+this.thumbnailbackgroundcolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpRelease .tpThumbnail img { background-color: #"+this.thumbnailbackgroundcolor.substr(2)+"; }"
}if(this.thumbnailpaddingcolor){L+="#"+this.id+".tpReleaseList .tpRelease .tpThumbnail { background-color: #"+this.thumbnailpaddingcolor.substr(2)+"; }"
}if(this.framecolor){L+="#"+this.id+".tpReleaseList { border-color: #"+this.framecolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList ul { border-color: #"+this.framecolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList ol { border-color: #"+this.framecolor.substr(2)+"; }"
}if(this.texthighlighthovercolor){L+="#"+this.id+".tpReleaseList .tpRelease:hover .tpShine { background-color: #"+this.texthighlighthovercolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpRelease:hover .tpShine { border-color: #"+this.texthighlighthovercolor.substr(2)+"; }"
}if(this.texthovercolor){L+="#"+this.id+".tpReleaseList .tpRelease:hover a { color: #"+this.texthovercolor.substr(2)+"; }"
}if(this.texthighlighthovercolor){L+="#"+this.id+".tpReleaseList .tpRelease:hover a .tpMetadata .tpGroup { border-color: #"+this.texthighlighthovercolor.substr(2)+" !important; }"
}if(this.thumbnailhighlighthovercolor){L+="#"+this.id+".tpReleaseList .tpRelease:hover a .tpThumbnail { border-color: #"+this.thumbnailhighlighthovercolor.substr(2)+" !important; }"
}if(this.itemshineselectedcolor){L+="#"+this.id+".tpReleaseList .tpReleaseSelected .tpShine { background-color: #"+this.itemshineselectedcolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpReleaseSelected .tpShine { border-color: #"+this.itemshineselectedcolor.substr(2)+"; }"
}if(this.textselectedcolor){L+="#"+this.id+".tpReleaseList .tpReleaseSelected a { color: #"+this.textselectedcolor.substr(2)+"; }"
}if(this.texthighlightselectedcolor){L+="#"+this.id+".tpReleaseList .tpReleaseSelected a .tpMetadata .tpGroup { border-color: #"+this.texthighlightselectedcolor.substr(2)+" !important; }"
}if(this.thumbnailhighlightselectedcolor){L+="#"+this.id+".tpReleaseList .tpReleaseSelected a .tpThumbnail { border-color: #"+this.thumbnailhighlightselectedcolor.substr(2)+" !important; }"
}if(this.itemshineselectedcolor){L+="#"+this.id+".tpReleaseList .tpReleaseSelected:hover .tpShine { background-color: #"+this.itemshineselectedcolor.substr(2)+"; }";
L+="#"+this.id+".tpReleaseList .tpReleaseSelected:hover .tpShine { border-color: #"+this.itemshineselectedcolor.substr(2)+"; }"
}if(this.textselectedcolor){L+="#"+this.id+".tpReleaseList .tpReleaseSelected:hover a { color: #"+this.textselectedcolor.substr(2)+"; }"
}if(this.backgroundcolor&&this.itembackgroundcolor&&this.framecolor){L+=".tpReleaseList ::-webkit-scrollbar                     { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
L+=".tpReleaseList ::-webkit-scrollbar-track               { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
L+=".tpReleaseList ::-webkit-scrollbar-thumb               { background-color: #"+this.itembackgroundcolor.substr(2)+"; border-color: #"+this.framecolor.substr(2)+"}\n";
L+=".tpReleaseList ::-moz-scrollbar                     { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
L+=".tpReleaseList ::-moz-scrollbar-track               { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
L+=".tpReleaseList ::-moz-scrollbar-thumb               { background-color: #"+this.itembackgroundcolor.substr(2)+"; border-color: #"+this.framecolor.substr(2)+"}\n"
}if(this.style.styleSheet){this.style.styleSheet.cssText=L
}else{this.style.appendChild(document.createTextNode(L))
}}if(this.currentReleaseUrl||this.currentMediaId){this.doSelectTile(this.currentMediaId,this.currentReleaseUrl)
}var z=this.currentClip;
if(z&&(z.baseClip&&(z.baseClip.noSkip))){this.disable()
}else{if(this.blocker){this.enable()
}}},handleTileLoaded:function(c){var b=this;
this.loadedTiles.push(c);
if(this.loadedTiles.length==this.numTiles){if(!this.pretty){$pdk.jQuery(this.container).find(".tpRelease").css("display","");
$pdk.jQuery(b.previousPage).remove()
}else{if(this.previousPage){this.paging=true;
var a=$pdk.jQuery(this.currentPage).width();
if(this.animateForward){$pdk.jQuery(this.container).find(".tpRelease").css("display","").css("-webkit-filter","blur(1px)").css("filter","blur(2px)");
$pdk.jQuery(this.container).find(".tpGrid .tpRelease").animate({left:"-="+a},600,function(){$pdk.jQuery(b.previousPage).remove();
b.paging=false;
$pdk.jQuery(b.container).find(".tpRelease").css("-webkit-filter","").css("filter","");
if(b.eventQueue&&b.eventQueue.length){b.handleReleaseModelRefreshed(b.eventQueue.shift())
}})
}else{$pdk.jQuery(this.container).find(".tpRelease").css("display","").css("-webkit-filter","blur(1px)").css("filter","blur(2px)");
$pdk.jQuery(this.container).find(".tpGrid .tpRelease").animate({left:"+="+a},600,function(){$pdk.jQuery(b.previousPage).remove();
b.paging=false;
$pdk.jQuery(b.container).find(".tpRelease").css("-webkit-filter","").css("filter","");
if(b.eventQueue&&b.eventQueue.length){b.handleReleaseModelRefreshed(b.eventQueue.shift())
}})
}}else{$pdk.jQuery(this.container).find(".tpRelease").fadeIn(400,function(){b.paging=false
})
}}if(this.showDescription){setTimeout(function(f){for(var d=0;
d<b.loadedTiles.length;
d++){tpEllipsis($pdk.jQuery(b.loadedTiles[d]).find(".tpGroup")[0],$pdk.jQuery(b.loadedTiles[d]).find(".tpGroup p")[0])
}},1)
}}},doInitialLoad:function(a){if(!a.entries||a.entries.length<=0){return
}tpDebug("doInitialLoad called");
if(!this.currentReleaseUrl&&this.autoPlay&&!this.hasAutoPlayed){tpDebug("doInitialLoad firing OnReleaseSelected");
this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:a.entries[0].url,userInitiated:false});
this.controller.setRelease(a.entries[0],false);
this.wasSetByReleaseList=true
}else{if(!this.currentReleaseUrl&&this.autoLoad&&!this.hasAutoLoaded){this.hasAutoLoaded=true;
this.controller.loadRelease(a.entries[0],false);
this.wasSetByReleaseList=true
}}},handleMediaStart:function(b){this.playing=true;
var a=b.data;
if(a.baseClip&&(a.baseClip.noSkip)){this.disable()
}else{if(this.blocker){this.enable()
}}this.currentClip=a
},disable:function(){if(tpIsIPhone()||tpIsAndroid()){return
}if(!this.blocker){this.blocker=document.createElement("div");
this.blocker.style.width="100%";
this.blocker.style.height="100%";
this.blocker.style.position="absolute";
this.blocker.style.top="0";
this.blocker.style.left="0";
this.blocker.style.background="black";
this.blocker.style.opacity="0.75";
this.blocker.style.filter="alpha(opacity=75)";
this.blocker.innerHTML="&nbsp;";
this.blocker.style.zIndex="500";
this.container.appendChild(this.blocker)
}this.blocker.style.display="";
var a=this.container.childNodes;
for(child in a){if(child.style){child.style.opacity="0.75";
child.style.filter="alpha(opacity=75)"
}}},enable:function(){tpDebug("Doing enable");
try{if(this.blocker){this.blocker.style.display="none"
}var b=this.container.childNodes;
for(child in b){if(child.style){child.style.opacity="";
child.style.filter=""
}}}catch(a){tpDebug("enabled() threw an error with "+a.message+" on "+a.lineNumber)
}},handleMediaEnd:function(a){this.playing=false;
tpDebug("Enabling releaseList");
this.enable()
},output:function(b){var a="";
for(prop in b){a+=prop+": "+b[prop]+"\n"
}alert(a)
}});
ReleaseList=tpReleaseList;
var SeekEvents={USERSEEKED:"userseeked",PROGRAMATICALLYSEEKED:"programaticallyseeked",SEEKFAILED:"seekfailed"};
var SeekStates={PAUSED:"paused",PLAYING:"playing",USERSEEKING:"userseeking",PROGRAMATICALLYSEEKING:"programaticallyseeking",ERROR:"error"};
SeekHandler=EventDispatcher.extend({init:function(a){this.videoEngine=a;
this.seekInterval=350;
this.seekState=this.videoEngine.isPaused()?SeekStates.PAUSED:SeekStates.PLAYING;
var b=this;
if(!tpIsIOS()){}else{}this.videoEngine.addEventListener("MEDIA_SEEKED",function(c){b.onSeeked(c)
});
this.lastTime=this.videoEngine.getCurrentTime()/1000
},stopTimer:function(){clearInterval(this.seekTimer)
},startTimer:function(){var a=this;
this.lastTime=0;
this.seekTimer=setInterval(function(){a.onTimer()
},this.seekInterval)
},onSeeked:function(b){tpDebug("got seeked event from "+this.lastTime+" to"+this.videoEngine.getCurrentTime());
this.lastTime=this.video.getCurrentTime()/1000;
if(false&&this.seeking&&Math.abs(this.videoEngine.getCurrentTime()/1000-this.seekingTo)<=300){}else{tpDebug("This was a user seek");
var a=this;
setTimeout(function(){a.dispatchEvent(SeekEvents.USERSEEKED,a.lastTime)
},1)
}this.seekState=this.videoEngine.isPaused()?SeekStates.PAUSED:SeekStates.PLAYING
},onSeeking:function(a){},onTimer:function(){},doSeek:function(b,a,c){},removeProgressListeners:function(){clearInterval(this.progTimer);
this.progTimer=undefined
},checkPlayable:function(){return this.video.readyState>=3
},checkSeekable:function(a){return false
},checkBuffered:function(a){return false
},destroy:function(){this.buildListenerChain();
this.removeProgressListeners();
clearInterval(this.seekTimer)
}});
var RELEASE_WAIT_TIME=1000;
var STANDBY_WAIT_TIME=250;
StandbyManager=Class.extend({init:function(b,a){this.controller=b;
this.pbm=a;
var c=this;
this.controller.registerFunction("showMenuCard",this,this.showMenuCard);
this.controller.registerFunction("checkIfEndCardExists",this,this.checkIfEndCardExists);
this.controller.addEventListener("OnLoadRelease",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnReleaseSelected",function(f){c.checkStandbyRS(f)
});
this.controller.addEventListener("OnPlugInsComplete",function(f){});
this.controller.addEventListener("OnLoadSmil",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnMediaEnd",function(f){c.playing=false
});
this.controller.addEventListener("OnMediaStart",function(f){c.playing=true
});
this.controller.addEventListener("OnReleaseEnd",function(f){tpDebug("StandbyManager got "+f.type);
c.playing=false;
c.checkStandbyRE(f)
});
this.controller.addEventListener("OnClearCurrentRelease",function(f){tpDebug("StandbyManager got "+f.type);
c.controller.dispatchEvent("OnShowPreviewImageOverlay",false);
c.controller.dispatchEvent("OnShowPlayOverlay",false);
c.endStandby(f)
});
this.controller.addEventListener("OnReleaseError",function(f){tpDebug("StandbyManager got "+f.type);
c.endStandby(f)
});
this.controller.addEventListener("OnShowCard",function(f){tpDebug("StandbyManager got "+f.type);
if(f.data.deck=="forms"){c.formVisible=true
}});
this.controller.addEventListener("OnHideCard",function(f){tpDebug("StandbyManager got "+f.type);
if(f.data.deck=="forms"){c.formVisible=false
}});
this.controller.addEventListener("OnSetReleaseUrl",function(f){c.endStandby(f)
});
this.controller.addEventListener("OnSetRelease",function(f){c.endStandby(f)
});
this.controller.addEventListener("OnResetPlayer",function(f){c.endStandby(f)
});
this.timerdelay=RELEASE_WAIT_TIME;
var c=this;
var e=function(){c.controller.removeEventListener("OnPlayerLoaded",e);
c.timerrunning=true;
c.startTimer()
};
this.controller.addEventListener("OnPlayerLoaded",e);
this.releaseEnded=false;
this.lastClip=null;
var d=this.controller.getProperty("endCard");
if(d){this.endCardID=d
}else{this.endCardID="forms:tpMenuCard"
}},showMenuCard:function(a){if(a){this.controller.showPlayerCard("forms","tpMenuCard");
this.cardShowing=true
}else{this.controller.hidePlayerCard("forms");
this.cardShowing=false
}},checkStandby:function(a){this.toWarm=false;
this.stopTimer();
this.timerdelay=STANDBY_WAIT_TIME;
tpDebug("Starting standby timer for "+a.type);
this.startTimer();
this.setStandby(true)
},checkStandbyRS:function(a){tpDebug("release selected "+a);
this.stopTimer()
},checkStandbyRE:function(a){this.lastClip=a.data;
this.toWarm=true;
this.releaseEnded=true;
this.stopTimer();
var b=true;
if(!b){this.timerdelay=RELEASE_WAIT_TIME;
tpDebug("Starting timer for "+a.type);
this.startTimer();
this.setStandby(true)
}},endStandby:function(a){this.toWarm=false;
this.releaseEnded=false;
this.setStandby(false)
},startTimer:function(){var a=this;
if(!this.timerrunning){this.timerrunning=true;
this.timer=setTimeout(function(){a.standbyTick()
},this.timerdelay)
}},stopTimer:function(){clearTimeout(this.timer);
this.timerrunning=false
},setStandby:function(a){if(a){if(!this.timerrunning){tpDebug("Starting timer because it was running");
this.startTimer()
}}else{this.doRemoveStandby()
}},checkIfEndCardExists:function(b){var a=this.controller.getProperty("endCard");
if(a){this.endCardID=a
}else{this.endCardID="tpMenuCard"
}return true
},doStartStandby:function(){tpDebug("doing startStandby");
if(this.playing==true){return
}this.isStandBy=true;
var h=this.controller.getProperty("endCard");
if(h){this.endCardID=h
}var a=true||(this.controller.getProperty("relateditemsURL")!=null||h!=null);
var g=true;
if(!this.releaseEnded||!a||!g){tpDebug("dispatching OnShowPlayOverlay true");
this.controller.dispatchEvent("OnShowPlayOverlay",!this.formVisible);
this.controller.dispatchEvent("OnShowPreviewImageOverlay",true)
}else{this.controller.dispatchEvent("OnShowPreviewImageOverlay",true);
this.controller.dispatchEvent("OnShowPlayOverlay",true);
tpDebug("call to show card");
if(this.endCardID.indexOf(":")!=-1){var d=this.endCardID.split(":");
var b=d[0];
var c=d[1];
this.controller.showPlayerCard(b,c)
}else{this.controller.showPlayerCard("forms",this.endCardID)
}this.cardShowing=true;
if(tpIsIOS()){this.controller.showFullScreen(false)
}}var e;
var f=this;
this.playingListener=function(i){f.controller.removeEventListener("OnMediaPlaying",f.playingListener);
if(f.isStandBy){tpDebug("playingListener hiding overlay");
f.isStandBy=false
}};
this.controller.addEventListener("OnMediaPlaying",this.playingListener,true)
},doShowCard:function(d,f,c,b,e,a){if(f==this.cardID&&c!="Enable"){this.controller.dispatchEvent("OnShowPlayOverlay",true)
}},doRemoveStandby:function(){if(this.timerrunning){this.stopTimer()
}if(this.isStandby){this.isStandby=false;
this.controller.dispatchEvent("OnShowPlayOverlay",false)
}},standbyTick:function(){if(tpIsIOS()){var a=this;
setTimeout(function(){a.doStartStandby()
},1)
}else{this.doStartStandby()
}},clickPlayButton:function(){this.pbm.executeCurrentRelease()
}});
TokenManager=Class.extend({init:function(a){this.controller=a;
this.pluginsLoaded=false;
this.waitTokens=[];
var b=this;
this.controller.registerFunction("setToken",this,this.setToken);
this.plugInsCompleteHandler=function(c){b.plugInsComplete.apply(b,arguments)
};
this.controller.addEventListener("OnPlugInsComplete",this.plugInsCompleteHandler)
},plugInsComplete:function(a){this.controller.removeEventListener("OnPlugInsComplete",this.plugInsCompleteHandler);
this.pluginsLoaded=true;
if(this.waitTokens.length>0){while(this.waitTokens.length>0){this._doSetToken(this.waitTokens.shift())
}}},setToken:function(b,c){var a={token:b,type:c,globalDataType:"com.theplatform.pdk.data::TokenInfo"};
if(this.pluginsLoaded){this._doSetToken(a)
}else{this.waitTokens.push(a)
}},_doSetToken:function(a){this.controller.dispatchEvent("OnSetToken",a)
}});
UrlManager=Class.extend({init:function(a){this.controller=a;
this.plugins=[];
this._currentQueue=[];
this.totalUrlPluginsRegistered=0;
this.totalUrlPluginsLoaded=0;
this.controller.registerFunction("registerURLPlugIn",this,this.registerURLPlugIn);
this.controller.registerFunction("setClip",this,this.setClip)
},checkClip:function(a,b){this._context={clip:a,callback:b,complete:false,found:false};
this._currentQueue=this.plugins.concat();
if(this._currentQueue.length===0){b(a);
return true
}else{if(!this._processNextPlugin()){b(a)
}return false
}},_processNextPlugin:function(){var b=false,a;
while(!b&&this._currentQueue.length>0){a=this._currentQueue.shift();
b=a.component.rewriteURL(this._context.clip)
}this._context.found=b?true:this._context.found;
return this._context.found
},registerURLPlugIn:function(b,c,a){a=parseInt(a);
this.plugins.push({component:b,urlType:c,priority:(isNaN(a)?1000:a)});
this.totalUrlPluginsRegistered++;
this.plugins.sort(this.compare)
},setClip:function(a){if(this._currentQueue.length===0){if(!this._context.complete){this._context.clip=a;
this._context.callback(a);
this._context.complete=true
}}else{this._context.clip=a;
if(!this._processNextPlugin()){this.setClip(a)
}}},compare:function(d,c){return d.priority-c.priority
}});
function tpIsAndroid(){if(navigator.userAgent.match(/iPhone/i)){return false
}else{if(navigator.userAgent.match(/Android/i)){return true
}else{return false
}}}function tpIsChrome(){if(navigator.userAgent.toLowerCase().match(/chrome/i)){return true
}else{return false
}}function tpIsAndroidLegacy(){if(!navigator.userAgent.match(/Android/i)){return false
}else{if(navigator.userAgent.toLowerCase().indexOf("android 1.")!=-1){return true
}else{if(navigator.userAgent.toLowerCase().indexOf("android 2.")!=-1){return true
}else{if(navigator.userAgent.toLowerCase().indexOf("android 3.0")!=-1){return true
}else{if(navigator.userAgent.toLowerCase().indexOf("silk")!=-1){return true
}else{return false
}}}}}}function tpIsIOS(){if(navigator.userAgent.match(/iPad/i)){return true
}if(navigator.userAgent.match(/iPhone/i)){return true
}else{return false
}}function tpIsIPhone(){if(navigator.userAgent.match(/iPhone/i)){return true
}else{return false
}}function tpGetPid(b){var c=b;
if(c&&c.indexOf("pid=")==-1){c=c.substring(c.lastIndexOf("/")+1);
var a=c.indexOf("?");
if(a>0){c=c.substring(0,a)
}}else{if(c){c=c.substring(c.indexOf("pid=")+4);
var a=c.indexOf("&");
if(a>0){c=c.substring(0,a)
}}}return c
}tpControllerClass=$pdk.queue.Controller;
function tpScaleImage(c,g,h){var a=parseInt(c.naturalWidth);
var i=parseInt(c.naturalHeight);
var b=i/a;
c.originalHeight=i;
c.originalWidth=i;
var f=h/g;
var e=g/a;
var d=h/i;
if((e-d)>0){c.height=(h);
c.style.width="auto";
c.newHeight=h;
c.newWidth=h/b
}else{if((e-d)<0){c.width=(g);
c.style.height="auto";
c.newWidth=g;
c.newHeight=g*b
}else{c.height=h;
c.width=g;
c.newHeight=h;
c.newWidth=g
}}}function tpIsChrome(){return(navigator.userAgent.toLowerCase().indexOf("chrome")>-1)
}function tpIsWebKit(){return(navigator.userAgent.toLowerCase().indexOf("webkit")>-1)
}function tpIsSafari(){return(navigator.userAgent.toLowerCase().indexOf("safari")>-1)
}function tpIsFirefox(){return(navigator.userAgent.toLowerCase().indexOf("firefox")>-1)
}function tpParseXml(b){var a=null;
if(window.DOMParser){var c=new DOMParser();
a=c.parseFromString(b,"text/xml")
}else{a=new ActiveXObject("Microsoft.XMLDOM");
a.async="false";
a.loadXML(b)
}tpRemoveWhiteSpace(a);
return a
}function tpRemoveWhiteSpace(b){var a=/\S/;
for(var c=0;
c<b.childNodes.length;
c++){var d=b.childNodes[c];
if(d.nodeType==3&&(!(a.test(d.nodeValue)))){b.removeChild(d);
c--
}else{if(d.nodeType==1){tpRemoveWhiteSpace(d)
}}}}function tpTimeToMillis(d){var a=0;
if(d){if(d.indexOf("ms")>0){a=d.substr(0,d.indexOf("ms"))
}else{var c=d.split(":");
while(c.length>0){var b=c.shift();
if(c.length==2){a+=((b)*1000*60*60)
}if(c.length==1){a+=((b)*1000*60)
}if(c.length==0){if(b.indexOf(".")){a+=((b)*1000)
}else{a+=(b)*1000
}}}}}return a
}function tpSendUrl(a){var b=document.createElement("img");
b.src=a;
b.style.display="none";
b.width=1;
b.height=1;
b.left=-1111;
b.src=a;
document.body.appendChild(b);
tpDebug("sent tracking/impressiong to  "+a);
document.body.removeChild(b)
}function tpGetIEVersion(){var c=9999;
if(navigator.appName=="Microsoft Internet Explorer"){var a=navigator.userAgent;
var b=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
if(b.exec(a)!=null){c=parseFloat(RegExp.$1)
}}return c
}function tpGetComponentSize(b){var c=false;
var d=b.style.height;
var a=b.style.width;
if(d==="100%"&&b.style.width==="100%"||(!d&&!a)){c=true
}if(c&&b.parentNode&&(b.offsetHeight==0&&b.offsetWidth==0)){return tpGetComponentSize(b.parentNode)
}else{if(!c){d=d.replace("px","");
a=a.replace("px","");
return{width:parseInt(a),height:parseInt(d)}
}}return{width:b.offsetWidth,height:b.offsetHeight}
}function tpGetScriptPath(b){if(b===undefined&&tpScriptPath!==undefined){return tpScriptPath
}var a=document.getElementsByTagName("script");
var d;
if(b!==undefined){for(var c=0;
c<a.length;
c++){if(a[c].src.indexOf(b)>=0){d=a[c].src;
break
}}}else{d=a[a.length-1].src
}if(!d){d=a[a.length-1].src
}if(d.indexOf("/")==-1){return""
}d=d.substring(0,d.lastIndexOf("/"));
return d
}function tpMillisToStr(d){var c=d/1000;
var a=Math.floor(c/(60*60));
c=c-(a*(60*60));
var b=Math.floor(c/60);
var e=Math.floor(c)%60;
var f="";
if(a>0){f=a.toString()+":";
if(b<10){f+="0"
}}f+=b+":";
if(e<10){f+="0"
}f+=e.toString();
return f
}function tpEllipsis(h,l){var a=false;
var c=0;
var g=l.innerHTML;
var e=l.innerHTML.length;
var j=l.innerHTML.length;
var d=0;
var b=h.clientHeight>=h.scrollHeight;
var k;
var f;
while(!b){k=$pdk.jQuery(h).height();
f=h.scrollHeight;
if(tpIsFirefox()){f=0;
$pdk.jQuery(h).children().each(function(m){f+=$pdk.jQuery(h).children().eq(m).outerHeight()
})
}if((j-d)<=1){if(f>k){l.innerHTML="";
a=false
}b=true
}else{if(k>=f){d=e;
e=Math.floor((e+j)/2);
l.innerHTML=g.substr(0,e)+"&hellip;";
a=g.substr(e-1,2).match(/^[a-zA-Z]+$/)
}else{if(k<f){j=e;
e=Math.floor((e+d)/2);
l.innerHTML=g.substr(0,e)+"&hellip;";
a=g.substr(e-1,2).match(/^[a-zA-Z]+$/)
}}}c++;
if(c>100){break
}}if(l.innerHTML.substr(0,e).match(/[\W]+$/)){l.innerHTML=l.innerHTML.substr(0,e).replace(/[\W]+$/g,"")+"&hellip;"
}if(a){l.innerHTML=g.substr(0,e);
l.innerHTML=l.innerHTML.replace(/[\W]+[\w]+$/g,"");
l.innerHTML+="&hellip;"
}}function tpCreateColorizedStateStyles(h,n,j,f,i,b,l){var c=document.createElement("canvas");
var k=this;
if(c.getContext&&c.getContext("2d")){var g=$pdk.jQuery(h).css("background-image");
var d="";
if(g&&g!=="none"){if(g.indexOf('url("')==0||g.indexOf("url('")==0){g=g.substr(5,g.length-7)
}else{if(g.indexOf("url(")==0){g=g.substr(4,g.length-5)
}}var e=new Image();
e.onload=function(){var q=document.createElement("canvas");
var o=q.getContext("2d");
q.style.borderColor="#"+i.substr(2);
var p=$pdk.jQuery(q).css("border-color");
p=p.substr(4,p.length-5).split(", ");
q.width=this.width;
q.height=this.height;
o.drawImage(this,0,0,this.width,this.height);
tpColorize(o,p[0],p[1],p[2]);
d=n.replace(/\{url\}/g,"url("+q.toDataURL()+")").replace(/\{state\}/g,":hover");
if(b.styleSheet){b.styleSheet.cssText=d+b.styleSheet.cssText
}else{b.insertBefore(document.createTextNode(d),b.firstChild)
}};
e.src=g;
var m=new Image();
m.onload=function(){var q=document.createElement("canvas");
var o=q.getContext("2d");
q.style.borderColor="#"+f.substr(2);
var p=$pdk.jQuery(q).css("border-color");
p=p.substr(4,p.length-5).split(", ");
q.width=this.width;
q.height=this.height;
o.drawImage(this,0,0,this.width,this.height);
tpColorize(o,p[0],p[1],p[2]);
d=n.replace(/\{url\}/g,"url("+q.toDataURL()+")").replace(/\{state\}/g,(l?l:":active"));
if(b.styleSheet){b.styleSheet.cssText+=d
}else{b.appendChild(document.createTextNode(d))
}};
m.src=g;
var a=new Image();
a.onload=function(){var q=document.createElement("canvas");
var o=q.getContext("2d");
q.style.borderColor="#"+j.substr(2);
var p=$pdk.jQuery(q).css("border-color");
p=p.substr(4,p.length-5).split(", ");
q.width=this.width;
q.height=this.height;
o.drawImage(this,0,0,this.width,this.height);
tpColorize(o,p[0],p[1],p[2]);
d=n.replace(/\{url\}/g,"url("+q.toDataURL()+")").replace(/\{state\}/g,"");
if(b.styleSheet){b.styleSheet.cssText+=d
}else{b.appendChild(document.createTextNode(d))
}};
a.src=g
}}}function tpColorize(a,f,p,y){var C={r:f,g:p,b:y};
function j(H,G,F){var H=H/360,G=G/100,F=F/100,J,I,i;
if(G==0){J=I=i=F
}else{l=H*6;
k=Math.floor(l);
x=F*(1-G);
w=F*(1-G*(l-k));
t=F*(1-G*(1-(l-k)));
if(k==0){J=F;
I=t;
i=x
}else{if(k==1){J=w;
I=F;
i=x
}else{if(k==2){J=x;
I=F;
i=t
}else{if(k==3){J=x;
I=w;
i=F
}else{if(k==4){J=t;
I=x;
i=F
}else{J=F;
I=x;
i=w
}}}}}}return{r:Math.round(J*255),g:Math.round(I*255),b:Math.round(i*255)}
}function e(h,F,G){h=h/255;
F=F/255;
G=G/255;
var J=Math.min(h,F,G),K=Math.max(h,F,G),I=K-J,s={};
s.v=K;
if(I==0){s.h=0;
s.s=0
}else{s.s=I/K;
var H=(((K-h)/6)+(I/2))/I;
var i=(((K-F)/6)+(I/2))/I;
var v=(((K-G)/6)+(I/2))/I;
if(h==K){s.h=v-i
}else{if(F==K){s.h=(1/3)+H-v
}else{if(G==K){s.h=(2/3)+i-H
}}}if(s.h<0){s.h+=1
}if(s.h>1){s.h-=1
}}return{h:(s.h*360),s:(s.s*100),v:(s.v*100)}
}var o;
if(a.hasOwnProperty("canvas")||a.canvas){o=a
}if(a.hasOwnProperty("width")||a.width){o=a.getContext("2d")
}if(!o){console.error("Trying to colorize non-canvas");
return
}var n=o.getImageData(0,0,o.canvas.width,o.canvas.height);
var E=e(C.r,C.g,C.b);
var A=E.h/360;
var q=E.s/100;
var l=A*6;
var k=Math.floor(l);
var c=E.v*2.55;
for(var z=0;
z<n.data.length;
z+=4){if(n[z+3]==0){continue
}var m=Math.max(n.data[z]/2.55,n.data[z+1]/2.55,n.data[z+2]/2.55);
var d=m/100,u,B,D;
if(q==0){u=B=D=d
}else{var x=d*(1-q);
if(k==0||k==2||k==4){var t=d*(1-q*(1-(l-k)));
if(k==0){u=d;
B=t;
D=x
}else{if(k==2){u=x;
B=d;
D=t
}else{if(k==4){u=t;
B=x;
D=d
}}}}else{var w=d*(1-q*(l-k));
if(k==1){u=w;
B=d;
D=x
}else{if(k==3){u=x;
B=w;
D=d
}else{u=d;
B=x;
D=w
}}}}n.data[z]=u*(c);
n.data[z+1]=B*(c);
n.data[z+2]=D*(c)
}o.putImageData(n,0,0)
}var tpScriptPath;
if(window["$pdk"]===undefined){tpScriptPath=tpGetScriptPath()
}else{tpScriptPath=$pdk.scriptRoot+"/js"
}XMLLoader=Class.extend({init:function(a){this._requestContentType=a
},load:function(a,h,c){var g;
if(typeof XDomainRequest!=="undefined"&&a.indexOf(document.domain)<0){g=true
}if(typeof XMLHttpRequest==="undefined"){XMLHttpRequest=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")
}catch(j){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")
}catch(j){}try{return new ActiveXObject("Msxml2.XMLHTTP")
}catch(j){}throw new Error("This browser does not support XMLHttpRequest.")
}
}var i;
if(g){i=new XDomainRequest();
if(typeof(f._requestContentType)==="string"){i.setRequestHeader("Content-Type",this._requestContentType)
}}else{i=new XMLHttpRequest()
}var f=this;
var d=false;
var e=function(j){d=true;
tpDebug("Error getting SMIL");
c(j)
};
var b=function(){if(this.readyState===4&&this.status===200&&!d){d=true;
var j=i.responseXML;
if(j==null||typeof(j)!=="string"){j=i.responseText
}if(typeof(h)==="function"){h(j)
}}else{if(this.readyState===4&&this.status===404&&!d){d=true;
e()
}else{if(g&&!d){d=true;
if(typeof(h)==="function"){tpDebug("Got SMIL");
h(i.responseText);
tpDebug("Called SMIL callback")
}}}}};
i.onreadystatechange=b;
i.onload=b;
i.onerror=e;
i.ontimeout=e;
setTimeout(function(){try{tpDebug("Trying to download SMIL from "+a);
i.open("GET",a);
i.send();
setTimeout(function(){if(!d){if(typeof(c)==="function"){c()
}}},5000)
}catch(j){tpDebug(j.message);
if(typeof(c)==="function"){c(j)
}}},1)
}});
if(window.tpPhase1PDKLoaded){if(window.tpDoInitGwtCommManager){tpDoInitGwtCommManager()
}tpPhase1PDKLoaded()
};