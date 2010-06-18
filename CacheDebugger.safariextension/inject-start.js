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
var manifestInspector;
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

function onLoadCacheManifest (text) {
    var body = document.getElementsByTagName('body')[0];
    console.log(manifestInspector);
    if(manifestInspector == null) {
        manifestInspector = document.createElement('div');
        manifestInspector.id = 'manifestInspector';
        manifestInspector.innerHTML = '<p class="close-btn"><span>x</span></p><p class="title">Manifest</p><pre class="body">' + text + '</pre>';
    }
    body.appendChild(manifestInspector);
    // manifestInspector.addEventListener('mousedown', startDragManifestInspector);
    manifestInspector.onmousedown = startDragManifestInspector;
}

function startDragManifestInspector (event) {
    event.preventDefault();
    event.preventDefault();
    // Initial click position
    var startX = event.clientX, 
        startY = event.clientY, 
        originX = manifestInspector.offsetLeft, 
        originY = manifestInspector.offsetTop;
    // Should probably capture existing event and bubble it through
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    function onMouseMove (event) {
        var deltaX = startX - originX, 
            deltaY = startY - originY, 
            mouseX = event.clientX + window.scrollX, 
            mouseY = event.clientY + window.scrollY;
        // console.log('x: ' + mouseX + ', y: ' + mouseY);
        manifestInspector.style.left = (event.clientX - deltaX) + 'px';
        manifestInspector.style.top = (event.clientY - deltaY) + 'px';
    }
    function onMouseUp (event) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

