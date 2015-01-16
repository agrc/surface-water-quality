/*jshint unused:false */

var profile = {
	basePath: '../src',
	action: 'release',
	cssOptimize: 'comments',
	mini: true,
	optimize: 'shrinksafe',
	layerOptimize: 'shrinksafe',
	stripConsole: 'all',
	selectorEngine: 'acme',
	layers: {
		'dojo/dojo': {
			include: [
				'dojo/i18n',
				'dojo/domReady',
				'app/run',
				'app/App',
				'dojox/gfx/path',
				'dojox/gfx/svg',
				'dojox/gfx/shape'
			],
			targetStylesheet: 'app/resources/App.css',
			includeLocales: ['en-us'],
			customBase: true,
			boot: true
		}
	},
	staticHasFeatures: {
		// The trace & log APIs are used for debugging the loader, so we don’t need them in the build
		'dojo-trace-api': 0,
		'dojo-log-api': 0,

		// This causes normally private loader data to be exposed for debugging, so we don’t need that either
		'dojo-publish-privates': 0,

		// We’re fully async, so get rid of the legacy loader
		'dojo-sync-loader': 0,

		// dojo-xhr-factory relies on dojo-sync-loader
		'dojo-xhr-factory': 0,

		// We aren’t loading tests in production
		'dojo-test-sniff': 0
	},
	plugins: {
		'xstyle/css': 'xstyle/build/amd-css'
	},
	userConfig: {
		packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'waterquality']
	},
	packages: ['put-selector', 'mustache', {
		name: 'esri',
		resourceTags: {
			amd: function(filename, mid) {
				return (/.*\.js/).test(filename);
			}
		}
	}]
};
