var series      = require('stream-series');
var gulp        = require('gulp');
var inject      = require('gulp-inject');
var concat      = require('gulp-concat');
var filter      = require('gulp-filter');
var uglify      = require('gulp-uglify');
var minifyCss   = require('gulp-minify-css');
var minifyHTML  = require('gulp-minify-html');

var sources = {
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

function getModules() {
    return [
        ['./client/src/app/home/**/*.js', './client/src/app/home/**/*.css'],
        ['./client/src/app/auth/**/*.js', './client/src/app/auth/**/*.css']
    ]
}

gulp.task('default', ['dev']);


gulp.task('dev', function () {
    var sources = [];
    var modules = get3RDParties().concat(getModules());
    for (var id in modules) sources.push(gulp.src(modules[id], {read: false}));
    //
    return gulp.src('./client/src/app/home/view/index.html')
        .pipe(inject(series(sources), { ignorePath: "/client/src/" }))
        .pipe(gulp.dest('./client/src'));
});

gulp.task('prod', ['jquery-js', 'bootstrap-js', 'bootstrap-css', 'app-js', 'app-css'], function() {
    var sources = [];
    var modules = getModules();
    for (var id in modules) sources = sources.concat(modules[id]);

    gulp.src('./client/src/app/home/view/index.html')
        .pipe(inject(gulp.src([
            "./client/public/lib/jquery/**/*.*",
            "./client/public/lib/bootstrap/**/*.*",
            "./client/public/lib/app/**/*.*",
        ]), { ignorePath: "/client/public/" }))
        .pipe(minifyHTML({
            conditionals:   true,
            spare:          true
        }))
        .pipe(gulp.dest('./client/public'));

    return true;
});

gulp.task('app-js', function() {
    var sources = [];
    var modules = getModules();
    for (var id in modules) sources = sources.concat(modules[id]);

    return gulp.src(sources)
        .pipe(filter('**/*.js'))
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/lib/app/js/'));
});


gulp.task('app-css', function() {
    var sources = [];
    var modules = getModules();
    for (var id in modules) sources = sources.concat(modules[id]);

    return gulp.src(sources)
        .pipe(filter('**/*.css'))
        .pipe(concat('app.css'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(gulp.dest('./client/public/lib/app/css/'));
});


gulp.task('jquery-js', function() {
    return gulp.src(sources.jquery)
        .pipe(filter('**/*.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/lib/jquery/js/'));

});

gulp.task('bootstrap-js', function(end) {
    return gulp.src(sources.bootstrap)
        .pipe(filter('**/*.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/lib/bootstrap/js/'));
});

gulp.task('bootstrap-css', function(end) {
    return gulp.src(sources.bootstrap)
        .pipe(filter('**/*.css'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(gulp.dest('./client/public/lib/bootstrap/css/'));
});

gulp.task('all', ['dev', 'prod']);

