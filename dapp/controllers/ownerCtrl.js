(
  function(){
    angular
    .module("multiSigWeb")
    .controller("ownerCtrl", function($scope, Owner){

      $scope.$watch(
        function(){
          return Owner.owners
        },
        function(){
          $scope.owners = Owner.owners;
          $scope.totalItems = Object.keys($scope.owners).length;
        }
      );

      $scope.itemsPerPage = 10;

      $scope.update = function(owner){
        Owner.update(owner);
        if(owner == $scope.new){
          $scope.new = null;
        }
      }

      $scope.remove = function(owner){
        Owner.remove(owner);
      }

      $scope.removeAll = function(){
        Owner.removeAll();
      }
    });
  }
)();
