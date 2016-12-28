angular.module('multiSigWeb').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/settings.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3>\n" +
    "    Settings\n" +
    "  </h3>\n" +
    "  </div>\n" +
    "  <div class=\"panel-body\">\n" +
    "    <form ng-submit=\"update()\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label>Ethereum node</label>\n" +
    "        <input type=\"url\" ng-model=\"config.ethereumNode\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label>Gas limit</label>\n" +
    "        <input type=\"number\" ng-model=\"config.gasLimit\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label>Gas price</label>\n" +
    "        <input type=\"number\" ng-model=\"config.gasPrice\" class=\"form-control\" />\n" +
    "      </div>\n" +
    "      <input type=\"submit\" class=\"btn btn-default\" value=\"Update\" />\n" +
    "    </form>\n" +
    "  </div>\n" +
    "</div>\n"
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
    "            {{wallet.maxWithdraw|ether}}\n" +
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
    "            <button type=\"button\" class=\"btn btn-default\" ng-click=\"withdrawLimit(wallet)\">\n" +
    "              Withdraw limit\n" +
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


  $templateCache.put('partials/modals/addOwner.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Add owner\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Name </label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required\\>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Address </label>\n" +
    "    <input type=\"text\" class=\"form-control\"\n" +
    "    ng-model=\"owner.address\" required\\>\n" +
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


  $templateCache.put('partials/modals/addWalletOwner.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Add owner\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Name </label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required\\>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Address </label>\n" +
    "    <input type=\"text\" class=\"form-control\"\n" +
    "    ng-model=\"owner.address\" required\\>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"sign()\">\n" +
    "    Sign offline\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"getNonce()\">\n" +
    "    Get nonce\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/confirmTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <div class=\"modal-title\">\n" +
    "    <h3>\n" +
    "      Confirm transaction\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\n" +
    "    Sign offline\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/deposit.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Deposit\n" +
    "  <h3>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label class=\"control-label\">\n" +
    "      Amount (ETH):\n" +
    "    </label>\n" +
    "    <input type=\"number\" class=\"form-control\" ng-model=\"amount\" step=\"any\">\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" ng-click=\"deposit()\" class=\"btn btn-default\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" ng-click=\"sign()\" class=\"btn btn-default\">\n" +
    "    Sign offline\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </a>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/editOwner.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Edit owner\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Name </label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" required\\>\n" +
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


  $templateCache.put('partials/modals/editWallet.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Edit wallet\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Name </label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"name\" required\\>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Address </label>\n" +
    "    <input type=\"text\" class=\"form-control\"\n" +
    "    ng-model=\"address\" disabled \\>\n" +
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


  $templateCache.put('partials/modals/executeTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <div class=\"modal-title\">\n" +
    "    <h3>\n" +
    "      Execute transaction\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\n" +
    "    Sign offline\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/getNonce.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Get nonce\n" +
    "  </h3>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label>\n" +
    "      Address\n" +
    "    </label>\n" +
    "    <input class=\"form-control\" type=\"text\" ng-model=\"address\" \\>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\">\n" +
    "    Ok\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/newWallet.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Deploy new wallet\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"newWallet\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Name </label>\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"name\" required ng-min-length=\"1\"\\>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> # required confirmations </label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-min=\"1\" ng-max=\"owners.length\"\n" +
    "      ng-model=\"confirmations\" required\\>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Daily limit (ETH) </label>\n" +
    "      <input type=\"number\" class=\"form-control\"\n" +
    "      ng-model=\"limit\" required\\>\n" +
    "    </div>\n" +
    "\n" +
    "    <label> Owners: </label>\n" +
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
    "            Action\n" +
    "          </th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr ng-repeat=\"owner in owners\">\n" +
    "          <td>\n" +
    "            {{owner.name}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            {{owner.address}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <button type=\"button\" class=\"btn btn-danger\" ng-click=\"removeOwner(owner.address)\">\n" +
    "              Remove\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "          <td>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <button ng-click=\"addOwner()\" type=\"button\" class=\"btn btn-default\">\n" +
    "              Add\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployWallet()\"\n" +
    "    ng-disabled=\"newWallet.$invalid\">\n" +
    "      Send Transaction\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"deployOfflineWallet()\"\n" +
    "    ng-disabled=\"newWallet.$invalid\">\n" +
    "      Sign Offline\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/removeOwner.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Remove owner\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Name </label>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"owner.name\" readonly \\>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label> Address </label>\n" +
    "    <input type=\"text\" class=\"form-control\"\n" +
    "    ng-model=\"owner.address\" readonly \\>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"sign()\">\n" +
    "    Sign offline\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-default\" type=\"button\" ng-click=\"getNonce()\">\n" +
    "    Get nonce\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/removeWallet.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Remove wallet\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"removeWallet\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Name </label>\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"wallet.name\" disabled \\>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Address </label>\n" +
    "      <input type=\"text\" class=\"form-control\" disabled\n" +
    "      ng-model=\"wallet.address\"\\>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Enter name for confirmation </label>\n" +
    "      <input type=\"text\" class=\"form-control\"\n" +
    "      ng-model=\"confirmation\"\\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\n" +
    "    ng-disabled=\"confirmation != wallet.name\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/restoreWallet.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Restore deployed wallet\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<form class=\"form\" name=\"restoreWallet\">\n" +
    "  <div class=\"modal-body\" id=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Name </label>\n" +
    "      <input type=\"text\" class=\"form-control\" ng-model=\"old.name\" required\\>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Address </label>\n" +
    "      <input type=\"text\" class=\"form-control\"\n" +
    "      ng-model=\"old.address\" required\\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"ok()\"\n" +
    "    ng-disabled=\"restoreWallet.$invalid\">\n" +
    "      Ok\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/retrieveNonce.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Multisig nonce\n" +
    "  </h3>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label>\n" +
    "      Nonce\n" +
    "    </label>\n" +
    "    <input class=\"form-control\" type=\"text\" readonly ng-model=\"nonce\" id=\"nonce\" \\>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
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
    "  <div class=\"modal-title\">\n" +
    "    <h3>\n" +
    "      Revoke confirmation\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"send()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\n" +
    "    Sign offline\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/modals/selectNewWallet.html',
    "<div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\" id=\"modal-title\">\n" +
    "      Add wallet\n" +
    "    </h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" id=\"modal-body\">\n" +
    "  <div class=\"radio\">\n" +
    "    <label>\n" +
    "      <input type=\"radio\" value=\"create\" ng-model=\"walletOption\">\n" +
    "      Create new Wallet\n" +
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
    "\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Destination </label>\n" +
    "      <input type=\"text\" ng-model=\"tx.to\" class=\"form-control\" required>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Value (ETH) </label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"tx.value\" ng-required=\"!abi\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> ABI string </label>\n" +
    "      <textarea type=\"text\" rows=\"3\" class=\"form-control\" ng-model=\"abi\" ng-change=\"updateMethods()\" ng-required=\"!tx.value\">\n" +
    "      </textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Method </label>\n" +
    "      <select ng-model=\"method\" ng-options=\"method.name for method in methods track by method.index\"\n" +
    "       ng-required=\"tx.abi\" class=\"form-control\" ng-change=\"setMethod()\"></select>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\" ng-show=\"method\">\n" +
    "      <h3>\n" +
    "        Params\n" +
    "      </h3>\n" +
    "\n" +
    "      <div ng-repeat=\"param in abiArray[method.index].inputs\" >\n" +
    "        <div ng-switch on=\"param.type\">\n" +
    "          <label>{{param.name}}</label>\n" +
    "          <input ng-switch-default type=\"text\" class=\"form-control\" ng-model=\"params[$index]\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Send transaction\n" +
    "    </button>\n" +
    "\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Sign Offline\n" +
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
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label>\n" +
    "      Limit in ETH:\n" +
    "    </label>\n" +
    "    <input type=\"number\" step=\"any\" ng-model=\"limit\" class=\"form-control\"\\>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"setLimit()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"sign()\">\n" +
    "    Sign Offline\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\">\n" +
    "    Get nonce\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
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
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label>Hex code</label>\n" +
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
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label>Signed transaction</label>\n" +
    "    <textarea class=\"form-control\" rows=\"5\" ng-model=\"tx\"></textarea>\n" +
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


  $templateCache.put('partials/modals/signMultisigTransactionOffline.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Sign multisig transaction offline\n" +
    "  </h3>\n" +
    "</div>\n" +
    "\n" +
    "<form ng-submit=\"ok()\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>\n" +
    "        Multisig Nonce\n" +
    "      </label>\n" +
    "      <input class=\"form-control\" type=\"text\" ng-model=\"nonces.multisig\" required \\>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>\n" +
    "        Account Nonce\n" +
    "      </label>\n" +
    "      <input class=\"form-control\" type=\"text\" ng-model=\"nonces.account\" required \\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Ok\" ng-disabled=\"form.$invalid\" \\>\n" +
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
    "\n" +
    "<form ng-submit=\"ok()\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>\n" +
    "        Nonce\n" +
    "      </label>\n" +
    "      <input class=\"form-control\" type=\"number\" ng-model=\"nonce\" ng-min=\"0\" required \\>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <input class=\"btn btn-default\" type=\"submit\" value=\"Ok\" \\>\n" +
    "    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"cancel()\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/updateRequired.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Change # required conf.\n" +
    "  </h3>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label class=\"control-label\">\n" +
    "      Required confirmations:\n" +
    "    </label>\n" +
    "    <input type=\"number\" class=\"form-control\" ng-model=\"required\">\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"bytton\" class=\"btn btn-default\" ng-click=\"update()\">\n" +
    "    Send transaction\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"signOffline()\">\n" +
    "    Sign Offline\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"getNonce()\">\n" +
    "    Get nonce\n" +
    "  </button>\n" +
    "  <button type=\"button\" class=\"btn btn-danger\" ng-click=\"cancel()\">\n" +
    "    Cancel\n" +
    "  </button>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/walletTransaction.html',
    "<div class=\"modal-header\">\n" +
    "  <h1>\n" +
    "    Send multisig transaction\n" +
    "  </h1>\n" +
    "</div>\n" +
    "\n" +
    "<form class=\"form\" name=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Destination </label>\n" +
    "      <input type=\"text\" ng-model=\"tx.to\" class=\"form-control\" required>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Value (ETH) </label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"tx.value\" ng-required=\"!abi\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> ABI string </label>\n" +
    "      <textarea rows=\"5\" type=\"text\" class=\"form-control\" ng-model=\"abi\" ng-change=\"updateMethods()\" ng-required=\"!tx.value\">\n" +
    "      </textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Method </label>\n" +
    "      <select ng-model=\"method\" ng-options=\"method.name for method in methods track by method.index\"\n" +
    "       ng-required=\"tx.abi\" class=\"form-control\" ng-change=\"setMethod()\"></select>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\" ng-show=\"method\">\n" +
    "      <h3>\n" +
    "        Params\n" +
    "      </h3>\n" +
    "\n" +
    "      <div ng-repeat=\"param in abiArray[method.index].inputs\" >\n" +
    "        <div ng-switch on=\"param.type\">\n" +
    "          <label>{{param.name}}</label>\n" +
    "          <input ng-switch-default type=\"text\" class=\"form-control\" ng-model=\"params[$index]\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"panel-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Send transaction\n" +
    "    </button>\n" +
    "\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Sign Off\n" +
    "    </button>\n" +
    "\n" +
    "    <button type=\"button\" ng-click=\"getNonce()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Get nonce\n" +
    "    </button>\n" +
    "\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('partials/modals/withdrawLimit.html',
    "<div class=\"modal-header\">\n" +
    "  <h3 class=\"modal-title\">\n" +
    "    Withdraw limit\n" +
    "  </h3>\n" +
    "</div>\n" +
    "\n" +
    "<form name=\"form\" class=\"form\">\n" +
    "  <div class=\"modal-body\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label> Value (ETH) </label>\n" +
    "      <input type=\"number\" class=\"form-control\" ng-model=\"tx.value\" required>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" ng-click=\"send()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Send transaction\n" +
    "    </button>\n" +
    "\n" +
    "    <button type=\"button\" ng-click=\"signOff()\" class=\"btn btn-default\" ng-disabled=\"form.$invalid\">\n" +
    "      Sign Offline\n" +
    "    </button>\n" +
    "    <button type=\"button\" ng-click=\"cancel()\" class=\"btn btn-danger\">\n" +
    "      Cancel\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</form>\n"
  );

}]);
