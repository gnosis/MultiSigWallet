(
  function () {
    angular
    .module("multiSigWeb")
    .controller("addNotificationsCtrl", function ($rootScope, $scope, $uibModalInstance, wallet, EthAlerts, Utils, callback) {

      $scope.selectedEvents = {};
      $scope.params = {};

      $scope.showLoadingSpinner = false;
      $scope.showAlertData = false;
      // When True, all events are selected. None otherwise.
      var subscribeUnsubscribe = true;
      $scope.subscribeUnsubscribeValue = 'Subscribe all';

      $scope.events = abiJSON.multiSigDailyLimit.abi.filter(function (item) {
        if (item.type == 'event') {
          return item;
        }
      });

      $scope.request = {
        'contract' : wallet.address,
        'abi' : JSON.stringify(abiJSON.multiSigDailyLimit.abi),
        'events' : {}
      };

      var getRequest = {
        'contract' : wallet.address
      };

      /**
      * Retrieves the user/contract related Alert and its events
      */
      function getAlert () {
        var request = {'contract': $scope.request.contract};
        var data = {'params':request};
        EthAlerts.get(data).then(
          function successCallback(response) {
            for (key in response.data) {
              $scope.selectedEvents[key] = true;
            }

            if (Object.keys(response.data).length == $scope.events.length) {
              subscribeUnsubscribe = false;
              $scope.subscribeUnsubscribeValue = 'Unsubscribe all';
            }

            // Show Alert data
            $scope.showAlertData = true;
          },
          function errorCallback(response) {
            $uibModalInstance.close();

            if (response.status == 401) {
              response.data = 'Wrong authentication code.';
            }
            else if (response.status = -1) {
              response.data = 'An error occurred. Please verify whether Gnosis Alert Node is setted correctly.';
            }
            Utils.dangerAlert(response);
          }
        );
      }

      getAlert();

      $scope.subscribeUnsubscribe = function () {
        if (subscribeUnsubscribe) {
          for (event in $scope.events) {
            $scope.selectedEvents[$scope.events[event].name] = true;
          }

          $scope.subscribeUnsubscribeValue = 'Unsubscribe all';
        }
        else {
          $scope.selectedEvents = {};
          $scope.subscribeUnsubscribeValue = 'Subscribe all';
        }

        subscribeUnsubscribe = !subscribeUnsubscribe;

      };

      /**
      * Updates the alert
      */
      $scope.ok = function () {
        Object.keys($scope.selectedEvents).map(function (item) {
          if ($scope.selectedEvents[item]==true) {
            $scope.request.events[item] = null;

            /*if (item in $scope.params) {
              var paramsDict = {};
              Object.keys($scope.params[item]).map(function (param) {
                paramsDict[param] = $scope.params[item][param];
              });
              $scope.request.events[item] = paramsDict;
            }*/
          }
        });

        // Show loading spinner
        $scope.showLoadingSpinner = true;

        EthAlerts.create($scope.request).then(
          function successCallback(response) {
            $uibModalInstance.close();
            callback();
            Utils.success("The alert was updated successfully.");
          },
          function errorCallback(response) {
            var errorMessage = "";

            if (response.status == 401) {
              errorMessage = 'Please select one or more events.';
            }
            else if (response.status = -1) {
              errorMessage = 'An error occurred. Please verify whether Gnosis Alert Node is setted correctly.';
            }
            else {
              Object.keys(response.data).map(function (error) {
                errorMessage += "<b>" + error + "</b>: ";
                errorMessage += response.data[error];
                errorMessage += "<br/>";
              });
            }
            Utils.dangerAlert(errorMessage);
          }
        )
        .finally(function () {
          $scope.showLoadingSpinner = false;
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
