(
  function(){
    angular
    .module("multiSigWeb")
    .service("Utils", function(){
      var factory = {};

      factory.errorToHtml = function(error){
        if(error.status == 500){
          return $translate.instant('InternalServerError');
        }
        else{
          if(error.data){
            if(typeof error.data == "string"){
              return error.data;
            }
            else if(error.data){
              var keys = Object.keys(error.data);
              var html_errors = '<ul class="list-group text-danger">';
              for(var i=0; i<keys.length; i++){
                if(typeof error.data[keys[i]] == "object" && Object.keys(error.data[keys[i]]).length){
                  if(isNaN(keys[i])){
                    html_errors += '<li class="list-group-item">'+keys[i]+factory.errorToHtml({data: error.data[keys[i]]})+'</li>';
                  }
                  else{
                    html_errors += factory.errorToHtml({data: error.data[keys[i]]});
                  }
                }
                else{
                  html_errors += '<li class="list-group-item">'+error.data[keys[i]]+'</li>';
                }
              }
              html_errors += '</ul>';
              return html_errors;
            }
            else{
              return "";
            }
          }
          else{
            if(typeof error == "object" && error.toString().indexOf("User denied") != -1){
              return 'Transaction rejected by user';
            }
            else{
              return error;
            }
          }
        }
      };

      factory.dangerAlert = function(error){
        BootstrapDialog.show({
          type: BootstrapDialog.TYPE_DANGER,
          title: 'Error',
          message: factory.errorToHtml(error),
        });
      }

      factory.notification = function(info){
        BootstrapDialog.show({
            message: info,
            onshown: function(dialogRef){
              setTimeout(function(){
                dialogRef.close();
              }, 5000);
            }
          });
      }

      factory.success = function(info){
        BootstrapDialog.show({
          type: BootstrapDialog.TYPE_SUCCESS,
          message: info
        });
      }

      return factory;
    });
  }
)();
