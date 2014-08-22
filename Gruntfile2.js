// This is Grunt configuration file
// Grunt is used for pre-processing static assets so they can be served directly by nginx

// Use of '/dist':
// 1) It is the directory where the processed assets are stored
// 2) Most files will be served by nginx directly from it, unless the file still need node handling (e.g. index.html)
// 3) Files directly served by nginx should be stored zipped for production mode and unzipped for all other modes

// Main available options (just run them on command line):
// "grunt development" or "grunt devel"     -> development mode
// "grunt production" or "grunt prod"       -> production mode
// "grunt development_chrome" or "grunt devel_chrome"     -> chromeApp development mode
// "grunt production_chrome" or "grunt prod_chrome"       -> chromeApp production mode
// "grunt test"                             -> unit tests mode
// "grunt test-cover"                       -> test coverage mode on unit or on standard client usage

// Other options:
// "grunt set_version:<version> <mode>"     -> set_version called before <mode> will set the version number at about.html

// Known issues:
// 1) The plugin grunt-recess has an issue when generating style.css compilation from .less (only production build)
//    The function webkit-calc() has an issue, so the timestamps on conversation feed appear not aligned.
//    Workaround was not to do less compilation for style.less at Grunt anymore, so any request for style.css
//       is delivered to NodeJS, which will use lessmiddleware to dynamically parse the style.less. This is the
//       only known 'compiling' scenario where the problem does not happen.
//    The module grunt-contrib-less was tried as an alternative to grunt-recess, but it shows multiple compilation
//       problems of our existing code.
//    We may return using grunt-recess usage in the future if newer version of it (or newer versions of our own
//       less files) does not present the problem anymore.


