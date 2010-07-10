// console.log(safari);

// Setup
// =====
var manifest = { 
        url: document.getElementsByTagName('html')[0].getAttribute('manifest'), 
        status: 0, 
        events: [], 
        headers: '', 
        content: '', 
        error: false
    };



// Extension proxy event handling
// ==============================
function handleMessage (event) {
    // console.log('Message: ' + event.name);
    switch(event.name) {
        case 'updateToolbarItem':
            updateInspector();
            updateToolbarItem();
            break;
    }
}


// Updating the toolbar item
function updateToolbarItem () {
    var message = {};
    message.status = applicationCache.status;
    message.manifestURL = manifest.url;
    safari.self.tab.dispatchMessage('updateToolbarItem', message);
}


// Manifest loading and parsing
// ============================
function loadManifestContent (url) {
	var request = new XMLHttpRequest();
	var onManifestLoaded = function (event) {
		if(request.readyState === 4) {
		    manifest.status = request.status;
		    manifest.headers = request.getAllResponseHeaders();
		    manifest.content = request.responseText;
            // updateInspector();
            // parseManifest(request);
            // setManifestHttpStatus(request.status);
		}
	}
	request.addEventListener('readystatechange', onManifestLoaded);
	request.open('GET', url);
	request.send();
}
function parseManifest (request) {
    // cacheInspector_manifestHeaders.getElementsByTagName('pre')[0].innerText = request.getAllResponseHeaders();
    // cacheInspector_manifestContent.getElementsByTagName('pre')[0].innerText = request.responseText;
	// showCacheInspector();
}


// Monitor events from the applicationCache object
// ===============================================
function onCacheEvent (event) {
    // console.log(event);
    manifest.events.push(event);
    if(event.type === 'error') { manifest.error = true; }
    // switch(event.type) {
    //     case 'cached':
    //     case 'checking':
    //     case 'downloading':
    //     case 'error':
    //     case 'noupdate':
    //     case 'progress':
    //     case 'updateready':
    //     case 'obsolete':
    // }
    updateToolbarItem();
    updateInspector();
}

// Sent when the update process finishes for the first time
// —that is, the first time an application cache is saved.

applicationCache.addEventListener('cached', onCacheEvent, false);
// Sent when the cache update process begins.
applicationCache.addEventListener('checking', onCacheEvent, false);
// Sent when the update process begins downloading resources in the manifest file.
applicationCache.addEventListener('downloading', onCacheEvent, false);
// Sent when an error occurs.
// - Should change the icon in this case.
applicationCache.addEventListener('error', onCacheEvent, false);
// Sent when the update process finishes but the manifest file does not change.
applicationCache.addEventListener('noupdate', onCacheEvent, false);
// Sent when each resource in the manifest file begins to download.
applicationCache.addEventListener('progress', onCacheEvent, false);
// Sent when there is an existing application cache, the update process 
// finishes, and there is a new application cache ready for use.
applicationCache.addEventListener('updateready', onCacheEvent, false);
// Fired if the manifest file returns a 404 or 410.
// This results in the application cache being deleted.
applicationCache.addEventListener('obsolete', onCacheEvent, false);

// applicationCache.swapCache
// Replaces the active cache with the latest version.
// Doesn't trigger an event.

// applicationCache.update
// Manually triggers the update process.

// DOMApplicationCache.UNCACHED =    0
// DOMApplicationCache.IDLE =        1
// DOMApplicationCache.CHECKING =    2
// DOMApplicationCache.DOWNLOADING = 3
// DOMApplicationCache.UPDATEREADY = 4
// DOMApplicationCache.OBSOLETE    = 5

// Setup
if(manifest.url) loadManifestContent(manifest.url);
safari.self.addEventListener('message', handleMessage, false);