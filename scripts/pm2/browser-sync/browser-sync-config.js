/* eslint-disable no-console */
/**
 * Provides configuration options for "Browser Sync"; a local, live-reload,
 * testing web server.
 *
 * @see https://www.browsersync.io/
 * @see https://www.browsersync.io/docs/options
 * @see https://www.browsersync.io/docs/command-line
 *
 */

"use strict";

console.log( "[browser-sync-config] Initializing Browser-Sync Config" );

module.exports = {

	// host: "luke1.dasix.com",
	host: "0.0.0.0",

	// The main listen port
	port: 8080,

	// Configure the Web UI
	ui: {
		port: 8081,
	},

	// Logging
	logLevel       : "debug",
	logConnections : true,
	logFileChanges : true,

	// Disable the 'notifications' when refreshing pages
	// If you're having trouble with Browser Sync, you might
	// want to turn this back on to ensure everything is working...
	notify: false,

	// Watch Settings
	// see also: https://github.com/paulmillr/chokidar#api
	files: "**/*",

	/* watchOptions: {
		usePolling: true,
		interval: 200
	},*/

	// Static webserver options
	server: {
		baseDir   : "./docs/html/latest",
		directory : false,
		index     : "index.html",
		routes    : {
			"/lib/phaser" : "./node_modules/phaser/build",
			"/lib/qx"     : "./node_modules/qooxdoo",
			"/lib/lodash" : "./node_modules/lodash",
		},
	},

	// Delays
	reloadDelay    : 0,
	reloadThrottle : 0,
	reloadDebounce : 0,

	// Add CORS support
	cors: true,

	// Do not open a browser window
	open: false,

	// We don't need the "online" features
	online: false,

};
