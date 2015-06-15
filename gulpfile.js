var series  = require('stream-series');
var gulp    = require('gulp');
var inject  = require('gulp-inject');
var order   = require("gulp-order");

gulp.task('default', function () {
    var home        = gulp.src(['./client/src/component/home/**/*.js', './client/src/component/home/**/*.css'], {read: false});
    var auth        = gulp.src(['./client/src/component/auth/**/*.js', './client/src/component/auth/**/*.css'], {read: false});

    gulp.src('./client/src/component/home/view/index.html')
        .pipe(inject(series(home, auth)))
        .pipe(gulp.dest('./client/src'));
});
