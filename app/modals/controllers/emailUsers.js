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

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.initialize = function() {
      // Initialize Variables
      $scope.searchTypes = ['All', 'Name', 'Email'];
      $scope.searchType = 'All';
      $scope.availableEmails = [];
      $scope.selectedEmails = [];
      $scope.selectAddEmails = false;
      $scope.selectRemoveEmails = false;
      $scope.emailStepOne = true;
      $scope.emailStepTwo = false;
      $scope.emailStepThree = false;
      $scope.subjectLine = '';
      $scope.emailMessage = '';

      var userDataKeys = [];

      switch (emailData.mode) {
        case 'event':
          // Initialize block level variables.
          var dataList = {};

          if (emailData.eventData.type === 'participants') {
            dataList = emailData.eventData.event.participants;
          } else {
            dataList = emailData.eventData.event.volunteers;
          }

          // Collect user keys (members) and guest info.
          _.each(dataList, function(user) {
            if (!user.guest) {
              userDataKeys.push(user.key);
            } else if (user.email) {
              $scope.availableEmails.push({
                name: user.name,
                text:
                  user.name.first + ' ' + user.name.last + ' - ' + user.email,
                email: user.email,
              });
            }
          });

          // Check to see if list has user keys.
          if (!_.isEmpty(userDataKeys)) {
            // Initialize block level variables.
            var promiseArray = [];

            // Build promise array.
            _.each(userDataKeys, function(key) {
              promiseArray.push(commonServices.getData('userData/' + key));
            });

            // Handle promise array.
            $q.all(promiseArray).then(
              function(data) {
                _.each(data, function(user) {
                  $scope.availableEmails.push({
                    name: user.name,
                    text:
                      user.name.first +
                      ' ' +
                      user.name.last +
                      ' - ' +
                      user.email,
                    email: user.email,
                  });
                });

                console.debug($scope.availableEmails);
              },
              function(err) {
                console.debug(err);
              }
            );
          }

          break;
        default:
          break;
      }
    };

    $scope.checkValid = function() {
      if (
        !_.isEmpty($scope.selectedEmails) &&
        !_.isEmpty($scope.subjectLine) &&
        !_.isEmpty($scope.emailMessage)
      ) {
        $scope.emailValid = true;
      } else {
        $scope.emailValid = false;
      }
    };

    $scope.nextStep = function() {
      if ($scope.emailStepOne) {
        $scope.emailStepOne = false;
        $scope.emailStepTwo = true;
      } else if ($scope.emailStepTwo) {
        $scope.emailStepTwo = false;
        $scope.emailStepThree = true;
        $scope.checkValid();
      } else {
        console.debug('Error: Invalid email step....');
      }
    };

    $scope.backStep = function() {
      if ($scope.emailStepTwo) {
        $scope.emailStepTwo = false;
        $scope.emailStepOne = true;
      } else if ($scope.emailStepThree) {
        $scope.emailStepThree = false;
        $scope.emailStepTwo = true;
      } else {
        console.debug('Error: Invalid email step....');
      }
    };

    $scope.addEmails = function() {
      _.each($scope.selectAddEmails, function(user) {
        $scope.selectedEmails.push(user);
        $scope.availableEmails = _.filter($scope.availableEmails, function(o) {
          return user.email !== o.email;
        });
      });
      $scope.selectAddEmails = false;
    };

    $scope.removeEmails = function() {
      _.each($scope.selectRemoveEmails, function(user) {
        $scope.availableEmails.push(user);
        $scope.selectedEmails = _.filter($scope.selectedEmails, function(o) {
          return user.email !== o.email;
        });
      });
      $scope.selectRemoveEmails = false;
    };

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
        default:
          break;
      }
    };

    $scope.sendEmail = function() {
      var emailString = '';

      _.each($scope.selectedEmails, function(user) {
        emailString += user.email + ';';
      });

      var emailPromise = commonServices.emailService('derek', 'how1234', {
        from: 'howstaff@test.com',
        to: emailString,
        subject: $scope.subjectLine,
        text: $scope.emailMessage,
      });

      $q.all([emailPromise]).then(function(data) {
        if (data[0].status === 'SUCCESS') {
          // Handle success!
        } else if (data[0].status === 'ERROR' && data[0].code === 503) {
          // Handle to many attempts message.
        } else {
          // Handle all other errors.
        }
      });
    };
  });
