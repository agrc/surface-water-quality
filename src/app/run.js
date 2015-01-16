(function () {
    var projectUrl;
    if (typeof location === 'object') {
        // running in browser
        projectUrl = location.pathname.replace(/\/[^\/]+$/, "") + '/';

        // running in unit tests
        projectUrl = (projectUrl === "/") ? '/src/' : projectUrl;
    } else {
        // running in build system
        projectUrl = '';
    }
    var config = {packagePaths: {}};
    config.packagePaths[projectUrl] = [
        'app',
        'agrc',
        'ijit',
        'bootstrap',
        'waterquality'
    ];
    config.packages = [{
        name: 'spin',
        location: projectUrl + 'spinjs',
        main: 'spin'
    }]
    require(config, ['app']);
})();
