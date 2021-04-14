/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

var archiver = require('archiver');
var chalk = require('chalk');
var extensionDescriptor = require('./helpers/extensionDescriptor');
var fs = require('fs');
var getPaths = require('./helpers/getPackagePaths.js');
var path = require('path');
var process = require('process');

var getOutputDirectory = function() {
  var args = process.argv.slice(2);
  if (args.length === 2 && args[0] === '--output-dir') {
    var directory = args[1];

    if (!fs.lstatSync(directory).isDirectory()) {
      throw new Error('--output-dir "' + directory + '" is not a directory');
    }

    // console.log('__dirname is ', __dirname)
    return path.resolve('.', directory);
  }

  return path.resolve('.');
}

var fileExists = function(filepath) {
  // We need to check if a file exists in a case sensitive way that is not OS dependent.
  var fileDirectory = path.dirname(filepath);
  var folderFiles = fs.readdirSync(fileDirectory);
  var fileBaseName = path.basename(filepath);

  return folderFiles.indexOf(fileBaseName) !== -1;
};

module.exports = function() {
  var outputDirectory = getOutputDirectory();
  var packageName = 'package-' + extensionDescriptor.name + '-' + extensionDescriptor.version + '.zip';
  var outputPath = path.resolve(outputDirectory, packageName);

  var output = fs.createWriteStream(outputPath);
  var zipArchive = archiver('zip');

  zipArchive.pipe(output);

  var filepaths = getPaths(extensionDescriptor);

  filepaths.forEach(function(filepath) {
    if (!fileExists(filepath)) {
      var error = 'Cannot find file: ' + filepath;
      console.error(chalk.red(error));
      process.exit(1);
    }
    zipArchive.file(filepath);
  });

  zipArchive.finalize();

  console.log(chalk.green('wrote file to ' + outputPath));
};
