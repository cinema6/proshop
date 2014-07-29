(function() {
    'use strict';

    define(['account'], function() {
        describe('accountService', function() {
            var $httpBackend,
                $timeout,
                account,
                successSpy,
                failureSpy,
                c6UrlMaker;

            beforeEach(function() {
                module('c6.ui', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                });

                module('c6.proshop');

                inject(function($injector){
                    account = $injector.get('account');
                    $timeout = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('changeEmail()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changeEmail.success');
                        failureSpy = jasmine.createSpy('changeEmail.failure');
                        spyOn($timeout, 'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(200,'Successfully changed email');
                        account.changeEmail('userX','foobar','usery')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith('Successfully changed email');
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(400,'Unable to find user.');
                        account.changeEmail('userX','foobar','xx')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(200,{});
                        account.changeEmail('userX','foobar','x')
                            .then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('changePassword()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changePassword.success');
                        failureSpy = jasmine.createSpy('changePassword.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/password')
                            .respond(200,"Success");
                        account.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith("Success");
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/password')
                            .respond(500,'There was an error.');
                        account.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('There was an error.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user/password').respond(200,{});
                        account.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getOrg()', function() {
                    var mockOrg;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getOrg.success');
                        failureSpy = jasmine.createSpy('getOrg.failure');
                        spyOn($timeout,'cancel');
                        mockOrg = { id: 'o-1' };
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/org/o-1')
                            .respond(200,mockOrg);
                        account.getOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/org/o-1')
                            .respond(404,'Unable to find org.');
                        account.getOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/org/o-1')
                            .respond(200,'');
                        account.getOrg(mockOrg.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getOrgs()', function() {
                    describe('when querying by field', function() {
                        var mockField, mockOrgs;

                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getOrgs.success');
                            failureSpy = jasmine.createSpy('getOrgs.failure');
                            spyOn($timeout,'cancel');
                            mockField = 'name';
                            mockOrgs = [{name:'Org1'}, {name:'Org2'}];
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/orgs?sort=name')
                                .respond(200,mockOrgs);
                            account.getOrgs(mockField).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockOrgs);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/orgs?sort=name')
                                .respond(404,'Unable to find orgs.');
                            account.getOrgs(mockField).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/orgs?sort=name')
                                .respond(200,'');
                            account.getOrgs(mockField).then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });

                    describe('when querying all orgs', function() {
                        var mockOrgs;

                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getOrgs.success');
                            failureSpy = jasmine.createSpy('getOrgs.failure');
                            spyOn($timeout,'cancel');
                            mockOrgs = [{name:'Org1'}, {name:'Org2'}];
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/orgs')
                                .respond(200,mockOrgs);
                            account.getOrgs().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockOrgs);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/orgs')
                                .respond(404,'Unable to find orgs.');
                            account.getOrgs().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/orgs')
                                .respond(200,'');
                            account.getOrgs().then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });
                });

                describe('putOrg()', function() {
                    var mockOrg;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putOrg.success');
                        failureSpy = jasmine.createSpy('putOrg.failure');
                        spyOn($timeout,'cancel');
                        mockOrg = { id: 'o-1' };
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/org/o-1')
                            .respond(200,mockOrg);
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/org/o-1')
                            .respond(404,'Unable to update org.');
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/account/org/o-1')
                            .respond(200,'');
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postOrg()', function() {
                    var mockOrg;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postOrg.success');
                        failureSpy = jasmine.createSpy('postOrg.failure');
                        spyOn($timeout,'cancel');
                        mockOrg = { name: 'o-1' };
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(200,mockOrg);
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(404,'Unable to create org.');
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(200,'');
                        account.postOrg({id:'o-1'}).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getUser()', function() {
                    var mockUser;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getUser.success');
                        failureSpy = jasmine.createSpy('getUser.failure');
                        spyOn($timeout,'cancel');
                        mockUser = { id: 'u-1' };
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/user/u-1')
                            .respond(200,mockUser);
                        account.getUser(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/user/u-1')
                            .respond(404,'Unable to find user.');
                        account.getUser(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/user/u-1')
                            .respond(200,'');
                        account.getUser(mockUser.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getUsers()', function() {
                    describe('when querying by org', function() {
                        var mockOrg, mockUsers;

                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getUsers.success');
                            failureSpy = jasmine.createSpy('getUsers.failure');
                            spyOn($timeout,'cancel');
                            mockOrg = {id:'o-1'};
                            mockUsers = [{id:'u-1'}, {name:'u-2'}];
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/users?org=o-1')
                                .respond(200,mockUsers);
                            account.getUsers(mockOrg).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockUsers);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/users?org=o-1')
                                .respond(404,'Unable to find users.');
                            account.getUsers(mockOrg).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find users.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/users?org=o-1')
                                .respond(200,'');
                            account.getUsers(mockOrg).then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });

                    describe('when querying all orgs', function() {
                        var mockUsers;

                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getUsers.success');
                            failureSpy = jasmine.createSpy('getUsers.failure');
                            spyOn($timeout,'cancel');
                            mockUsers = [{id:'u-1'}, {id:'u-2'}];
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/users')
                                .respond(200,mockUsers);
                            account.getUsers().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockUsers);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/users')
                                .respond(404,'Unable to find users.');
                            account.getUsers().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find users.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/users')
                                .respond(200,'');
                            account.getUsers().then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });
                });

                describe('putUser()', function() {
                    var mockUser;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putUser.success');
                        failureSpy = jasmine.createSpy('putUser.failure');
                        spyOn($timeout,'cancel');
                        mockUser = { id: 'u-1', email: 'foo@bar.com', org: 'o-1'};
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/user/u-1')
                            .respond(200,mockUser);
                        account.putUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/user/u-1')
                            .respond(404,'Unable to update user.');
                        account.putUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/account/user/u-1')
                            .respond(200,'');
                        account.putUser(mockUser).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postOrg()', function() {
                    var mockUser;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putOrg.success');
                        failureSpy = jasmine.createSpy('putOrg.failure');
                        spyOn($timeout,'cancel');
                        mockUser = { id: 'u-1', email: 'foo@bar.com', org: 'o-1'};
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(200,mockUser);
                        account.postUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(404,'Unable to create user.');
                        account.postUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(200,'');
                        account.postUser(mockUser).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    });
}());