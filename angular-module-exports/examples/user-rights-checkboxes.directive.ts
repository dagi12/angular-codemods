// @ts-ignore
import template from "./user-rights-checkboxes.html";
// @ts-ignore
import StaticConfig from "src/app/initialization/static-config";
// @ts-ignore
import { ExtendedConfig } from "src/zamowienia-openapi";

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
