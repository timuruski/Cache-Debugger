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


// Display the manifest inspector
// ==============================
var cacheInspector;
function fetchInspectorTemplate () {
	safari.self.tab.dispatchMessage('fetchInspectorTemplate');
}
function onFetchInspectorTemplate (message) {
    var stub = document.createElement('div');
    stub.innerHTML = message;
	cacheInspector = stub.children[0];
	document.body.appendChild(cacheInspector);
    // cacheInspector = document.getElementById('cacheInspector');
	// cacheInspector_closeBtn = cacheInspector_closeBtn.getElementById('cacheInspector_closeBtn');
	// cacheInspector_closeBtn.addEventListener('click', hideCacheInspector, false);
    // cacheInspector.addEventListener('mousedown', startDragCacheInspector, false);
	cacheInspector_status = document.getElementById('cacheInspector_status');
	cacheInspector_manifestURL = document.getElementById('cacheInspector_manifestURL');
	cacheInspector_manifestHeaders = document.getElementById('cacheInspector_manifestHeaders');
	cacheInspector_manifestContent = document.getElementById('cacheInspector_manifestContent');
	// cacheInspector_manifestRaw.addEventListener('mousedown', startDragCacheInspector, false);
	
	// Use an invisible setting to store these states.
	toggleManifestHeaders(safari.extension.manifestHeadersOpen);
	toggleManifestContent(safari.extension.manifestContentOpen);
}
// function showCacheInspector () {
//     cacheInspector.style.display = 'block';
// }
// function hideCacheInspector () {
//     cacheInspector.style.display = 'none';
// }
// function toggleCacheInspector () {
//     if(cacheInspector) {
//         if(cacheInspector.style) showCacheInspector();
//      else hideCacheInspector();
//     }
// }
fetchInspectorTemplate();


var cacheInspector, 
	cacheInspector_closeBtn, 
	cacheInspector_status, 
	cacheInspector_manifestURL, 
	cacheInspector_manifestHeaders, 
	cacheInspector_manifestContent;

// Startup
function init (event) {
	cacheInspector = document.getElementById('cacheInspector');
	cacheInspector.addEventListener('mousedown', startDragCacheInspector, false);
	cacheInspector_closeBtn = document.getElementById('cacheInspector_closeBtn');
	cacheInspector_closeBtn.addEventListener('click', hideCacheInspector, false);
	cacheInspector_status = document.getElementById('cacheInspector_status');
	cacheInspector_manifestURL = document.getElementById('cacheInspector_manifestURL');
	cacheInspector_manifestHeaders = document.getElementById('cacheInspector_manifestHeaders');
	cacheInspector_manifestContent = document.getElementById('cacheInspector_manifestContent');
	// cacheInspector_manifestRaw.addEventListener('mousedown', startDragCacheInspector, false);
	
	// hideCacheInspector();
	
	showManifestSection('cacheInspector_manifestHeaders');
	hideManifestSection('cacheInspector_manifestContent');
	// showDetailedManifest();
	// showFormattedManifest();
	// showRawManifest();
	
	// loadManifest('../mobile-me.manifest');
	// loadManifest('../html5demo.manifest');
	
	// cacheInspector_status.getElementsByClassName('value');
	// cacheInspector_status.getElementsByClassName('statusCode');
}


// Manifest loading and parsing
function loadManifestContent (url) {
	cacheInspector_manifestURL.getElementsByClassName('value')[0].innerText = url;
	var request = new XMLHttpRequest();
	var onManifestLoaded = function (event) {
		// console.log(request);
		if(request.readyState === 4) {
			parseManifest(request);
			setManifestHttpStatus(request.status);
		}
	}
	request.addEventListener('readystatechange', onManifestLoaded);
	request.open('GET', url);
	request.send();
}
function parseManifest (request) {
	cacheInspector_manifestHeaders.getElementsByTagName('pre')[0].innerText = request.getAllResponseHeaders();
	cacheInspector_manifestContent.getElementsByTagName('pre')[0].innerText = request.responseText;
	// showCacheInspector();
}
function setManifestHttpStatus (status) {
	var badge = cacheInspector_manifestURL.getElementsByClassName('httpCode')[0];
	var c = '';
	if(status >= 200 && status < 300) c = 'successful';
	if(status >= 300 && status < 400) c = 'redirect';
	if(status >= 400 && status < 500) c = 'clientError';
	if(status >= 500) c = 'serverError';
	badge.innerText = status;
	badge.className = 'httpCode ' + c;
	// cacheInspector_manifestURL.getElementsByClassName('httpCode')[0].innerText = status;
}

// Disclosure sections
function isManifestHeadersOpen () { return cacheInspector_manifestHeaders.className === 'open'; }
function toggleManifestHeaders (open) {
    if(typeof open === 'undefined') { open = !isManifestHeadersOpen() }
    cacheInspector_manifestHeaders.className = open ? 'open' : 'closed';
    safari.extension.settings.manifestHeadersOpen = open;
}
function isManifestContentOpen () { return cacheInspector_manifestContent.className === 'open'; }
function toggleManifestContent (open) {
    if(typeof open === 'undefined') { open = !isManifestContentOpen() }
    cacheInspector_manifestContent.className = open ? 'open' : 'closed';
    safari.extension.settings.manifestContentOpen = open;
}


// Manifest inspector
function toggleCacheInspector () {
    // document.getElementById('cacheInspector') ? hideCacheInspector() : showCacheInspector();
    // cacheInspector.style.opacity = (cacheInspector.style.opacity === 0) ? 1 : 0;
    cacheInspector.style.display = (cacheInspector.style.display === 'block') ? 'none' : 'block';
}
function showCacheInspector () {
	// document.body.appendChild(cacheInspector);
    cacheInspector.style.display = 'block';
    // cacheInspector.style.opacity = 1;
}
function hideCacheInspector () {
	// document.body.removeChild(cacheInspector);
    cacheInspector.style.display = 'none';
    // cacheInspector.style.opacity = 0;
}

// Drag functionality
function startDragCacheInspector (event) {
	if(event.target === cacheInspector_manifestHeaders || event.target === cacheInspector_manifestContent) return;
	// Initial click position
	var startX = event.clientX, 
		startY = event.clientY, 
		originX = cacheInspector.offsetLeft, 
		originY = cacheInspector.offsetTop;

	event.stopPropagation();
	event.preventDefault();
	window.addEventListener('mousemove', onMouseMove, true);
	window.addEventListener('mouseup', onMouseUp, true);

	function onMouseMove (event) {
		// Prevent inspector from being dragged off the screen.
		if(event.clientX < 0 || event.clientY < 0) return;
		var deltaX = startX - originX, 
			deltaY = startY - originY, 
			mouseX = event.clientX // + window.scrollX,
			mouseY = event.clientY // + window.scrollY;
		cacheInspector.style.left = (mouseX - deltaX) + 'px';
		cacheInspector.style.top = (mouseY - deltaY) + 'px';
	}
	function onMouseUp (event) {
		window.removeEventListener('mousemove', onMouseMove, true);
		window.removeEventListener('mouseup', onMouseUp, true);
	}
}