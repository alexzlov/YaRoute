angular.module('yaRoute', [])
  .constant('config', {
    scriptUrl: 'https://api-maps.yandex.ru/2.0-stable/?load=package.standard&lang=ru-RU'
  })
  .factory('scriptLoader', ['$q', '$rootScope', function($q, $rootScope) {
    "use strict";
    function loadScript(sourcePath, callback) {
      var elem = document.createElement("script");
      elem.onload = elem.onreadystatechange = function() {
        if (elem.readyState && elem.readyState !== "complete" && elem.readyState !== "loaded") {
          return;
        }
        elem.onload = elem.onreadystatechange = null;
        callback();
      };
      elem.async = true;
      elem.src = sourcePath;
      document.getElementsByTagName('body')[0].appendChild(elem);
    }
    return function(url) {
      var deferred = $q.defer();
      loadScript(url, function () {
        $rootScope.$apply(function() {
          deferred.resolve();
        });
      });
      return deferred.promise;
    };
  }])
  .factory('maps', ['$window', '$timeout', 'scriptLoader', 'config',
    function ($window, $timeout, scriptLoader, config) {
      "use strict";
      var promise;
      return {
        ready: function (callback) {
          if (!promise) {
            promise = scriptLoader(config.scriptUrl).then(function() {
              return $window.ymaps;
            });
          }
          promise.then(function(ymaps) {
            ymaps.ready(function() {
              callback(ymaps);
            });
          });
        }
      };
  }])
  .controller('YRouteController', ['$scope', '$element', '$window', 'maps',
    function($scope, $element, $window, maps) {
      "use strict";
      var self = this;
      console.log('hello!');
      maps.ready(function(ymaps) {
        self.ymap = new ymaps.Map("map", {
          center: [55.87, 37.66],
          zoom: 10,
          width: 600,
          height: 600
        });
      });
  }]);