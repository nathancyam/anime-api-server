/**
 * Created by nathanyam on 10/07/2016.
 */

"use strict";

class AnnCommand {

  /**
   * @param {AnimeNewsNetwork.Searcher} annSearcher
   * @param {Anime} animeEntity
   * @param {Object} searchObj
   */
  constructor(annSearcher, animeEntity, searchObj) {
    this.annSearcher = annSearcher;
    this.animeEntity = animeEntity;
    this.searchObj = searchObj;
  }

  /**
   * @param {{ get(): Function }}container
   * @param {Anime} animeEntity
   * @param {Object} searchObj
   * @returns {AnnCommand}
   */
  static create(container, animeEntity, searchObj) {
    return new AnnCommand(container.get('ann_searcher'), animeEntity, searchObj);
  }

  /**
   * @returns {Promise.<Object>}
   */
  execute() {
    return this.annSearcher.search(this.searchObj)
      .then(response => {
        const [ image ] = response.images;
        this.animeEntity.image_url = image;
        return this.animeEntity.save();
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
