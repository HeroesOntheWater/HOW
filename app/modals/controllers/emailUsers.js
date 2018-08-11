/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:emailUsers
 * @description
 * # emailUsers
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('emailUsers', function(
    emailData,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    $uibModal,
    $http
  ) {
    'use strict';

    console.log(emailData);

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.initialize = () => {

        // Initialize Variables
        $scope.searchTypes = ['All', 'Name', 'Email'];
        $scope.searchType = 'All';
        $scope.availableEmails = [];
        $scope.selectedEmails = [];
        $scope.selectAddEmails = false;
        $scope.selectRemoveEmails = false;

        let userDataKeys = [];
        
        switch(emailData.mode) {
            case 'event': 

                // Initialize block level variables.
                let dataList = {}

                if (emailData.eventData.type === 'participants') {
                    dataList = emailData.eventData.event.participants;
                } else {
                    dataList = emailData.eventData.event.volunteers;
                }

                // Collect user keys (members) and guest info.
                _.each(dataList, (user) => {
                    if (!user.guest) {
                        userDataKeys.push(user.key);
                    } else if (user.email) {
                        $scope.availableEmails.push({
                           name: user.name,
                           text: user.name.first + ' ' + user.name.last + ' - ' + user.email,
                           email: user.email 
                        });
                    }
                });

                // Check to see if list has user keys.
                if (!_.isEmpty(userDataKeys)) {

                    // Initialize block level variables.
                    let promiseArray = [];

                    // Build promise array.
                    _.each(userDataKeys, (key) => {
                        promiseArray.push(commonServices.getData('userData/' + key));
                    });

                    // Handle promise array.
                    $q.all(promiseArray).then(function(data) {
                        _.each(data, (user) => {
                            $scope.availableEmails.push({
                                name: user.name,
                                text: user.name.first + ' ' + user.name.last + ' - ' + user.email,
                                email: user.email  
                            });
                        });

                        console.debug($scope.availableEmails);
                    }, (err) => {
                        console.debug(err);
                    });

                }

                break;
            default: break;
        }
        
    }

    $scope.addEmails = () => {
        _.each($scope.selectAddEmails, (user) => {
            $scope.selectedEmails.push(user);
            $scope.availableEmails = _.filter($scope.availableEmails, (o) => { return user.email !== o.email});
        });
        $scope.selectAddEmails = false;
    }

    $scope.removeEmails = () => {
        _.each($scope.selectRemoveEmails, (user) => {
            $scope.availableEmails.push(user);
            $scope.selectedEmails = _.filter($scope.selectedEmails, (o) => { return user.email !== o.email});
        });
        $scope.selectRemoveEmails = false;
    }

    $scope.clearSearch = function() {
        $scope.searchFirst = undefined;
        $scope.searchLast = undefined;
        $scope.searchEmail = undefined;
        $scope.searchPhone = undefined;
        $scope.search_form.$setValidity();
        $scope.search_form.$setPristine();
        $scope.search_form.$setUntouched();
    };

    $scope.runSearch = function() {

        // Initliazed Variables.
        $scope.foundParticipants = [];
  
        switch ($scope.searchType) {
            case 'Name':

                break;
            case 'Email':

                break;
            case 'All':
            default: break;
        }
    };

    $scope.sendEmail = () => {
        let formData = {
            from: 'howstaff@test.com',
            to: 'derek.rusu@gmail.com',
            subject: 'Test 550',
            text: 'Sending from how app!'
        }
        var emailPromise = commonServices.emailService('derek', 'how1234', formData);
        $q.all([emailPromise]).then((data) => {
            if (data[0]) {
                // success here
            };
        });
    };

   
  });
