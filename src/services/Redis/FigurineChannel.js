const FIGURINE_EVENT = 'figurine_watcher';

class FigurineChannel {
  constructor(socketHandler, notificationManager) {
    this._socketHandler = socketHandler;
    this._notificationManager = notificationManager;
    this._attachListeners();
    console.log(`${(new Date()).toLocaleString()} - FigurineChannel initialised.`);
  }

  _attachListeners() {
    this._socketHandler.torrentNsp.on('connection', this._onSocketConnect.bind(this));
  }

  _onSocketConnect(socket) {
    socket.on(FIGURINE_EVENT, this._onSocketMessage.bind(this));
  }

  _onSocketMessage({ action, message, status }) {
    try {
      const figurines = JSON.parse(message);
      const newFigurines = figurines.map(fig => fig.name).join(', ');

      this._notificationManager.emit('message', {
        type: 'note',
        title: 'New Alter Figurine on AmiAmi',
        message: newFigurines,
        body: newFigurines,
      });
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = FigurineChannel;
