const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const typescript = require('gulp-typescript');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const { deleteAsync } = require('del');

gulp.task('clean', () => {
  return deleteAsync(['dist/gulp/**', '!dist/gulp']);
});

gulp.task('typescript', () => {
    const tsProject = typescript.createProject('tsconfig.json');
  
    return gulp.src(['src/server/**/*.ts'])
        .pipe(tsProject())
        .pipe(gulp.dest('dist/gulp/server'));
});

gulp.task('babel', () => {
    return gulp.src([
        'dist/gulp/server/**/*.js',
        '!dist/gulp/server/**/*.d.ts'
    ])
        .pipe(babel())
        .pipe(gulp.dest('dist/gulp/server'));
});

gulp.task('sass', () => {
    return gulp.src('public/sass/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/gulp/css'));
});

gulp.task('build', gulp.series(
    'clean',
    'typescript',
    'babel',
    'sass'
  ));