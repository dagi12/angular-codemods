import { IComponentOptions, IController } from "angular";
import StaticConfig from "src/app/initialization/static-config";
import { ExtendedConfig } from "src/zamowienia-openapi";
import template from "./user-rights-checkboxes.html";

class UserRightsCheckboxesController implements IController {
  rentTypeOut: boolean;
  label: string;
  auth: string;
  ngModel: any;

  /*@ngInject*/
  constructor() {}

  $onInit() {}

  $postLink() {
    this.rentTypeOut =
      StaticConfig.configuration.rentInOut === ExtendedConfig.RentInOutEnum.OUT;

    this.label =
      (this.auth === "KLIE" && "Zamawia dla różnych klientów") ||
      (this.auth === "PRAC" && "Zamawia dla różnych osób");
  }

  checkDifferentClients = () => {
    if (!this.ngModel.differentOrdering && this.auth === "KLIE") {
      this.ngModel.differentClients = false;
    }
  };
}

const UserRightsCheckboxesComponent: IComponentOptions = {
  bindings: {
    ngModel: "=",
    auth: "<",
    mixed: "=",
  },
  controller: UserRightsCheckboxesController,
  template,
};
