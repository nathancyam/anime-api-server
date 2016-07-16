module.exports = function () {
  return {
    files: [
      'src/**/*.js',
      '!src/controllers/*.js',
      'tests/unit/**/fixtures/*'
    ],

    tests: [
      'tests/unit/**/*Test.js'
    ],

    testFramework: 'mocha',

    env: {
      type: 'node',
      runner: 'node'  // or full path to any node executable
    }
  };
};
