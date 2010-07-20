// Display the manifest inspector
// ==============================
var cacheInspector, 
	cacheInspector_titlebar, 
	cacheInspector_closeBtn, 
	cacheInspector_error, 
	cacheInspector_status, 
	cacheInspector_manifestURL, 
	cacheInspector_cacheEvents, 
	cacheInspector_manifestHeaders, 
	cacheInspector_manifestContent;

var cacheInspector_eventTimeline_fresh = true, 
    cacheInspector_manifestHeaders_fresh = true,
    cacheInspector_manifestContent_fresh = true;

function updateInspector () {
    if(!cacheInspector || !manifest) return;
    setCacheStatus(applicationCache.status);
    setManifestHttpStatus(manifest.status);
    cacheInspector_error.style.display = manifest.error ? 'block' : 'none';
    cacheInspector_manifestURL.getElementsByClassName('value')[0].innerText = manifest.url;
    var list = cacheInspector_eventTimeline.getElementsByTagName('ul')[0], 
        listItem, eventElement;
    for(var i = list.children.length; i < manifest.events.length; i++) {
        eventElement = document.createElement('span');
        eventElement.className = 'event ' + manifest.events[i].type;
        eventElement.innerText = formatEventType(manifest.events[i].type);
        listItem = document.createElement('li');
        listItem.appendChild(eventElement);
        list.appendChild(listItem);
    }
    cacheInspector_manifestHeaders.getElementsByTagName('pre')[0].innerHTML = parseManifestHeaders(manifest.headers);
    cacheInspector_manifestContent.getElementsByTagName('pre')[0].innerText = parseManifestContent(manifest.content);
    
    // Store these states by tab in the global-page.
    if(cacheInspector_eventTimeline_fresh) toggleEventTimeline( manifest.error );
    if(cacheInspector_manifestHeaders_fresh) toggleManifestHeaders( manifest.error );
    if(cacheInspector_manifestContent_fresh) toggleManifestContent(false);
}
function formatEventType (type) {
    switch(type) {
        case 'cached':
            return 'Cached';
        case 'checking':
            return 'Checking';
        case 'downloading':
            return 'Downloading';
        case 'error':
            return 'Error';
        case 'noupdate':
            return 'No update';
        case 'progress':
            return 'Progress';
        case 'updateready':
            return 'Update ready';
        case 'obsolete':
            return 'Obsolete'
    }
    
    return type;
}

function fetchInspector () {
	safari.self.tab.dispatchMessage('fetchInspector');
}
function onFetchInspector (message) {
    var stub = document.createElement('div'), 
        inspector;
    stub.innerHTML = message;
    inspector = stub.children[0];
    document.body.appendChild(inspector);
	initializeInspector(inspector);
}
function initializeInspector (element) {
    cacheInspector = element;
    cacheInspector_titlebar = document.getElementById('cacheInspector_titlebar');
    cacheInspector_closeBtn = document.getElementById('cacheInspector_closeBtn');
	cacheInspector_error = document.getElementById('cacheInspector_error');
	cacheInspector_status = document.getElementById('cacheInspector_status');
	cacheInspector_manifestURL = document.getElementById('cacheInspector_manifestURL');
	cacheInspector_eventTimeline = document.getElementById('cacheInspector_eventTimeline');
	cacheInspector_manifestHeaders = document.getElementById('cacheInspector_manifestHeaders');
	cacheInspector_manifestContent = document.getElementById('cacheInspector_manifestContent');
	cacheInspector_manifestHeaders_toggle = document.getElementById('cacheInspector_manifestHeaders_toggle');
	cacheInspector_manifestContent_toggle = document.getElementById('cacheInspector_manifestContent_toggle');
	
    // Reorganize these handlers to use bubbling.
    // cacheInspector.addEventListener('mousedown', startDragCacheInspector, false);
    cacheInspector_titlebar.addEventListener('mousedown', startDragCacheInspector, false);
    cacheInspector_closeBtn.addEventListener('click', hideCacheInspector, false);
    cacheInspector_eventTimeline_toggle.addEventListener('click', toggleEventTimeline, false);
    cacheInspector_manifestHeaders_toggle.addEventListener('click', toggleManifestHeaders, false);
    cacheInspector_manifestContent_toggle.addEventListener('click', toggleManifestContent, false);
    
    hideCacheInspector();
    updateInspector();
}

function setManifestHttpStatus (status) {
    var badgeElement = cacheInspector_manifestURL.getElementsByClassName('httpCode')[0];
        badgeClassName = '';
    if(status >= 200 && status < 300) badgeClassName = 'successful';
    if(status >= 300 && status < 400) badgeClassName = 'redirect';
    if(status >= 400 && status < 500) badgeClassName = 'clientError';
    if(status >= 500) badgeClassName = 'serverError';
    badgeElement.innerText = status;
    badgeElement.className = 'httpCode ' + badgeClassName;
    // cacheInspector_manifestURL.getElementsByClassName('httpCode')[0].innerText = status;
}

