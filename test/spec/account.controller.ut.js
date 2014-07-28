(function() {
    'user strict';

    define(['account'], function() {
        describe('AcctChangeCtrl', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                account,
                successSpy,
                failureSpy,
                AcctCtrl;

            beforeEach(function() {
                account = {
                    changePassword: jasmine.createSpy('account.changePassword'),
                    changeEmail: jasmine.createSpy('account.changeEmail')
                };

                module('c6.proshop');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    $scope = $rootScope.$new();

                    $log.context = function() { return $log; }

                    AcctCtrl = $controller('AcctChangeCtrl', {
                        $scope: $scope,
                        $log: $log,
                        account: account
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(AcctCtrl).toBeDefined();
                });
            });

            describe('methods', function() {
                describe('changeEmail()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changeEmail.success');
                        failureSpy = jasmine.createSpy('changeEmail.failure');
                    });
                    it('will resolve a promise if success',function(){
                        account.changeEmail.and.returnValue($q.when('Success'));
                        AcctCtrl.changeEmail('how','pass','how2')
                            .then(successSpy,failureSpy);
                        $scope.$digest();
                        expect(account.changeEmail).toHaveBeenCalledWith('how','pass','how2');
                        expect(successSpy).toHaveBeenCalledWith('Success');
                    });
                    it('will reject a promise if fails',function(){
                        account.changeEmail.and.returnValue($q.reject('Failed!'));
                        AcctCtrl.changeEmail('how','pass','how2')
                            .then(successSpy,failureSpy);
                        $scope.$digest();
                        expect(account.changeEmail).toHaveBeenCalledWith('how','pass','how2');
                        expect(failureSpy).toHaveBeenCalledWith('Failed!');
                    });
                });

                describe('changePassword()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changePassword.success');
                        failureSpy = jasmine.createSpy('changePassword.failure');
                    });
                    it('will resolve a promise if success',function(){
                        account.changePassword.and.returnValue($q.when('Success'));
                        AcctCtrl.changePassword('how','pass','how2')
                            .then(successSpy,failureSpy);
                        $scope.$digest();
                        expect(account.changePassword).toHaveBeenCalledWith('how','pass','how2');
                        expect(successSpy).toHaveBeenCalledWith('Success');
                    });
                    it('will reject a promise if fails',function(){
                        account.changePassword.and.returnValue($q.reject('Failed!'));
                        AcctCtrl.changePassword('how','pass','how2')
                            .then(successSpy,failureSpy);
                        $scope.$digest();
                        expect(account.changePassword).toHaveBeenCalledWith('how','pass','how2');
                        expect(failureSpy).toHaveBeenCalledWith('Failed!');
                    });
                });
            });
        });
    });
}());