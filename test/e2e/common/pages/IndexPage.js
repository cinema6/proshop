module.exports = function() {
    'use strict';

    this.logoutButton = element(by.buttonText('Log Out'));
    this.userEmail = element(by.binding('AppCtrl.user.email'));

    this.get = function() {
        browser.get('https://localhost:9000');
    };

    this.url = function() {
        return browser.getLocationAbsUrl();
    };

    this.login = function() {
        var LoginPage = require('./LoginPage.js'),
            loginPage = new LoginPage();

        loginPage.setEmail('howard@reelcontent.com');
        loginPage.setPassword('password');
        loginPage.emailInput.submit();
    };
};