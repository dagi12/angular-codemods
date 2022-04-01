import template from './my-auto-complete.html';
import './my-auto-complete.css';
import StaticConfig from 'src/app/initialization/static-config';
import { IQService, ITimeoutService } from 'angular';

const NIP_LENGTH = 10;
const CLIENT_AUTOCOMPLETE_ID_LIST = new Set([
  'client-autocomplete',
  'payer-autocomplete',
  'instructor-autocomplete'
]);

const modelOptions = {
  debounce: {
    default: 400,
    blur: 250
  }
};

export /*@ngInject*/ function MyAutoCompleteDirective($timeout: ITimeoutService) {
  return {
    scope: {
      id: '@?',
      label: '@?',
      placeholder: '@?',
      customStyle: '@?',
      customLabelStyle: '@?',
      ngModel: '=',
      ngIfInside: '<',
      textMethod: '@',
      textMethodNew: '<?',
      callback: '&?',
      resultSetItemText: '&?',
      querySearch: '&?',
      notFoundCallback: '&?',
      api: '=?',
      ngDisabled: '<?',
      ngIf: '<?',
      ngShow: '<?',
      mdNoCache: '=?'
    },
    transclude: true,
    controller: /*@ngInject*/ function ($scope, $q: IQService) {
      $scope.modelOptions = modelOptions;

      $scope.controller = {};

      $scope.clearAutocompleteWithSelected = () => {
        $scope.controller.searchItemText = null;
        // todo test
        $scope.ngModel = undefined;
        $scope.controller.ngModel = undefined;
      };

      if ($scope.api) {
        $scope.api.clear = $scope.clearAutocompleteWithSelected;
      }

      $scope.clearAutocomplete = function (event) {
        // TODO czemu muszę czekać, żeby wyczyścić autocomplete
        $timeout(() => {
          if (
            !!$scope.controller.ngModel &&
            (!event.target.value || typeof $scope.controller.ngModel === 'string')
          ) {
            $scope.controller.ngModel = undefined;
          }
        }, 300);
      };

      $scope.querySearchDirectiveMethod = function (searchItemText) {
        if (
          CLIENT_AUTOCOMPLETE_ID_LIST.has($scope.id) &&
          StaticConfig.configuration.logicConfig.exactClientSearch &&
          searchItemText.length < NIP_LENGTH
        ) {
          return $q.when([]);
        }
        const itemList = $scope.querySearch({ searchItemText });
        itemList.then(list => {
          if (list.length === 0 && $scope.notFoundCallback) {
            $scope.notFoundCallback({ id: $scope.id, searchItemText });
          }
        });
        return itemList;
      };

      $scope.$watch('ngModel', value => {
        $scope.controller.ngModel = value;
      });

      $scope.typeAheadOnSelect = (item, model) => {
        $scope.controller.ngModel = model;
        $scope.directiveCallback();
      };

      $scope.directiveCallback = function () {
        $scope.ngModel = $scope.controller.ngModel;
        if ($scope.callback) {
          $timeout(() => {
            $scope.callback({
              ngModel: $scope.controller.ngModel
            });
          });
        }
      };

      $scope.itemTextDirectiveMethod = !$scope.textMethod
        ? item => $scope.textMethodNew(item)
        : item => {
            if (!item) {
              return null;
            }
            if (typeof item[$scope.textMethod] === 'function') {
              return item[$scope.textMethod]();
            }
            return item[$scope.textMethod];
          };

      $scope.resultItemTextDirectiveMethod = function (item) {
        if (!$scope.resultSetItemText) {
          return $scope.itemTextDirectiveMethod(item);
        }
        if (!item) {
          return null;
        }
        return $scope.resultSetItemText({ item });
      };
    },
    compile: function (element, attrs) {
      attrs.id = attrs.id || 'ordering-person-autocomplete';
      attrs.ngIfInside = attrs.ngIfInside || 'true';
      attrs.querySearch = attrs.querySearch || 'querySearch(searchItemText)';
      return {
        post: scope =>
          $timeout(() => {
            // eslint-disable-next-line unicorn/no-array-callback-reference
            if (element.find('input').attr('disabled')) {
              scope.hideButton = true;
            }
          })
      };
    },
    template
  };
}
