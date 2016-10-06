var assert = require('assert');
var versioning = require('./index.js');

describe('strMapping', () => {
  it('returns one token with longer current', () => {
    var current = 'aaa bbb ccc';
    var previous = 'bbb';
    var result = versioning.strMapping(current, previous);
    assert.equal(result.length, 1);
    assert.equal(result[0].currentPos, 4);
    assert.equal(result[0].previousPos, 0);
    assert.equal(result[0].size, 3);
  });

  it('returns one token with shorter current', () => {
    var current = 'bbb';
    var previous = 'aaa bbb ccc';
    var result = versioning.strMapping(current, previous);
    assert.equal(result.length, 1);
    assert.equal(result[0].currentPos, 0);
    assert.equal(result[0].previousPos, 4);
    assert.equal(result[0].size, 3);
  });

  it('returns many elements', () => {
    var current = 'our reveals now are ended';
    var previous = 'forget our reveals, but now are not ended';
    var result = versioning.strMapping(current, previous);
    assert.equal(result.length, 3);
  });

});

describe('strDiff & strGetPrevious', () => {
  it('first try', () => {
    var current = 'our reveals now are ended, these our actors were all spirits';
    var previous = 'forget our reveals, they were not.';
    var diff = versioning.strDiff(current, previous);
    var rolledBack = versioning.strGetPrevious(current, diff);
    assert.equal(previous, rolledBack);
  });

  it('second try', () => {
    var current = 'totally different';
    var previous = '11111';
    var diff = versioning.strDiff(current, previous);
    var rolledBack = versioning.strGetPrevious(current, diff);
    assert.equal(previous, rolledBack);
  });

  it('edge try', () => {
    var current = 'aaabbbcccdddeeefff';
    var ending = 'fff';
    var starting = 'aaa';
    var diff = versioning.strDiff(current, ending);
    var rolledBack = versioning.strGetPrevious(current, diff);
    assert.equal(ending, rolledBack);
    diff = versioning.strDiff(current, starting);
    rolledBack = versioning.strGetPrevious(current, diff);
    assert.equal(starting, rolledBack);
  });

});

describe.only('general functions:', () => {
  it('rollback', () => {
    var data = {
      title: 'Lord Of The Rings',
      characters: ['Frodo', 'Gandalf', 'Aragorn']
    };
    versioning.push(data);
    data.characters.push('Legolas');
    versioning.push(data);
    data = versioning.rollback(data);
    assert.equal(data.characters.length, 3);
    assert.equal(data.versioning.history.length, 3);
    assert.equal(data.characters[0], 'Frodo');
    assert.equal(data.characters[1], 'Gandalf');
    assert.equal(data.characters[2], 'Aragorn');
  });

  it('pop', () => {
    var data = {
      title: 'Lord Of The Rings',
      characters: ['Frodo', 'Gandalf', 'Aragorn']
    };
    versioning.push(data);
    data.characters.push('Legolas');
    versioning.push(data);
    data = versioning.pop(data);
    assert.equal(data.versioning.history.length, 1);
    assert.equal(data.characters[0], 'Frodo');
    assert.equal(data.characters[1], 'Gandalf');
    assert.equal(data.characters[2], 'Aragorn');
  });

  it('delete', () => {
    var data = {
      title: 'Lord Of The Rings',
      characters: ['Frodo', 'Gandalf', 'Aragorn']
    };
    versioning.push(data);
    assert.equal(versioning.delete(data), true);
    data.characters.push('Legolas');
    assert.equal(versioning.push(data), false);
  });
});