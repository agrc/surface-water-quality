(function () {
    // the baseUrl is relavant in source version and while running unit tests.
    // the`typeof` is for when this file is passed as a require argument to the build system
    // since it runs on node, it doesn't have a window object. The basePath for the build system
    // is defined in build.profile.js
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
        ) ? '/src' : './',
        packages: [
            'agrc',
            'app',
            'dijit',
            'dgrid',
            'dojo',
            'dojox',
            'esri',
            'layer-selector',
            'sherlock',
            'spinjs',
            'xstyle',
            'ijit', {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            }, {
                name: 'bootstrap',
                location: 'bootstrap/dist',
                main: 'js/bootstrap'
            }
        ],
        map: {
            'agrc': {
                'spin': 'spinjs/spin'
            }
        }
    };
    require(config, ['dojo/parser', 'dojo/domReady!', 'jquery'], function (parser) {
        parser.parse();
    });
}());
