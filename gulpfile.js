var gulp = require('gulp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var changed = require('gulp-changed');
var filter = require('gulp-filter');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var stylish = require('jshint-stylish');
var assign = Object.assign || require('object.assign');
var sourcemaps = require("gulp-sourcemaps");
var ngHtml2Js = require("gulp-ng-html2js");
var htmlMin = require('gulp-minify-html');
var builder = require('systemjs-builder');
var RSVP = require('rsvp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var karma = require('karma').server;
var insert = require('gulp-insert');
var ngAnnotate = require('gulp-ng-annotate');
var fs = require('fs');
var replace = require('gulp-replace-task');
var lessPluginCleanCSS = require("less-plugin-clean-css");
var cleancss = new lessPluginCleanCSS({advanced: true});
var cache = require('gulp-cached');
var uglify = require('gulp-uglify');
var adjustUrls = require('gulp-css-url-adjuster');
var routeBundler = require('systemjs-route-bundler')

var compilerOptions = {
  filename: '',
  filenameRelative: '',
  blacklist: [],
  whitelist: [],
  //modules: 'system',
  //sourceMap: true,
  //sourceMapName: '',
  //sourceFileName: '',
  sourceRoot: '',
  moduleRoot: '',
  moduleIds: false,
  experimental: false,
  format: {
    comments: false,
    compact: false,
    indent: {
      parentheses: true,
      adjustMultilineComment: true,
      style: "  ",
      base: 0
    }
  }
};

var path = {
  source:'client/src/**/*.js',
  html:'client/**/*.html',
  templates: 'client/src/**/*.html',
  less: ['client/src/**/*.less', '!client/src/assets/**/*.less'],
  themes: ['client/src/assets/dark.less', 'client/src/assets/light.less'],
  themesOutput:'client/dist/assets/',
  output:'client/dist/',
  outputCss: 'client/dist/**/*.css'
};


gulp.task('test', ['compile-all'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function(){
    done();
  });
});

gulp.task('clean', function() {
  return gulp.src([path.output])
    .pipe(vinylPaths(del));
});

gulp.task('html', function () {
  return gulp.src(path.templates)
    .pipe(cache('html'))
    .pipe(plumber())
    .pipe(changed(path.output, { extension: '.html' }))
    .pipe(htmlMin({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(ngHtml2Js())

    // not entirely sure this is needed....
    .pipe(insert.prepend("import angular from 'angular';\n"))
    .pipe(babel(compilerOptions))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('less', function () {
  return gulp.src(path.less)
    .pipe(cache('less'))
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.less'}))
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [ cleancss ]
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.output))
    .pipe(filter('**/*.css')) // prevents reloading due to .map files
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('rebase-css-paths', function(callback) {
  return gulp.src(path.outputCss)
    .pipe(adjustUrls({
      replace:  [/(\.\.\/)+/,'dist/']
    }))
    .pipe(gulp.dest(path.output))
});

gulp.task('move', function () {
  return gulp.src([
      './client/src/**/*.{json,svg,woff,ttf,png,gif,ico,jpg,eot}',
      ])
    .pipe(cache('move'))
    //.pipe(changed(path.output, { extension: '.json' }))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('json', function () {
  return gulp.src('./client/src/**/*.json')
    .pipe(changed(path.output, { extension: '.json' }))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('cache-bust', function(){
  return gulp.src('./client/index.html')
    .pipe(replace({
      usePrefix: false,
      patterns: [
        {
          match: '<!--PROD',
          replacement: ''
        },
        {
          match: 'END-->',
          replacement: ''
        },
        {
          match: '{{hash}}',
          replacement: Math.round(new Date() / 1000)
        }
      ]
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('less-themes', function () {
    return gulp.src(path.themes)
      .pipe(cache('less-themes'))
      .pipe(plumber())
      .pipe(changed(path.output, {extension: '.less'}))
      .pipe(sourcemaps.init())
      .pipe(less({
        plugins: [ cleancss ]
      }))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(path.themesOutput))
      .pipe(filter('**/*.css')) // prevents reloading due to .map files
      .pipe(browserSync.reload({ stream: true }));
});

gulp.task('es6', function () {
  return gulp.src(path.source)
    .pipe(cache('es6'))
    .pipe(plumber())
    .pipe(changed(path.output, { extension: '.js' }))
    .pipe(sourcemaps.init())
    .pipe(babel(compilerOptions))
    .pipe(ngAnnotate({
      sourceMap: true,
      gulpWarnings: false
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('compile-all', function (callback) {
  return runSequence(
    ['less', 'less-themes', 'html', 'es6', 'move'],
    callback
  );
});

gulp.task('compile-other', function (callback) {
  return runSequence(
    ['html', 'es6', 'move'],
    callback
  );
});

gulp.task('compile-less', function (callback) {
  return runSequence(
    ['less', 'less-themes'],
    callback
  );
});

gulp.task('recompile', function (callback) {
  return runSequence(
    'clean',
    ['compile-all'],
    callback
  );
});

gulp.task('compile-production', function(callback){
  return runSequence(
    'recompile',
    ['rebase-css-paths'],
    callback
  )
});

gulp.task('minify', function(){
  var condition = '**/routing.js';
  return gulp.src([
      'client/dist/**/*.js',
      '!**/routing.js',
      '!**/lazy-routes.js',
      '!**/routes.js'
    ])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify(
      {mangle: false}
    ))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.output))
});

gulp.task('release', function(callback) {
  return runSequence(
    ['build', 'cache-bust'],
    'minify',
    callback
  );
});

gulp.task('lint', function() {
  return gulp.src(path.source)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('serve', ['recompile'], function (done) {
  browserSync({
    open: false,
    port: 9000,
    server: {
      baseDir: ['client','server'],
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});

gulp.task('watch', ['serve'], function() {
  var watchOther = gulp.watch([path.source, path.html], ['compile-other']);
  var watchLess = gulp.watch([path.less, path.themes], ['compile-less']);
  watchOther.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
  watchLess.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('build', ['compile-production'], function () {
  var routes = require('./client/src/app/routes.json');
  // get the source paths of our routes
  routes = routes.map(function (r) { return r.src; });

  var config = {
    // baseURL: 'client',
    main: 'app/app',
    routes: routes,
    bundleThreshold: 0.6,
    config: './client/system.config.js',
    sourceMaps: true,
    minify: false,
    mangle: false,
    dest: 'client/dist/app',
    destJs: 'client/dist/app/app.js'
  }

  return routeBundler.build(config);
});
