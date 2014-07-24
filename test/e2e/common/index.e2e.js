(function() {
    'use strict';

    describe('/', function() {
        var IndexPage, indexPage;

        beforeEach(function() {
            IndexPage = require('./pages/IndexPage.js');
            indexPage = new IndexPage();
            indexPage.get();
        });

        describe('when not logged in', function() {
            it('should load redirect to /login', function() {
                expect(indexPage.url()).toBe('http://localhost:9000/#/login');
            });

            it('should hide user info', function() {
                expect(indexPage.userEmail.isDisplayed()).toBe(false);
                expect(indexPage.logoutButton.isDisplayed()).toBe(false);
            });
        });

        describe('when logged in', function() {
            beforeEach(function() {
                indexPage.login();
            });

            afterEach(function() {
                indexPage.logoutButton.click();
            });

            it('should resolve to /users', function() {
                indexPage.get();

                expect(indexPage.url()).toBe('http://localhost:9000/#/users');
            });

            it('should resolve /login to /users', function() {
                browser.get('http://localhost:9000/#/login');
                expect(indexPage.url()).toBe('http://localhost:9000/#/users');
            });

            it('should show the user email and logout button', function() {
                expect(indexPage.userEmail.isDisplayed()).toBe(true);
                expect(indexPage.logoutButton.isDisplayed()).toBe(true);
            });
        });
    });
}());