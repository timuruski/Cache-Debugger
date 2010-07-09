// Setup
// =====
// console.log(safari);
var manifestURL = document.getElementsByTagName('html')[0].getAttribute('manifest');


// Extension proxy event handling
// ==============================
function handleMessage (event) {
    // console.log('Message: ' + event.name);
    switch(event.name) {
        case 'updateToolbarItem':
            updateToolbarItem();
            break;
        case 'toggleCacheInspector':
            toggleCacheInspector();
            break;
        case 'fetchInspectorTemplate':
            onFetchInspectorTemplate(event.message);
            break;
    }
}

safari.self.addEventListener('message', handleMessage, false);

// Updating the toolbar item
function updateToolbarItem () {
    var message = {};
    message.status = window.applicationCache.status;
    message.manifest = manifestURL;
    safari.self.tab.dispatchMessage('updateToolbarItem', message);
}


// Monitor events from the applicationCache object
// ===============================================
function onCached (event) {
    // console.log('applicationCache: cached');
    // Sent when the update process finishes for the first time
    // —that is, the first time an application cache is saved.
    updateToolbarItem();
}
function onChecking (event) {
    // console.log('applicationCache: checking');
    // Sent when the cache update process begins.
    updateToolbarItem();
}
function onDownloading (event) {
    // console.log('applicationCache: downloading');
    // Sent when the update process begins downloading 
    // resources in the manifest file.
    updateToolbarItem();
}
function onError (event) {
    // console.log('applicationCache: error');
    // Sent when an error occurs.
    // - Should change the icon in this case.
}
function onNoUpdate (event) {
    // console.log('applicationCache: no-update');
    // Sent when the update process finishes but the 
    // manifest file does not change.
    updateToolbarItem();
}
function onProgress (event) {
    // Sent when each resource in the manifest file begins to download.
}
function onUpdateReady (event) {
    // console.log('applicationCache: update-ready');
    // Sent when there is an existing application cache, 
    // the update process finishes, and there is a new 
    // application cache ready for use.
    updateToolbarItem();
}
function onObsolete (event) {
    // Fired if the manifest file returns a 404 or 410.
    // This results in the application cache being deleted.
}

applicationCache.addEventListener('cached', onCached, false);
applicationCache.addEventListener('checking', onChecking, false);
applicationCache.addEventListener('downloading', onDownloading, false);
applicationCache.addEventListener('error', onError, false);
applicationCache.addEventListener('noupdate', onNoUpdate, false);
// applicationCache.addEventListener('progress', onProgress, false);
applicationCache.addEventListener('updateready', onUpdateReady, false);
// applicationCache.addEventListener('obsolete', onObsolete, false);

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


