define(function() {
    'use strict';

    var c6 = window.c6 = {};

    c6.kLocal = !!window.LOCAL;
    c6.kDebug = !!window.DEBUG;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = c6.kDebug ? ['error','warn','log','info'] : [];
    c6.kApiUrl = '/api';
    c6.kPreviewUrl = 'http://' + (c6.kDebug ? 'staging.cinema6.com' : 'cinema6.com');

    return c6;
});
