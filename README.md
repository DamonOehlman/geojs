# GeoJS

The GeoJS library is a collection of Geospatial types and utility functions designed to make the process of writing a spatial JavaScript app achievable on both the client and the server (via [NodeJS](http://nodejs.org/)).  The project was started as a result of extracting the core types and bridging functions out of [Tile5](https://github.com/DamonOehlman/tile5).

## The Core Types

To be completed

## Plugin Architecture

The core of GeoJS focuses just the core types required to get things working, and then provides a number of plugins designed to add different pieces of functionality.  The plugins are designed to work on both the client and the server, and can be activated using the following command:

```js
GeoJS.plugin('addressing', function(err, addressing) {
	// parse the address from finding nemo :)
	var parsedAddress = addressing.parse('42 Wallaby Way, Sydney, Australia');
});
```

For the plugin to work effectively on the client, then you must include the plugin JS file after you have included the main `geojs.js` file.  _In time we may use something like [$LABjs](http://labjs.com/) to dynamically load the module_

```html
<script src="https://raw.github.com/DamonOehlman/geojs/master/lib/geojs.js"></script>
<script src="https://raw.github.com/DamonOehlman/geojs/master/lib/plugins/addressing.js"></script>
```

### Writing a Plugin

To be completed

## Internationaliztion

At present, GeoJS does not support languages other than English.  The general structure of the library has been built to support plugging in other languages, and it is definitely something that I hope to look at in time.

