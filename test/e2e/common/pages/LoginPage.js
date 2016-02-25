module.exports = function() {
    'use strict';

    this.emailInput = element(by.model('LoginCtrl.email'));
    this.passwordInput = element(by.model('LoginCtrl.password'));
    this.loginError = element(by.binding('LoginCtrl.loginError'));

    this.get = function() {
        browser.get('https://localhost:9000/#/login');
    };

    this.setEmail = function(name) {
        this.emailInput.sendKeys(name);
    };

    this.setPassword = function(password) {
        this.passwordInput.sendKeys(password);
    };

    this.login = function() {
        this.setEmail('howard@reelcontent.com');
        this.setPassword('sdfjhsdfs');
        this.emailInput.submit();
    };

    this.url = function() {
        return browser.getLocationAbsUrl();
    };
};