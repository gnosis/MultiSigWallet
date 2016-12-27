angular.module('multiSigWeb').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/nav.html',
    "<nav class=\"navbar navbar-default\" role=\"navigation\" ng-controller=\"navCtrl\">\n" +
    "    <div class=\"navbar-header\">\n" +
    "\n" +
    "        <!-- note the ng-init and ng-click here: -->\n" +
    "        <button type=\"button\" class=\"navbar-toggle\" ng-click=\"navCollapsed = !navCollapsed\">\n" +
    "            <span class=\"sr-only\">Toggle navigation</span>\n" +
    "            <span class=\"icon-bar\"></span>\n" +
    "            <span class=\"icon-bar\"></span>\n" +
    "            <span class=\"icon-bar\"></span>\n" +
    "        </button>\n" +
    "        <a class=\"navbar-brand\" href=\"#\">MultiSigWeb</a>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"collapse navbar-collapse\" uib-collapse=\"navCollapsed\">\n" +
    "        <ul class=\"nav navbar-nav\">\n" +
    "          <li>\n" +
    "            <a href=\"#/wallets\">\n" +
    "              Wallets\n" +
    "            </a>\n" +
    "          </li>\n" +
    "          <li>\n" +
    "            <a href=\"#/transactions\">\n" +
    "              Transactions\n" +
    "            </a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "\n" +
    "        <ul class=\"nav navbar-nav pull-right\" ng-show=\"loggedIn\">\n" +
    "          <li uib-dropdown>\n" +
    "           <a href=\"#\" uib-dropdown-toggle>\n" +
    "             <!-- <i class=\"fa fa-address-book-o\" aria-hidden=\"true\"></i> -->\n" +
    "             Account {{coinbase|limitTo:20}}... <b class=\"caret\"></b>\n" +
    "           </a>\n" +
    "           <ul class=\"dropdown-menu\">\n" +
    "              <li ng-repeat=\"account in accounts\"><a href=\"\" ng-click=\"selectAccount(account)\">{{account}}</a></li>\n" +
    "           </ul>\n" +
    "          </li>\n" +
    "          <li>\n" +
    "            <p class=\"navbar-text\"> Balance: {{balance|ether}} </p>\n" +
    "          </li>\n" +
    "          <li>\n" +
    "            <p class=\"navbar-text\"> Nonce: {{nonce}} </p>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</nav>\n"
  );


  $templateCache.put('partials/transactions.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3>\n" +
    "    Transactions\n" +
    "    <div class=\"pull-right\">\n" +
    "      <button type=\"button\" class=\"btn btn-default\" ng-click=\"sendSignedTransaction()\">\n" +
    "        Send signed transaction\n" +
    "      </button>\n" +
    "      <button type=\"button\"  class=\"btn btn-default\" ng-click=\"sendTransaction()\">\n" +
    "        Send transaction\n" +
    "      </button>\n" +
    "      <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\">\n" +
    "        Get nonce\n" +
    "      </button>\n" +
    "      <button type=\"button\" class=\"btn btn-danger\" ng-click=\"removeAll()\">\n" +
    "        Remove all\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </h3>\n" +
    "  </div>\n" +
    "  <div class=\"panel-body\">\n" +
    "    <table class=\"table table-hover\">\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <th>\n" +
    "            Destination\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Value\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Data\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Nonce\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Mined\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Logs\n" +
    "          </th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr ng-repeat=\"transaction in transactions | objectToArray| limitTo:currentPage*itemsPerPage:itemsPerPage*(currentPage-1) track by $index\">\n" +
    "          <td>\n" +
    "            <a ng-href=\"https://testnet.etherscan.io/tx/{{transaction.txHash}}\">\n" +
    "              {{getTo(transaction.info.to)}}\n" +
    "            </a>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{transaction.info.value | ether}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "              {{transaction.info.input | limitTo: 20}}...\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{transaction.info.nonce}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <span ng-show=\"transaction.receipt\">\n" +
    "              Yes\n" +
    "            </span>\n" +
    "            <span ng-hide=\"transaction.receipt\">\n" +
    "              No\n" +
    "            </span>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <!--\n" +
    "            <ul>\n" +
    "              <li ng-repeat=\"log in transaction.receipt.logs\">\n" +
    "                {{log}}\n" +
    "              </li>\n" +
    "            </ul>\n" +
    "          -->\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <button class=\"btn btn-default\" ng-click=\"remove(transaction.txHash)\">\n" +
    "              <i class=\"fa fa-minus text-danger\">\n" +
    "              </i>\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "    <div ng-hide=\"totalItems\" class=\"text-center\">\n" +
    "      No transactions\n" +
    "    </div>\n" +
    "\n" +
    "    <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\" items-per-page=\"itemsPerPage\"></ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/wallet.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3>    Wallets\n" +
    "    <small>\n" +
    "      <button class=\"btn btn-default pull-right\" ng-click=\"newWalletSelect()\">\n" +
    "        Add\n" +
    "      </button>\n" +
    "    </small>\n" +
    "  </h3>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"panel-body\">\n" +
    "    <table class=\"table table-hover\">\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <th>\n" +
    "            Name\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Address\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Balance\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            # Conf.\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Daily limit\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Limit for today\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Actions\n" +
    "          </th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr ng-repeat=\"(walletAddress, wallet) in wallets|objectToArray|limitTo:itemsPerPage:itemsPerPage*(currentPage-1) track by $index\">\n" +
    "          <td>\n" +
    "            <a ng-href=\"#/wallet/{{wallet.address}}\">{{wallet.name}}</a>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{wallet.address|limitTo:20}}...\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{wallet.balance|ether}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{wallet.confirmations|bigNumber}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{wallet.limit|ether}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{wallet.limit.minus(wallet.spent)|ether}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"deposit(wallet)\">\n" +
    "              Deposit\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"removeWallet(wallet.address)\">\n" +
    "              Remove\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"editWallet(wallet)\">\n" +
    "              Edit\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"setRequired(wallet)\">\n" +
    "              Set required\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"setLimit(wallet)\">\n" +
    "              Set daily\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "    <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\" items-per-page=\"itemsPerPage\"></ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/walletDetail.html',
    "<div class=\"page-header\">\n" +
    "  <h2>\n" +
    "    {{wallet.name}}\n" +
    "  </h2>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3>\n" +
    "      Owners\n" +
    "      <div class=\"pull-right\">\n" +
    "        <button type=\"button\" ng-click=\"addOwner()\" class=\"btn btn-default\">\n" +
    "          Add\n" +
    "        </button>\n" +
    "        <button type=\"button\" ng-click=\"hideOwners = true\" class=\"btn btn-default\" ng-hide=\"hideOwners\">\n" +
    "          Hide\n" +
    "        </button>\n" +
    "        <button type=\"button\" ng-click=\"hideOwners = false\" class=\"btn btn-default\" ng-show=\"hideOwners\">\n" +
    "          Show\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "  <div class=\"panel-body collapse\" uib-collapse=\"hideOwners\">\n" +
    "    <table class=\"table table-hover\">\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <th>\n" +
    "            Name\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Address\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Actions\n" +
    "          </th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr ng-repeat=\"owner in owners track by $index\">\n" +
    "          <td>\n" +
    "            {{getOwnerName(owner)}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{owner}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <button type=\"button\" ng-click=\"editOwner(owner)\" class=\"btn btn-default\">\n" +
    "              Edit\n" +
    "            </button>\n" +
    "            <button type=\"button\" ng-click=\"removeOwner(owner)\" class=\"btn btn-danger\" ng-hide=\"owners.length == 1\">\n" +
    "              Remove\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3>\n" +
    "      Multisig-Transactions\n" +
    "      <div class=\"pull-right form-inline\">\n" +
    "        <select class=\"form-control\" ng-model=\"showTxs\" ng-change=\"updateParams()\">\n" +
    "          <option value=\"all\">\n" +
    "            All\n" +
    "          </option>\n" +
    "          <option value=\"pending\">\n" +
    "            Pending\n" +
    "          </option>\n" +
    "          <option value=\"executed\">\n" +
    "            Executed\n" +
    "          </option>\n" +
    "        </select>\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"addTransaction()\">\n" +
    "          Add\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "  <div class=\"panel-body\">\n" +
    "    <table class=\"table table-hover\">\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <th>\n" +
    "            Destionation/Type\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Value\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Data\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Nonce\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            # Confirmations\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Executed\n" +
    "          </th>\n" +
    "          <th>\n" +
    "            Actions\n" +
    "          </th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr ng-repeat=\"txHash in txHashes track by $index\">\n" +
    "          <td>\n" +
    "            {{getType(transactions[txHash])}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{transactions[txHash].value|ether}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{getParam(transactions[txHash])}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{transactions[txHash].nonce}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <ul ng-repeat=\"owner in transactions[txHash].confirmations\">\n" +
    "              <li>\n" +
    "                {{wallet.owners[owner].name}}\n" +
    "              </li>\n" +
    "            </ul>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <span ng-show=\"transactions[txHash].executed\">\n" +
    "              Yes\n" +
    "            </span>\n" +
    "            <span ng-hide=\"transactions[txHash].executed\">\n" +
    "              No\n" +
    "            </span>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\n" +
    "            ng-hide=\"transactions[txHash].executed || transactions[txHash].confirmed\"\n" +
    "            ng-click=\"confirmTransaction(txHash)\">\n" +
    "              Confirm\n" +
    "            </button>\n" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\n" +
    "            ng-show=\"transactions[txHash].confirmed && !transactions[txHash].executed\"\n" +
    "            ng-click=\"revokeConfirmation(txHash)\">\n" +
    "              Revoke Confirmation\n" +
    "            </button>\n" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\n" +
    "            ng-show=\"!transactions[txHash].executed && transactions[txHash].confirmations.length == confirmations\"\n" +
    "            ng-click=\"executeTransaction(txHash)\">\n" +
    "              Execute\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "    <div class=\"form-inline\">\n" +
    "      <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\"\n" +
    "      ng-change=\"updateTransactions()\" items-per-page=\"itemsPerPage\"></ul>\n" +
    "      <select class=\"form-control pull-right\" ng-change=\"updateTransactions()\" ng-model=\"itemsPerPage\" convert-to-number>\n" +
    "        <option value=\"2\">\n" +
    "          2\n" +
    "        </option>\n" +
    "        <option value=\"5\">\n" +
    "          5\n" +
    "        </option>\n" +
    "        <option value=\"10\">\n" +
    "          10\n" +
    "        </option>\n" +
    "      </select>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
