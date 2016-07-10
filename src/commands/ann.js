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
   * @returns {Promise.<Object>}
   */
  handle() {
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

class AnnCommandFactory {
  /**
   * @param {AnimeNewsNetwork.Searcher} annSearcher
   * @param {Anime} animeEntity
   * @param {Object} searchObj
   * @returns {AnnCommand}
   */
  static create(
    annSearcher,
    animeEntity,
    searchObj
  ) {
    return new AnnCommand(annSearcher, animeEntity, searchObj);
  }
}

module.exports = AnnCommandFactory;
