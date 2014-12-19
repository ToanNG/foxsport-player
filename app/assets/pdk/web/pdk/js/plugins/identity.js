// Set the namespace for the new plug-in
$pdk.ns("$pdk.plugin.Identity");

$pdk.plugin.Identity = $pdk.extend(function(){},
{

    COOKIENAME: "tpIdentityTokens",
    COOKIETIMEOUT: "tpIdentityTimeOut",
    identityServiceUrl: "https://euid.theplatform.com",
    authSigninPath: "/idm/web/Authentication/signIn",
    promptImmediately: false,
    loginFormEnabled: true,

    loginInstructions: "Please enter your username and password to continue",
    errorInstructions: "Invalid username or password, please try again",
    errorColor: "#FF0000",
    instructionsColor: "#FFFFFF",
    contexts: [],
    loginHasFailed: false,
    isGettingToken: false,
    waitingForCredentials: false,
    prompting: false,
    priority: 1,
    cancelLabel: "Cancel",
    loginLabel: "Login",
    usernameLabel: "Username",
    passwordLabel: "Password",

    constructor : function(){
    },

    initialize : function(lo){
        this.controller = lo.controller;
        this.username = lo.vars["username"];
        this.password = lo.vars["password"];
        this.directory = lo.vars["directory"];
        this.priority = lo.priority;

        if (lo.vars["contexts"])
        {
            this.contexts = lo.vars["contexts"].split(",");
        }
        if (lo.vars["promptImmediately"])
            this.promptImmediately = lo.vars["promptImmediately"].toString().toLowerCase() =="true";
        if (lo.vars["loginFormEnabled"])
            this.loginFormEnabled = lo.vars["loginFormEnabled"].toString().toLowerCase() =="true";

        this.directory = lo.vars["directory"];
        if (lo.vars["identityServiceUrl"])
            this.identityServiceUrl = lo.vars["identityServiceUrl"];
        if (lo.vars["tokenScope"])
            this.tokenScope = lo.vars["tokenScope"];
        if (lo.vars["loginInstructions"])
            this.loginInstructions = lo.vars["loginInstructions"];
        if (lo.vars["errorInstructions"])
            this.errorInstructions = lo.vars["errorInstructions"];
        if (lo.vars["usernameLabel"])
            this.usernameLabel = lo.vars["usernameLabel"];
        if (lo.vars["passwordLabel"])
            this.passwordLabel = lo.vars["passwordLabel"];
        if (lo.vars["loginLabel"])
            this.loginLabel = lo.vars["loginLabel"];
        if (lo.vars["cancelLabel"])
            this.cancelLabel = lo.vars["cancelLabel"];

        this.token = lo.vars["token"];

        this.video = this.controller.getVideoProxy();//maybe it's a proxy, maybe it's the real deal...

        this.addLoginCard();

        try
        {
            this.controller.registerMetadataUrlPlugIn(this, this.priority);
            tpDebug("*** identity plugin LOADED! ***");
        }
        catch(e)
        {
            tpDebug("WARN: " + e.message);
        }

        var me = this;
        this.controller.addEventListener("OnPlayerLoaded", function (e) { me.handlePlayerLoaded(e); });
    },

    addLoginCard: function()
    {
        var html =  '<div class="tpPlayerCard tpLoginCard">' +
                        '<div class="tpCardHeader">' +
                            '<div class="tpCardTitle">' +
                                '${title}' +
                            '</div>' +
                            '<div class="tpCardClose">' +
                                '<a href="#" class="tpButton" tp:label="${close}" onclick="$pdk.controller.hidePlayerCard(\'forms\', \'tpLoginCard\');"><span>${close}</span></a>' +
                            '</div>' +
                        '</div>' +
                        '<div class="tpCardBody">' +
                            '<br/>'+
                            '<span style="width: 33%; display: inline-block; text-align: right;">${username}:&nbsp;</span><input style="width: 66%; font-size: 12px; height: 20px" class="tpUsername" type="text" value="" /><br/>' +
                            '<span style="width: 33%; display: inline-block; text-align: right;">${password}:&nbsp;</span><input style="width: 66%; font-size: 12px; height: 20px" class="tpPassword" type="password" value="" /><br/><br/>' +
                            '<div class="tpFormActions" style="text-align: right">' +
                                '<a href="#" class="tpButton tpSubmit" tp:label="${submit}"><span>${submit}</span></a>&nbsp;' +
                                '<a href="#" class="tpButton tpCancel" tp:label="${cancel}"><span>${cancel}</span></a>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

        var me = this;

        var presenter = {
            show: function(initVars)
            {
                $pdk.jQuery(initVars.card).find(".tpUsername").attr("value", this.username);
                $pdk.jQuery(initVars.card).find(".tpPassword").attr("value", this.password);

                $pdk.jQuery(initVars.card).find(".tpFormActions .tpSubmit").click(function() {
                    var un = $pdk.jQuery(initVars.card).find(".tpUsername").attr("value");
                    var pw = $pdk.jQuery(initVars.card).find(".tpPassword").attr("value");
                    me.doSetUsernameAndPass(un, pw);
                });

                $pdk.jQuery(initVars.card).find(".tpFormActions .tpCancel").click(function() {
                    $pdk.jQuery(initVars.card).find(".tpUsername").attr("value", "");
                    $pdk.jQuery(initVars.card).find(".tpPassword").attr("value", "");
                    me.doSetUsernameAndPass();
                    me.controller.hidePlayerCard("forms", "tpLogInCard");
                });
            },

            hide: function()
            {

            }
        }
        // This should not be the login card
        me.controller.addPlayerCard("forms", "tpLoginCard", html, "urn:theplatform:pdk:area:player", {title: 'Log-in', username: 'Username', password: 'Password', close: 'Close', submit: 'Submit', cancel: 'Cancel'}, presenter, 100);
    },

    rewriteMetadataUrl : function(releaseUrl, isPreview)
    {
        if (isPreview) return false;

        if (this.token || this.cancelled)
        {
            return false;
        }
        else {
            this.waiting = true;
            this.metadataurl = releaseUrl;
            return true;
        }
    },

    shouldPrompt: function()
    {
        return (this.promptImmediately==true&&
                !(this.username&&this.password&&this.username.length&&this.password.length)&&!this.token);
    },

    handlePlayerLoaded: function(e)
    {
        this.controller.removeEventListener("OnPlayerLoaded", this.handlePlayerLoaded);
        this.doGetToken();
    },

    doSetToken: function()
    {
        tpDebug("doSetToken: " + this.token, "IdentityPlugIn");
        if (this.token)
        {
            this.controller.setToken(this.token, "urn:theplatform:auth:token")
        }

        if (this.waiting)
        {
            tpDebug("doSetToken resuming metadata url: " + this.metadataurl, "IdentityPlugIn");
            this.controller.setMetadataUrl(this.metadataurl);
        }
    },

    doGetToken: function()
    {
        tpDebug("doGetToken()","IdentityPlugIn");

        if (this.token && this.token.length )
        {
            tpDebug("already had them, sending back","IdentityPlugIn");
            this.doSetToken();
        }
        else if (this.identityServiceUrl && this.authSigninPath)
        {
            if (this.directory&&this.directory.length)
                this.token = this.checkCookieForToken(this.directory+"/"+this.username);
            else
                this.token = this.checkCookieForToken(this.username);

            //we're supposed to update the cookie again now with a new idletimeout..
            if (this.token&&this.token.length)
            {
                tpDebug("Got a token for "+this.username+" from a cookie: " + this.token,"IdentityPlugIn");
                this.doSetToken();
            }
            else
            {
                if (this.username && this.password)
                {
                    tpDebug("Requesting token from service","IdentityPlugIn");
                    this.getToken();
                }
                else {
                    this.waitingForCredentials = true;

                    var me = this;
                    this.promptForLogin(false, function() { me.doSetUsernameAndPass.apply(me, arguments)});
                }
            }
        }
        else
        {
             tpDebug("getCredentials needs an accoundId.","IdentityPlugIn","error");
            return false;
        }

        return true;
    },

    doSetUsernameAndPass: function(un, pw)
    {
        if (un && pw)
        {
            this.username = un;
            this.password = pw;
            this.doGetToken();
        }
        else
        {
            // they hit cancel
            this.doSetToken();
        }
    },

    promptForLogin: function(doRetry, callback)
    {
        if (!this.loginFormEnabled)
        {
            return;
        }

        var isRetry=doRetry;

        // is isRetry=true check...

        // if the card is already up, no need to show it again...
        if (this.prompting&&!isRetry)
            return;
        else if (this.prompting&&isRetry)
        {
            // what happens here?
            tpDebug("prompting and retrying...")
//            return;
        }

        // if (isRetry)
        //     initVars = {username:this.username,password:"",instructions:this.errorInstructions,errorInstructions:this.errorInstructions,instructionsColor:_errorColor,errorColor:_errorColor, context:_context};
        // else
        //     initVars = {username:_username,password:"",instructions:_loginInstructions,errorInstructions:_errorInstructions,instructionsColor:_instructionsColor, errorColor:_errorColor, context:_context};

        tpDebug("Requesting token from tpLoginCard","IdentityPlugIn");

        this.controller.showPlayerCard('forms', 'tpLoginCard');
        this.prompting = true;
    },

    checkCookieForToken: function(username)
    {
        tpDebug("Checking cookie for token", "IdentityPlugIn");

        this.cookie = this.getCookie(this.COOKIENAME);

        if (this.cookie==null||this.cookie.length<=0)
            return null;

        var pairs = this.cookie.split("%2C");

        var item;
        for (var i=0; i<pairs.length; i++)
        {
            item = pairs[i];
            var pair = item.split("%3A");

            if (username == null || pair[0]==encodeURIComponent(username))
                return pair[1];
        }

        return null;
    },

    storeCookie:function(username,token,expiryDate,directory)
    {
        tpDebug("Saving token to cookie","IdentityPlugIn");
        var newcookie;
        var name;

        if (directory)
        {
            name=encodeURIComponent(directory+"/"+username);
        }
        else
            name = encodeURIComponent(username);


        newcookie = name+encodeURIComponent(":"+token+",");


        if (this.cookie==null)
            this.cookie="";

        var nameColon = name+":"; //encodeURIComponent(":");

        var index = this.cookie.indexOf(nameColon);

        if (index!=-1)
        {
            //we need to replace
            var pairs = this.cookie.split(",");//encodeURIComponent(","));

            this.cookie="";

            for (var item in pairs)
            {
                if (item.indexOf(nameColon)==-1)
                    this.cookie+=item+","; //encodeURIComponent(",");
            }
        }
        //otherwise //we can just append


        this.cookie += newcookie;


        this.setCookie(this.COOKIENAME,this.cookie, expiryDate);
    },

    setCookie: function(name,value,date)
    {
        document.cookie = name+"="+value+"; expires="+date+"; path=/";
    },

    getCookie: function(name)
    {
        var cookies = document.cookie.split(';');

        if (cookies==null||cookies.length<=0)
            return null;

        var ourcookie;

        var nameEQ = name+"=";

        //look for the substring

        for(var i=0;i<cookies.length;i++) {
            var c = cookies[i];

            while (c.charAt(0)==' ')
                c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length,c.length);
        }

        return null;
    },

    getToken: function()
    {
        this.isGettingToken = true;


        var request = this.identityServiceUrl + this.authSigninPath;

        var context = "";
        if (this.directory && this.directory.length > 0)
        {
            context = this.directory + "/";
        }

        request += "?username=" + context + this.username
                + "&password=" + this.password + "&form=json&schema=1.0";

        var me = this;

        $pdk.jQuery.ajax({
            url: request,

            dataType: 'jsonp json',

            beforeSend: function(jqXhr, settings) {
                return true;
            },

            success: function(json) {
                me.handleTokenData(json);
            },

            error: function(error) {
                tpDebug("JSON Error getting token", "IdentityPlugIn");
            }});
    },

    handleTokenData: function(json)
    {
        tpDebug("Got response from identity service...","IdentityPlugIn");

        var success = false;
        if (json)
        {
            tpDebug("Identity Service JSON:\n" + json, "IdentityPlugIn", "debug");

            tpDebug("Identity Service Response: " + json.signInResponse, "IdentityPlugIn");

            if (json && json.signInResponse && json.signInResponse.token)
            {
                this.token = json.signInResponse.token;
                tpDebug("Identity Service token: " + this.token, "IdentityPlugIn");

                success = true;
                //we need to store the dir/username and token
                var expiry = json.signInResponse.idleTimeout;

                //                var expiryDate:Date = new Date();
                //                expiryDate.setTime(expiryDate.time+expiry);

                var now = new Date();
                //don't know what this would even do...
                // var to = this.getCookie(this.COOKIETIMEOUT);
                now.setTime(now.getTime()+parseInt(expiry));

                this.setCookie(this.COOKIETIMEOUT,expiry);
                this.storeCookie(this.username,this.token,now.toUTCString(),this.directory);
                this.doSetToken();

                this.controller.hidePlayerCard("forms", "tpLogInCard");
            }
        }
        if (!success)
        {
            tpDebug("Identity Service call did not succeed, reprompting...", "IdentityPlugIn");
            var me = this;
            // div does not exist
            //this.instructionsDiv.innerHTML = "<span>"+this.errorInstructions+"</span>";
            $pdk.jQuery(".tpLoginCard .tpCardBody").prepend("<span>"+this.errorInstructions+"</span>");
            // was causing error message to not  show
            //this.promptForLogin(true, function() { me.doSetUsernameAndPass.apply(me, arguments)});
        }

        this.isGettingToken = false;
    }
});

$pdk.controller.plugInLoaded(new $pdk.plugin.Identity());
