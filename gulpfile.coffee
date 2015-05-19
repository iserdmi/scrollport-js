gulp = require 'gulp'
argv = require('yargs').argv
gulpif = require 'gulp-if'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'
coffee = require 'gulp-coffee'
insert = require 'gulp-insert'
sourcemaps = require 'gulp-sourcemaps'
bower_config = require './bower.json'

copyrights = "/* Scrollport.js #{bower_config.version} — #{bower_config.description} Author: #{bower_config.authors[0]}. Licensed MIT. */\n"

gulp.task 'scripts', ->
  gulp.src('src/*.coffee')
    .pipe gulpif !argv.production, sourcemaps.init()
    .pipe coffee()
    .pipe gulpif !!argv.production, insert.prepend copyrights
    .pipe gulpif !argv.production, sourcemaps.write()
    .pipe gulp.dest 'dist'
    .pipe uglify()    
    .pipe rename
      suffix: '.min'
    .pipe gulpif !!argv.production, insert.prepend copyrights
    .pipe gulp.dest 'dist'

gulp.task 'watch', ->
  gulp.watch 'src/*.coffee', ['scripts']

gulp.task 'default', ['scripts']
