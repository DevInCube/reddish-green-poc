declare var Peer: any;

type EventHandler = (data: any) => void;

export default class RemoteController {
    private eventListeners: {[eventType: string]: EventHandler[]};

    constructor(id: string, options: any) {
        this.eventListeners = {}; 
        //
        const peer = new Peer(randomId(), options);
        const conn = peer.connect(id);
        conn.on('open', () => {
            this.__emit(`open`, {});
            //
            conn.on('data', (data: {event: string, data: any}) => {
                // console.log('Received', data);
                if (data.event) {
                    this.__emit(data.event, data.data);
                }
            });
        });

        function randomId() {
            return Math.random().toString(36).substring(14);
        }
    }

    addEventListener(eventType: string, handler: EventHandler) {
        this.__ensureListeners(eventType);
        this.eventListeners[eventType].push(handler);
    }

    __emit(eventType: string, data: any) {
        this.__ensureListeners(eventType);
        for (const handler of this.eventListeners[eventType]) {
            handler(Object.assign({ preventDefault() {}}, data));
        }
    }

    __ensureListeners(eventType: string) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
    }
}