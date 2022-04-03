import StaticConfig from "src/app/initialization/static-config";
import { ExtendedConfig } from "src/zamowienia-openapi";
import template from "./user-rights-checkboxes.html";

export /*@ngInject*/ function UserRightsCheckboxes() {
  return {
    scope: {
      ngModel: "=",
      auth: "<",
      mixed: "=",
    },
    link: function (scope) {
      scope.rentTypeOut =
        StaticConfig.configuration.rentInOut ===
        ExtendedConfig.RentInOutEnum.OUT;

      scope.checkDifferentClients = function () {
        if (!scope.ngModel.differentOrdering && scope.auth === "KLIE") {
          scope.ngModel.differentClients = false;
        }
      };

      scope.label =
        (scope.auth === "KLIE" && "Zamawia dla różnych klientów") ||
        (scope.auth === "PRAC" && "Zamawia dla różnych osób");
    },
    template,
  };
}
