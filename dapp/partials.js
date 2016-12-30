angular.module('multiSigWeb').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/settings.html',
    "<div class=\"panel panel-default\">\r" +
    "\n" +
    "  <div class=\"panel-heading\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Settings\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"panel-body\">\r" +
    "\n" +
    "    <form ng-submit=\"update()\">\r" +
    "\n" +
    "      <div class=\"form-group\">\r" +
    "\n" +
    "        <label>Ethereum node</label>\r" +
    "\n" +
    "        <input type=\"url\" ng-model=\"config.ethereumNode\" class=\"form-control\" />\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "      <div class=\"form-group\">\r" +
    "\n" +
    "        <label>Gas limit</label>\r" +
    "\n" +
    "        <input type=\"number\" ng-model=\"config.gasLimit\" class=\"form-control\" />\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "      <div class=\"form-group\">\r" +
    "\n" +
    "        <label>Gas price</label>\r" +
    "\n" +
    "        <input type=\"number\" ng-model=\"config.gasPrice\" class=\"form-control\" />\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "      <input type=\"submit\" class=\"btn btn-default\" value=\"Update\" />\r" +
    "\n" +
    "    </form>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/transactions.html',
    "<div class=\"panel panel-default\">\r" +
    "\n" +
    "  <div class=\"panel-heading\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Transactions\r" +
    "\n" +
    "      <div class=\"pull-right\">\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"sendTransaction()\">\r" +
    "\n" +
    "          Send transaction\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"sendRawTransaction()\">\r" +
    "\n" +
    "          Send raw transaction\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\">\r" +
    "\n" +
    "          Get nonce\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-danger\" ng-click=\"removeAll()\">\r" +
    "\n" +
    "          Remove all\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"panel-body\">\r" +
    "\n" +
    "    <table class=\"table table-hover\">\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Destination\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Value\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Data\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Nonce\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Mined\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Logs\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "        <tr ng-repeat=\"transaction in transactions | objectToArray| limitTo:currentPage*itemsPerPage:itemsPerPage*(currentPage-1) track by $index\">\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <a ng-href=\"https://testnet.etherscan.io/tx/{{transaction.txHash}}\">\r" +
    "\n" +
    "              {{getTo(transaction.info.to)}}\r" +
    "\n" +
    "            </a>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{transaction.info.value | ether}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "              {{transaction.info.input | limitTo: 20}}...\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{transaction.info.nonce}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <span ng-show=\"transaction.receipt\">\r" +
    "\n" +
    "              Yes\r" +
    "\n" +
    "            </span>\r" +
    "\n" +
    "            <span ng-hide=\"transaction.receipt\">\r" +
    "\n" +
    "              No\r" +
    "\n" +
    "            </span>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <!--\r" +
    "\n" +
    "            <ul>\r" +
    "\n" +
    "              <li ng-repeat=\"log in transaction.receipt.logs\">\r" +
    "\n" +
    "                {{log}}\r" +
    "\n" +
    "              </li>\r" +
    "\n" +
    "            </ul>\r" +
    "\n" +
    "          -->\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <button class=\"btn btn-default\" ng-click=\"remove(transaction.txHash)\">\r" +
    "\n" +
    "              <i class=\"fa fa-minus text-danger\">\r" +
    "\n" +
    "              </i>\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "    <div ng-hide=\"totalItems\" class=\"text-center\">\r" +
    "\n" +
    "      No transactions\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\" items-per-page=\"itemsPerPage\"></ul>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/wallet.html',
    "<div class=\"panel panel-default\">\r" +
    "\n" +
    "  <div class=\"panel-heading\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Wallets\r" +
    "\n" +
    "      <div class=\"pull-right\">\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"newWalletSelect()\">\r" +
    "\n" +
    "          Add\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"panel-body\">\r" +
    "\n" +
    "    <table class=\"table table-hover table-bordered table-striped\">\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Name\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Address\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Balance\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            # Conf.\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Daily limit\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Limit for today\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Actions\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "        <tr ng-repeat=\"(walletAddress, wallet) in wallets|objectToArray|limitTo:itemsPerPage:itemsPerPage*(currentPage-1) track by $index\">\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <a ng-href=\"#/wallet/{{wallet.address}}\">{{wallet.name}}</a>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{wallet.address|limitTo:20}}...\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{wallet.balance|ether}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{wallet.confirmations|bigNumber}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{wallet.limit|ether}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{wallet.maxWithdraw|ether}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"deposit(wallet)\">\r" +
    "\n" +
    "              Deposit\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"removeWallet(wallet.address)\">\r" +
    "\n" +
    "              Remove\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"editWallet(wallet)\">\r" +
    "\n" +
    "              Edit\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"setRequired(wallet)\">\r" +
    "\n" +
    "              Set required\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"setLimit(wallet)\">\r" +
    "\n" +
    "              Set daily\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"withdrawLimit(wallet)\">\r" +
    "\n" +
    "              Withdraw limit\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "    <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\" items-per-page=\"itemsPerPage\"></ul>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/walletDetail.html',
    "<div class=\"page-header\">\r" +
    "\n" +
    "  <h2>\r" +
    "\n" +
    "    {{wallet.name}}\r" +
    "\n" +
    "  </h2>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"panel panel-default\">\r" +
    "\n" +
    "  <div class=\"panel-heading\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Owners\r" +
    "\n" +
    "      <div class=\"pull-right\">\r" +
    "\n" +
    "        <button type=\"button\" ng-click=\"addOwner()\" class=\"btn btn-default\">\r" +
    "\n" +
    "          Add\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "        <button type=\"button\" ng-click=\"hideOwners = true\" class=\"btn btn-default\" ng-hide=\"hideOwners\">\r" +
    "\n" +
    "          Hide\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "        <button type=\"button\" ng-click=\"hideOwners = false\" class=\"btn btn-default\" ng-show=\"hideOwners\">\r" +
    "\n" +
    "          Show\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"panel-body collapse\" uib-collapse=\"hideOwners\">\r" +
    "\n" +
    "    <table class=\"table table-hover\">\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Name\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Address\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Actions\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "        <tr ng-repeat=\"owner in owners track by $index\">\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{getOwnerName(owner)}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{owner}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <button type=\"button\" ng-click=\"editOwner(owner)\" class=\"btn btn-default\">\r" +
    "\n" +
    "              Edit\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "            <button type=\"button\" ng-click=\"removeOwner(owner)\" class=\"btn btn-danger\" ng-hide=\"owners.length == 1\">\r" +
    "\n" +
    "              Remove\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"panel panel-default\">\r" +
    "\n" +
    "  <div class=\"panel-heading\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Multisig-Transactions\r" +
    "\n" +
    "      <div class=\"pull-right form-inline\">\r" +
    "\n" +
    "        <select class=\"form-control\" ng-model=\"showTxs\" ng-change=\"updateParams()\">\r" +
    "\n" +
    "          <option value=\"all\">\r" +
    "\n" +
    "            All\r" +
    "\n" +
    "          </option>\r" +
    "\n" +
    "          <option value=\"pending\">\r" +
    "\n" +
    "            Pending\r" +
    "\n" +
    "          </option>\r" +
    "\n" +
    "          <option value=\"executed\">\r" +
    "\n" +
    "            Executed\r" +
    "\n" +
    "          </option>\r" +
    "\n" +
    "        </select>\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"addTransaction()\">\r" +
    "\n" +
    "          Add\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"panel-body\">\r" +
    "\n" +
    "    <table class=\"table table-hover\">\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Destionation/Type\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Value\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Data\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Nonce\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            # Confirmations\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Executed\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Actions\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "        <tr ng-repeat=\"txHash in txHashes track by $index\">\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{getType(transactions[txHash])}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{transactions[txHash].value|ether}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{getParam(transactions[txHash])}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{transactions[txHash].nonce}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <ul ng-repeat=\"owner in transactions[txHash].confirmations\">\r" +
    "\n" +
    "              <li>\r" +
    "\n" +
    "                {{wallet.owners[owner].name}}\r" +
    "\n" +
    "              </li>\r" +
    "\n" +
    "            </ul>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <span ng-show=\"transactions[txHash].executed\">\r" +
    "\n" +
    "              Yes\r" +
    "\n" +
    "            </span>\r" +
    "\n" +
    "            <span ng-hide=\"transactions[txHash].executed\">\r" +
    "\n" +
    "              No\r" +
    "\n" +
    "            </span>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\r" +
    "\n" +
    "            ng-hide=\"transactions[txHash].executed || transactions[txHash].confirmed\"\r" +
    "\n" +
    "            ng-click=\"confirmTransaction(txHash)\">\r" +
    "\n" +
    "              Confirm\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\r" +
    "\n" +
    "            ng-show=\"transactions[txHash].confirmed && !transactions[txHash].executed\"\r" +
    "\n" +
    "            ng-click=\"revokeConfirmation(txHash)\">\r" +
    "\n" +
    "              Revoke Confirmation\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-default\"\r" +
    "\n" +
    "            ng-show=\"!transactions[txHash].executed && transactions[txHash].confirmations.length == confirmations\"\r" +
    "\n" +
    "            ng-click=\"executeTransaction(txHash)\">\r" +
    "\n" +
    "              Execute\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "    <div class=\"form-inline\">\r" +
    "\n" +
    "      <ul uib-pagination total-items=\"totalItems\" ng-model=\"currentPage\"\r" +
    "\n" +
    "      ng-change=\"updateTransactions()\" items-per-page=\"itemsPerPage\"></ul>\r" +
    "\n" +
    "      <select class=\"form-control pull-right\" ng-change=\"updateTransactions()\" ng-model=\"itemsPerPage\" convert-to-number>\r" +
    "\n" +
    "        <option value=\"2\">\r" +
    "\n" +
    "          2\r" +
    "\n" +
    "        </option>\r" +
    "\n" +
    "        <option value=\"5\">\r" +
    "\n" +
    "          5\r" +
    "\n" +
    "        </option>\r" +
    "\n" +
    "        <option value=\"10\">\r" +
    "\n" +
    "          10\r" +
    "\n" +
    "        </option>\r" +
    "\n" +
    "      </select>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/addOwner.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Add owner\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Name </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required\\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Address </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\"\r" +
    "\n" +
    "    ng-model=\"owner.address\" required\\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\r" +
    "\n" +
    "    Ok\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/addWalletOwner.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Add owner\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Name </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required\\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Address </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\"\r" +
    "\n" +
    "    ng-model=\"owner.address\" required\\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"send()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"sign()\">\r" +
    "\n" +
    "    Sign offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"getNonce()\">\r" +
    "\n" +
    "    Get nonce\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/confirmTransaction.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <div class=\"modal-title\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Confirm transaction\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\r" +
    "\n" +
    "    Sign offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/deposit.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Deposit\r" +
    "\n" +
    "  <h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label class=\"control-label\">\r" +
    "\n" +
    "      Amount (ETH):\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "    <input type=\"number\" class=\"form-control\" ng-model=\"amount\" step=\"any\">\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button type=\"button\" ng-click=\"deposit()\" class=\"btn btn-default\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" ng-click=\"sign()\" class=\"btn btn-default\">\r" +
    "\n" +
    "    Sign offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </a>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/editOwner.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Edit owner\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Name </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required\\>\r" +
    "\n" +
    "  </div>  \r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\r" +
    "\n" +
    "    Ok\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/editWallet.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Edit wallet\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Name </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"name\" required\\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Address </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\"\r" +
    "\n" +
    "    ng-model=\"address\" disabled \\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\r" +
    "\n" +
    "    Ok\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/executeTransaction.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <div class=\"modal-title\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Execute transaction\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\r" +
    "\n" +
    "    Sign offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/getNonce.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Get nonce\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label>\r" +
    "\n" +
    "      Address\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "    <input class=\"form-control\" type=\"text\" ng-model=\"address\" \\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\r" +
    "\n" +
    "    Ok\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/newWallet.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Deploy new wallet\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<form class=\"form\" name=\"newWallet\">\r" +
    "\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Name </label>\r" +
    "\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"name\" required ng-min-length=\"1\"\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> # required confirmations </label>\r" +
    "\n" +
    "      <input type=\"number\" class=\"form-control\" ng-min=\"1\" ng-max=\"owners.length\"\r" +
    "\n" +
    "      ng-model=\"confirmations\" required\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Daily limit (ETH) </label>\r" +
    "\n" +
    "      <input type=\"number\" class=\"form-control\"\r" +
    "\n" +
    "      ng-model=\"limit\" required\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <label> Owners: </label>\r" +
    "\n" +
    "    <table class=\"table table-hover\">\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Name\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Address\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "          <th>\r" +
    "\n" +
    "            Action\r" +
    "\n" +
    "          </th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "        <tr ng-repeat=\"owner in owners\">\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{owner.name}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            {{owner.address}}\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-danger\" ng-click=\"removeOwner(owner.address)\">\r" +
    "\n" +
    "              Remove\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "          <td>\r" +
    "\n" +
    "            <button ng-click=\"addOwner()\" type=\"button\" class=\"btn btn-default\">\r" +
    "\n" +
    "              Add\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "          </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployWallet()\"\r" +
    "\n" +
    "    ng-disabled=\"newWallet.$invalid\">\r" +
    "\n" +
    "      Send Transaction\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployOfflineWallet()\"\r" +
    "\n" +
    "    ng-disabled=\"newWallet.$invalid\">\r" +
    "\n" +
    "      Sign Offline\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/removeOwner.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Remove owner\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Name </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" readonly \\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label> Address </label>\r" +
    "\n" +
    "    <input type=\"text\" class=\"form-control\"\r" +
    "\n" +
    "    ng-model=\"owner.address\" readonly \\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"send()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"sign()\">\r" +
    "\n" +
    "    Sign offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"getNonce()\">\r" +
    "\n" +
    "    Get nonce\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/removeWallet.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Remove wallet\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<form class=\"form\" name=\"removeWallet\">\r" +
    "\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Name </label>\r" +
    "\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"wallet.name\" disabled \\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Address </label>\r" +
    "\n" +
    "      <input type=\"text\" class=\"form-control\" disabled\r" +
    "\n" +
    "      ng-model=\"wallet.address\"\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Enter name for confirmation </label>\r" +
    "\n" +
    "      <input type=\"text\" class=\"form-control\"\r" +
    "\n" +
    "      ng-model=\"confirmation\"\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\r" +
    "\n" +
    "    ng-disabled=\"confirmation != wallet.name\">\r" +
    "\n" +
    "      Ok\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/restoreWallet.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Restore deployed wallet\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<form class=\"form\" name=\"restoreWallet\">\r" +
    "\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Name </label>\r" +
    "\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"old.name\" required\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Address </label>\r" +
    "\n" +
    "      <input type=\"text\" class=\"form-control\"\r" +
    "\n" +
    "      ng-model=\"old.address\" required\\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\r" +
    "\n" +
    "    ng-disabled=\"restoreWallet.$invalid\">\r" +
    "\n" +
    "      Ok\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/retrieveNonce.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Multisig nonce\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label>\r" +
    "\n" +
    "      Nonce\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "    <input class=\"form-control\" type=\"text\" readonly ng-model=\"nonce\" id=\"nonce\" \\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ngclipboard-success=\"copy()\" ngclipboard data-clipboard-target=\"#nonce\">\r" +
    "\n" +
    "    Copy\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/revokeConfirmation.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <div class=\"modal-title\">\r" +
    "\n" +
    "    <h3>\r" +
    "\n" +
    "      Revoke confirmation\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\r" +
    "\n" +
    "    Sign offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/selectNewWallet.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\r" +
    "\n" +
    "      Add wallet\r" +
    "\n" +
    "    </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"radio\">\r" +
    "\n" +
    "    <label>\r" +
    "\n" +
    "      <input type=\"radio\" value=\"create\" ng-model=\"walletOption\">\r" +
    "\n" +
    "      Create new wallet\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"radio\">\r" +
    "\n" +
    "    <label>\r" +
    "\n" +
    "      <input type=\"radio\" value=\"restore\" ng-model=\"walletOption\">\r" +
    "\n" +
    "      Restore deployed wallet\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" ng-click=\"ok()\">\r" +
    "\n" +
    "    Next\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/sendTransaction.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<form name=\"form\" class=\"form\">\r" +
    "\n" +
    "  <div class=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Destination </label>\r" +
    "\n" +
    "      <input type=\"text\" ng-model=\"tx.to\" class=\"form-control\" required>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Value (ETH) </label>\r" +
    "\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"tx.value\" ng-required=\"!abi\">\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> ABI string </label>\r" +
    "\n" +
    "      <textarea type=\"text\" rows=\"3\" class=\"form-control\" ng-model=\"abi\" ng-change=\"updateMethods()\" ng-required=\"!tx.value\">\r" +
    "\n" +
    "      </textarea>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Method </label>\r" +
    "\n" +
    "      <select ng-model=\"method\" ng-options=\"method.name for method in methods track by method.index\"\r" +
    "\n" +
    "       ng-required=\"tx.abi\" class=\"form-control\" ng-change=\"setMethod()\"></select>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"form-group\" ng-show=\"method\">\r" +
    "\n" +
    "      <h3>\r" +
    "\n" +
    "        Params\r" +
    "\n" +
    "      </h3>\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <div ng-repeat=\"param in abiArray[method.index].inputs\" >\r" +
    "\n" +
    "        <div ng-switch on=\"param.type\">\r" +
    "\n" +
    "          <label>{{param.name}}</label>\r" +
    "\n" +
    "          <input ng-switch-default type=\"text\" class=\"form-control\" ng-model=\"params[$index]\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Send transaction\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Sign Offline\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/setLimit.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Change daily limit\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label>\r" +
    "\n" +
    "      Limit in ETH:\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "    <input type=\"number\" step=\"any\" ng-model=\"limit\" class=\"form-control\"\\>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"setLimit()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\r" +
    "\n" +
    "    Sign Offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\">\r" +
    "\n" +
    "    Get nonce\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/showSignedTransaction.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Signed transaction\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label>Hex code</label>\r" +
    "\n" +
    "    <textarea class=\"form-control\" rows=\"5\" ng-model=\"signed\" id=\"signed\"></textarea>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" ngclipboard-success=\"copy()\" ngclipboard data-clipboard-target=\"#signed\">\r" +
    "\n" +
    "    Copy\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/signedTransaction.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Send raw transaction\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label>Raw transaction</label>\r" +
    "\n" +
    "    <textarea class=\"form-control\" rows=\"5\" ng-model=\"tx\"></textarea>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button class=\"btn btn-default\" ng-click=\"sendRawTransaction()\">\r" +
    "\n" +
    "    Send\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/signMultisigTransactionOffline.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Sign multisig transaction offline\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<form ng-submit=\"ok()\" name=\"form\">\r" +
    "\n" +
    "  <div class=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label>\r" +
    "\n" +
    "        Multisig Nonce\r" +
    "\n" +
    "      </label>\r" +
    "\n" +
    "      <input class=\"form-control\" type=\"text\" ng-model=\"nonces.multisig\" required \\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label>\r" +
    "\n" +
    "        Account Nonce\r" +
    "\n" +
    "      </label>\r" +
    "\n" +
    "      <input class=\"form-control\" type=\"text\" ng-model=\"nonces.account\" required \\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Ok\" ng-disabled=\"form.$invalid\" \\>\r" +
    "\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/signOffline.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Sign transaction offline\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<form ng-submit=\"ok()\">\r" +
    "\n" +
    "  <div class=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label>\r" +
    "\n" +
    "        Nonce\r" +
    "\n" +
    "      </label>\r" +
    "\n" +
    "      <input class=\"form-control\" type=\"number\" ng-model=\"nonce\" ng-min=\"0\" required \\>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Ok\" \\>\r" +
    "\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/updateRequired.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Change # required conf.\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"modal-body\">\r" +
    "\n" +
    "  <div class=\"form-group\">\r" +
    "\n" +
    "    <label class=\"control-label\">\r" +
    "\n" +
    "      Required confirmations:\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "    <input type=\"number\" class=\"form-control\" ng-model=\"required\">\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div class=\"modal-footer\">\r" +
    "\n" +
    "  <button type=\"bytton\" class=\"btn btn-default\" ng-click=\"update()\">\r" +
    "\n" +
    "    Send transaction\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"signOffline()\">\r" +
    "\n" +
    "    Sign Offline\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\">\r" +
    "\n" +
    "    Get nonce\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\r" +
    "\n" +
    "    Cancel\r" +
    "\n" +
    "  </button>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/walletTransaction.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h1>\r" +
    "\n" +
    "    Send multisig transaction\r" +
    "\n" +
    "  </h1>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<form class=\"form\" name=\"form\">\r" +
    "\n" +
    "  <div class=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Destination </label>\r" +
    "\n" +
    "      <input type=\"text\" ng-model=\"tx.to\" class=\"form-control\" required>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Value (ETH) </label>\r" +
    "\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"tx.value\" ng-required=\"!abi\">\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> ABI string </label>\r" +
    "\n" +
    "      <textarea rows=\"5\" type=\"text\" class=\"form-control\" ng-model=\"abi\" ng-change=\"updateMethods()\" ng-required=\"!tx.value\">\r" +
    "\n" +
    "      </textarea>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Method </label>\r" +
    "\n" +
    "      <select ng-model=\"method\" ng-options=\"method.name for method in methods track by method.index\"\r" +
    "\n" +
    "       ng-required=\"tx.abi\" class=\"form-control\" ng-change=\"setMethod()\"></select>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"form-group\" ng-show=\"method\">\r" +
    "\n" +
    "      <h3>\r" +
    "\n" +
    "        Params\r" +
    "\n" +
    "      </h3>\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <div ng-repeat=\"param in abiArray[method.index].inputs\" >\r" +
    "\n" +
    "        <div ng-switch on=\"param.type\">\r" +
    "\n" +
    "          <label>{{param.name}}</label>\r" +
    "\n" +
    "          <input ng-switch-default type=\"text\" class=\"form-control\" ng-model=\"params[$index]\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"panel-footer\">\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Send transaction\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Sign Off\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"getNonce()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Get nonce\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );


  $templateCache.put('partials/modals/withdrawLimit.html',
    "<div class=\"modal-header\">\r" +
    "\n" +
    "  <h3 class=\"modal-title\">\r" +
    "\n" +
    "    Withdraw limit\r" +
    "\n" +
    "  </h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<form name=\"form\" class=\"form\">\r" +
    "\n" +
    "  <div class=\"modal-body\">\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label> Value (ETH) </label>\r" +
    "\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"tx.value\" required>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"modal-footer\">\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Send transaction\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\r" +
    "\n" +
    "      Sign Offline\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\r" +
    "\n" +
    "      Cancel\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</form>\r" +
    "\n"
  );

}]);
