import Dropzone from 'dropzone';
import './my-dropzone.css';
import './ng-dropzone.css';
/**!
 * AngularJS dropzone directive
 * @author Uday Hiwarale <uhiwarale@gmail.com>
 * https://www.github.com/thatisuday/ngDropzone
 */

Dropzone.autoDiscover = false;

const controlMethods = [
  'removeFile',
  'removeAllFiles',
  'processQueue',
  'getAcceptedFiles',
  'getRejectedFiles',
  'getQueuedFiles',
  'getUploadingFiles',
  'disable',
  'enable',
  'confirm',
  'createThumbnailFromUrl'
];

const callbackMethods = [
  'drop',
  'dragstart',
  'dragend',
  'dragenter',
  'dragover',
  'dragleave',
  'addedfile',
  'removedfile',
  'thumbnail',
  'error',
  'processing',
  'uploadprogress',
  'sending',
  'success',
  'complete',
  'canceled',
  'maxfilesreached',
  'maxfilesexceeded',
  'processingmultiple',
  'sendingmultiple',
  'successmultiple',
  'completemultiple',
  'canceledmultiple',
  'totaluploadprogress',
  'reset',
  'queuecomplete'
];

function loadMethodsTo(scope: any, dropzone: Dropzone) {
  for (const methodName of controlMethods) {
    scope.methods[methodName] = (...args) => {
      dropzone[methodName](...args);
      if (!scope.$$phase && !scope.$root.$$phase) {
        scope.$apply();
      }
    };
  }
}

function applyCallbacks(scope: any, dropzone: Dropzone) {
  for (const method of callbackMethods) {
    const callback = scope.callbacks[method] || angular.noop;
    dropzone.on(method, (...args) => {
      Reflect.apply(callback, null, args);
      if (!scope.$$phase && !scope.$root.$$phase) {
        scope.$apply();
      }
    });
  }
}

/*@ngInject*/
function NgDropzoneDirective(dropzoneOps) {
  return {
    template: '<div ng-transclude=""></div>',
    transclude: true,
    reaplce: true,
    scope: {
      options: '=?', //http://www.dropzonejs.com/#configuration-options
      callbacks: '=?', //http://www.dropzonejs.com/#events
      methods: '=?' //http://www.dropzonejs.com/#dropzone-methods
    },
    link: function (scope: any, iElem) {
      scope.options = scope.options || {};
      const initOps = angular.extend({}, dropzoneOps, scope.options);
      const dropzone = new Dropzone(iElem[0], initOps);
      scope.methods = scope.methods || {};
      scope.methods.getDropzone = () => {
        return dropzone;
      }; //Return dropzone instance
      scope.methods.getAllFiles = () => {
        return dropzone.files;
      }; //Return all files;
      loadMethodsTo(scope, dropzone);
      if (scope.callbacks) {
        applyCallbacks(scope, dropzone);
      }
    }
  };
}

function DropzoneOpsProvider() {
  const defOps = {};

  // noinspection JSUnusedGlobalSymbols
  return {
    setOptions: function (newOps) {
      angular.extend(defOps, newOps);
    },
    $get: function () {
      return defOps;
    }
  };
}

export default angular
  .module('thatisuday.dropzone', [])
  .provider('dropzoneOps', DropzoneOpsProvider)
  .directive('ngDropzone', NgDropzoneDirective).name;
