/**
 * Created by nathanyam on 9/07/2016.
 */

"use strict";

const fs = require('fs');
const path = require('path');
const request = require('request');

function readDir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    });
  });
}

class AnnImageHandler {
  /**
   * @param {String} imageDir
   */
  constructor(imageDir) {
    this.imageDir = imageDir;
  }

  /**
   * @param {Object} annResponse
   * @returns {Promise.<Object>}
   */
  handle(annResponse) {
    const { images, main_title: [ title ] } = annResponse;
    const largestImageUrl = images.find(el => el.includes('full') || el.includes('max'));
    const annImageName = this._formatFileName(title, largestImageUrl);

    return readDir(this.imageDir)
      .then(files => {
        const hasImage = files.some(el => el === annImageName);

        if (hasImage) {
          return Object.assign({}, annResponse, { images: [`/media/images/${annImageName}`] });
        }

        return this._downloadImage(largestImageUrl, path.resolve(this.imageDir, annImageName));
      })
      .then(() => {
        return Object.assign({}, annResponse, { images: [`/media/images/${annImageName}`] });
      });
  }

  /**
   * @param {String} animeName
   * @param {String} fileName
   * @returns {string}
   * @private
   */
  _formatFileName(animeName, fileName) {
    const fileType = fileName.split('.').pop();
    animeName = animeName.toLowerCase().replace(/(\s|\W)/g, '');
    return 'ann_' + animeName + '_full.' + fileType;
  }

  /**
   * @param {String} url
   * @param {String} downloadPath
   * @returns {Promise}
   * @private
   */
  _downloadImage(url, downloadPath) {
    return new Promise((resolve, reject) => {
      const picStream = fs.createWriteStream(downloadPath);
      picStream.on('close', () => resolve());
      picStream.on('error', () => reject(err));

      return request.get(url)
        .pipe(picStream);
    });
  }
}

module.exports = AnnImageHandler;