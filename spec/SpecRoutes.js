describe('Тесты для YaRoutes', function() {
  beforeEach(module('yaRoute'));
  var $controller;
  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  describe('Тестируем контроллер', function() {
    var $scope, controller, ctrl;

    /**
     * Инициализируем и создаем необходимые моки
     */
    beforeEach(inject(function() {
      $scope = {
        $digest: function() {}
      };
      controller = $controller("YRouteController as yrc", {$scope: $scope});
      ctrl = $scope.yrc;
      ctrl.ymaps = {
        Placemark: function() { return {
          events: {
            add: function() {}
          }
        }
      }};
      ctrl.ymap  = {
        getCenter: function() {}
      };
      ctrl.mapPoints = {
        add: function() {},
        remove: function() {}
      };
      spyOn(ctrl, "drawRoute");
    }));

    it('Контроллер доступен', function() {
      expect($scope.yrc).not.toEqual(undefined);
    });

    it('Добавление точки маршрута без названия не происходит', function() {
      var prevRoutePointsLength = ctrl.routePoints.length;
      ctrl.routePointName = "";
      ctrl.addRoutePoint();
      expect(ctrl.routePoints.length).toEqual(prevRoutePointsLength);
    });

    it('Проверка добавления точки маршрута', function() {
      ctrl.routePointName = "Test Route";
      var prevRoutePointLength = ctrl.routePoints.length;
      ctrl.addRoutePoint();
      expect(ctrl.routePoints.length).toEqual(prevRoutePointLength + 1);
    });

    it('Проверка удаления точки маршрута', function() {
      ctrl.routePoints = [{
        id: 112233
      }];
      ctrl.deleteRoutePoint(112233);
      expect(ctrl.routePoints.length).toEqual(0);
    });

    it("Проверка обработчика события drag'n'drop", function() {
      ctrl.routePoints = [
        {id: 17}, {id: 17234}
      ];
      ctrl.drop(17234, 17);
      expect(ctrl.routePoints[0].id).toEqual(17234);
      expect(ctrl.routePoints[1].id).toEqual(17);
    });
  });

  describe('Тестируем сервисы', function() {
    var maps;
    beforeEach(function() {
      inject(function(_maps_) {
        maps = _maps_;
      });
    });

    describe('Тестируем сервис "maps"', function() {
      it('Сервис "maps" доступен', function() {
        expect(angular.isObject(maps)).toBe(true);
      });

      it('Сервис "maps" возвращает колбэк', function() {
        expect(angular.isFunction(maps.ready)).toBe(true);
      });
    });

    describe('Тестируем загрузчик скрипта Яндекс.Карты', function() {
      var httpBackend, scriptLoader;
      beforeEach(function() {
        inject(function($httpBackend, _scriptLoader_, _config_) {
          scriptLoader = _scriptLoader_;
          httpBackend = $httpBackend;
          config = _config_;
        });
      });
      afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
      });

      it('Загрузчик скрипта доступен', function() {
        expect(angular.isFunction(scriptLoader)).toBe(true);
      });

      it('Загрузчик возвращает promise', function() {
        console.log(scriptLoader(config.scriptUrl));
        expect(scriptLoader(config.scriptUrl.then)).not.toEqual(undefined);
      });
    });
  });
});