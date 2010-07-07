// Setup
// =====
var manifestURL = document.getElementsByTagName('html')[0].getAttribute('manifest');


// Extension proxy event handling
// ==============================
function handleMessage (event) {
    // console.log('Message: ' + event.name);
    switch(event.name) {
        case 'updateToolbarItem':
            updateToolbarItem();
            break;
        case 'toggleManifestInspector':
            toggleManifestInspector();
            break;
        case 'loadInspectorTemplate':
            onLoadInspectorTemplate(event.message);
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

// Display the manifest inspector
// ==============================
var inspectorTemplate;
function loadInspectorTemplate () {
	safari.self.tab.dispatchMessage('loadInspectorTemplate');
}
function onLoadInspectorTemplate (message) {
    // console.log(message);
    var inspector = document.createElement('div');
    inspector.innerHTML = message;
    document.body.appendChild(inspector.children[0]);
}
loadInspectorTemplate();

var manifestInspector, manifestInspector_body, manifestInspector_closeBtn;
function showManifestInspector () {
    // Download manifest inspector
    // This should probably be moved into the global HTML page
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(request.readyState === 4 /*&& request.status == 200*/) {
            onLoadCacheManifest(request.responseText);
        }
    }
    request.open('GET', manifestURL);
    request.send(null);
}
function hideManifestInspector () {
    var body = document.getElementsByTagName('body')[0];
    body.removeChild(manifestInspector);
}
function toggleManifestInspector () {
    document.getElementById('manifestInspector') ? hideManifestInspector() : showManifestInspector();
}

function onLoadCacheManifest (text) {
    var body = document.getElementsByTagName('body')[0], 
        html = '<p id="manifestInspector_closeBtn"><span>x</span></p>' + 
               '<p id="manifestInspector_title">Manifest</p>' + 
               '<pre id="manifestInspector_body">' + text + '</pre>';
    // console.log(manifestInspector);
    if(manifestInspector == null) {
        manifestInspector = document.createElement('div');
        manifestInspector.id = 'manifestInspector';
        manifestInspector.innerHTML = html;
    }
    body.appendChild(manifestInspector);
    manifestInspector_body = document.getElementById('manifestInspector_body');
    manifestInspector_closeBtn = document.getElementById('manifestInspector_closeBtn');
    // manifestInspector.addEventListener('mousedown', startDragManifestInspector);
    manifestInspector_closeBtn.addEventListener('click', hideManifestInspector, false);
    manifestInspector.addEventListener('mousedown', startDragManifestInspector, false);
}

function startDragManifestInspector (event) {
    if(event.target === manifestInspector_body) return;
    // Initial click position
    var startX = event.clientX, 
        startY = event.clientY, 
        originX = manifestInspector.offsetLeft, 
        originY = manifestInspector.offsetTop;
    
    event.stopPropagation();
    event.preventDefault();
    window.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('mouseup', onMouseUp, true);
    
    function onMouseMove (event) {
        var deltaX = startX - originX, 
            deltaY = startY - originY, 
            mouseX = event.clientX, // + window.scrollX,
            mouseY = event.clientY, // + window.scrollY;
            posX = (mouseX - deltaX), 
            posY = (mouseY - deltaY);
        // Prevent inspector from being dragged off the screen.
        // Tries to mimic window behavior in OS X.
        if((mouseX >= 0)) manifestInspector.style.left = posX + 'px';
        manifestInspector.style.top = ( (posY >= 0) ? posY : 0 ) + 'px';
    }
    function onMouseUp (event) {
        window.removeEventListener('mousemove', onMouseMove, true);
        window.removeEventListener('mouseup', onMouseUp, true);
    }
}

