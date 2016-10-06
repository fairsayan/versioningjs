(function(exports) {
var minTokenLength = 3;
exports.versioningLabel = 'versioning';

/***
  * Return tokens of the current string you will find in the previous one with the relative positions
  * @param string
  * @param string
  * @return [{
  *   currentPos: number
  *   previousPos: number
  *   size: number
  * }]
  */
exports.strMapping = function (current, previous) {
  var result = [];
  var consolidatedCurrentPos = 0;
  var consolidatedPreviousPos = 0;

  while (current.length >= minTokenLength) {
    
    var size = minTokenLength;
    var pos = null, trialPos;
    do {
      var trial = current.substring(0, size++);
      trialPos = previous.indexOf(trial);
      if (trialPos !== -1) pos = trialPos;
    } while (trialPos !== -1 && size - 1 <= current.length);
    size -= 2;
    if (pos !== null) {
      result.push({
        currentPos: consolidatedCurrentPos,
        previousPos: consolidatedPreviousPos + pos,
        size: size
      });
      current = current.substring(size);
      previous = previous.substring(pos + size);
      consolidatedCurrentPos += size;
      consolidatedPreviousPos += pos + size;
    } else {
      current = current.substring(1);
      consolidatedCurrentPos++;
    }
  }
  return result;
};

/***
  * Return differences to go back from current to previous
  * @param string
  * @param string
  * @return [{
  *   start: number
  *   size: number
  *   substitution: string
  * }]
  */
exports.strDiff = function (current, previous) {
  var map = exports.strMapping(current, previous);
  var result = [];

  for (var i = map.length - 1; i >= 0; i--) {
    var currentNextPos = (i < map.length - 1 ? map[i + 1].currentPos : current.length);
    var previousNextPos = (i < map.length - 1 ? map[i + 1].previousPos : previous.length);
    var el = {
      start: map[i].currentPos + map[i].size,
      size: currentNextPos - map[i].currentPos - map[i].size,
      substitution: previous.substring(map[i].previousPos + map[i].size, previousNextPos)
    };
    if (el.size > 0 || el.substitution !== '') result.push(el);
  }

  // starting token
  if (map.length > 0) {
    var firstEl = {
      start: 0,
      size: map[0].currentPos,
      substitution: previous.substring(0, map[0].previousPos)
    };
    if (firstEl.size > 0 || firstEl.substitution !== '') result.push(firstEl);
  } else if (current !== previous) {
    result.push({
      start: 0,
      size: current.length,
      substitution: previous
    });
  }
  return result;
};

exports.strGetPrevious = function (current, diff) {
  for (var i = 0; i < diff.length; i++) {
    var before = current.substring(0, diff[i].start);
    var after = current.substring(diff[i].start + diff[i].size, current.length);
    current = before + diff[i].substitution + after;
  }
  return current;
};

/***
  * If data contains versioning it will pull out versioning info. It returns useful info regarding versioning
  * @param object if versioning is inside 
  * @param object
  * @return {
      isVersioningInsideData: boolean,
      isDeleted: boolean
      versioning: object
      dataWithoutVersioning: object
    }
  */
var pullOutVersioning = function (data, options) {
  var versioning, isVersioningInsideData = false;

  if (typeof options === 'undefined') options = {};
  if (typeof options.versioning === 'undefined') {
    isVersioningInsideData = true;
    versioning = data[exports.versioningLabel];
    if (typeof versioning === 'undefined') versioning = { history: [] };
    data[exports.versioningLabel] = undefined;
  } else {
    versioning = options.versioning;
    if (typeof versioning === 'undefined') versioning = { history: [] };
    if (typeof versioning.history === 'undefined') versioning.history = [];
  }

  return {
    versioning: versioning,
    isVersioningInsideData: isVersioningInsideData,
    isDeleted: (versioning.history.length > 0 && versioning.history[versioning.history.length - 1].action === 'deleted')
  };
};


/***
  * If options.versioning is not provided, versioning info will be added in data
  * @param object
  * @param object
  * @return boolean
  */
exports.push = function (data, options) {
  var info = pullOutVersioning(data, options);
  if (info.isDeleted) return false;

  var history = info.versioning.history;
  var strData = JSON.stringify(data);

  if (history.length > 0) {
    history.push({
      action: 'updated',
      date: new Date(),
      diff: exports.strDiff(strData, info.versioning.strLast)
    });
    
  } else history.push({
    action: 'created',
    date: new Date()
  });
  info.versioning.strLast = strData;

  if (info.isVersioningInsideData) data[exports.versioningLabel] = info.versioning;
  return true;
};

/***
  * It returns the last value stored and deletes it.
  * The last value stored in versioning will be used as current value, not the data value
  * @param object
  * @param object
  * @return object | undefined the old value if there is an old value
  */
exports.pop = function (data, options) {
  var info = pullOutVersioning(data, options);
  var history = info.versioning.history;
  if (history.length === 0) return;
  var strLast = info.versioning.strLast;
  var previous = history.pop();
  if (previous.action === 'created') return; // no more history
  
  if (previous.action !== 'deleted') info.versioning.strLast = exports.strGetPrevious(strLast, previous.diff);
  var result = JSON.parse(info.versioning.strLast);

  if (info.isVersioningInsideData) result[exports.versioningLabel] = info.versioning;
  return result;
};

/***
  * @param object
  * @param object
  * @return boolean
  */
exports.delete = function (data, options) {
  var info = pullOutVersioning(data, options);
  if (info.isDeleted) return false;

  var history = info.versioning.history;

  history.push({
    action: 'deleted',
    date: new Date()
  });

  if (info.isVersioningInsideData) data[exports.versioningLabel] = info.versioning;
  return true;
};

/***
  * It retrieves the previous value, but it doesn't delete the history, just add a "rollback" action
  *  @return object | undefined the old value if there is an old value
  */
exports.rollback = function (data, options) {
  var info = pullOutVersioning(data, options);
  var history = info.versioning.history;
  var strPrevious = info.versioning.strLast, isPreviousValid = false;

  for (var i = history.length - 1; i >= 0 && !isPreviousValid; i--) {
    var el = history[i];
    if (el.action !== 'rollback' && el.action !== 'created') isPreviousValid = true;
    if (el.action === 'rollback' || el.action === 'updated') 
      strPrevious = exports.strGetPrevious( strPrevious, el.diff );
  }
  if (!isPreviousValid) return;
  var result = JSON.parse(strPrevious);
  
  history.push({
    action: 'rollback',
    date: new Date(),
    diff: exports.strDiff(strPrevious, info.versioning.strLast)
  });
  info.versioning.strLast = strPrevious;

  if (info.isVersioningInsideData) result[exports.versioningLabel] = info.versioning;
  return result;
};

})(typeof exports === 'undefined' ? this.versioning={}: exports);