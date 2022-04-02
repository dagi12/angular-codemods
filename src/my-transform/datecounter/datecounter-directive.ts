import html from 'src/app/pickdrop/dropoff/datecounter/datecounter-directive.html';

function checkPlaces(scope, model) {
  if (scope.parent.wyPlanUKl && !model.wyFaktMiejsce) {
    return 'Podaj miejsce wyjazdu z wypożyczalni.';
  }

  if (scope.parent.wyPlanUKl && !model.wyjazdData) {
    return 'Podaj date wyjazdu z wypożyczalni.';
  }
  if (
    (scope.parent.wyPlanUKl && !model.wyFaktUKlMiejsce) ||
    (!scope.parent.wyPlanUKl && !model.wyFaktMiejsce)
  ) {
    return 'Podaj miejsce wydania klientowi';
  }
}

function checkDates(scope, model) {
  if (scope.parent.wyPlanUKl && !model.wyjazdLicznik) {
    return 'Podaj stan licznika przy wyjeździe z wypożyczalni.';
  }
  if (scope.parent.wyPlanUKl && !model.wyjazdPaliwo) {
    return 'Podaj stan paliwa przy wyjeździe z wypożyczalni.';
  }
  if (!model.wyFaktData) {
    return 'Podaj date wydania';
  }
  if (scope.parent.wyPlanUKl && model.wyFaktData.getTime() < model.wyjazdData.getTime()) {
    return 'Data wyjazdu z wypożyczalni musi być mniejsza niż data wydania klientowi';
  }
}

function checkCounterAndFuel(scope, model) {
  if (!model.wyStanLicz) {
    return 'Podaj stan licznika przy wydaniu klientowi';
  }
  if (scope.parent.wyPlanUKl && model.wyjazdLicznik > model.wyStanLicz) {
    return 'Stsn licznika wyjazdu z wypożyczalni musi być mniejszy niż licznik przy wydaniu klientowi';
  }

  if (!model.wyStanPal) {
    return 'Podaj stan paliwa przy wydaniu klientowi';
  }
  if (model.wyStanPal > 100) {
    return 'Stan paliwa przy wydaniu nie może być większy niż 100%';
  }
}

export function DatecounterDirective() {
  return {
    scope: false,
    controller: /*@ngInject*/ function ($scope) {
      $scope.rentalPlaceChange = ({ rentalPlace }) => {
        $scope.parent.rentcar.wyFaktMiejsce = rentalPlace;
      };
    },
    link: function (scope) {
      scope.parent.wizardManager.setVerification(
        '/datecounter',
        () => {
          const model = scope.parent.rentcar;
          return (
            checkPlaces(scope, model) ||
            checkDates(scope, model) ||
            checkCounterAndFuel(scope, model)
          );
        },
        true
      );
    },
    template: html
  };
}
