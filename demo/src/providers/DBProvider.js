const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')


const ipfsOptions = {
    EXPERIMENTAL: {
        pubsub: true
    },
    config: {
        Addresses: {
            Swarm: [
                // Use IPFS dev signal server
                // Websocket:
                '/dns4/ws-star-signal-1.servep2p.com/tcp/443/wss/p2p-websocket-star',
                '/dns4/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
                // WebRTC:
                // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                // Use local signal server
                // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
            ]
        },
    }
};

export default class OrbitDBProvider {
    dbInstance;
    ipfs;

    constructor(dbInstance, ipfs) {
        this.dbInstance = dbInstance;
        this.ipfs = ipfs;
    }

    static async build() {
        // Creates an IPFS instance and waits till its ready
        const ipfs = new IPFS(ipfsOptions);
        await ipfs.ready;

        // Creates an OrbitDB instance on top of IPFS
        const dbInstance = await OrbitDB.createInstance(ipfs);

        return new OrbitDBProvider(dbInstance, ipfs);
    }


    // Connects to address of DB and waits for it to load
    async openDatabase(address) {
        // Checks if address supplied is valid
        if (!OrbitDB.isValidAddress(address)) {
            throw Error("Invalid OrbitDB address supplied: " + address);
        }

        let timeout = new Promise((_, reject) =>
            setTimeout(() => {
                reject(new Error(`Timeout awaiting database ${address}`));
            }, 5000)
        );

        const dbPromise = this.dbInstance.open(address, {
            create: true,
            sync: true
        });

        // If any promise fails via a thrown error, we let it fall through.
        const db = await Promise.race([timeout, dbPromise]);

        await db.load();
        console.log("connected!");
        return db;
    }

    async close() {
        this.ipfs.stop();
    }

}
