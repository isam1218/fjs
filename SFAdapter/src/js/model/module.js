var sfa_model = angular.module('SFA_model', ['SF_API']);

sfa_model.service('DataManager', ['SFApi', fjs.model.DataManager]);
sfa_model.filter('WhoFilter', fjs.model.filter.Who);
sfa_model.filter('WhatFilter', fjs.model.filter.What);
sfa_model.filter('SortRelatedFields', fjs.model.filter.SortRelatedFields);
sfa_model.filter('HasCallInfoFilter', fjs.model.filter.HasCallInfoFilter);
