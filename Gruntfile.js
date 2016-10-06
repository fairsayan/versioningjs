module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['Gruntfile.js', 'index.js', 'test.js']
    },
    uglify: {
      target: {
        files: {
          'index.min.js': ['./index.js']
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'nyan',
          clearRequireCache: true
        },
        src: ['test.js']
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'mochaTest', 'uglify:target']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['watch']);
};