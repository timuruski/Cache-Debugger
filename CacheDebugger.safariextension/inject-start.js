// Event handling
function handleMessage (event) {
    // console.log('Message: ' + event.name);
    switch(event.name) {
        case 'requestStatus':
            requestStatus();
            break;
        case 'showManifestInspector':
            showManifestInspector();
            break;
    }
}

safari.self.addEventListener('message', handleMessage, false);

// Updating the toolbar item
function requestStatus () {
    safari.self.tab.dispatchMessage('sendStatus', window.applicationCache.status);
}


// Display the manifest inspector
var manifestInspector, manifestInspector_body, manifestInspector_closeBtn;
function showManifestInspector () {
    // Download manifest inspector
    var manifestURL = document.getElementsByTagName('html')[0].getAttribute('manifest');
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

function onLoadCacheManifest (text) {
    var body = document.getElementsByTagName('body')[0];
    var html = '<p id="manifestInspector_closeBtn"><span>x</span></p>' + 
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
    // console.log('target: ' + event.target + ', currentTarget: ' + event.currentTarget);
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
            deltaY = startY - originY; 
            // mouseX = event.clientX + window.scrollX,
            // mouseY = event.clientY + window.scrollY;
        manifestInspector.style.left = (event.clientX - deltaX) + 'px';
        manifestInspector.style.top = (event.clientY - deltaY) + 'px';
    }
    function onMouseUp (event) {
        window.removeEventListener('mousemove', onMouseMove, true);
        window.removeEventListener('mouseup', onMouseUp, true);
    }
}

