(function() {
    'use strict';

    module.exports = {
        server: {
            url: 'http://localhost:<%= settings.connectPort %>/',
            app: '<%= settings.openBrowser %>'
        }
    };
})();