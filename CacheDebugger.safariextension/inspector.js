// Display the manifest inspector
// ==============================
var cacheInspector, 
	cacheInspector_titlebar, 
	cacheInspector_closeBtn, 
	cacheInspector_status, 
	cacheInspector_manifestURL, 
	cacheInspector_manifestHeaders, 
	cacheInspector_manifestContent;

function initializeInspector () {
    safari.self.addEventListener('message', handleInspectorMessage, false);
    safari.self.addEventListener('change', handleInspectorSettings, false);
    fetchInspector();
    // updateInspector();
}
function updateInspector () {
    if(!cacheInspector || !manifest) return;
    setCacheStatus(applicationCache.status);
    setManifestHttpStatus(manifest.status);
    cacheInspector_manifestURL.getElementsByClassName('value')[0].innerText = manifest.url;
    cacheInspector_manifestHeaders.getElementsByTagName('pre')[0].innerHTML = parseManifestHeaders(manifest.headers);
    cacheInspector_manifestContent.getElementsByTagName('pre')[0].innerText = parseManifestContent(manifest.content);
}

function fetchInspector () {
	safari.self.tab.dispatchMessage('fetchInspector');
}
function onFetchInspector (message) {
    var stub = document.createElement('div');
    stub.innerHTML = message;
	cacheInspector = stub.children[0];
	document.body.appendChild(cacheInspector);
	
    cacheInspector_titlebar = document.getElementById('cacheInspector_titlebar');
    cacheInspector_closeBtn = document.getElementById('cacheInspector_closeBtn');
	cacheInspector_status = document.getElementById('cacheInspector_status');
	cacheInspector_manifestURL = document.getElementById('cacheInspector_manifestURL');
	cacheInspector_manifestHeaders = document.getElementById('cacheInspector_manifestHeaders');
	cacheInspector_manifestContent = document.getElementById('cacheInspector_manifestContent');
	cacheInspector_manifestHeaders_toggle = document.getElementById('cacheInspector_manifestHeaders_toggle');
	cacheInspector_manifestContent_toggle = document.getElementById('cacheInspector_manifestContent_toggle');
	
    // Reorganize these handlers to use bubbling.
    // cacheInspector.addEventListener('mousedown', startDragCacheInspector, false);
    cacheInspector_titlebar.addEventListener('mousedown', startDragCacheInspector, false);
    cacheInspector_closeBtn.addEventListener('click', hideCacheInspector, false);
    cacheInspector_manifestHeaders_toggle.addEventListener('click', toggleManifestHeaders, false);
    cacheInspector_manifestContent_toggle.addEventListener('click', toggleManifestContent, false);
    
	// Store these states by tab in the global-page.
    toggleManifestHeaders(true);
    toggleManifestContent(false);
    
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
            valueText = 'DOWNLOADING';
            break;
		case 4:
			badgeClassName = 'updateready';
            valueText = 'UPDATEREADY';
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
function isManifestHeadersOpen () { return cacheInspector_manifestHeaders.className === 'open'; }
function toggleManifestHeaders (open) {
    if(typeof open === 'undefined' || typeof open === 'object') { open = !isManifestHeadersOpen() }
    cacheInspector_manifestHeaders.className = open ? 'open' : 'closed';
}
function isManifestContentOpen () { return cacheInspector_manifestContent.className === 'open'; }
function toggleManifestContent (open) {
    if(typeof open === 'undefined' || typeof open === 'object') { open = !isManifestContentOpen() }
    cacheInspector_manifestContent.className = open ? 'open' : 'closed';
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
initializeInspector();