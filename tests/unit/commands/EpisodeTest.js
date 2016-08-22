/**
 * Created by nathanyam on 14/08/2016.
 */

"use strict";

const EpisodeCommand = require('../../../src/commands/episode');
const sinon = require('sinon');
const should = require('chai').should();

describe('Episode Command', () => {

  it('should create an episode model', () => {
    const notification = { emit() {} };
    const notificationStub = sinon.stub(notification, 'emit');
    const episodeHelper = { setEpisodeModelToAnime() {} };
    const episodeHelperStub = sinon.stub(episodeHelper, 'setEpisodeModelToAnime');
    episodeHelperStub.returns(Promise.resolve({}));

    const command = EpisodeCommand.create({
      get() {
        return notification
      },
      helper() {
        return episodeHelper
      }
    }, '[gg]_Macross_Delta_-_13_[B2027CA9].mkv');

    return command.execute()
      .then(() => {
        notificationStub.calledOnce.should.equal(true);
        notificationStub.calledWith('notification:new', {
          type: 'note',
          title: 'Macross Delta',
          message: '[gg]_Macross_Delta_-_13_[B2027CA9].mkv',
          body: 'Download Finished: [gg]_Macross_Delta_-_13_[B2027CA9].mkv'
        });
      });
  });

});
