(
  function () {
    angular
    .module("multiSigWeb")
    .filter('objectToArray', function () {
      return function (objectMap) {
        var returnedArray = [];
        if (objectMap) {
          var keys = Object.keys(objectMap);
          for (var i=0; i<keys.length; i++) {
            returnedArray.push(objectMap[keys[i]]);
          }
        }
        return returnedArray;
      };
    })
    .filter('fromNow', function () {
      return function(dateString) {
        if (!dateString) {
          return null;
        }
        return moment(new Date(dateString)).fromNow();
      };
    })
    .filter('address', function () {
      return function(address) {
        if(address && address.length > 3){
          return address.slice(0, 12) + "...";
        }
      };
    })
    .filter('bigNumber', function () {
      return function (big) {
        return new Web3().toBigNumber(big).toNumber();        
      };
    })
    .filter('txData', function () {
      return function (data) {
        if (data) {
          if (data == "0x") {
            return "";
          }
          else if(data.length > 3 && data.length < 10) {
            return data.slice(0, 10);
          }
          else if (data.length > 3 && data.length > 10) {
            return data.slice(0, 10) + "...";
          }
        }
      };
    })
    .filter('logParam', function ($filter) {
      return function (log, isEther) {
        if (log && Array.isArray(log)) {
          return log.reduce(function (finalString, address) {
            if (address.indexOf("0x") == -1){
              return finalString + address + ", ";
            }
            else{
              return finalString + address.slice(0, 20) + "..., ";
            }
          }, "").slice(0, -2);
        }
        else if (log === "0x0") {
          return "0x0";
        }
        else if(log && log.indexOf && log.indexOf("0x") != -1){
          return log.slice(0, 10) + "...";
        }
        else if ( log && log.match(/^[0-9]+$/) !== null) {
          if (isEther) {
            return $filter('ether')(log);
          }
          else if(log.toString().length < 8){
            return log.toString().slice(0, 7);
          }
          else{
            return new Web3().toBigNumber(log).toExponential(3);
          }
        }
        else {
          return log;
        }
      };
    })
    .filter('ether', function () {
      return function (num) {
        if (num) {
          var casted = new Web3().toBigNumber(num);
          if (casted.gt(0)) {
            var ether = casted.div('1e18');
            if (ether.gt(1)) {
              return ether.toPrecision(Math.floor(Math.log(ether.toNumber())/Math.log(10) + 3)).toString(10) + " ETH";
            }
            else {
              return ether.toPrecision(2).toString() + " ETH";
            }

          }
          else {
            return "0.00 ETH";
          }
        }
        return null;
      };
    })
    .filter('token', function () {
        return function (token) {
        if (token && token.balance) {
          var decimals = token.decimals;
          if(token.decimals === undefined){
            decimals = 18;
          }
          var string_split = new Web3().toBigNumber(token.balance).div("1e" + decimals).toString(10).split('.');
          var new_string = "";
          var places = string_split[0].length - 1;
          for (var i=places; i>=0; i--) {
            new_string = string_split[0][i] + new_string;
            if (i > 0 && (places - i + 1) % 3 === 0) {
              new_string = ',' + new_string;
            }
          }
          if (string_split.length == 2) {
            new_string += '.' + string_split[1].substring(0, 2);
          }
          return new_string + " " + token.symbol;
        }
        else if (token && token.symbol){
          return "0 "+ token.symbol;
        }
        else{
          return null;
        }
      };
    })
    .filter('reverse', function () {
      return function (items) {
        return items.slice().reverse();
      };
    })
    .filter('dashIfEmpty', function ($sce){
      return function (text){
        return text || text === 0 ? $sce.trustAsHtml(text.toString()) : $sce.trustAsHtml("<p class='text-center'>\n-\n</p>");
      };
    })
    .filter('addressBookNameOrFalse', function (Wallet) {
      return function (addressCandidate) {
        var addressBook = JSON.parse(localStorage.getItem('addressBook') || '{}');
        return (addressBook[addressCandidate] && addressBook[addressCandidate].name || false);
      }
    })
    .filter('addressCanBeOwner', function (Wallet) {
      return function (addressCandidate, currentWallet) {
        if (addressCandidate && Array.isArray(addressCandidate)) {
          for (key in Wallet.wallets) {
            var wallet = Wallet.wallets[key];
            return addressCandidate.map(function (address) {
              if (wallet && wallet.owners && wallet.owners[address] && wallet.owners[address].name){
                return wallet.owners[address].name;
              }
              else {
                return address;
              }
            });
          }
        }
        // If address is owner of the current wallet, return its name
        else if (addressCandidate
          && addressCandidate.indexOf
          && addressCandidate.indexOf("0x") != -1
          && currentWallet
          && currentWallet.owners
          && currentWallet.owners[addressCandidate]
          && currentWallet.owners[addressCandidate].name) {
            return currentWallet.owners[addressCandidate].name;
          }
        else if (addressCandidate && addressCandidate.indexOf && addressCandidate.indexOf("0x") != -1) {
          for (key in Wallet.wallets) {
            var wallet = Wallet.wallets[key];
            if ( wallet && wallet.owners && wallet.owners[addressCandidate] && wallet.owners[addressCandidate].name){
              return wallet.owners[addressCandidate].name;
            }
          }
          return addressCandidate;
        }
        else {
          return addressCandidate;
        }
      };
    })
    .filter('addressCanBeToken', function (Web3Service) {
      return function (addressCandidate, wallet) {
        if (addressCandidate && addressCandidate.indexOf && addressCandidate.indexOf("0x") != -1) {
          addressCandidate = Web3Service.toChecksumAddress(addressCandidate);
          if (wallet.tokens) {
            var foundToken = null;
            var keys = Object.keys(wallet.tokens);
            for (var x=0; x<keys.length; x++) {
                var token = wallet.tokens[keys[x]];
                if (addressCandidate == token.address) {
                    foundToken = token;
                    break;
                }
            }
            if (foundToken) {
                return foundToken.symbol;
            }
          }
        }
        return addressCandidate;
      };
    })
    .filter('formatEventName', function (){
      return function (text){
        return text.split(/(?=[A-Z])/).join(' ');
      };
    })
    .filter('selectFilter', function() {
      return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
          var keys = Object.keys(props);

          items.forEach(function (item) {
            var itemMatches = false;

            for (var i = 0; i < keys.length; i++) {
              var prop = keys[i];
              var text = props[prop].toLowerCase();
              if (item[prop] && item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            }

            if (itemMatches) {
              out.push(item);
            }
          });
        }

        return out;
      };
    });

  }
)();
