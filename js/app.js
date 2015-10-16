tmap = null;
angular.module('yaRoute', [])

  /**
   * Конфигурация приложения. Адрес загрузки скрипта
   * Яндекс.Карты, координаты центра по умолчанию
   */
  .constant('config', {
    scriptUrl: 'https://api-maps.yandex.ru/2.0/?load=package.standard,package.geoObjects,package.editor&lang=ru-RU',
    mapCenter: [55.72, 37.64],
    strokeColor: "#FF0000"
  })

  /**
   * Загрузчик скрипта Яндекс.Карт
   */
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

  /**
   * Контроллер приложения
   */
  .controller('YRouteController', ['$scope', '$element', '$window', 'maps', 'config',
    function($scope, $element, $window, maps, config) {
      "use strict";
      var self = this;
      self.routePoints = [];
      self.pointCounter = 0;

      // Инициализация
      maps.ready(function(ymaps) {
        self.ymap = tmap = new ymaps.Map("map", {
          center: config.mapCenter,
          zoom: 10
        });
        self.ymaps = ymaps;
        var collection = new ymaps.GeoObjectCollection({}, {
          draggable: true
        });
        self.mapPoints = collection;
        self.ymap.geoObjects.add(collection);
      });

      /**
       * Добавление точки маршрута. Координаты по умолчанию
       * берутся из конфига приложения
       */
      this.addRoutePoint = function() {
        self.pointCounter += 1;
        if (!self.routePointName.length) {
          return;
        }
        var newPoint = {
          id: self.pointCounter,
          name: self.routePointName
        };
        var newMapPoint = new self.ymaps.Placemark(
          config.mapCenter,
          {
            balloonContent: newPoint.name
          },
          {
            draggable: true,
            itemId: newPoint.id
          }
        );
        newMapPoint.events.add('dragend', function(e) {
          self.drawRoute();
        });
        newMapPoint.events.add('drag', function(e) {
          self.drawRoute();
        });
        self.mapPoints.add(newMapPoint);
        newPoint.marker = newMapPoint;
        self.routePoints.push(newPoint);
        // Очищаем текстовое поле
        self.routePointName = "";
        self.drawRoute();
      };

      /**
       * Удаление точки маршрута
       * @param routePointId
       */
      this.deleteRoutePoint = function(routePointId) {
        for (var i = 0; i < self.routePoints.length; i++) {
          var item = self.routePoints[i];
          if (item.id == routePointId) {
            self.mapPoints.remove(item.marker);
            self.routePoints.splice(i, 1);
          }
        }
        self.drawRoute();
      };

      /**
       * Отрисовка маршрута при добавлении новой точки
       * либо при изменении координат существующей
       */
      this.drawRoute = function() {
        var routeGeometry = [];
        self.routePoints.forEach(function(point) {
          routeGeometry.push(point.marker.geometry.getCoordinates());
        });
        if (!self.route) {
          self.route = new self.ymaps.Polyline(routeGeometry, {}, {
            draggable: false,
            strokeColor: config.strokeColor,
            strokeWidth: 5
          });
          self.mapPoints.add(self.route);
        } else {
          self.route.geometry.setCoordinates(routeGeometry);
        }
      };

      /**
       * Меняет местами элементы списка при перетаскивании
       * @param from
       * @param to
       */
      this.drop = function(from, to) {
        console.log(from + ' <--> ' + to);
      };
  }])
  .directive('draggable', function() {
    return function(scope, element) {
      var elem = element[0];
      elem.draggable = true;
      elem.addEventListener('dragstart', function(event) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('Attributes', this.getAttribute("data-id"));
        return false;
      }, false);
      elem.addEventListener('dragend', function(event) {
        return false;
      }, false);
    }
  })
  .directive('droppable', function() {
    return {
      scope: {
        drop: '&'
      },
      link: function(scope, element) {
        var elem = element[0];
        elem.addEventListener('dragover', function(event) {
          if (event.preventDefault) {
            event.preventDefault();
          }
          this.classList.add('on-drop');
          return false;
        }, false);
        elem.addEventListener('dragenter', function(event) {
          return false;
        }, false);
        elem.addEventListener('dragleave', function (event) {
          this.classList.remove('on-drop');
          return false;
        }, false);
        elem.addEventListener('drop', function(event) {
          if (event.stopPropagation) {
            event.stopPropagation();
          }
          var to = this.getAttribute("data-id");
          var from = event.dataTransfer.getData("Attributes");
          scope.drop({from: from, to: to});
          return false;
        }, false);
      }
    }
  });