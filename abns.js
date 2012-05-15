// <ab33@gmx.com>
    
if (typeof(abns) == 'undefined') {
	var abns = {};
}

/**
 * Watch History
 * @param size
 */
abns.WatchHistory = function(size) {
    this._init(size);
};

abns.WatchHistory.DEFAULT_NAME = 'abns.WatchHistory';
abns.WatchHistory.DEFAULT_SIZE = 10;
abns.WatchHistory.LAST_UNIQ_ID = 'abns.LastUniqId';

abns.WatchHistory.prototype = {

    _init: function(size) {
        this.setSize(size);
        if (!localStorage.getItem(abns.WatchHistory.LAST_UNIQ_ID))
            localStorage.setItem(abns.WatchHistory.LAST_UNIQ_ID, 1);
    },

    setSize: function(size) {
        if (size <= 0) return;

        this.size = size;

        var h = this.getSerialized();
        var a = this.getUnserialized();

        // Very, very silly code
        if ((a.length >> 2) > this.size) {
            var tmp = new Array();
            for(var i = 0; i < this.size; i++) {
                tmp.push(a.shift(), a.shift(), a.shift(), a.shift());
            }
            this.putUnserialized(tmp);
        }
    },

    getSize: function() {
        return this.size;
    },

    put: function(url, page, title) {
        var h = this.getSerialized();
        var a = this.getUnserialized();

        // Very, very silly code
        if ((a.length >> 2) >= this.getSize()) {
            var tmp = new Array();
            for(var i = 0; i < (this.getSize() - 1); i++) {
                tmp.push(a.shift(), a.shift(), a.shift(), a.shift());
            }
            h = tmp.join("\n") + "\n";
        }

        var id = localStorage.getItem(abns.WatchHistory.LAST_UNIQ_ID);
        localStorage.setItem(abns.WatchHistory.LAST_UNIQ_ID, ++id);

        h = id + "\n" + url + "\n" + page + "\n" + title + "\n" + h;
        this.putSerialized(h);
    },

    removeById: function (id) {
        var a = this.getUnserialized();
        // Very, very silly code
        var tmp = new Array();
        var i;
        while (i = a.shift()) {
            if (i != id) {
                tmp.push(i, a.shift(), a.shift(), a.shift());
            } else {
                a.shift(); a.shift(); a.shift();
            }
        }
        this.putUnserialized(tmp);
    },

    removeAll: function() {
        localStorage.setItem(abns.WatchHistory.DEFAULT_NAME, '');
    },

    getAsArray: function () {
        var a = this.getUnserialized();
        var items = new Array;
        var id;
        while (id = a.shift()) {
            var i = new Array;
            i['id']    = id;
            i['url']   = a.shift();
            i['page']  = a.shift();
            i['title'] = a.shift();
            items.push(i);
        }
        return items;
    },

    getById: function(id) {
        var a = this.getUnserialized();
        var item = new Array;
        var i;
        while (i = a.shift()) {
            if (i == id) {
                item['id']    = id;
                item['url']   = a.shift();
                item['page']  = a.shift();
                item['title'] = a.shift();
                break;
            } else {
                a.shift(); a.shift(); a.shift();
            }

        }
        if (!item['id']) {
            item['id']    = 0;
            item['url']   = '';
            item['page']  = '';
            item['title'] = '';
        }
        return item;
    },

    getSerialized: function() {
        if (!localStorage.getItem(abns.WatchHistory.DEFAULT_NAME))
            localStorage.setItem(abns.WatchHistory.DEFAULT_NAME, '');
        return localStorage.getItem(abns.WatchHistory.DEFAULT_NAME);
    },

    putSerialized: function(v) {
        localStorage.setItem(abns.WatchHistory.DEFAULT_NAME, v);
    },

    getUnserialized: function() {
        var h = this.getSerialized();
        var a = h.split("\n");
        a.pop();
        return a;
    },

    putUnserialized: function(arr) {
        this.putSerialized(arr.join("\n") + "\n");
    }
};

