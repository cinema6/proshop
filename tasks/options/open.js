(function() {
    'use strict';

    module.exports = {
        server: {
            url: 'https://localhost:<%= settings.connectPort %>/',
            app: '<%= settings.openBrowser %>'
        }
    };
})();