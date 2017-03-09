(
  function () {
    angular
    .module("multiSigWeb")
    .controller("addNotificationsCtrl", function ($rootScope, $scope, $uibModalInstance, wallet, EthAlerts, Utils, callback) {

      $scope.selectedEvents = {}
      $scope.params = {};

      $scope.events = abiJSON.multiSigDailyLimit.abi.filter(function (item) {
        if (item.type == 'event') {
          return item;
        }
      });

      $scope.request = {
        'contract' : wallet.address,
        'abi' : abiJSON.multiSigDailyLimit.abi,
        'events' : {}
      };

      var getRequest = {
        'contract' : wallet.address
      }

      function getAlert () {
        var data = {'params':$scope.request};

        EthAlerts.get(data).then(
          function successCallback(response) {
            for (key in response.data) {
              $scope.selectedEvents[key] = true;
            }
          },
          function errorCallback(response) {
            Utils.dangerAlert(response);
          }
        );
      }

      getAlert();

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

        EthAlerts.create($scope.request).then(
          function successCallback(response) {
            $uibModalInstance.close();
            callback();
            Utils.success("The alert was created successfully.");
          },
          function errorCallback(response) {
            var errorMessage = "";
            Object.keys(response.data).map(function (error) {
              errorMessage += "<b>" + error + "</b>: ";
              errorMessage += response.data[error];
              errorMessage += "<br/>";
            });
            //callback();
            Utils.dangerAlert(errorMessage);
          }
        );
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
