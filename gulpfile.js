var series      = require('stream-series');
var gulp        = require('gulp');
var inject      = require('gulp-inject');
var concat      = require('gulp-concat');
var filter      = require('gulp-filter');
var uglify      = require('gulp-uglify');
var minifyCss   = require('gulp-minify-css');
var minifyHTML  = require('gulp-minify-html');
var ts          = require('gulp-typescript');
var rename      = require("gulp-rename");
var clean       = require('gulp-clean');
var runSequence = require('run-sequence');

function getModules() {
    return [
        ['./client/src/app/home/**/*.ts', './client/src/app/home/**/*.js', './client/src/app/home/**/*.css', './client/src/app/home/template/**/*.html'],
        ['./client/src/app/auth/**/*.ts', './client/src/app/auth/**/*.js', './client/src/app/auth/**/*.css', './client/src/app/auth/template/**/*.html'],
    ]
}
var sources = {
    'typescript':   ['./client/src/3rdparty/typescript/engine.js', './client/src/3rdparty/typescript/compiler.js'],
    'jquery':       ['./client/src/3rdparty/jquery/2.1.4.js'],
    'bootstrap':    ['./client/src/3rdparty/bootstrap/js/bootstrap.js', './client/src/3rdparty/bootstrap/css/**/*.css'],
    'angular':      ['./client/src/3rdparty/angular/deploy/**/*.js',    './client/src/3rdparty/angular/deploy/**/*.css']
};

function get3RDParties() {
    return [
        sources.jquery,
        sources.bootstrap,
        sources.angular
    ]
}

gulp.task('default', ['dev']);

gulp.task('all', function(finish){
    runSequence('dev', 'prod', finish);
});

gulp.task('dev', function(finish){
    runSequence('dev-create-temp', 'dev-css', 'dev-js', 'dev-destroy-temp', finish);
});

gulp.task('dev-create-temp', function() {
    return gulp.src('./temp', {read: false})
        .pipe(clean());
});

gulp.task('dev-css', function() {
    var streams = [];
    var modules = get3RDParties().concat(getModules().concat(sources.typescript));
    for (var id in modules) streams.push(gulp.src(modules[id], {read: false}));
    //
    return gulp.src('./client/src/app/home/index.html')
        .pipe(inject(series(streams).pipe(filter('**/*.css')), {
            ignorePath: "/client/src/"
        }))
        .pipe(gulp.dest('./temp'));
});

gulp.task('dev-js', function() {
    var streams = [];
    var modules = get3RDParties().concat(getModules().concat(sources.typescript));
    for (var id in modules) streams.push(gulp.src(modules[id], {read: false}));
    //
    return gulp.src('./temp/index.html')
        .pipe(inject(series(streams).pipe(filter(['**/*.js', '**/*.ts'])), {
            starttag: '<!-- inject:js -->',
            ignorePath: "/client/src/",
            transform: function (filepath) {
                var type = (filepath.substr(filepath.lastIndexOf(".")).toLowerCase() == ".ts")?'type="text/typescript"':''
                return '<script ' + type + ' src="' + filepath + '"></script>';
            }
        }))
        .pipe(gulp.dest('./client/src'));
});

gulp.task('dev-destroy-temp', function() {
    return gulp.src('./temp', {read: false})
        .pipe(clean());
});

gulp.task('prod', function(finish) {
    runSequence(
        'prod-create-temp',
        'prod-jquery',
        'prod-bootstrap',
        'prod-app',
        'prod-inject-index',
        'prod-destroy-temp',
    finish);
});

gulp.task('prod-create-temp', function() {
    return gulp.src('./temp', {read: false})
        .pipe(clean());
});

gulp.task('prod-jquery', function(finish){
    runSequence(
        'prod-jquery-js',
        finish);
});

gulp.task('prod-jquery-js', function() {
    return gulp.src(sources.jquery)
        .pipe(filter('**/*.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/lib/jquery/'));

});

gulp.task('prod-bootstrap', function(finish){
    runSequence(
        'prod-bootstrap-js',
        'prod-bootstrap-css',
        finish);
});

gulp.task('prod-bootstrap-js', function(end) {
    return gulp.src(sources.bootstrap)
        .pipe(filter('**/*.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/lib/bootstrap/'));
});

gulp.task('prod-bootstrap-css', function(end) {
    return gulp.src(sources.bootstrap)
        .pipe(filter('**/*.css'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(gulp.dest('./client/public/lib/bootstrap/'));
});

gulp.task('prod-app', function(finish){
    runSequence(
        'prod-app-ts',
        'prod-app-js',
        'prod-app-concat',
        'prod-app-css',
        'prod-app-html',
        finish);
});

gulp.task('prod-app-concat', function() {
    var streams = [];
    var modules = getModules();
    for (var modID in modules) {
        for (var sourceID in modules[modID]){
            var source  = modules[modID][sourceID]
            var type    = source.substr(source.lastIndexOf(".")).toLowerCase();
            if (type != ".js" && type != ".ts") continue;
            var prefix  = type.substr(1);
            var temp    = "./temp/" + source.split("./client/src/").join("").replace(".ts", ".js");
            streams.push(temp);
            console.log(streams.length + ", " + source + ", " + temp);
        }
    }

    return gulp.src(streams)
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/lib/app/'));
});

gulp.task('prod-app-ts', function() {
    var streams = [];
    var modules = getModules();
    for (var id in modules) streams = streams.concat(modules[id]);

    return gulp.src(streams, {base: "./client/src"})
        .pipe(filter('**/*.ts'))
        .pipe(ts())
        .pipe(rename({
            prefix: "ts-",
            extname: ".js"
        }))
        .pipe(gulp.dest('./temp/'));
});

gulp.task('prod-app-js', function() {
    var streams = [];
    var modules = getModules();
    for (var id in modules) streams = streams.concat(modules[id]);

    return gulp.src(streams, {base: "./client/src"})
        .pipe(filter('**/*.js'))
        .pipe(rename({
            prefix: "js-",
        }))
        .pipe(gulp.dest('./temp/'));
});

gulp.task('prod-app-css', function() {
    var streams = [];
    var modules = getModules();
    for (var id in modules) streams = streams.concat(modules[id]);

    return gulp.src(streams)
        .pipe(filter('**/*.css'))
        .pipe(concat('style.css'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(gulp.dest('./client/public/lib/app/'));
});

gulp.task('prod-app-html', function() {
    var streams = [];
    var modules = getModules();
    for (var id in modules) streams = streams.concat(modules[id]);

    return gulp.src(streams, {base: "./client/src"})
        .pipe(filter('**/*.html'))
        .pipe(minifyHTML({
            conditionals:   true,
            spare:          true
        }))
        .pipe(gulp.dest('./client/public/'));
});

gulp.task('prod-inject-index', function() {
    return gulp.src('./client/src/app/home/index.html')
        .pipe(inject(gulp.src([
            "./client/public/lib/jquery/**/*.*",
            "./client/public/lib/bootstrap/**/*.*",
            "./client/public/lib/app/**/*.*"
        ]), { ignorePath: "/client/public/" }))
        .pipe(minifyHTML({
            conditionals:   true,
            spare:          true
        }))
        .pipe(gulp.dest('./client/public'));
});

gulp.task('prod-destroy-temp', function() {
    return gulp.src('./temp', {read: false})
        .pipe(clean());
});

