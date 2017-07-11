const HOUR_INTERVAL = 1000 * 60 * 60;

module.exports = (app) => {
  const commandManager = app.get('command');
  const bus = app.get('bus');

  setTimeout(() => {
    console.log('Updating anime');
    const updateCommand = commandManager.create('anime_update', { is_watching: true });
    bus.handle(updateCommand);
  }, HOUR_INTERVAL * 3);
};
