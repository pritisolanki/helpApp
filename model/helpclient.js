const net = require('net');
const EventEmmiter = require('events');
const uuid = require('uuid/v4')

class helpclient extends EventEmmiter {
    constructor(port, address) {
        super();
        
        this.address = address || HOST;
        this.port = port || PORT;
        this.heartbeatListener = this.heartbeat.bind(this);
        this.init();
        this.index = uuid();
    }
    
    init() {
        this.socket = new net.Socket();
        this.socket.connect(this.port, this.address, () => {
            console.log(`Client connected to: ${this.address} :  ${this.port}`);
        });
        
        this.socket.on('data', (data) => {
            const messages = data.toString().split('\n').filter(Boolean);

            for(const message of messages) {
                try {
                    const result = JSON.parse(message);

                    if(result.msg && result.msg.reply)
                        this.emit(`result-${result.msg.reply}`, result);
                    else this.emit(result.type, result);
                } catch(e) {
                    console.log('Invalid JSON', message);
                }
            }
        });

        this.lastHeartbeat = null;
        this.on('heartbeat', this.heartbeatListener);
        
        this.socket.on('error', (err) => {
            if(err.code === 'ERR_STREAM_WRITE_AFTER_END') {
                console.log('Try again after we reconnect');
            } else {
                console.log('error', err, err.code);
            }
        });
    }

    heartbeat(data) {
        if(this.lastHeartbeat) {
            const diff = data.epoch - this.lastHeartbeat;
            if(diff > 2) {
                console.log('disconnected');
                return this.reconnect();
            }
        }       
        this.lastHeartbeat = data.epoch;
    }
    //handle heartbeats
    async reconnect() {
        this.removeListener('heartbeat', this.heartbeatListener);
        this.socket.end();
        await new Promise(resolve => this.socket.on('close', resolve));
        this.socket.destroy();
        this.socket = null;

        this.init();
        this.login(this.name);
    }

    sendCommand(message) {
        message.id = 'id-' + (this.index);
        return new Promise((resolve, reject) => {
            this.socket.write(JSON.stringify(message));
            this.once(`result-${message.id}`, resolve);
        });
    }

    login(name) {
        this.name = name;
        const message = JSON.stringify({ name });
        return new Promise((resolve, reject) => {
            this.socket.write(message);
            this.once('welcome', resolve);
        });
    }
}
module.exports = helpclient;
