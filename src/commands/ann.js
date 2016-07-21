/**
 * Created by nathanyam on 10/07/2016.
 */

"use strict";

class AnnCommand {

  /**
   * @param {AnimeNewsNetwork.Searcher} annSearcher
   */
  constructor(annSearcher) {
    this.annSearcher = annSearcher;
  }

  static create(container) {
    return new AnnCommand(container.get('ann_searcher'));
  }

  /**
   * @param {Anime} animeEntity
   * @param {Object} searchObj
   * @returns {Promise.<Object>}
   */
  execute(animeEntity, searchObj) {
    return this.annSearcher.search(searchObj)
      .then(response => {
        const [ image ] = response.images;
        animeEntity.image_url = image;
        return animeEntity.save();
      })
      .then(() => {
        return {
          status: 'SUCCESS',
          message: 'Image successfully updated'
        }
      });
  }
}

module.exports = AnnCommand;
