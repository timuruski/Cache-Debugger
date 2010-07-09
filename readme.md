# Cache Debugger #

A Safari 5 extension for debugging HTML5 offline caches. Displays the cache status and the contents of the manifest.

## Version History ##

### Version 1.0.1 ###
* Added: Styled inspector scrollbars.
* Added: Toolbar-item now monitors applicationCache events and updates accordingly.
* Improved: Inspector drag behavior, more like OS X windows.
* Fixed: Improved install/startup state, toolbar-items are disabled by default. 
* Fixed: Removed some cases were toolbar-item wouldn't display correct state. 
* Fixed: Non-active tabs could trigger toolbar-item state change.
* Fixed: Toolbar-item was enabled on a page that wasn't cached.

### Version 1.0: ###
* Initial release


## Roadmap ##

### Version 1.1: ###
* Update toolbar icon to match Safari style more
* Store inspector state and position in extension settings
* Inspector floats above all content
* Toolbar icon responds to applicationCache events, shows error state. *done*
* Buttons in the inspector for swapping and updating the cache
* Style inspector scrollbar *done*
* Animate inspector hide/show
* Make inspector resizable


### Version 1.2: ###
* Update inspector as the cache updates
* Display cache status in inspector
* Show expiry headers for files in manifest
* Collapsable sections in manifest
* A way to clear the cache? User configurable JS call?