function setCacheStatus (status) {
    var badgeElement = cacheInspector_status.getElementsByClassName('statusCode')[0], 
        valueElement = cacheInspector_status.getElementsByClassName('value')[0], 
        badgeClassName = '', 
        valueText = '';
    
    var ellipsisPattern = /\.{0,3}$/, 
        animDownloadingLabel = function (currentText) {
            var result = currentText.match(ellipsisPattern)[0], 
                ellipsis = '';
            switch(result.length) {
                case 0:
                    ellipsis = '.';
                    break;
                case 1:
                    ellipsis = '..';
                    break;
                case 2:
                    ellipsis = '...';
                    break;
                case 3:
                default:
                    ellipsis = '...';
                    break;
            }
            return 'DOWNLOADING' + ellipsis;
        }
    
	switch(status) {
		case 0:
		    badgeClassName = '';
			valueText = 'UNCACHED';
			break;
		case 1:
            badgeClassName = 'idle';
            valueText = 'IDLE';
            break;
		case 2:
            badgeClassName = 'checking';
            valueText = 'CHECKING';
            break;
		case 3:
			badgeClassName = 'downloading';
            valueText = animDownloadingLabel(valueElement.innerText);
            break;
        case 4:
            badgeClassName = 'updateready';
            valueText = 'UPDATEREADY';
            break;
        case 5:
            badgeClassName = 'obsolete';
            valueText = 'OBSOLETE';
            break;
	}
    badgeElement.innerText = status;
	badgeElement.className = 'statusCode ' + badgeClassName;
	valueElement.innerText = valueText;
}

function parseManifestHeaders (input) {
	var formatLine = function (line) {
        var key = line.trimLeft().substring(0, line.indexOf(':')), 
    	    value = line.substring(line.indexOf(':') + 1).trim(), 
    	    className = [];
    	if( isImportant(key) ) {
    	    className.push('highlight');
    	    if( !isValid(key, value) ) className.push('problem');
    	    return '<span class="' + className.join(' ') + '">' + line.trim() + '</span>';
        }

        return line;
    }
    var isImportant = function (key) {
        switch(key) {
            case 'Content-Type':
            case 'Cache-Control':
            case 'Last-Modified':
                return true;
        }
        // else
        return false;
    }
    var isValid = function (key, value) {
        switch(key) {
            case 'Content-Type':
                return (value === 'text/cache-manifest');
        }
        
        return true;
    }
    
	var lines = input.split('\n');
	for(var i = 0; i < lines.length; i++) {
        lines[i] = formatLine( lines[i] );
	}
	
	return lines.join('\n');
}


function parseManifestContent (str) {
    return str;
}

// Disclosure sections (some DRY needed here)
function isEventTimelineOpen () { return cacheInspector_eventTimeline.className === 'open'; }
function toggleEventTimeline (open) {
    if(typeof open === 'object') { cacheInspector_eventTimeline_fresh = false; }
    if(typeof open === 'undefined' || typeof open === 'object') { open = !isEventTimelineOpen() }
    cacheInspector_eventTimeline.className = open ? 'open' : 'closed';
}
function isManifestHeadersOpen () { return cacheInspector_manifestHeaders.className === 'open'; }
function toggleManifestHeaders (open) {
    if(typeof open === 'object') { cacheInspector_manifestHeaders_fresh = false; }
    if(typeof open === 'undefined' || typeof open === 'object') { open = !isManifestHeadersOpen() }
    cacheInspector_manifestHeaders.className = open ? 'open' : 'closed';
}
function isManifestContentOpen () { return cacheInspector_manifestContent.className === 'open'; }
function toggleManifestContent (open) {
    if(typeof open === 'object') { cacheInspector_manifestContent_fresh = false; }
    if(typeof open === 'undefined' || typeof open === 'object') { open = !isManifestContentOpen() }
    cacheInspector_manifestContent.className = open ? 'open' : 'closed';
}


// Manifest inspector
function toggleCacheInspector () {
    document.getElementById('cacheInspector') ? hideCacheInspector() : showCacheInspector();
    // cacheInspector.style.display = (cacheInspector.style.display === 'block') ? 'none' : 'block';
    // cacheInspector.style.opacity = (cacheInspector.style.opacity === 0) ? 1 : 0;
}
function showCacheInspector () {
    cacheInspector.style.display = 'block';
    document.body.appendChild(cacheInspector);
    // cacheInspector.style.opacity = 1;
}
function hideCacheInspector () {
    cacheInspector.style.display = 'none';
    document.body.removeChild(cacheInspector);
    // cacheInspector.style.opacity = 0;
}

// Drag functionality
function startDragCacheInspector (event) {
    if(event.target === cacheInspector_closeBtn) return;
    // if(event.target === cacheInspector_manifestHeaders || event.target === cacheInspector_manifestContent) return;
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


// Misc
function handleInspectorMessage (event) {
    switch(event.name) {
        case 'toggleCacheInspector':
            toggleCacheInspector();
            break;
        case 'fetchInspector':
            onFetchInspector(event.message);
            break;
    }
}
function handleInspectorSettings (event) {
    //
}



// Start up
// ========
if(typeof safari !== 'undefined') {
    safari.self.addEventListener('message', handleInspectorMessage, false);
    safari.self.addEventListener('change', handleInspectorSettings, false);
    fetchInspector();
}
// updateInspector();