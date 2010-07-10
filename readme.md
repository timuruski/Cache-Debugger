# Cache Debugger #

A Safari 5 extension for debugging HTML5 offline caches. Displays the cache status and the contents of the manifest.

## Version History ##

### Version 1.1 - July 10, 2010: ###
* Improved: Redesigned toolbar icon to match Safari
* Improved: Redesigned cache inspector
* Added: Added application cache status to inspector
* Added: Added cache event timeline to inspector
* Added: Added manifest headers to inspector
* Added: Added manifest HTTP status to inspector
* Improved: Inspector responds to cache events

### Version 1.0.1 - June 21, 2010: ###
* Added: Styled inspector scrollbars.
* Added: Toolbar-item now monitors applicationCache events and updates accordingly.
* Improved: Inspector drag behavior, more like OS X windows.
* Fixed: Improved install/startup state, toolbar-items are disabled by default. 
* Fixed: Removed some cases were toolbar-item wouldn't display correct state. 
* Fixed: Non-active tabs could trigger toolbar-item state change.
* Fixed: Toolbar-item was enabled on a page that wasn't cached.

### Version 1.0 - June 19, 2010: ###
* Initial release


## Roadmap ##

### Version 1.2: ###
* Buttons in the inspector for swapping and updating the cache
* Store inspector state and position in extension settings
* Show expiry headers for files in manifest
* Collapsable sections in manifest
* A way to clear the cache? User configurable JS call?
