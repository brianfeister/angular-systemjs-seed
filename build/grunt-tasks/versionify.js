/**
 * Task: versionify
 * Description: Add project metadata for frontend
 */

module.exports = function(grunt) {
  'use strict';

  var fs = require('fs');

  grunt.registerTask('versionify', 'Add git hash and package.json version to main html file', function(options) {
      var git = require('git-rev-sync');
      var pkg = grunt.file.readJSON('package.json');
      var filePath = 'client/index.html';
      var fileContents = grunt.file.read( filePath );
      var timestamp = grunt.template.today('UTC: yyyy-mm-dd HH:MM:ss Z');
      var fileContents = fileContents.replace( /<!-- release\[(.*?)\] -->/ig, '<!-- release[ time:'+timestamp+' | version: '+pkg.version+' | git SHA: '+git.short()+' ] -->');
      var fileContents = fileContents.replace( /window\.expV(.*?)\/\/expV/ig, 'window.expV = { version: \''+pkg.version+'\', gitUrl: \''+pkg.repository.url+'\', sha: \''+git.short()+'\', timestamp: \''+timestamp+'\' } //expV');
      grunt.file.write( filePath, fileContents );
  });
};
