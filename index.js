(function(exports) {
  exports.works = function () {
    console.info('yes');
  };
})(typeof exports === 'undefined' ? this['versioning']={}: exports);