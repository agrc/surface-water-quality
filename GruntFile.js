module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html'
    ];
    var gruntFile = 'GruntFile.js';
    var jshintFiles = [jsFiles, gruntFile, 'profiles/*.js'];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat(['src/ChangeLog.html']),
                push: false
            }
        },
        clean: {
      // vendor/*.* and package.json break the build
            build: ['dist'],
            deploy: ['deploy']
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['*.html'],
                        dest: 'dist/'
                    }
                ]
            }
        },
        dojo: {
            prod: {
                options: {
          // You can also specify options to be used in all your tasks
                    profiles: [
                        'profiles/prod.build.profile.js',
                        'profiles/build.profile.js'
                    ] // Profile for build
                }
            },
            stage: {
                options: {
          // You can also specify options to be used in all your tasks
                    profiles: [
                        'profiles/stage.build.profile.js',
                        'profiles/build.profile.js'
                    ] // Profile for build
                }
            },
            options: {
        // You can also specify options to be used in all your tasks
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
            // exclude tests because some images in dojox throw errors
                        src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                        dest: 'src/'
                    }
                ]
            }
        },
        jasmine: {
            main: {
                src: ['src/app/run.js'],
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc',
                fix: true
            },
            main: {
                src: jshintFiles
            }
        },
        processhtml: {
            options: {},
            main: {
                files: {
                    'dist/index.html': ['src/index.html']
                }
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true, // eslint-disable-line camelcase
                    passes: 2,
                    dead_code: true // eslint-disable-line camelcase
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false // eslint-disable-line camelcase
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist',
                        src: '**/*.js',
                        dest: 'dist'
                    }
                ]
            }
        },
        watch: {
            eslint: {
                files: jshintFiles,
                tasks: ['eslint:main', 'jasmine:main:build']
            },
            src: {
                files: jshintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            }
        }
    });

  // Default task.
    grunt.registerTask('default', [
        'jasmine:main:build',
        'eslint:main',
        'connect',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'clean:build',
        'newer:imagemin:main',
        'dojo:prod',
        'uglify:prod',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'newer:imagemin:main',
        'dojo:stage',
        'uglify:stage',
        'copy:main',
        'processhtml:main'
    ]);
};
