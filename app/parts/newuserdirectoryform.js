/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:NewuserdirectoryformCtrl
 * @description
 * # NewuserdirectoryformCtrl
 * Controller of the ohanaApp
 */
angular.module('ohanaApp')
    .controller('NewUserDirectoryFormCtrl', function($rootScope, $q, commonServices, $scope, $uibModalInstance, howLogService) {
        'use strict';

        $scope.initialize = function() {
            // calendar options
            $scope.popup = {
                opened: false
            };

            $scope.format = 'MM/dd/yyyy';

            $scope.chapters = [];

            $scope.regions = $rootScope.siteData.regions;

            $scope.states = $rootScope.siteData.states;

            $scope.branches = ['none', 'Firefighter', 'Police', 'EMS'];

            // empty submit object
            $scope.newUserDirectory = {
                gender: 'N/A',
                branch: 'none',
                years: 0,
                service_type: false
            };

            $scope.dateOptions = {
                formatYear: 'yyyy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(1900, 5, 22),
                showWeeks: false,
                startingDay: 1
            };
        };

        $scope.setDefault = function() {
            $scope.newUserDirectory.branch = 'none';
            $scope.newUserDirectory.years = 0;
        };

        $scope.open = function() {
            $scope.popup.opened = true;
        };

        $scope.regionUpdate = function() {
            var regionName = $scope.newUserDirectory.region.text;
            var path = '/Regions/' + regionName + '/';
            var getChapters = commonServices.getData(path);

            $q.all([getChapters]).then(function(data) {
                var chapterNames = [];
                if (data[0]) {
                    _.each(data[0], function(state) {
                        _.each(state, function(chapters) {
                            chapterNames.push(chapters.name);
                        });
                    });
                    $scope.chapters = chapterNames;
                } else {
                    console.log('Failed to get Chapters...');
                }
            });
        };

        $scope.ZipUpdate = function() {
            var result = commonServices.addressLookup($scope.newUserDirectory.address.zip, function(callbackResult) {
                if (callbackResult.success == true) {
                    $scope.locationUpdate(callbackResult.results);
                }
            });
        };

        $scope.locationUpdate = function(location) {
            var ctrl = this;
            commonServices.zipCompare(location).then(function(result) {
                $scope.newUserDirectory.region = result[1];
                ctrl.regionUpdate();
                $scope.newUserDirectory.chapter = result[0];
            });

        };

        $scope.postUser = function(form) {
            console.log(form);

            if (form.$invalid) {
                console.log('form is invalid');
            } else {
                console.log('form is valid');
            }
            // var i;

            // //push to db kept breaking due to null value
            // if ($scope.newUserDirectory.address.line2 == null) {
            //     $scope.newUserDirectory.address.line2 = '';
            // }
            // console.log($scope.newUserDirectory);
            // console.log('SUCCESS');

            // var newDOB = $scope.newUserDirectory.DOB;
            // newDOB = newDOB.toString();
            // var DOBmonth = newDOB.substring(4, 7);
            // var DOBday = newDOB.substring(8, 10);
            // var DOByear = newDOB.substring(11, 15);

            // switch (DOBmonth) {
            //     case 'Jan':
            //         DOBmonth = '01';
            //         break;
            //     case 'Feb':
            //         DOBmonth = '02';
            //         break;
            //     case 'Mar':
            //         DOBmonth = '03';
            //         break;
            //     case 'Apr':
            //         DOBmonth = '04';
            //         break;
            //     case 'May':
            //         DOBmonth = '05';
            //         break;
            //     case 'Jun':
            //         DOBmonth = '06';
            //         break;
            //     case 'Jul':
            //         DOBmonth = '07';
            //         break;
            //     case 'Aug':
            //         DOBmonth = '08';
            //         break;
            //     case 'Sep':
            //         DOBmonth = '09';
            //         break;
            //     case 'Oct':
            //         DOBmonth = '10';
            //         break;
            //     case 'Nov':
            //         DOBmonth = '11';
            //         break;
            //     case 'Dec':
            //         DOBmonth = '12';
            //         break;
            //     default:
            //         console.log('Error with DOB...');
            // }

            // newDOB = DOBmonth + '/' + DOBday + '/' + DOByear;

            // var packet = {
            //     address: {
            //         city: $scope.newUserDirectory.address.city,
            //         line1: $scope.newUserDirectory.address.line1,
            //         line2: $scope.newUserDirectory.address.line2,
            //         state: $scope.newUserDirectory.address.state.name,
            //         zip: $scope.newUserDirectory.address.zip
            //     },
            //     name: $scope.newUserDirectory.name,
            //     branch: $scope.newUserDirectory.branch,
            //     email: $scope.newUserDirectory.email,
            //     gender: $scope.newUserDirectory.gender,
            //     DOB: newDOB,
            //     phone: $scope.newUserDirectory.phone,
            //     years: $scope.newUserDirectory.years,
            //     Region: $scope.newUserDirectory.region.text,
            //     Chapter: $scope.newUserDirectory.chapter,
            //     password: $scope.newUserDirectory.password
            // };

            // var results = commonServices.register(packet);

            // $q.all([results]).then(function(data) {
            //     console.log(data[0]);
            //     if (data[0]) {
            //         // If sign in was successful, send user to events page
            //         swal({
            //             text: "User added!",
            //             type: 'success',
            //             timer: 2500
            //         });
            //         howLogService.logPrimaryChapterChange(packet.name.first + ' ' + packet.name.last, false, false, packet.Chapter);
            //         $uibModalInstance.close();
            //         window.location.replace('#/home');
            //     } else {
            //         // Do something here when sign in unsuccessful....
            //         swal({
            //             text: "Error submitting data. Please try again",
            //             type: 'error',
            //             timer: 2500
            //         });
            //     }
            // });


        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        angular.element(document).ready(function() {
            $("#phonenum").mask("(999)999-9999");
            $("#sanicDOB").mask("99/99/9999");
            $("#Zip").mask("99999");
        });
    });
