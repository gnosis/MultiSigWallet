angular.module('multiSigWeb').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/multisigData.html',
    "<div class=\"tx-data\">\n" +
    "  {{transactions[txId].data|limitTo:1000}}\n" +
    "  <span ng-show=\"transactions[txId].data.length > 1000\">...</span>  \n" +
    "</div>\n"
  );


  $templateCache.put('partials/paramValueData.html',
    "<div class=\"tx-data\">\n" +
    "  {{param.value}}  \n" +
    "</div>\n"
  );


  $templateCache.put('partials/settings.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4>\n" +
    "      Settings\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <form ng-submit=\"update()\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"node\">Ethereum node</label>\n" +
    "        <input id=\"node\" type=\"url\" ng-model=\"config.ethereumNode\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"gas-limit\">Gas limit</label>\n" +
    "        <input id=\"gas-limit\" type=\"number\" ng-model=\"config.gasLimit\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"gas-price\">Gas price</label>\n" +
    "        <input id=\"gas-price\" type=\"number\" ng-model=\"config.gasPrice\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"wallet-factory\">Web3 wallet</label>\n" +
    "        <select id=\"web3-wallet\" ng-model=\"config.wallet\" class=\"form-control\" >\n" +
    "          <option value=\"injected\">\n" +
    "            Default (MetaMask, Mist, Parity ...)\n" +
    "          </option>\n" +
    "          <option value=\"ledger\">\n" +
    "            Ledger Wallet\n" +
    "          </option>\n" +
    "        </select>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"wallet-factory\">Wallet factory contract</label>\n" +
    "        <input id=\"wallet-factory\" type=\"text\" ng-model=\"config.walletFactoryAddress\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"wallet-factory\">Alerts node</label>\n" +
    "        <input id=\"wallet-factory\" type=\"text\" ng-model=\"config.alertsNode\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"wallet-factory\">Authorization code</label>\n" +
    "        <input id=\"wallet-factory\" type=\"text\" ng-model=\"config.authCode\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <button class=\"btn btn-danger\" type=\"button\" ng-click=\"remove()\" ng-show=\"showDeleteAuthCodeBtn\">\n" +
    "          Delete Authorization code\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"panel-footer\">\n" +
    "      <input type=\"submit\" class=\"btn btn-default\" value=\"Update\" />\n" +
    "      <button type=\"button\" class=\"btn btn-default\" ng-click=\"reset()\">\n" +
    "        Reset\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4>\n" +
    "      Import/export wallets\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-footer\">\n" +
    "    <input type=\"button\" class=\"btn btn-default\" value=\"Import\" ng-click=\"showImportWalletDialog()\" />\n" +
    "    <input type=\"button\" class=\"btn btn-default\" value=\"Export\" ng-click=\"showExportWalletDialog()\" />\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/transactions.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <div class=\"pull-right\">\n" +
    "      <button type=\"button\" class=\"btn btn-default\" disabled-if-no-accounts\n" +
    "       ng-click=\"sendTransaction()\" show-hide-by-connectivity=\"online\">\n" +
    "        Send transaction\n" +
    "      </button>\n" +
    "      <button type=\"button\" class=\"btn btn-default\"\n" +
    "      ng-click=\"sendRawTransaction()\" show-hide-by-connectivity=\"online\">\n" +
    "        Send signed transaction\n" +
    "      </button>\n" +
    "      <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\" show-hide-by-connectivity=\"online\">\n" +
    "        Get nonce\n" +
    "      </button>\n" +
    "      <button type=\"button\" class=\"btn btn-danger\" ng-disabld=\"!totalItems\" ng-click=\"removeAll()\">\n" +
    "        Remove all\n" +
    "      </button>\n" +
    "    </div>\n" +
    "    <h4>\n" +
    "      Transactions\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <table class=\"table table-hover table-bordered table-striped\">\n" +
    "    <thead>\n" +
    "      <tr>\n" +
    "        <th>\n" +
    "          Destination\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Value\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Data\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Nonce\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Mined\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Logs\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Remove\n" +
    "        </th>\n" +
    "      </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "      <tr ng-repeat=\"transaction in transactions | limitTo:currentPage*itemsPerPage:itemsPerPage*(currentPage-1) track by $index\">\n" +
    "        <td>\n" +
    "          <a uib-popover=\"{{transaction.multisig || transaction.info.to}}\" popover-trigger=\"'mouseenter'\"\n" +
    "          ng-href=\"{{etherscan}}/tx/{{transaction.txHash}}\" target=\"_blank\"\n" +
    "          ng-bind-html=\"getDestinationOrContract(transaction) | dashIfEmpty\">\n" +
    "          </a>\n" +
    "        </td>\n" +
    "        <td ng-bind-html=\"transaction.info.value | ether | dashIfEmpty\">\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <div ng-show=\"transaction.decodedData.title\" class=\"row\">\n" +
    "            <div ng-class=\"{'col-md-8' : !transaction.toWallet && !transaction.toToken, 'col-md-12': transaction.toWallet || transaction.toToken}\">\n" +
    "              <span  popover-trigger=\"'mouseenter'\" uib-popover-template=\"'partials/txData.html'\" popover-placement=\"bottom\" popover-append-to-body=\"true\">\n" +
    "                {{transaction.decodedData.title}}\n" +
    "              </span>\n" +
    "            <ul>\n" +
    "              <li ng-repeat=\"param in transaction.decodedData.params\">\n" +
    "                {{param.name}}:\n" +
    "                <span popover-enable=\"param.value && param.value.toString().length > 10\" popover-trigger=\"'mouseenter'\"\n" +
    "                  uib-popover-template=\"'partials/paramValueData.html'\">\n" +
    "                  {{param.value|addressCanBeOwner:wallet|logParam:(param.name == 'value')}}                  \n" +
    "                </span>\n" +
    "              </li>\n" +
    "            </ul>\n" +
    "            </div>\n" +
    "            <div class=\"col-md-4\" ng-show=\"transaction.decodedData.notDecoded || transaction.decodedData.params\" ng-hide=\"transaction.toWallet\">\n" +
    "              <button class=\"btn btn-default btn-sm pull-right\" ng-click=\"editABI(transaction.info.to)\">\n" +
    "                Edit ABI\n" +
    "              </button>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "          <div class=\"text-center\" ng-show=\"!transaction.decodedData.title\">\n" +
    "            -\n" +
    "          </div>\n" +
    "        </td>\n" +
    "        <td ng-bind-html=\"transaction.info.nonce | dashIfEmpty\">\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span ng-show=\"transaction.receipt\">\n" +
    "            Yes\n" +
    "          </span>\n" +
    "          <span ng-hide=\"transaction.receipt\">\n" +
    "            No\n" +
    "          </span>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <ul ng-show=\"transaction.receipt.decodedLogs.length\">\n" +
    "            <li ng-repeat=\"log in transaction.receipt.decodedLogs track by $index\">\n" +
    "              {{log.name}}\n" +
    "              <ul>\n" +
    "                <li ng-repeat=\"param in log.events track by $index\">\n" +
    "                  {{param.name}}:\n" +
    "                  <span uib-popover=\"{{param.value}}\" popover-enable=\"param.value && param.value.toString().length > 7\" popover-trigger=\"'mouseenter'\">\n" +
    "                    {{param.value|addressCanBeOwner|logParam:(param.name == 'value')}}\n" +
    "                  </span>\n" +
    "                </li>\n" +
    "              </ul>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "          <p ng-show=\"!transaction.receipt.decodedLogs.length\" class=\"text-center\">\n" +
    "            -\n" +
    "          </p>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <button class=\"btn btn-danger btn-sm\" ng-click=\"remove(transaction.txHash)\">\n" +
    "            Remove\n" +
    "          </button>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "    </tbody>\n" +
    "  </table>\n" +
    "  <div ng-hide=\"totalItems\" class=\"text-center panel-body\">\n" +
    "    No transactions. Send a transaction <a href=\"\" ng-click=\"sendTransaction()\">now</a>.\n" +
    "  </div>\n" +
    "  <div class=\"panel-footer\">\n" +
    "    <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\" items-per-page=\"itemsPerPage\"></ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/txData.html',
    "<div class=\"tx-data\">\n" +
    "  {{transaction.info.input|limitTo:1000}}\n" +
    "  <span ng-show=\"transaction.info.input.length > 1000\">...</span>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/wallet.html',
    "<!-- Owners panel -->\n" +
    "<div class=\"panel panel-default\" data-ng-show=\"isSafari\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "     <p class=\"centered\">In some instances the webapp won't fully load if using <b>Safari</b>. Please visit using Google Chrome or Mozilla Firefox.</p>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "      <p class=\"centered\">If there are transactions with inaccurate data, please <a href=\"https://github.com/aragon/multisig-transparency/issues/new\">inform us</a>. You can read more about our <a href=\"https://blog.aragon.org/why-transparency-matters-d6f9e6e10985\">transparency model</a>.</p>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-lg-6\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "      <div class=\"panel-heading\">\n" +
    "        <h4>\n" +
    "          Owners\n" +
    "        </h4>\n" +
    "      </div>\n" +
    "      <table class=\"table table-bordered\" uib-collapse=\"hideOwners\">\n" +
    "        <thead>\n" +
    "          <tr>\n" +
    "            <th>\n" +
    "              Name\n" +
    "            </th>\n" +
    "            <th class=\"text-right\">\n" +
    "              Address\n" +
    "            </th>\n" +
    "          </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "          <tr ng-repeat=\"owner in owners track by $index\">\n" +
    "            <td>\n" +
    "              {{getOwnerName(owner)}}\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{owner}}\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "        </tbody>\n" +
    "      </table>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-lg-6\">\n" +
    "    <div class=\"panel panel-default\">\n" +
    "      <div class=\"panel-heading\">\n" +
    "        <div class=\"pull-right\">\n" +
    "        </div>\n" +
    "        <h4>\n" +
    "          Assets\n" +
    "        </h4>\n" +
    "      </div>\n" +
    "      <table class=\"table table-bordered\" uib-collapse=\"hideTokens\">\n" +
    "        <thead>\n" +
    "          <tr>\n" +
    "            <th>\n" +
    "              Name\n" +
    "            </th>\n" +
    "            <th class=\"text-right\">\n" +
    "              Multisig balance\n" +
    "            </th>\n" +
    "          </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "          <tr>\n" +
    "            <td>Ether</td>\n" +
    "            <td class=\"text-right\"><span>{{balance|ether}} {{balanceUSD|fiat}}</span></td>\n" +
    "          </tr>\n" +
    "          <tr ng-repeat=\"token in wallet.tokens track by $index\">\n" +
    "            <td>\n" +
    "              {{token.name}}\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{token|token}} {{token.balanceUSD|fiat}}\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          <tr ng-repeat=\"token in wallet.tokens track by $index\">\n" +
    "            <td>\n" +
    "              Euro\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{euro}} EUR\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          <tr ng-repeat=\"token in wallet.tokens track by $index\">\n" +
    "            <td>\n" +
    "              Zcash\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{zec}} ZEC\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          <tr ng-repeat=\"token in wallet.tokens track by $index\">\n" +
    "            <td>\n" +
    "              Bitcoin\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{btc}} BTC\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          <tr ng-repeat=\"token in wallet.tokens track by $index\">\n" +
    "            <td>\n" +
    "              Decred\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{dcr}} DCR\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          <tr ng-repeat=\"token in wallet.tokens track by $index\">\n" +
    "            <td>\n" +
    "              Dai\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "              {{dai}} DAI\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "        </tbody>\n" +
    "      </table>\n" +
    "      <div ng-show=\"!totalTokens\" class=\"panel-body text-center\" uib-collapse=\"hideTokens\">\n" +
    "        No tokens. Add an ERC20 token <a href=\"\" ng-click=\"addToken()\">now</a>.\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<!-- Multisig transactions panel -->\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <div class=\"pull-right form-inline\">\n" +
    "\n" +
    "      <select class=\"form-control\" ng-model=\"showTxs\" ng-change=\"updateParams()\">\n" +
    "        <option value=\"all\">\n" +
    "          All\n" +
    "        </option>\n" +
    "        <option value=\"pending\">\n" +
    "          Pending\n" +
    "        </option>\n" +
    "        <option value=\"executed\">\n" +
    "          Executed\n" +
    "        </option>\n" +
    "      </select>\n" +
    "      <select class=\"form-control\" ng-change=\"updateTransactions()\" ng-model=\"itemsPerPage\" convert-to-number>\n" +
    "        <option value=\"5\">\n" +
    "          5/p\n" +
    "        </option>\n" +
    "        <option value=\"10\">\n" +
    "          10/p\n" +
    "        </option>\n" +
    "        <option value=\"20\">\n" +
    "          20/p\n" +
    "        </option>\n" +
    "      </select>\n" +
    "    </div>\n" +
    "    <h4>\n" +
    "      Multisig transactions\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"table-responsive transaction-table\">\n" +
    "  <table class=\"table table-bordered table-tx\">\n" +
    "    <thead>\n" +
    "      <tr>\n" +
    "        <th>\n" +
    "          ID\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Destination\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Value\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Subject\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Human readable info\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Confirmations\n" +
    "        </th>\n" +
    "      </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "      <tr ng-repeat=\"txId in txIds track by $index\">\n" +
    "        <td>\n" +
    "          <a target=\"blank\" href=\"{{transactions[txId].details.multisigTx|etherscan}}\">{{txId|bigNumber}}</a>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span uib-popover=\"{{transactions[txId].to}}\" popover-enable=\"'true'\" popover-trigger=\"'mouseenter'\">\n" +
    "            <a ng-href=\"{{transactions[txId].toUrl}}\" target=\"_blank\">{{transactions[txId].destination}}</a>\n" +
    "          </span>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          {{transactions[txId].value|ether}}\n" +
    "        </br>\n" +
    "          {{transactions[txId].details.fiat|fiat}}\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <div class=\"text-center\" ng-show=\"!transactions[txId].dataDecoded.title\">\n" +
    "            -\n" +
    "          </div>\n" +
    "          <span popover-trigger=\"'mouseenter'\" uib-popover-template=\"'partials/multisigData.html'\" popover-placement=\"bottom\" popover-append-to-body=\"true\" popover-enable=\"transactions[txId].data != '0x'\">\n" +
    "            {{transactions[txId].dataDecoded.title}}\n" +
    "          </span>\n" +
    "          <ul>\n" +
    "            <li ng-repeat=\"param in transactions[txId].dataDecoded.params\">\n" +
    "              {{param.name}}:\n" +
    "              <span uib-popover=\"{{param.value}}\" popover-enable=\"param.value && param.value.toString().length > 7\" popover-trigger=\"'mouseenter'\">\n" +
    "                {{param.value|addressCanBeOwner:wallet|logParam}}\n" +
    "              </span>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <div class=\"row\">\n" +
    "          <span class=\"col-md-12\">{{transactions[txId].details.desc}}</span>\n" +
    "          <br>\n" +
    "          <ul>\n" +
    "            <li ng-repeat=\"entity in transactions[txId].details.entities\">\n" +
    "              <a target=\"blank\" href=\"{{entity.tx|etherscan}}\">{{entity.name}}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "          </div>\n" +
    "        </td>\n" +
    "        <td class=\"confirmation-list\">\n" +
    "          <div class=\"row\">\n" +
    "            <div ng-class=\"{'col-md-12' : transactions[txId].executed, 'col-md-6' : !transactions[txId].executed}\">\n" +
    "              <ul  ng-repeat=\"owner in transactions[txId].confirmations\">\n" +
    "                <li>\n" +
    "                  {{wallet.owners[owner].name}}\n" +
    "                </li>\n" +
    "              </ul>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "    </tbody>\n" +
    "  </table>\n" +
    "  </div>\n" +
    "  <div ng-hide=\"totalItems\" class=\"panel-body text-center\">\n" +
    "    Loading...\n" +
    "  </div>\n" +
    "  <div class=\"panel-footer text-right\">\n" +
    "    <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\" ng-change=\"updateTransactions()\" items-per-page=\"itemsPerPage\" next-text=\"&gt;\" previous-text=\"&lt;\"></ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/wallets.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <div class=\"pull-right\">\n" +
    "      <button type=\"button\" class=\"btn btn-default\" ng-click=\"newWalletSelect()\">\n" +
    "        Add\n" +
    "      </button>\n" +
    "    </div>\n" +
    "    <h4>\n" +
    "      Wallets\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <table class=\"table table-bordered\">\n" +
    "    <thead>\n" +
    "      <tr>\n" +
    "        <th>\n" +
    "          Name\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Address\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Balance\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Required confirmations\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Daily limit\n" +
    "        </th>\n" +
    "        <th>\n" +
    "          Limit for today\n" +
    "        </th>\n" +
    "      </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "      <tr ng-repeat=\"(walletAddress, wallet) in wallets|objectToArray|limitTo:itemsPerPage:itemsPerPage*(currentPage-1) track by $index\">\n" +
    "        <td>\n" +
    "          <a ng-href=\"#/wallet/{{wallet.address}}\" ng-bind-html=\"wallet.name | dashIfEmpty\"></a>\n" +
    "          <div class=\"pull-right form-inline\">\n" +
    "            <button type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"editWallet(wallet)\">\n" +
    "              Edit\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-danger btn-sm\" ng-click=\"removeWallet(wallet.address)\">\n" +
    "              Remove\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-primary btn-sm\" ng-click=\"openNotifications(wallet.address)\">\n" +
    "              Notifications\n" +
    "            </button>\n" +
    "          </div>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <div uib-popover=\"{{wallet.address}}\" popover-trigger=\"'mouseenter'\">\n" +
    "            {{::wallet.address|address}}\n" +
    "          </div>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span value-or-dash-by-connectivity=\"{{wallet.balance|ether}}\">{{wallet.balance|ether}}</span>\n" +
    "          <button type=\"button\" disabled-if-no-accounts\n" +
    "          class=\"btn btn-default btn-sm pull-right\" ng-click=\"deposit(wallet)\">\n" +
    "            Deposit\n" +
    "          </button>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span class=\"col-xs-9\" value-or-dash-by-connectivity=\"{{wallet.confirmations|bigNumber|dashIfEmpty}}\"></span>\n" +
    "          <button type=\"button\" disabled-if-no-accounts\n" +
    "          class=\"btn btn-default btn-sm col-xs-3\" ng-click=\"setRequired(wallet)\">\n" +
    "            Edit\n" +
    "          </button>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span value-or-dash-by-connectivity=\"{{wallet.limit|ether}}\">{{wallet.limit|ether}}</span>\n" +
    "          <button type=\"button\" disabled-if-no-accounts\n" +
    "          class=\"btn btn-default btn-sm pull-right\" ng-click=\"setLimit(wallet)\">\n" +
    "            Edit\n" +
    "          </button>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span value-or-dash-by-connectivity=\"{{wallet.maxWithdraw|ether}}\">{{wallet.maxWithdraw|ether}}</span>\n" +
    "          <button type=\"button\" disabled-if-no-accounts\n" +
    "          class=\"btn btn-default btn-sm pull-right\" ng-click=\"withdrawLimit(wallet)\">\n" +
    "            Withdraw\n" +
    "          </button>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "    </tbody>\n" +
    "  </table>\n" +
    "  <div ng-hide=\"totalItems\" class=\"panel-body text-center\">\n" +
    "    No wallets. Add wallet <a href=\"\" ng-click=\"newWalletSelect()\">now</a>.\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/addNotifications.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Notifications\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"addNotifications\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <input type=\"button\" class=\"btn btn-sm btn-primary\"\n" +
    "        ng-value=\"subscribeUnsubscribeValue\" ng-click=\"subscribeUnsubscribe()\">\n" +
    "    </div>\n" +
    "    <div class=\"form-group\" ng-repeat=\"event in events track by $index\">\n" +
    "      <label class=\"checkbox-inline\">\n" +
    "          <input type=\"checkbox\" value=\"\"\n" +
    "          ng-model=\"selectedEvents[event.name]\">\n" +
    "          {{event.name | formatEventName}}\n" +
    "      </label>\n" +
    "      <!-- TO BE Handled in another moment\n" +
    "      <div class=\"form-group\" ng-repeat=\"param in event.inputs track by $index\" >\n" +
    "          <label ng-attr-for=\"{{ 'value-' + $parent.$index + '-' + $index }}\">{{param.name}}</label>\n" +
    "          <input ng-attr-id=\"{{ 'value-' + $parent.$index + '-' + $index }}\"\n" +
    "            type=\"text\"\n" +
    "            class=\"form-control\"\n" +
    "            ng-model=\"params[event.name][param.name]\">\n" +
    "      </div>\n" +
    "      -->\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\n" +
    "      ng-show=\"!showLoadingSpinner\">\n" +
    "      Ok\n" +
    "    </button>    \n" +
    "    <button class=\"btn btn-default\" type=\"button\"\n" +
    "      ng-show=\"showLoadingSpinner\"\n" +
    "      disabled>\n" +
    "      <i class=\"fa fa-spinner fa-spin\"></i>\n" +
    "      Sending...\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/addOwner.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Add owner\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"name\">Name</label>\n" +
    "    <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required />\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"address\">Address</label>\n" +
    "    <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"owner.address\" required />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\" ng-disabled=\"!owner.address.length > 0\">\n" +
    "    Ok\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/addWalletOwner.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Add owner\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\" show-hide-by-connectivity=\"online\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"owner.name\" />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Address</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"owner.address\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-disabled=\"form.$invalid\" ng-click=\"send()\" show-hide-by-connectivity=\"online\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-disabled=\"form.$invalid\" ng-click=\"sign()\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/confirmTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Confirm transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>  \n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/confirmTransactionOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Confirm transaction offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form ng-submit=\"signOffline()\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"nonce\">Transaction ID</label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"transactionId\" required \\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Confirm offline\" />\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/deleteDApp.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Delete Authorization Code\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"signupForm\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    Are you sure to delete your authorization code?\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\n" +
    "      ng-show=\"!showLoadingSpinner\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\"\n" +
    "      ng-show=\"showLoadingSpinner\"\n" +
    "      disabled>\n" +
    "      <i class=\"fa fa-spinner fa-spin\"></i>\n" +
    "      Deleting...\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/deposit.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Deposit\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"value\">Amount (ETH):</label>\n" +
    "      <input id=\"value\" type=\"number\" class=\"form-control\" ng-model=\"amount\" step=\"any\" min=\"0\" max=\"999999999999999\" required >\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"deposit()\" ng-disabled=\"form.$invalid\" class=\"btn btn-default\" show-hide-by-connectivity=\"online\">\n" +
    "      Send transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"sign()\" ng-disabled=\"form.$invalid\" class=\"btn btn-default\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/depositToken.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Deposit token\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"value\">Amount ({{token.symbol}}):</label>\n" +
    "      <input id=\"value\" type=\"number\" class=\"form-control\" ng-model=\"amount\" step=\"any\" min=\"0\" max=\"999999999999999\" required>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"deposit()\" class=\"btn btn-default\" show-hide-by-connectivity=\"online\" ng-disabled=\"form.$invalid\">\n" +
    "      Send transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"sign()\" class=\"btn btn-default\" show-hide-by-connectivity=\"offline\" ng-disabled=\"form.$invalid\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/disclaimer.html',
    "<div class=\"modal-header\">\n" +
    "  <div class=\"bootstrap-dialog-header\">\n" +
    "    <div class=\"bootstrap-dialog-title\">Important notice</div>\n" +
    "  </div>  \n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <p>\n" +
    "    Don't use the wallet hosted at\n" +
    "    <a href=\"https://wallet.gnosis.pm\" class=\"prevent-focus\" target=\"_blank\">https://wallet.gnosis.pm</a> to sign transactions.\n" +
    "    Use <a href=\"https://wallet.gnosis.pm\" target=\"_blank\">https://wallet.gnosis.pm</a> only to\n" +
    "    check the status of your wallet. Use a locally installed version for signing.\n" +
    "    A version can be obtained <a href=\"https://github.com/ConsenSys/MultiSigWallet\" target=\"_blank\">here</a>.\n" +
    "  </p>\n" +
    "  <p>\n" +
    "    All smart contracts have been audited carefully multiple times.\n" +
    "    However, all contracts are <strong>WITHOUT ANY WARRANTY;</strong> without even\n" +
    "    the implied warranty of <strong>MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE</strong>.\n" +
    "  </p>\n" +
    "  <p>\n" +
    "    Use at your own risk.\n" +
    "  </p>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" ng-click=\"ok()\" class=\"btn btn-default\" id=\"terms-button\" >\n" +
    "    I confirm the terms and conditions\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/editABI.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Edit ABI\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"name\">Contract name</label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"name\" name=\"name\" />\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"abi\">ABI</label>\n" +
    "    <textarea rows=\"5\" id=\"abi\" type=\"text\" class=\"form-control\" ng-model=\"abi\" required >\n" +
    "    </textarea>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\n" +
    "    Ok\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/editOwner.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Edit owner\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"name\">Name</label>\n" +
    "    <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required />\n" +
    "  </div>  \n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\n" +
    "    Ok\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/editToken.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Add/edit token\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Address</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-min=\"40\" ng-change=\"updateInfo()\"\n" +
    "      ng-model=\"editToken.address\" ng-disabled=\"editMode\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-disabled=\"!editToken.address\" ng-model=\"editToken.name\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"symbol\">Symbol</label>\n" +
    "      <input id=\"symbol\" type=\"text\" class=\"form-control\" ng-disabled=\"!editToken.address\" ng-model=\"editToken.symbol\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"decimals\">Decimals</label>\n" +
    "      <input id=\"decimals\" type=\"number\" class=\"form-control\" ng-disabled=\"!editToken.address\" ng-model=\"editToken.decimals\" min=\"0\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\" ng-disabled=\"form.$invalid\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/editWallet.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Edit wallet\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"name\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Address</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"address\" disabled />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\" ng-disabled=\"form.$invalid\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/executeMultisigTransactionOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Execute transaction offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form ng-submit=\"ok()\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"nonce\">Transaction ID</label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"transactionId\" required \\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Execute offline\" ng-click=\"executeOffline()\" />\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/executeTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Execute transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>  \n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/exportWalletConfiguration.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Export wallets\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <textarea ng-model=\"configuration\" id=\"configuration\" class=\"form-control json-config\"></textarea>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ngclipboard-success=\"copy()\" ngclipboard data-clipboard-target=\"#configuration\">\n" +
    "    Copy\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"close()\">\n" +
    "    Close\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/getNonce.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Get nonce\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Address</label>\n" +
    "      <input id=\"address\" class=\"form-control\" type=\"text\" ng-minlength=\"40\" ng-model=\"address\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\" ng-disabled=\"form.$invalid\" >\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/importWalletConfiguration.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Import wallets\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <textarea ng-model=\"configuration\" class=\"form-control json-config\"></textarea>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"load()\">\n" +
    "    Save\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"close()\">\n" +
    "    Close\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/ledgerHelp.html',
    "<div class=\"modal-header\">\n" +
    "  <div class=\"bootstrap-dialog-header\">\n" +
    "    <div class=\"bootstrap-dialog-title\">\n" +
    "      Unlock your Ledger wallet\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <img src=\"./img/ledger.jpg\" class=\"img-responsive\" />\n" +
    "  <br>\n" +
    "  <p>\n" +
    "    In order to use the multisig with your Ledger wallet you need to:\n" +
    "    <ul>\n" +
    "      <li>\n" +
    "        Connect your Ledger wallet to your USB port\n" +
    "      </li>\n" +
    "      <li>\n" +
    "        Enter your Ledger wallet pin code\n" +
    "      </li>\n" +
    "      <li>\n" +
    "        Update ledger firmware if version < 1.2\n" +
    "      </li>\n" +
    "      <li>\n" +
    "        Install the Ethereum app on your Ledger wallet\n" +
    "      </li>\n" +
    "      <li>\n" +
    "        Enable Browser support and contract data on settings\n" +
    "      </li>\n" +
    "      <li>\n" +
    "        Allow the multisig DApp to access your accounts on the Ledger wallet\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </p>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" ng-click=\"ok()\" class=\"btn btn-default\" id=\"terms-button\" >\n" +
    "    Ok\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/newWallet.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Deploy new wallet\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"newWallet\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"name\" required ng-min-length=\"1\" />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"required\">Required confirmations</label>\n" +
    "      <input id=\"required\" type=\"number\" class=\"form-control\" ng-min=\"1\" ng-max=\"owners.length\" ng-model=\"confirmations\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"daily-limit\"> Daily limit (ETH) </label>\n" +
    "      <input id=\"daily-limit\" type=\"number\" class=\"form-control\" ng-min=\"0\" max=\"999999999999999\" ng-model=\"limit\" required />\n" +
    "    </div>\n" +
    "    <div class=\"panel panel-default\">\n" +
    "      <div class=\"panel-heading\">\n" +
    "        Owners\n" +
    "      </div>\n" +
    "      <table class=\"table table-hover table-bordered table-striped\">\n" +
    "        <thead>\n" +
    "          <tr>\n" +
    "            <th>\n" +
    "              Name\n" +
    "            </th>\n" +
    "            <th>\n" +
    "              Address\n" +
    "            </th>\n" +
    "            <th>\n" +
    "              Action\n" +
    "            </th>\n" +
    "          </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "          <tr ng-repeat=\"owner in owners\">\n" +
    "            <td>\n" +
    "              {{owner.name}}\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              {{owner.address}}\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <button type=\"button\" class=\"btn btn-danger\" ng-click=\"removeOwner(owner.address)\">\n" +
    "                Remove\n" +
    "              </button>\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "          <!--<tr>\n" +
    "            <td>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <button ng-click=\"addOwner()\" type=\"button\" class=\"btn btn-default\">\n" +
    "                Add\n" +
    "              </button>\n" +
    "            </td>\n" +
    "          </tr>-->\n" +
    "          <tr>\n" +
    "            <td>\n" +
    "              <input type=\"text\" class=\"form-control\" placeholder=\"Name\" ng-model=\"newOwner.name\" />\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <input type=\"text\" class=\"form-control\" placeholder=\"Address\" ng-model=\"newOwner.address\" />\n" +
    "            </td>\n" +
    "            <td>\n" +
    "              <button ng-click=\"addOwner()\" type=\"button\" class=\"btn btn-default\"\n" +
    "                ng-disabled=\"newOwner.address == undefined || !newOwner.address.length > 0\">\n" +
    "                Add\n" +
    "              </button>\n" +
    "            </td>\n" +
    "          </tr>\n" +
    "        </tbody>\n" +
    "      </table>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployWallet()\" ng-disabled=\"newWallet.$invalid\" show-hide-by-factory-status=\"offline\" >\n" +
    "      Deploy\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployFactoryWallet()\" ng-disabled=\"newWallet.$invalid\" show-hide-by-factory-status=\"online\">\n" +
    "      Deploy with factory\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployOfflineWallet()\" ng-disabled=\"newWallet.$invalid\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign deployment offline\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployFactoryWalletOffline()\" ng-disabled=\"newWallet.$invalid\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign deployment with factory offline\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/notificationsSignup.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Notifications signup\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"signupForm\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Email</label>\n" +
    "      <input name=\"email\" type=\"email\" class=\"form-control\" ng-model=\"request.email\" />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\n" +
    "      ng-disabled=\"!request.email && signupForm.email.$error\"\n" +
    "      ng-show=\"!showLoadingSpinner\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" id=\"load\"      \n" +
    "      ng-show=\"showLoadingSpinner\"\n" +
    "      disabled>\n" +
    "      <i class=\"fa fa-spinner fa-spin\"></i>\n" +
    "      Sending...\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/removeOwner.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Remove owner\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"name\">Name</label>\n" +
    "    <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"owner.name\" readonly />\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"address\"> Address </label>\n" +
    "    <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"owner.address\" readonly />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"send()\">\n" +
    "    Send multisig transaction\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/removeToken.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Remove token\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"name\">Name</label>\n" +
    "    <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"token.name\" onfocus=\"this.blur()\" readonly />\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"address\"> Address </label>\n" +
    "    <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"token.address\" onfocus=\"this.blur()\" readonly />\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"symbol\"> Symbol </label>\n" +
    "    <input id=\"symbol\" type=\"text\" class=\"form-control\" ng-model=\"token.symbol\" onfocus=\"this.blur()\" readonly />\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"decimals\"> Decimals </label>\n" +
    "    <input id=\"decimals\" type=\"text\" class=\"form-control\" ng-model=\"token.decimals\" onfocus=\"this.blur()\" readonly />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\n" +
    "    Ok\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/removeWallet.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Remove wallet\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"removeWallet\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"wallet.name\" disabled />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Address</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" disabled ng-model=\"wallet.address\" />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"confirmation\">Enter wallet name for confirmation</label>\n" +
    "      <input id=\"confirmation\" type=\"text\" class=\"form-control\" ng-model=\"confirmation\" />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\" ng-disabled=\"confirmation != wallet.name\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/removeWalletOwnerOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Add owner offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"address\">Address</label>\n" +
    "    <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"owner.address\" required />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"sign()\" show-hide-by-connectivity=\"offline\">\n" +
    "    Sign offline\n" +
    "  </button>  \n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/replaceOwner.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Replace owner\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"owner.name\" readonly />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\"> Owner address </label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"owner.address\" readonly />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"newOwner\"> New owner address </label>\n" +
    "      <input id=\"newOwner\" type=\"text\" class=\"form-control\" ng-minlength=\"40\" ng-model=\"newOwner\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-disabled=\"form.$invalid\" ng-click=\"send()\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/replaceOwnerOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Replace owner offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"oldOwner\"> Owner address </label>\n" +
    "      <input id=\"oldOwner\" type=\"text\" class=\"form-control\" ng-model=\"oldOwner\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"newOwner\"> New owner address </label>\n" +
    "      <input id=\"newOwner\" type=\"text\" class=\"form-control\" ng-model=\"newOwner\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"sign()\" ng-disabled=\"form.$invalid\" >\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/resetSettings.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Reset settings\n" +
    "  </h3>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  Do you want to reset settings to factory values?\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\n" +
    "    Ok\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/restoreWallet.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Restore deployed wallet\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"restoreWallet\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Name</label>\n" +
    "      <input id=\"name\" type=\"text\" class=\"form-control\" ng-model=\"old.name\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Address</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"old.address\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\" ng-disabled=\"restoreWallet.$invalid\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/retrieveNonce.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Multisig nonce\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"nonce\">Nonce</label>\n" +
    "    <input id=\"nonce\" class=\"form-control\" type=\"text\" readonly ng-model=\"nonce\" />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ngclipboard-success=\"copy()\" ngclipboard data-clipboard-target=\"#nonce\">\n" +
    "    Copy\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/revokeConfirmation.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Revoke confirmation\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/revokeMultisigConfirmationOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Revoke transaction confirmation offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form ng-submit=\"ok()\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"nonce\">Transaction ID</label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"transactionId\" required \\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Revoke offline\" ng-click=\"revokeOffline()\" />\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/selectNewWallet.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Add wallet\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"radio\" ng-show=\"coinbase\">\n" +
    "    <label>\n" +
    "      <input type=\"radio\" value=\"create\" ng-model=\"walletOption\">\n" +
    "      Create new wallet\n" +
    "    </label>\n" +
    "  </div>\n" +
    "  <div class=\"radio\">\n" +
    "    <label>\n" +
    "      <input type=\"radio\" value=\"restore\" ng-model=\"walletOption\">\n" +
    "      Restore deployed wallet\n" +
    "    </label>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" ng-click=\"ok()\">\n" +
    "    Next\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/sendTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Send transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"destination\">Destination</label>\n" +
    "      <input id=\"destination\" type=\"text\" ng-model=\"tx.to\" ng-change=\"updateABI()\"  ng-min=\"40\" class=\"form-control\" required>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Contract name (optional)</label>\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"name\" name=\"name\" />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"value\">Amount (ETH)</label>\n" +
    "      <input id=\"value\" type=\"number\" class=\"form-control\" ng-model=\"tx.value\" min=\"0\" max=\"999999999999999\" ng-required=\"!abi\">\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"abi\">ABI string</label>\n" +
    "      <textarea id=\"abi\" rows=\"3\" class=\"form-control\" ng-model=\"abi\" ng-change=\"updateMethods()\" ng-required=\"!tx.value\"></textarea>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"method\">Method</label>\n" +
    "      <select id=\"method\" ng-model=\"method\" ng-options=\"method.name for method in methods track by method.index\"\n" +
    "       ng-required=\"tx.abi\" class=\"form-control\" ng-change=\"setMethod()\" ng-disabled=\"!abiArray\" ></select>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\" ng-show=\"method && abiArray[method.index].inputs.length > 0\">\n" +
    "      <h3>\n" +
    "        Parameters\n" +
    "      </h3>\n" +
    "      <div class=\"form-group\" ng-repeat=\"param in abiArray[method.index].inputs\" >\n" +
    "        <div ng-switch on=\"param.type\">\n" +
    "          <label ng-attr-for=\"{{ 'value-' + $index }}\">{{param.name}}</label>\n" +
    "          <input ng-attr-id=\"{{ 'value-' + $index }}\" ng-switch-default type=\"text\" class=\"form-control\" ng-model=\"params[$index]\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" show-hide-by-connectivity=\"online\" ng-disabled=\"form.$invalid\">\n" +
    "      Send transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" show-hide-by-connectivity=\"offline\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/setLimit.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Change daily limit\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"limit\">Daily limit (ETH)</label>\n" +
    "      <input id=\"limit\" type=\"number\" step=\"any\" ng-model=\"limit\" min=\"0\" max=\"999999999999999\" class=\"form-control\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" ng-click=\"setLimit()\" show-hide-by-connectivity=\"online\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" ng-click=\"sign()\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/showNonce.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Nonce\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"signed\">Nonce</label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"nonce\" id=\"nonce\" />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" ngclipboard-success=\"copy()\" ngclipboard data-clipboard-target=\"#nonce\">\n" +
    "    Copy\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/showSignedTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Signed transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"signed\">Hex code</label>\n" +
    "    <textarea class=\"form-control\" rows=\"5\" ng-model=\"signed\" id=\"signed\"></textarea>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" ngclipboard-success=\"copy()\" ngclipboard data-clipboard-target=\"#signed\">\n" +
    "    Copy\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/signedTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Send signed transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"raw\">Signed transaction</label>\n" +
    "    <textarea id=\"raw\" class=\"form-control\" rows=\"5\" ng-model=\"tx\"></textarea>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" ng-click=\"sendRawTransaction()\">\n" +
    "    Send\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/signMultisigConfirmationRevokeOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Sign multisig transaction offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form ng-submit=\"ok()\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"modal-body\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"multisig-nonce\">Transaction id</label>\n" +
    "        <input id=\"multisig-nonce\" class=\"form-control\" type=\"number\" ng-model=\"nonces.multisig\" required />\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"account-nonce\">Nonce</label>\n" +
    "      <input id=\"account-nonce\" class=\"form-control\" type=\"number\" ng-model=\"nonces.account\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Ok\" ng-disabled=\"form.$invalid\" />\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/signOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Sign transaction offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form ng-submit=\"ok()\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"nonce\">Nonce</label>\n" +
    "      <input id=\"nonce\" class=\"form-control\" type=\"number\" ng-model=\"nonce\" ng-min=\"0\" required />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Ok\" />\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/spinner.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Approve transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"sk-circle\">\n" +
    "    <div class=\"sk-circle1 sk-child\"></div>\n" +
    "    <div class=\"sk-circle2 sk-child\"></div>\n" +
    "    <div class=\"sk-circle3 sk-child\"></div>\n" +
    "    <div class=\"sk-circle4 sk-child\"></div>\n" +
    "    <div class=\"sk-circle5 sk-child\"></div>\n" +
    "    <div class=\"sk-circle6 sk-child\"></div>\n" +
    "    <div class=\"sk-circle7 sk-child\"></div>\n" +
    "    <div class=\"sk-circle8 sk-child\"></div>\n" +
    "    <div class=\"sk-circle9 sk-child\"></div>\n" +
    "    <div class=\"sk-circle10 sk-child\"></div>\n" +
    "    <div class=\"sk-circle11 sk-child\"></div>\n" +
    "    <div class=\"sk-circle12 sk-child\"></div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/updateRequired.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Change required confirmations\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"confirmations\">Required confirmations</label>\n" +
    "      <input id=\"confirmations\" type=\"number\" class=\"form-control\" ng-min=\"1\" ng-model=\"required\" required>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" ng-click=\"update()\" show-hide-by-connectivity=\"online\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" ng-click=\"signOffline()\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/walletTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Send multisig transaction\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"destination\">Destination</label>\n" +
    "      <input id=\"destination\" type=\"text\" ng-model=\"tx.to\" ng-change=\"updateABI()\"  ng-min=\"40\" class=\"form-control\" required>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\">Contract name (optional)</label>\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"name\" name=\"name\" />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"value\">Amount (ETH)</label>\n" +
    "      <input id=\"value\" type=\"number\" class=\"form-control\" ng-model=\"tx.value\" min=\"0\" max=\"999999999999999\" ng-required=\"!abi\">\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"abi\"> ABI string </label>\n" +
    "      <textarea id=\"abi\" rows=\"5\" type=\"text\" class=\"form-control\" ng-model=\"abi\" ng-change=\"updateMethods()\" ng-required=\"!tx.value\"></textarea>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"method\">Method</label>\n" +
    "      <select id=\"method\" ng-model=\"method\"\n" +
    "       ng-options=\"method.name for method in methods track by method.index\"\n" +
    "       ng-required=\"tx.abi\" class=\"form-control\" ng-change=\"setMethod()\" ng-disabled=\"!abiArray\" ></select>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\" ng-show=\"method && abiArray[method.index].inputs.length > 0\">\n" +
    "      <h3>\n" +
    "        Parameters\n" +
    "      </h3>\n" +
    "      <div class=\"form-group\" ng-repeat=\"param in abiArray[method.index].inputs\" >\n" +
    "        <div ng-switch on=\"param.type\">\n" +
    "          <label ng-attr-for=\"{{ 'value-' + $index }}\">{{param.name}}</label>\n" +
    "          <input ng-attr-id=\"{{ 'value-' + $index }}\" ng-switch-default type=\"text\" class=\"form-control\" ng-model=\"params[$index]\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" show-hide-by-connectivity=\"online\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/web3Wallets.html',
    "<div class=\"modal-header\">\n" +
    "  <div class=\"bootstrap-dialog-header\">\n" +
    "    <div class=\"bootstrap-dialog-title\">\n" +
    "      No account found\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <p>\n" +
    "    This wallet requires a 3rd party Ethereum account management software like\n" +
    "    <a href=\"https://metamask.io/\" class=\"prevent-focus\" target=\"_blank\">Metamask</a>,\n" +
    "    <a href=\"https://github.com/ethereum/mist\" target=\"_blank\">Mist</a> or\n" +
    "    <a href=\"https://ethcore.io/parity.html\" target=\"_blank\">Parity</a>.\n" +
    "  </p>\n" +
    "  <p>\n" +
    "    You can monitor existing wallets without an account management software but you cannot create new wallets or sign transactions.\n" +
    "  </p>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" ng-click=\"ok()\" class=\"btn btn-default\" id=\"terms-button\" >\n" +
    "    Ok\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/withdrawLimit.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Withdraw limit\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"value\">Amount (ETH)</label>\n" +
    "      <input id=\"value\" type=\"number\" class=\"form-control\" ng-model=\"tx.value\" ng-min=\"0\" max=\"999999999999999\" required>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Destination</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"tx.to\" ng-minlength=\"40\" required>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" show-hide-by-connectivity=\"online\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/withdrawToken.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Withdraw token\n" +
    "  </h3>\n" +
    "</div>\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"amount\">Amount ({{token.symbol}})</label>\n" +
    "      <input id=\"amount\" type=\"number\" class=\"form-control\" ng-model=\"amount\" ng-min=\"0\" max=\"999999999999999\" required>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"address\">Destination</label>\n" +
    "      <input id=\"address\" type=\"text\" class=\"form-control\" ng-model=\"to\" ng-minlength=\"40\" required>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" show-hide-by-connectivity=\"online\">\n" +
    "      Send multisig transaction\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\" show-hide-by-connectivity=\"offline\">\n" +
    "      Sign offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );

}]);
