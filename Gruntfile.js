module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: "//==============\n"
            },
            dist: {
                src: ['src/frontend/*.js'],
                dest: 'dist/animeapp.js'
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js']
        },
        symlink: {
            views: {
                dest: 'public/animeapp/views',
                relativeSrc: '../../src/frontend/views',
                options: { type: 'dir' }
            },
            angular: {
                dest: 'public/js/animeapp.js',
                relativeSrc: '../../dist/animeapp.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-symlink');

    // Default task(s).
    grunt.registerTask('default', ['jshint','concat','symlink']);
};