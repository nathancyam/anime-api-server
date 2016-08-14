/**
 * Created by nathanyam on 14/08/2016.
 */

"use strict";

const episodeFileRegexp = /^\[([\w\W]{0,})\]\s(.*)\s-\s(\d{2,3})/;

class EpisodeCommand {

  /**
   * @param {NotificationManager} notificationManager
   * @param {{setEpisodeModelToAnime: Function}} episodeHelper
   */
  constructor(notificationManager, episodeHelper) {
    this.notificationManager = notificationManager;
    this.episodeHelper = episodeHelper;
  }

  static create(container) {
    return new EpisodeCommand(
      container.get('notification_manager'),
      container.helper('episode')
    );
  }

  /**
   * @param {String} filename
   * @returns {Promise.<Episode>}
   */
  execute(filename) {
    const filenameElements = filename.replace(/_/g, ' ').match(episodeFileRegexp);
    const episodeAttributes = {
      subgroup: filenameElements[1],
      animeTitle: filenameElements[2],
      number: filenameElements[3],
      filename: filename
    };

    return this.episodeHelper.setEpisodeModelToAnime(episodeAttributes)
      .then(episode => {
        const { animeTitle, filename } = episodeAttributes;

        this.notificationManager.emit('notification:new', {
          type: 'note',
          title: `New Episode: ${animeTitle}`,
          message: `${filename}`,
          body: `Download Finished: ${filename}`
        });

        return Promise.resolve(episode);
      });
  }
}

module.exports = EpisodeCommand;