module.exports = function(grunt) {
    var gruntLessMiddleware = require('grunt-less-middleware');

    var less_css = {
        rootCss: 'style.css',
        dest: 'build/',         // this is where css files will be generated
        src: 'less/',           // this is where less files exist
        prefix: '/css',         // this should be used in web-pages
        compress: true,         // YUI compress has issues with bootstrap, so use uglify
        optimization: 2,
        force: false,
        debug: true,
        once: true,
        dumpLineNumbers: false
    };

    "use strict";

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            // options: { separator: ';' },   // not used because it breaks csso
            thirdparty: {
                src: null,
                dest: 'build/thirdparty.js.concat'
            },
            business: {
                src: null,
                dest: 'build/business.js.concat'
            },
            ui: {
                src: null,
                dest: 'build/ui.js.concat'
            },
            css: {
                src: null,
                dest: 'build/thirdparty.css.concat'
            }
        },

        uglify: {
            thirdparty: {
                src: 'build/thirdparty.js.concat',
                dest: 'build/thirdparty.js.min'
            },
            business: {
                src: 'build/business.js.concat',
                dest: 'build/business.js.min'
            },
            ui: {
                src: 'build/ui.js.concat',
                dest: 'build/ui.js.min'
            }
        },

        csso: {
            options: {
                restructure: false // just being more conservative.. furthermore, it did not help on final size
            },
            thirdparty: {
                src: 'build/thirdparty.css.concat',
                dest: 'build/thirdparty.css.min'
            }
        },

        compress: {
            thirdparty: {
                src: 'build/thirdparty.js.min',
                dest: '<%= compress.output %>/thirdparty.js.gz'
            },
            business: {
                src: 'build/business.js.min',
                dest: '<%= compress.output %>/business.js.gz'
            },
            ui: {
                src: 'build/ui.js.min',
                dest: '<%= compress.output %>/ui.js.gz'
            },
            css: {
                src: 'build/thirdparty.css.min',
                dest: '<%= compress.output %>/thirdparty.css.gz'
            },
            style: {
                src: 'build/style.css',
                dest: 'build/style.css.gz'
            },
            about: {
                src: '<%= compress.output %>/about.html',
                dest: '<%= compress.output %>/about.html.gz'
            },
            badbrowser: {
                src: '<%= compress.output %>/badBrowser.html',
                dest: 'build/badBrowser.html.gz'
            },
            badlandbrowser: {
                src: '<%= compress.output %>/badLandingBrowser.html',
                dest: 'build/badLandingBrowser.html.gz'
            },
            iosbrowser: {
                src: '<%= compress.output %>/iosBrowser.html',
                dest: 'build/iosBrowser.html.gz'
            },
            unavailableplatform: {
                src: '<%= compress.output %>/unavailablePlatform.html',
                dest: 'build/unavailablePlatform.html.gz'
            },
            unavailableForAndroid: {
                src: '<%= compress.output %>/unavailableForAndroid.html',
                dest: 'build/unavailableForAndroid.html.gz'
            }
        },

        rename: {
            thirdparty: {
                src: '<%= rename.output %>/thirdparty.js.gz',
                dest: '<%= rename.output %>/thirdparty.js',
                options: {
                    ignore: true,
                }
            },
            thirdparty_dev: {
                src: 'build/thirdparty.js.concat',
                dest: '<%= rename.output %>/thirdparty.js',
                options: {
                    ignore: true,
                }
            },
            business: {
                src: '<%= rename.output %>/business.js.gz',
                dest: '<%= rename.output %>/business.js',
                options: {
                    ignore: true,
                }
            },
            business_dev: {
                src: 'build/business.js.concat',
                dest: '<%= rename.output %>/business.js',
                options: {
                    ignore: true,
                }
            },
            ui: {
                src: '<%= rename.output %>/ui.js.gz',
                dest: '<%= rename.output %>/ui.js',
                options: {
                    ignore: true,
                }
            },
            ui_dev: {
                src: 'build/ui.js.concat',
                dest: '<%= rename.output %>/ui.js',
                options: {
                    ignore: true,
                }
            },
            css: {
                src: '<%= rename.output %>/thirdparty.css.gz',
                dest: '<%= rename.output %>/thirdparty.css',
                options: {
                    ignore: true,
                }
            },
            css_dev: {
                src: 'build/thirdparty.css.concat',
                dest: '<%= rename.output %>/thirdparty.css',
                options: {
                    ignore: true,
                }
            },

            hash_thirdparty_js: {
                hash: null,                 // is filled later
                src: '<%= rename.output %>/thirdparty.js',
                dest: '<%= rename.output %>/thirdparty<%= rename.hash_thirdparty_js.hash %>.js',
                options: {
                    ignore: true,
                }
            },
            hash_business_js: {
                hash: null,                 // is filled later
                src: '<%= rename.output %>/business.js',
                dest: '<%= rename.output %>/business<%= rename.hash_business_js.hash %>.js',
                options: {
                    ignore: true,
                }
            },
            hash_ui_js: {
                hash: null,                 // is filled later
                src: '<%= rename.output %>/ui.js',
                dest: '<%= rename.output %>/ui<%= rename.hash_ui_js.hash %>.js',
                options: {
                    ignore: true,
                }
            },
            hash_thirdparty_css: {
                hash: null,                 // is filled later
                src: '<%= rename.output %>/thirdparty.css',
                dest: '<%= rename.output %>/thirdparty<%= rename.hash_thirdparty_css.hash %>.css',
                options: {
                    ignore: true,
                }
            },
            style: {
                src: 'build/style.css.gz',
                dest: '<%= rename.output %>/style.css'
            },
            style_dev: {
                src: 'build/style.css',
                dest: '<%= rename.output %>/style.css'
            },
            about: {
                src: '<%= rename.output %>/about.html.gz',
                dest: '<%= rename.output %>/about.html'
            },
            about_dev: {
                src: 'build/about.html',
                dest: '<%= rename.output %>/about.html'
            },
            badbrowser: {
                src: 'build/badBrowser.html.gz',
                dest: '<%= rename.output %>/badBrowser.html'
            },
            badlandingbrowser: {
                src: 'build/badLandingBrowser.html.gz',
                dest: '<%= rename.output %>/badLandingBrowser.html'
            },
            iosbrowser: {
                src: 'build/iosBrowser.html.gz',
                dest: '<%= rename.output %>/iosBrowser.html'
            },
            unavailableplatform: {
                src: 'build/unavailablePlatform.html.gz',
                dest: '<%= rename.output %>/unavailablePlatform.html'
            },
            unavailableForAndroid: {
                src: 'build/unavailableForAndroid.html.gz',
                dest: '<%= rename.output %>/unavailableForAndroid.html'
            }
        },

        cachebuster: {
            production: {
                options: {
                    format: 'json',
                    basedir: '<%= cachebuster.output %>/'
                },
                src: [
                    '<%= cachebuster.output %>/thirdparty.js',
                    '<%= cachebuster.output %>/business.js',
                    '<%= cachebuster.output %>/ui.js',
                    '<%= cachebuster.output %>/thirdparty.css'
                ],
                dest: 'build/hash_mapping.json'
            },
            development: {
                options: {
                    format: 'json',
                    basedir: '<%= cachebuster.output %>/'
                },
                src: [
                    '<%= cachebuster.output %>/thirdparty.js',
                    '<%= cachebuster.output %>/thirdparty.css'
                ],
                dest: 'build/hash_mapping.json'
            }
        },

        replace: {
            manifest_data: {
                src: 'manifest.json',
                dest: 'manifest.json',
                version: null,       // is filled later
                replacements: [
                    {
                        from: /("version": ".*")/g,
                        to: '"version": "<%= replace.manifest_data.version %>"'
                    }
                ]
            },
            fix_paths_for_concat: {
                src: 'config/client.json',
                dest: 'build/files_for_concat.json',
                replacements: [
                    {
                        from: 'imp/',
                        to: ''
                    },
                    {
                        from: '"common/',
                        to: '"../common/'
                    }
                ]
            },
            fix_paths_for_html: {
                src: 'config/client.json',
                dest: 'build/files_for_html_render.json',
                replacements: [
                    {
                        from: 'common/lib',
                        to: '/lib'
                    },
                    {
                        from: 'imp/js',
                        to: '/js'
                    },
                    {
                        from: 'common/js',
                        to: '/js'
                    },
                    {
                        from: 'infrastructure/',
                        to: '/infrastructure/'
                    }
                ]
            },
            js_into_html: {
                src: [ 'badBrowser.html', 'badLandingBrowser.html', 'iosBrowser.html', 'unavailablePlatform.html', 'unavailableForAndroid.html' ],
                dest: 'dist/',
                replacements: [
                    {
                        from: /<script type="text\/javascript" src="([^"]*)">/g,
                        to: function (matchedWord, index, fullText, regexMatches) {
                            var text = '';
                            if (grunt.file.exists(regexMatches[0])) {
                                text = grunt.file.read(regexMatches[0]);
                            }
                            return '<script type="text/javascript">\n' + text + '\n    ';
                        }
                    }
                ]
            },
            fix_paths_for_appcache: {
                src: 'build/ansible.appcache',
                dest: '<%= grunt.option(\"manifestDir\") %>/ansible.appcache',
                replacements: [
                    {
                        from: /\n([a-z].*)/g,
                        to: '\n/$1'
                    }
                ]
            },
            fix_index_production: {
                src: 'index.html',
                dest: 'build/index.html',
                replacements: [
                    {
                        from: /(<html lang=.*)>/g,
                        to: '$1 manifest=\"manifest/ansible.appcache\">'
                    },
                    {
                        from: /(<link rel="stylesheet" href=")css(\/style.css">)/g,
                        to: '$1dist$2'
                    }
                ]
            },
            fix_index_refs: {
                src: 'dist/index.html',
                dest: 'dist/index.html',
                replacements: [
                    {
                        from: /<link rel="stylesheet" href="(dist\/[^"]*)"(.*>)/g,
                        to: function (matchedWord, index, fullText, regexMatches) {
                            if (grunt.file.exists(regexMatches[0])) {
                                return matchedWord;
                            }
                            grunt.log.write('Removed reference to "' + regexMatches[0] + '" in index.html.\n');
                            return '';
                        }
                    },
                    {
                        from: /<script type="text\/javascript" src="(dist\/[^"]*)"(.*>)/g,
                        to: function (matchedWord, index, fullText, regexMatches) {
                            if (grunt.file.exists(regexMatches[0])) {
                                return matchedWord;
                            }
                            grunt.log.write('Removed reference to "' + regexMatches[0] + '" in index.html.\n');
                            return '';
                        }
                    }
                ]
            },
        },

        render: {
            index_production: {
                options: {
                    hash_mapping: null,       // is filled later
                    expand: false,
                    injected: false
                },
                files: {
                    '<%= render.output %>/index.html': [ 'build/index.html' ]
                }
            },
            index_development: {
                options: {
                    hash_mapping: null,       // is filled later
                    unpacked_files: null,     // is filled later
                    expand: true,
                    injected: false
                },
                files: {
                    '<%= render.output %>/index.html': [ 'index.html' ]
                }
            },
            runner_test: {
                options: {
                    unpacked_files: null,     // is filled later
                    injected: false
                },
                files: {
                    '<%= render.output %>/runner.html': [ '../infrastructure/unit/imp/runner.html' ]
                }
            },
            about: {
                options: {
                    version: 'undefined'      // is filled later
                },
                files: {
                    '<%= render.output %>/about.html' : [ 'views/modals/about.html' ]
                }
            }
        },

        recess: {
            options: {
                compile: true,
                compress: true
            },
            production: {
                files: {
                    "build/style.css.min": "less/style.less"
                    // recess show lint error on thirdparty.css.min, so let csso doing the job
                    //'build/thirdparty.css.min': 'build/thirdparty.css.concat'
                }
            },
            development: {
                files: {
                    "dist/style.css": "less/style.less"
                }
            }
        },

        shell: {
            generateLanguageFiles: {
                command: 'cd resources/i18n && ./convmastertoresource.pl resources-locale_master.json'
            }
        },

        clean: {
            all: [ 'build/*', '<%= clean.output %>/*', 'chrome_app_gen.html', 'manifest/*.appcache' ],
            build: [ 'build/*' ]
        },

        manifest: {
          generate: {
            options: {
              basePath: "",
              cache: [],
              network: ["*"],
//              fallback: [],
              exclude: [],
              preferOnline: false,
              verbose: true,
              timestamp: true
            },
            src: grunt.file.readJSON('config/appcache.json').manifest,
            dest: 'build/ansible.appcache'
          }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-csso');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-ejs-render');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-cachebuster');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-manifest');


    grunt.registerTask('compile_less_to_css', 'Compiles less files to css, using the less-middleware framework', function() {
        var processorHandler = this.async();
        var lessConfig = gruntLessMiddleware(processorHandler, less_css);
    });

    grunt.registerTask('set_paths_for_concat', 'Fix paths for running concatenation', function() {
        var content = grunt.file.readJSON('build/files_for_concat.json');
        grunt.config('concat.thirdparty.src', content.javascript.thirdparty);
        grunt.config('concat.business.src', content.javascript.business);
        grunt.config('concat.ui.src', content.javascript.ui);
        grunt.config('concat.css.src', content.stylesheets);
        return true;
    });

    grunt.registerTask('set_paths_for_index', 'Fix paths for rendering correctly file references on index.html', function(isInjected) {
        var content = grunt.file.readJSON('build/files_for_html_render.json');
        grunt.config('render.index_development.options.unpacked_files', content.javascript);
        if (isInjected == 1)
            grunt.config('render.index_development.options.injected', true);
        return true;
    });

    grunt.registerTask('set_paths_for_runner', 'Fix paths for rendering correctly file references on runner.html', function(isInjected) {
        var content = grunt.file.readJSON('build/files_for_html_render.json');
        grunt.config('render.runner_test.options.unpacked_files', content.javascript);
        if (isInjected == 1)
            grunt.config('render.runner_test.options.injected', true);
        return true;
    });

    grunt.registerTask('set_hash_mapping', 'Set hash mapping for allowing fingerprinting of pre-processed assets', function(isProduction) {
        var hash_map = grunt.file.readJSON('build/hash_mapping.json');
        grunt.config('rename.hash_thirdparty_js.hash', hash_map["thirdparty.js"]);
        grunt.config('rename.hash_thirdparty_css.hash', hash_map["thirdparty.css"]);
        if (isProduction == 1) {
            grunt.config('render.index_production.options.hash_mapping', hash_map);
            grunt.config('rename.hash_business_js.hash', hash_map["business.js"]);
            grunt.config('rename.hash_ui_js.hash', hash_map["ui.js"]);
        }
        else {
            var empty_hash_map = { "thirdparty.css":"", "thirdparty.js":"" };
            grunt.config('render.index_development.options.hash_mapping', empty_hash_map);
        }
        return true;
    });

    grunt.registerTask('set_version_development', 'Set version for development environment - get number from manifest file and store at about.html', function(version) {
        var manifest = grunt.file.readJSON('manifest.json');
        grunt.task.run('set_version_about:' + manifest.version);
        return true;
    });

    grunt.registerTask('set_version_about', 'Set version to be shown at about.html', function(version) {
        grunt.config('render.about.options.version', version);
        return true;
    });

    grunt.registerTask('set_version_manifest', 'Set version to be written at manifest.json', function(version) {
        // For daily builds in development the version is of the format "X.X.X-SNAPSHOT". We
        // need to truncate the '-SNAPSHOT' part in order to have a valid version format that
        // matches the Chrome App Extension rules.
        if (version.indexOf('-') !== -1) {
            version = version.substr(0, version.indexOf('-'))
        }
        grunt.config('replace.manifest_data.version', version);
        grunt.task.run('replace:manifest_data');
        return true;
    });

    // This is needed for Chrome App building in development mode
    grunt.registerTask('force-less-compilation', 'Force less compilation', function() {
        grunt.config('recess.options.compress', false);
        grunt.task.run('recess:development');
        return true;
    });

    grunt.registerTask('rename_wrapper', 'Task that wraps the rename process using params', function(element, outputDir) {
        grunt.config('rename.output', outputDir);
        grunt.task.run('rename:' + element);
        return true;
    });

    grunt.registerTask('compress_wrapper', 'Task that wraps the compress process using params', function(outputDir) {
        grunt.config('compress.output', outputDir);
        grunt.task.run('compress');
        return true;
    });

    grunt.registerTask('cachebuster_wrapper', 'Task that wraps the cachebuster process using params', function(mode, outputDir) {
        grunt.config('cachebuster.output', outputDir);
        grunt.task.run('cachebuster:' + mode);
        return true;
    });

    grunt.registerTask('render_wrapper', 'Task that wraps the render process using params', function(element, outputDir) {
        grunt.config('render.output', outputDir);
        grunt.task.run('render:' + element);
        return true;
    });

    grunt.registerTask('clean_wrapper', 'Task that wraps the clean process using params', function(option, outputDir) {
        grunt.config('clean.output', outputDir);
        grunt.task.run('clean:' + option);
        return true;
    });

    grunt.registerTask('generate_manifest', 'Task that generates manifest file', function(outputDir) {
        if (outputDir === undefined) {
            outputDir = 'manifest';
        }
        grunt.task.run('manifest');
        grunt.option("manifestDir", 'manifest');
        grunt.task.run('replace:fix_paths_for_appcache');
        return true;
    });

    grunt.registerTask('concat_wrapper', 'Task that wraps the concat process using params', function(option) {
        var client = grunt.file.readJSON('config/client.json');

        switch (option) {
            case 'thirdparty':
            case 'business':
            case 'ui':
                if (typeof client['javascript'][option] !== 'undefined' && client['javascript'][option].length != 0) {
                    grunt.task.run('concat:' + option);
                } else {
                    grunt.log.write('"' + option + '" is not be performed for concat wrapper.\n');
                }
                break;
            case 'css':
                if (typeof client['stylesheets'] !== 'undefined' && client['stylesheets'].length != 0) {
                    grunt.task.run('concat:' + option);
                } else {
                    grunt.log.write('"' + option + '" is not be performed for concat wrapper.\n');
                }
                break;
            case 'all':
                if (typeof client['javascript']['thirdparty'] !== 'undefined' && client['javascript']['thirdparty'].length != 0) {
                    grunt.task.run('concat:thirdparty');
                } else {
                    grunt.log.write('"thirdparty" is not be performed for concat wrapper.\n');
                }
                if (typeof client['javascript']['business'] !== 'undefined' && client['javascript']['business'].length != 0) {
                    grunt.task.run('concat:business');
                } else {
                    grunt.log.write('"business" is not be performed for concat wrapper.\n');
                }
                if (typeof client['javascript']['ui'] !== 'undefined' && client['javascript']['ui'].length != 0) {
                    grunt.task.run('concat:ui');
                } else {
                    grunt.log.write('"ui" is not be performed for concat wrapper.\n');
                }
                if (typeof client['stylesheets'] !== 'undefined' && client['stylesheets'].length != 0) {
                    grunt.task.run('concat:css');
                } else {
                    grunt.log.write('"css" is not be performed for concat wrapper.\n');
                }
                break
            default:
                return false;
        }
    });

    grunt.registerTask('uglify_wrapper', 'Task that wraps the uglify process checking source availability', function() {
        if (grunt.file.exists('build/thirdparty.js.concat')) {
            grunt.task.run('uglify:thirdparty');
        } else {
            grunt.log.write('"thirdparty" is not be performed for uglify wrapper.\n');
        }
        if (grunt.file.exists('build/business.js.concat')) {
            grunt.task.run('uglify:business');
        } else {
            grunt.log.write('"business" is not be performed for uglify wrapper.\n');
        }
        if (grunt.file.exists('build/ui.js.concat')) {
            grunt.task.run('uglify:ui');
        } else {
            grunt.log.write('"ui" is not be performed for uglify wrapper.\n');
        }
    });

    grunt.registerTask('csso_wrapper', 'Task that wraps the csso process checking source availability', function() {
        if (grunt.file.exists('build/thirdparty.css.concat')) {
            grunt.task.run('csso');
        } else {
            grunt.log.write('csso is not be performed for csso wrapper.\n');
        }
    });


    // Alias task for preparing the static assets for production mode
    // Execute "grunt prod" on shell for producing the assets on directory "dist/"
    grunt.registerTask('production', [
        'clean_wrapper:all:dist',
        'replace:js_into_html',
        'replace:fix_paths_for_concat',
        'replace:fix_index_production',
        'set_paths_for_concat',
        'concat_wrapper:all',
        'uglify_wrapper',
        'csso_wrapper',
//        'recess:production',
        'compile_less_to_css',
        'render_wrapper:about:dist',
        'compress_wrapper:dist',
        'rename_wrapper:thirdparty:dist',
        'rename_wrapper:business:dist',
        'rename_wrapper:ui:dist',
        'rename_wrapper:css:dist',
        'rename_wrapper:style:dist',
        'rename_wrapper:about:dist',
        'rename_wrapper:badbrowser:dist',
        'rename_wrapper:badlandingbrowser:dist',
        'rename_wrapper:iosbrowser:dist',
        'rename_wrapper:unavailableplatform:dist',
        'rename_wrapper:unavailableForAndroid:dist',
        'cachebuster_wrapper:production:dist',
        'set_hash_mapping:1',
        'render_wrapper:index_production:dist',
        'rename_wrapper:hash_thirdparty_js:dist',
        'rename_wrapper:hash_business_js:dist',
        'rename_wrapper:hash_ui_js:dist',
        'rename_wrapper:hash_thirdparty_css:dist',
        'shell:generateLanguageFiles',
        'replace:fix_index_refs',
        'generate_manifest:manifest',
        'clean_wrapper:build:dist']);
    grunt.registerTask('prod', ['production']);

    // Alias task for preparing the static assets for ChromeApp production mode
    // Execute "grunt prod_chrome" on shell for producing the ChromeApp assets on directory "dist/"
    grunt.registerTask('production_chrome', [
        'clean_wrapper:all:dist',
        'replace:js_into_html',
        'replace:fix_paths_for_concat',
        'set_paths_for_concat',
        'compile_less_to_css',
        'concat_wrapper:all',
        'uglify_wrapper',
        'csso_wrapper',
        'render_wrapper:about:dist',
        'rename_wrapper:thirdparty_dev:dist',
        'rename_wrapper:business_dev:dist',
        'rename_wrapper:ui_dev:dist',
        'rename_wrapper:css_dev:dist',
        'rename_wrapper:style_dev:dist',
        'cachebuster_wrapper:production:dist',
        'set_hash_mapping:1',
        'rename_wrapper:hash_thirdparty_js:dist',
        'rename_wrapper:hash_business_js:dist',
        'rename_wrapper:hash_ui_js:dist',
        'rename_wrapper:hash_thirdparty_css:dist',
        'shell:generateLanguageFiles',
        'clean_wrapper:build:dist']);
    grunt.registerTask('prod_chrome', ['production_chrome']);

    // Alias task for preparing the static assets for development mode
    // Execute "grunt devel" on shell for producing the assets on directory "dist/"
    grunt.registerTask('development', [
        'clean_wrapper:all:dist',
        'replace:js_into_html',
        'replace:fix_paths_for_concat',
        'set_paths_for_concat',
        'concat_wrapper:thirdparty',
        'rename_wrapper:thirdparty_dev:dist',
        'concat_wrapper:business',
        'rename_wrapper:business_dev:dist',
        'concat_wrapper:ui',
        'rename_wrapper:ui_dev:dist',
        'concat_wrapper:css',
        'rename_wrapper:css_dev:dist',
        'cachebuster:development',
        'set_hash_mapping:0',
        'replace:fix_paths_for_html',
        'set_paths_for_index:0',
        'render_wrapper:index_development:dist',
        'render_wrapper:about:dist',
        'shell:generateLanguageFiles',
        'replace:fix_index_refs',
        'clean_wrapper:build:dist']);
    grunt.registerTask('devel', ['development']);

    // Alias task for preparing the static assets for ChromeApp development mode
    // Execute "grunt devel" on shell for producing the ChromeApp assets on directory "dist/"
    grunt.registerTask('development_chrome', [
        'clean_wrapper:all:dist',
        'replace:js_into_html',
        'replace:fix_paths_for_concat',
        'set_paths_for_concat',
        'compile_less_to_css',
        'concat_wrapper:thirdparty',
        'rename_wrapper:thirdparty_dev:dist',
        'concat_wrapper:business',
        'rename_wrapper:business_dev:dist',
        'concat_wrapper:ui',
        'rename_wrapper:ui_dev:dist',
        'concat_wrapper:css',
        'rename_wrapper:css_dev:dist',
        'rename_wrapper:style_dev:dist',
        'cachebuster:development',
        'set_hash_mapping:0',
        'replace:fix_paths_for_html',
        'set_paths_for_index:0',
        'render_wrapper:about:dist',
        'shell:generateLanguageFiles',
        'clean_wrapper:build:dist']);
    grunt.registerTask('devel_chrome', ['development_chrome']);

    // Alias task for preparing the static assets for test mode
    // Execute "grunt test" on shell for producing the assets on directory "dist/"
    // Basically it is the same as "prod" but without doing fingerprinting and no concern for index.html
    grunt.registerTask('test', [
        'clean_wrapper:all:dist',
        'replace:fix_paths_for_html',
        'set_paths_for_runner:0',
        'render_wrapper:runner_test:dist',
        'replace:fix_paths_for_concat',
        'set_paths_for_concat',
        'concat_wrapper:thirdparty',
        'rename_wrapper:thirdparty_dev:dist',
        'shell:generateLanguageFiles',
        'clean_wrapper:build:dist']);

    // Alias task for preparing the static assets for test-cover mode
    // Execute "grunt test-cover" on shell for producing the assets on directory "dist/"
    // Produced assets will be ready to run coverage test on unit or at standard client
    grunt.registerTask('test-cover', [
        'clean_wrapper:all:dist',
        'replace:fix_paths_for_html',
        'set_paths_for_runner:1',
        'render_wrapper:runner_test:dist',
        'replace:fix_paths_for_concat',
        'set_paths_for_concat',
        'concat_wrapper:thirdparty',
        'rename_wrapper:thirdparty_dev:dist',
        'concat_wrapper:css',
        'rename_wrapper:css_dev:dist',
        'cachebuster:development',
        'set_hash_mapping:0',
        'set_paths_for_index:1',
        'render_wrapper:index_development:dist',
        'render_wrapper:about:dist',
        'shell:generateLanguageFiles',
        'replace:fix_index_refs',
        'clean_wrapper:build:dist']);
};
