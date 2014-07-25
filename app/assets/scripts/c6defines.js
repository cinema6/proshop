define(function() {
    'use strict';

    var c6 = window.c6 = {};

    c6.kLocal = !!window.DEBUG;
    c6.kDebug = c6.kLocal;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = c6.kDebug ? ['error','warn','log','info'] : [];
    c6.kApiUrl = '/api';

    return c6;
});