/**
 * Config
 * @param ns
 */
abns.Config = function(ns) {
    this._init(ns);
};

abns.Config.DEFAULT_NAMESPACE = 'abns.Config.';

abns.Config.prototype = {

    _init: function(ns) {
        this.ns = ns;
    },

    set: function(key, value) {
        localStorage.setItem(this.ns + key, value);
    },

    get: function(key) {
        return localStorage.getItem(this.ns + key);
    },

    initialize: function(key, default_value) {
        if (!this.get(key)) this.set(key, default_value);
    }
}

///

abns.WatchHistory.ref = function() {
    if (!abns.WatchHistory_instance)
        abns.WatchHistory_instance =  new abns.WatchHistory(abns.Config.ref().get(abns.Config.HISTORY_SIZE));
    return abns.WatchHistory_instance;
};

abns.Config.ref = function() {
    if (!abns.Config_instance)
        abns.Config_instance = new abns.Config(abns.Config.DEFAULT_NAMESPACE);
    return abns.Config_instance;
};

///
abns.Config.HISTORY_SIZE = 'history_size';
abns.Config.BOX_ADDRESS  = 'box_address';

///

if (typeof(abns.WatchControl) == 'undefined') {
	abns.WatchControl = {};
}

abns.WatchControl.watchNow = function(url) {

    return abns.WatchControl.executeRequest_sync(
                abns.WatchControl.prepareDavidBoxRequest(
                	abns.Config.ref().get(abns.Config.BOX_ADDRESS),
                	'playback', 'start_vod',
                	'title', encodeURIComponent(url), 'show', 0));

}


// domain = null - unknown or auto domain
abns.WatchControl.rcKeyPress = function(key, domain) {

    return abns.WatchControl.executeRequest_sync(
                abns.WatchControl.prepareDavidBoxRequest(
                	abns.Config.ref().get(abns.Config.BOX_ADDRESS),
                	'system', 'send_key',
                	key, domain, null, null));

}

abns.WatchControl.prepareDavidBoxRequest = function(addr, service, method, arg1, arg2, arg3, arg4) {
    return 'http://' + ((addr.indexOf(':', 0) == -1) ? addr + ':8008' : addr) + '/'
    	 + service + '?' + 'arg0=' + method
		 + ((arg1 == null) ? '' : '&arg1=' + arg1)
		 + ((arg2 == null) ? '' : '&arg2=' + arg2)
		 + ((arg3 == null) ? '' : '&arg3=' + arg3)
		 + ((arg4 == null) ? '' : '&arg4=' + arg4);
}

abns.WatchControl.executeRequest_sync = function(req) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', req, false);
    var ret = 0;
    try {
		xhr.send();
    } catch(err) {
    	ret = err.code;
    }
    return ret;
}

///

abns.WatchControl.chrome_notify_start = function(ttl, msg) {
    var notification = webkitNotifications.createNotification('', ttl, msg);
    notification.show();
    return notification;
}

abns.WatchControl.chrome_notify_finish = function(n) {
    n.cancel();
}

abns.WatchControl.chrome_watchNow = function(url) {
    var n = abns.WatchControl.chrome_notify_start('Sending URL to play on the Box..', 'URL: ' + url);
    var ret = abns.WatchControl.watchNow(url);
    if (ret) alert('Failed to send URL to play. Please check network address of the Box.');
    abns.WatchControl.chrome_notify_finish(n);
}

abns.WatchControl.chrome_rcKeyPress = function(key, domain) {
    var n = abns.WatchControl.chrome_notify_start('Sending RC key to the Box..', 'Key: "' + key + '"');
    var ret = abns.WatchControl.rcKeyPress(key, domain);
    if (ret) alert('Failed to send RC key. Please check network address of the Box.');
    abns.WatchControl.chrome_notify_finish(n);
}
