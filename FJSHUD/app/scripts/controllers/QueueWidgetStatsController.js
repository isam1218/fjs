hudweb.controller('QueueWidgetStatsController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function($scope, $rootScope, $routeParams, myHttpService) {
        $scope.queueId = $routeParams.queueId;
        $scope.query = "";
        $scope.sortField = "displayName";
        $scope.sortReverse = false;
        $scope.contacts = [];
        $scope.queueMembers = [];

        myHttpService.getFeed('queues');
        myHttpService.getFeed('queue_members');
        myHttpService.getFeed('queue_members_status');
        myHttpService.getFeed('queue_stat_calls');
        myHttpService.getFeed('contacts');
        myHttpService.getFeed('contacts_synced');

        $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
        $scope.selected = 'Stats';

        $scope.sort = function(field) {
            if ($scope.sortField != field) {
                $scope.sortField = field;
                $scope.sortReverse = false;
            }
            else {
                $scope.sortReverse = !$scope.sortReverse;
            }
        };

        // filter contacts down
        $scope.customFilter = function() {
            var tab = $scope.$parent.tab;

            return function(contact) {
                // remove self
                if (contact.xpid != $rootScope.myPid) {
                    // filter by tab
                    switch (tab) {
                        case 'all':
                            return true;
                            break;
                        case 'external':
                            if (contact.primaryExtension == '')
                                return true;
                            break;
                        case 'recent':
                            if ($scope.recents[contact.xpid] !== undefined) {
                                // attach timestamp to sort by
                                contact.timestamp = $scope.recents[contact.xpid];
                                return true;
                            }
                            break;
                        case 'favorites':
                            break;
                    }
                }
            };
        };

        $scope.customSort = function() {
            // recent list doesn't have a sort field
            if ($scope.$parent.tab == 'recent')
                return 'timestamp';
            else
                return $scope.sortField;
        };

        $scope.customReverse = function() {
            // recent list is always reversed
            if ($scope.$parent.tab == 'recent')
                return true;
            else
                return $scope.sortReverse;
        };

        // record most recent contacts
        $scope.storeRecent = function(xpid) {
            $scope.recents[xpid] = new Date().getTime();
            localStorage.recents = JSON.stringify($scope.recents);
        };

        $scope.$on('contacts_synced', function(event, data) {
            for (key in data) {
                var contact = data[key];

                $scope.contacts[contact.xpid] = contact;
            }
            $rootScope.loaded = true;
            $scope.$apply();
        });

        $scope.$on('contactstatus_synced', function(event, data) {
            for (key in data) {
                for (c in $scope.contacts) {
                    // set contact's status
                    if ($scope.contacts[c].xpid == data[key].xpid) {
                        $scope.contacts[c].hud_status = data[key].xmpp;
                        break;
                    }
                }
            }
        });

        $scope.$on('calls_synced', function(event, data) {
            for (key in data) {
                for (c in $scope.contacts) {
                    // set contact's status
                    if ($scope.contacts[c].xpid == data[key].xpid) {
                        $scope.contacts[c].calls_startedAt = data[key].startedAt;
                        break;
                    }
                }
            }
        });

        //$scope.$on('queues_synced', function(event, data) {
        //    if (data.queues !== undefined) {
        //        var queues = data.queues;
        //        for (i = 0; i < queues.length && $scope.queue === undefined; i++) {
        //            if (queues[i].xpid == $scope.queueId) {
        //                $scope.queue = queues[i];
        //            }
        //
        //        }
        //        $scope.$safeApply();
        //    }
        //});

        $scope.$on('queues_updated', function(event, data) {
            $scope.queueMembers = [];

            for (var i = 0; i < $scope.queue.members.length; i++) {
                var member = $scope.queue.members[i];

                member.contact = $scope.contacts[member.contactId];
                member.otherQueues = [];
                $scope.queueMembers.push(member);
            }

          var queues = data.queues;
          for (var q in queues) {
              var queue = queues[q];

                // Don't include this queue
              if (queue.xpid === $scope.queue.xpid) {
                continue;
              }

              for (var m in $scope.queueMembers) {
                var member = $scope.queueMembers[m];

                for (var qm in queue.members) {
                  var qMember = queue.members[qm];

                  if (qMember.xpid === member.xpid) {
                    member.otherQueues.push(queue);
                  }
                }
              }
            }
        });

        $scope.getAvatarUrl = function(xpid) {
            if (xpid !== undefined) {
                return myHttpService.get_avatar(xpid, 32, 32);
            }
            else
                return 'img/Generic-Avatar-32.png';
        };


        $scope.$on("$destroy", function() {

        });

        $scope.onTwistieClicked = function(e) {
            //   console.log('twistieClicked');
            var rowDiv = e.srcElement.parentElement.parentElement.parentElement;
            var className = rowDiv.className;
            var expanded = className.indexOf('ListLineExpanded') != -1;

            if (expanded) {

                if (this.$even) {
                    className = 'ListRow ListLine';
                } else {
                    className = 'ListRowOdd';
                }
            } else {
                className = 'ListRow ListLine ListLineExpanded';
            }

            rowDiv.className = className;
        }
    }]);
