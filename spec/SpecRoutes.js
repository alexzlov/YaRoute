describe('Тесты для YaRoutes', function() {
  beforeEach(module('yaRoute'));
  var $controller;
  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  describe('Тестируем контроллер', function() {
    var $scope, controller, ctrl;

    beforeEach(inject(function() {
      $scope = {};
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
  });
});