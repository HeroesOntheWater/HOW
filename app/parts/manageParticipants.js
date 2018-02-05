/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:ManageParticipantsCtrl
 * @description
 * # ManageParticipantsCtrl
 * Controller of the ohanaApp
 */
angular
  .module('ohanaApp')
  .controller('ManageParticipantsCtrl', function(
    event,
    $rootScope,
    $q,
    commonServices,
    $scope,
    $uibModalInstance,
    $uibModal,
    dataGridUtil
  ) {
    'use strict';

    $scope.initialize = function() {
      $scope.tableEmpty = false;
      $scope.getCurrentParticipantsData(event.participants);
    };

    $scope.addParticipantToEvent = function() {
      $uibModal.open({
        templateUrl: '/parts/addParticipantsToEvent.html',
        controller: 'AddParticipantToEvent',
        resolve: {
          event: function() {
            return event;
          }
        }
      });

      $scope.cancel();
    };

    // Daniel Arroyo Add waiver module here :)
    $scope.participantSignWaiver = function() {
      console.log($scope.currId);
    };

    $scope.getCurrentParticipantsData = function(participantsList) {

      // Initialze Variables.
      var promiseArray = [];

      if (_.isUndefined(participantsList) || _.isEmpty(participantsList)) {

        // Display Error.
        $scope.tableEmpty = true;

      } else {

        // Get id for each participant, and create promise.
        var guestList = [];
        _.each(participantsList, function(participant) {
          if (participant.guest) {
            guestList.push(participant);
          } else {
            promiseArray.push(commonServices.getData('userData/' + participant.key));
          }
        });

        // Run promise array and handle returned data.
        $q.all(promiseArray).then(function(data) {
          data = data.concat(guestList);
          $scope.buildTable(data);
        });

      }

    };
    
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.buildTable = function(results) {
      var dataSet = dataGridUtil.buildParticipantsTable(results);
      $scope.currId = '';

      angular.element(document).ready(function() {
        //toggle `popup` / `inline` mode
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.ajaxOptions = {
          type: 'PUT',
        };

        //if exists, destroy instance of table
        if ($.fn.DataTable.isDataTable($('#participantsTable'))) {
          $scope.participantsTable.destroy();
        }

        $scope.membersTable = $('#participantsTable').DataTable({
          data: dataSet,
          columns: [
            {},
            {
              title: 'Name',
              data: 'name'
            },
            {
              title: 'Email',
              data: 'email'
            },
            {
              title: 'Phone',
              data: 'phone'
            },
            {
              title: 'Type',
              data: 'type'
            },
            {
              title: 'Waiver',
              data: 'waiver'
            }
          ],
          responsive: {
            details: {
                type: 'column'
            }
          },
          columnDefs: [
            {
              targets: 0,
              searchable: false,
              orderable: false,
              className: 'dt-body-center control',
              render: function() {
                return '<div id="participants-row-data" style="width: 20px;">';
              }
            }
          ],
          order: [[2, 'asc']],
          headerCallback: _.noop,
          rowCallback: function(row, data, index) {
            $(row).find('div#participants-row-data').attr('data-key', data.key);
            $(row).find('div#participants-row-data').attr('data-row-index', index);
            var waiverStatus = $(row).find('td')[5];
            if ($(waiverStatus).text() === 'Complete') {
              $(waiverStatus).css("color", "green");
            } else {
              $(waiverStatus).css("color", "red");
            }
            return row;
          },
          drawCallback: function(settings) {

            // Reset button and clear selected
            $('tbody').find('tr').css('background-color', '');
            $scope.swStatus = true;
            $scope.currId = '';

            // Get the currently selected: state, Region, and chapterId.
            $('#participantsTable').off('click', 'tbody tr[role="row"]');
            $('#participantsTable').on('click', 'tbody tr[role="row"]', function() {

              // Set currently selected account.
              $scope.currId = $(this).find('div#participants-row-data').data('key');
              $('tbody').find('tr').css('background-color', '');
              $(this).css('background-color', '#FFFFC4');
              $('#signWaiver').removeClass('disabled');
              
            });

            // Clear selected value when user paginates
            $('#participantsTable_paginate').off('click');
            $('#participantsTable_paginate').on('click', function() {
              $('tbody').find('tr').css('background-color', '');
              $('#signWaiver').addClass('disabled');
            });

          }
        });
      });
    };
  });
