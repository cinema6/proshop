(function() {
    'use strict';

    describe('/login', function() {
        var LoginPage, loginPage;

        beforeEach(function() {
            LoginPage = require('./pages/LoginPage.js');
            loginPage = new LoginPage();
            loginPage.get();
        });

        describe('when not logged in', function() {
            it('should show the login form', function() {
                expect(loginPage.emailInput.isDisplayed()).toBe(true);
                expect(loginPage.passwordInput.isDisplayed()).toBe(true);
            });
        });

        describe('when logged in', function() {
            it('should redirect to /users', function() {
                loginPage.login();
                expect(loginPage.url()).toBe('http://localhost:9000/#/users');
                element(by.buttonText('Log Out')).click();
            });
        });

        describe('when logging in', function() {
            describe('with no password', function() {
                it('should show an error', function() {
                    loginPage.setEmail('Julie');

                    loginPage.emailInput.submit();

                    expect(loginPage.loginError.getText()).toEqual('Email and password required.');
                });
            });

            describe('with no username', function() {
                it('should show an error', function() {
                    loginPage.setPassword('password');

                    loginPage.emailInput.submit();

                    expect(loginPage.loginError.getText()).toEqual('Email and password required.');
                });
            });

            describe('with an invalid username and password', function() {
                it('should show an error', function() {
                    loginPage.setEmail('fail@bad.com');
                    loginPage.setPassword('password');

                    loginPage.emailInput.submit();

                    expect(loginPage.loginError.getText()).toEqual('Invalid email or password');
                });
            });

            describe('with a valid username and password', function() {
                it('should redirect to /users', function() {
                    loginPage.setEmail('julie@reelcontent.com');
                    loginPage.setPassword('password');

                    loginPage.emailInput.submit();

                    expect(loginPage.url()).toBe('http://localhost:9000/#/users');
                });
            });
        });
    });
}());