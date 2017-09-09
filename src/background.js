const HOUR_INTERVAL = 1000 * 60 * 60;

module.exports = (app) => {
  const commandManager = app.get('command');
  const bus = app.get('bus');

  function run() {
    console.log(`[${(new Date()).toLocaleString('en-GB', { timeZone: 'Australia/Melbourne' })}] [Auto Update] Starting background interval.`);
    /** @var {AnimeUpdateCommand} updateCommand */
    const updateCommand = commandManager.create('anime_update', { is_watching: true });
    bus.handle(updateCommand);
  }

  setInterval(() => {
    run();
  }, HOUR_INTERVAL * 3);

  run();
};
