/**
 * @name statement controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.statement.controllers')
        .controller('StatementController', Statement);

    Statement.$inject = ['$scope', '$filter', '$state', '$timeout', '$ionicScrollDelegate', 'languageService', 'tableStateService', 'accountService', 'websocketService', 'appStateService', 'currencyToSymbolService'];

    function Statement($scope, $filter, $state, $timeout, $ionicScrollDelegate, languageService, tableStateService, accountService, websocketService, appStateService, currencyToSymbolService) {
        var vm = this;
        vm.data = {};
        vm.noTransaction = false;
        vm.noMore = false;
        vm.hasRefresh = false;
        vm.enteredNow = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.goToTopButton = false;

        $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            vm.lastPage = from.name;
            vm.enteredNow = true;
            // check if state is changed from any state other than transactiondetail
            // we do not refresh the state if it comes back from transactiondetail
            if (vm.lastPage != 'transactiondetail') {
                vm.notAuthorizeYet();
            }
        });

        $scope.$on('authorize', (e, response) => {
            if (appStateService.statementRefresh) {
                vm.notAuthorizeYet();
            }
        });

        vm.notAuthorizeYet = function() {
            // check if app is authorized already or has to wait for it to be authorized
            if (appStateService.isLoggedin) {
                if (appStateService.statementRefresh) {
                    appStateService.statementRefresh = false;
                    appStateService.isStatementSet = false;
                    vm.pageState();
                }
            }
            // else{
            //    wait for authorize
            // }
        }

        vm.loadMore = function() {
            if (!tableStateService.statementCompletedGroup) {
                // here can load some amount of transactions already recieved
                vm.setBatch();
            } else if (tableStateService.statementCompletedGroup) {
                tableStateService.statementCurrentPage += 1;
                vm.pageState();
            }
        }

        $scope.$on('scroll.infiniteScrollComplete', () => {
            // console.log('new data loaded');
        });

        vm.pageState = function() {
            if (!appStateService.isStatementSet) {
                appStateService.isStatementSet = true;
                tableStateService.statementDateType = 'allTime';
                vm.resetParams();
                vm.setParams();
                tableStateService.statementCompletedGroup = false;
            } else if (appStateService.isStatementSet && vm.enteredNow && vm.lastPage == 'transactiondetail') {
                vm.enteredNow = false;
                vm.lastPage = '';
                vm.setParams();
            } else if (appStateService.isStatementSet && appStateService.isChangedAccount) {
                // if account is changed reset data attributes and send request again
                tableStateService.statementDateType = 'allTime';
                vm.resetParams();
                vm.setParams();
                vm.goTop();
            } else if (appStateService.isStatementSet && vm.dateChanged == true) {
                vm.transactions = [];
                vm.batchedTransaction = [];
                vm.filteredTransactions = [];
                vm.dateChanged = false;
                tableStateService.statementCurrentPage = 0;
                tableStateService.statementCompletedGroup = true;
                tableStateService.statementBatchNum = 0;
                tableStateService.statementBatchLimit = 0;
                vm.setParams();
                vm.goTop();
            } else if (appStateService.isStatementSet && tableStateService.statementCompletedGroup) {
                vm.transactions = [];
                tableStateService.statementCompletedGroup = false;
            } else {
                vm.setParams();
                $scope.$applyAsync(() => {
                    vm.noMore = false;
                });

            }
            vm.sendRequest();
        }

        vm.setParams = function() {
            vm.data.appID = tableStateService.statementAppID;
            vm.data.dateType = tableStateService.statementDateType;
            vm.data.dateFrom = tableStateService.statementDateFrom;
            vm.data.dateTo = tableStateService.statementDateTo;
            vm.data.currentPage = tableStateService.statementCurrentPage;
            vm.itemsPerPage = 300;
            vm.limit = vm.itemsPerPage + 1;
        }
        vm.resetParams = function() {
            tableStateService.statementAppID = 'allApps';
            tableStateService.statementDateFrom = '';
            tableStateService.statementDateTo = '';
            tableStateService.statementCurrentPage = 0;
            vm.transactions = [];
            vm.batchedTransaction = [];
            tableStateService.statementCompletedGroup = true;
            tableStateService.statementBatchNum = 0;
            tableStateService.statementBatchLimit = 0;
        }

        vm.sendRequest = function() {
            vm.params = {
                "description": 1,
                "limit": vm.limit,
                "offset": vm.itemsPerPage * vm.data.currentPage
            }
            if (vm.data.hasOwnProperty('dateFrom') && vm.data.dateFrom != "") {
                vm.params.date_from = vm.data.dateFrom;

            }
            if (vm.data.hasOwnProperty('dateTo') && vm.data.dateTo != "") {
                vm.params.date_to = vm.data.dateTo;
            }
            websocketService.sendRequestFor.statement(vm.params);
        }

        $scope.$on('statement:update', (e, _statement, _passthrough) => {
            vm.statement = _statement;
            vm.count = vm.statement.count;
            if (vm.count == 0) {
                vm.noTransaction = true;
                $scope.$applyAsync(() => {
                    vm.noMore = true;
                });
                vm.setBatch();
            } else if (vm.count > 0) {
                if (vm.count < vm.limit) {
                    // has no more to load on next call
                    vm.noTransaction = false;
                    $scope.$applyAsync(() => {
                        vm.noMore = true;
                    });
                    vm.statement.transactions.forEach(function(el, i) {
                        vm.transactions.push(vm.statement.transactions[i]);
                    });
                    vm.setBatch();
                } else if (vm.count == vm.limit) {
                    // has at least one transaction on next call to show to user
                    vm.noTransaction = false;
                    $scope.$applyAsync(() => {
                        vm.noMore = false;
                    });
                    vm.statement.transactions.forEach(function(el, i) {
                        if (i < vm.count - 1) {
                            vm.transactions.push(vm.statement.transactions[i]);
                        }
                    });
                    vm.setBatch();
                }
            }
        });

        vm.setBatch = function() {
            tableStateService.statementBatchLimit = Math.ceil(vm.transactions.length / tableStateService.statementBatchSize);
            vm.sliced = [];
            vm.sliced = vm.transactions.slice(tableStateService.statementBatchNum * tableStateService.statementBatchSize, (tableStateService.statementBatchNum + 1) * tableStateService.statementBatchSize);
            vm.sliced.forEach(function(el, i) {
                vm.batchedTransaction.push(vm.sliced[i]);
            });
            tableStateService.statementBatchNum = tableStateService.statementBatchNum + 1;
            if (tableStateService.statementBatchNum == tableStateService.statementBatchLimit) {
                tableStateService.statementBatchLimit = 0;
                tableStateService.statementBatchNum = 0;
                tableStateService.statementCompletedGroup = true;
            }

            vm.setFiltered();
        }

        vm.setFiltered = function() {
            $scope.$applyAsync(() => {
                vm.filteredTransactions = $filter('DataFilter')(vm.batchedTransaction, vm.data.appID);
                if (vm.filteredTransactions.length == 0) {
                    vm.noTransaction = true;
                } else {
                    vm.noTransaction = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        vm.calcTime = function(daysNumber) {
            var now = new Date();
            vm.currentEpoch = now.getTime();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            var midnightEpoch = new Date(today).getTime();
            vm.diff = vm.currentEpoch - midnightEpoch;
            var dayBeforeDate = now.setDate(now.getDate() - daysNumber);
            tableStateService.statementDateFrom = Math.ceil((dayBeforeDate - vm.diff) / 1000);
        }

        vm.dateFilter = function() {
            if (vm.data.dateType == 'allTime') {
                tableStateService.statementDateType = 'allTime';
                tableStateService.statementDateFrom = '';
                tableStateService.statementDateTo = '';
            } else if (vm.data.dateType == 'monthAgo') {
                tableStateService.statementDateType = 'monthAgo';
                vm.calcTime(30);
                tableStateService.statementDateTo = '';
            } else if (vm.data.dateType == 'sevenDayAgo') {
                tableStateService.statementDateType = 'sevenDayAgo';
                vm.calcTime(7);
                tableStateService.statementDateTo = '';
            } else if (vm.data.dateType == 'threeDayAgo') {
                tableStateService.statementDateType = 'threeDayAgo';
                vm.calcTime(3);
                tableStateService.statementDateTo = '';
            } else if (vm.data.dateType == 'oneDayAgo') {
                tableStateService.statementDateType = 'oneDayAgo';
                vm.calcTime(1);
                tableStateService.statementDateTo = Math.ceil((vm.currentEpoch - vm.diff) / 1000);
            } else if (vm.data.dateType == 'today') {
                tableStateService.statementDateType = 'today';
                vm.calcTime(0);
                tableStateService.statementDateTo = '';
            }
            tableStateService.statementDateType = vm.data.dateType;
            vm.dateChanged = true;
            vm.pageState();
        }

        vm.formatMoney = function(currency, amount) {
            vm.currency = sessionStorage.getItem('currency');
            return currencyToSymbolService.formatMoney(currency, amount);
        }

        vm.goTop = function() {
            $ionicScrollDelegate.scrollTop(true);
            vm.goToTopButton = false;
        }

        vm.goToTopButtonCondition = function() {
            $scope.$applyAsync(() => {
                if ($ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top >= 30) {
                    vm.goToTopButton = true;
                } else if ($ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top < 30) {
                    vm.goToTopButton = false;
                }
            });
        }

        // details functions
        vm.sendContractDetailRequest = function(id) {
            vm.id = id;
            sessionStorage.setItem('id', vm.id);
            $state.go('transactiondetail');
        }

    }
})();
