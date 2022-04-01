import template from '@common/ui/ibox-tools/ibox-tools.directive.html';
import StaticConfig from 'src/app/initialization/static-config';
import { ITimeoutService } from 'angular';

export /*@ngInject*/ function IboxToolsDirective($timeout: ITimeoutService) {
  return {
    scope: true,
    template,
    controller: /*@ngInject*/ function ($scope, $element) {
      $scope.showHide = function () {
        const ibox = $element.closest('div.ibox');
        const icon = $element.find('i:first');
        const content = ibox.find('div.ibox-content');
        content.slideToggle(200);

        icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');

        ibox.toggleClass('').toggleClass('border-bottom');

        // TODO czemu muszę czekać, żeby resizować pasek
        $timeout(() => {
          ibox.resize();
          ibox.find('[id^=map-]').resize();
        }, 50);
      };

      if ($scope.filter) {
        $scope.filter.showHide = $scope.showHide;
      }
    },
    link: function (scope) {
      $timeout(() => {
        if (StaticConfig.configuration.filterCollapsed) {
          scope.showHide();
        }
      });
    }
  };
}
