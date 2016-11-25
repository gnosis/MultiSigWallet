(
  function(){
    angular
    .module('multiSigWeb')
    .service('Transaction', function(){
      var factory = {
        transactions: JSON.parse(localStorage.getItem("transactions")) || {}
      };

      factory.add = function(tx){
        factory.transactions[tx.txHash] = tx;
        tx.date = new Date();
        localStorage.setItem("transactions", JSON.stringify(factory.transactions));
      }

      return factory;
    });
  }
)();
