/**
 * Created by nathanyam on 21/07/2016.
 */

"use strict";

const co = require('co');
const AnnSearcherCommand = require('../../commands/ann');
const AnimeUpdateCommand = require('../../commands/anime/update');
const EpisodeDownloadCommand = require('../../commands/episode');

const commands = {
  ann_searcher: AnnSearcherCommand,
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

class CommandBus {

  /**
   * @param {Function[]} middleware
   */
  constructor(middleware = []) {
    middleware.push(function* (cmd) { return yield cmd.execute(); });
    this.middleware = middleware;
    this.chain = this.createExecutionChain();
  }

  createExecutionChain() {
    let _middleware = this.middleware.slice().reverse();

    return _middleware.reduce((carry, item) => {
      return cmd => co(item(cmd, carry));
    });
  }

  /**
   * @param {{ execute: Function }} cmd
   */
  handle(cmd) {
    this.chain(cmd);
  }
}

module.exports = {
  CommandBus: CommandBus,
  CommandFactory: CommandFactory
};