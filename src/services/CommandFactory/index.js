/**
 * Created by nathanyam on 21/07/2016.
 */

"use strict";

const AnnSearcherCommand = require('../../commands/ann');
const AnimeUpdateCommand = require('../../commands/anime/update');
const EpisodeDownloadCommand = require('../../commands/episode');

const commands = {
  ann_search: AnnSearcherCommand,
  anime_update: AnimeUpdateCommand,
  episode_download: EpisodeDownloadCommand
};

class CommandFactory {

  /**
   * @param {Object} container
   */
  constructor(container) {
    this.container = container;
  }

  /**
   * @param {String} commandAlias
   */
  create(commandAlias) {
    if (!Object.keys(commands).includes(commandAlias)) {
      throw new Error(`Command ${commandAlias} not found.`);
    }

    const commandClass = commands[commandAlias];

    return commandClass.create(this.container);
  }
}

module.exports = CommandFactory;
