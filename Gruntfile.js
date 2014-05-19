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
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    "dist/animeapp.js": ['dist/animeapp.js']
                }
            }
        },
        watch: {
            angular: {
                files: ['src/frontend/**/*.js'],
                tasks: ['jshint', 'concat', 'uglify']
            },
            backend: {
                files: ['src/backend/**/*.js'],
                tasks: ['jshint']
            }
        },
        express: {
            dev: {
                options: {
                    script: 'src/backend/server.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-symlink');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'symlink']);
    grunt.registerTask('server', ['express:dev', 'watch']);
};