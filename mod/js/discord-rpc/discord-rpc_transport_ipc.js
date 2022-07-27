var EventEmitter = require('events');
var net = require('net');

const _DiscordRPC_OPCodes = {
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4
};

function _DiscordRPC_getIPCPath(id) {
  if (process.platform === 'win32') {
    return `\\\\?\\pipe\\discord-ipc-${id}`;
  }
  const { env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } } = process;
  const prefix = XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || '/tmp';
  return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
}

function _DiscordRPC_getIPC(id = 0) {
  return new Promise((resolve, reject) => {
    const path = _DiscordRPC_getIPCPath(id);
    const onerror = () => {
      if (id < 10) {
        resolve(_DiscordRPC_getIPC(id + 1));
      } else {
        reject(new Error('Could not connect to Discord IPC'));
      }
    };
    const sock = net.createConnection(path, () => {
      sock.removeListener('error', onerror);
      resolve(sock);
    });
    sock.once('error', onerror);
  });
}

async function findEndpoint(tries = 0) {
  if (tries > 30) {
    throw new Error('Could not find Discord IPC endpoint');
  }
  const endpoint = `http://127.0.0.1:${6463 + (tries % 10)}`;
  try {
    const r = await window.fetch(endpoint);
    if (r.status === 404) {
      return endpoint;
    }
    return findEndpoint(tries + 1);
  } catch (e) {
    return findEndpoint(tries + 1);
  }
}

function encode(op, data) {
  data = JSON.stringify(data);
  const len = Buffer.byteLength(data);
  const packet = Buffer.alloc(8 + len);
  packet.writeInt32LE(op, 0);
  packet.writeInt32LE(len, 4);
  packet.write(data, 8, len);
  return packet;
}

const working = {
  full: '',
  op: undefined
};

function decode(socket, callback) {
  const packet = socket.read();
  if (!packet) {
    return;
  }

  let { op } = working;
  let raw;
  if (working.full === '') {
    op = working.op = packet.readInt32LE(0);
    const len = packet.readInt32LE(4);
    raw = packet.slice(8, len + 8);
  } else {
    raw = packet.toString();
  }

  try {
    const data = JSON.parse(working.full + raw);
    callback({ op, data });
    working.full = '';
    working.op = undefined;
  } catch (err) {
    working.full += raw;
  }

  decode(socket, callback);
}

class _DiscordRPC_IPCTransport extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.socket = null;
  }

  async connect() {
    const socket = this.socket = await _DiscordRPC_getIPC();
    socket.on('close', this.onClose.bind(this));
    socket.on('error', this.onClose.bind(this));
    this.emit('open');
    socket.write(encode(_DiscordRPC_OPCodes.HANDSHAKE, { v: 1, client_id: this.client.clientId }));
    socket.pause();
    socket.on('readable', () => {
      decode(socket, ({ op, data }) => {
        switch (op) {
          case _DiscordRPC_OPCodes.PING:
            this.send(data, _DiscordRPC_OPCodes.PONG);
            break;
          case _DiscordRPC_OPCodes.FRAME:
            if (!data) {
              return;
            }
            if (data.cmd === 'AUTHORIZE' && data.evt !== 'ERROR') {
              findEndpoint()
                .then((endpoint) => {
                  this.client.request.endpoint = endpoint;
                })
                .catch((e) => {
                  this.client.emit('error', e);
                });
            }
            this.emit('message', data);
            break;
          case _DiscordRPC_OPCodes.CLOSE:
            this.emit('close', data);
            break;
          default:
            break;
        }
      });
    });
  }

  onClose(e) {
    this.emit('close', e);
  }

  send(data, op = _DiscordRPC_OPCodes.FRAME) {
    this.socket.write(encode(op, data));
  }

  async close() {
    return new Promise((r) => {
      this.once('close', r);
      this.send({}, _DiscordRPC_OPCodes.CLOSE);
      this.socket.end();
    });
  }

  ping() {
    this.send(uuid(), _DiscordRPC_OPCodes.PING);
  }
}