/**
 * Created by nathanyam on 14/08/2016.
 */

"use strict";

const episodeFileRegexp = /^\[([\w\W]{0,})\]\s(.*)\s-\s(\d{2,3})/;

class EpisodeCommand {

  /**
   * @param {NotificationManager} notificationManager
   * @param {{setEpisodeModelToAnime: Function}} episodeHelper
   * @param {String} filename
   */
  constructor(notificationManager, episodeHelper, filename) {
    this.notificationManager = notificationManager;
    this.episodeHelper = episodeHelper;
    this.filename = filename;
  }

  /**
   * @param {{ get(): Function }} container
   * @param {String} filename
   * @returns {EpisodeCommand}
   */
  static create(container, filename) {
    return new EpisodeCommand(
      container.get('notification_manager'),
      container.helper('episode'),
      filename
    );
  }

  /**
   * @returns {Promise.<Episode>}
   */
  execute() {
    const filenameElements = this.filename.replace(/_/g, ' ').match(episodeFileRegexp);
    const episodeAttributes = {
      subgroup: filenameElements[1],
      animeTitle: filenameElements[2],
      number: filenameElements[3],
      filename: this.filename
    };

    return this.episodeHelper.setEpisodeModelToAnime(episodeAttributes)
      .then(episode => {
        const { animeTitle, filename } = episodeAttributes;

        this.notificationManager.emit('message', {
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
