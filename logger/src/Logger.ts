import Store from 'orbit-db-store';
import { D3Data, getTreeAtSplit } from './model/D3DataType';
import DAGNode from './model/DAGNode';
import JoinEvent from './model/JoinEvent';
import JoinStorageProvider from './providers/JoinStorageProvider';
import Log from 'ipfs-log';
import OrbitDBJoinProvider from './adapters/OrbitDBJoinProvider';
import IPFS from 'ipfs';

/**
 * Class to log join events. The events can later be read by the time machine.
 * By default, this uses a local storage provider.
 */
export default class Logger {
  private readonly store;
  private storageProvider;
  private readonly ipfs;

  /**
   * Create a new logger
   * @param store The orbitdb database to listen for events on
   * @param ipfs Optionally pass the store's IPFS instance to share
   * @param storageProvider Optionally provide an custom storage provider.
   */
  constructor(store: Store, ipfs?: IPFS, storageProvider?: JoinStorageProvider) {
    this.ipfs = ipfs;
    this.store = store;
    if (storageProvider !== undefined && storageProvider !== null) {
      this.storageProvider = storageProvider;
      this.storageProvider.setUser(store._oplog._identity._id);
      this.storageProvider.setDatabase(`${store.address.root}/${store.address.path}`);
    }
  }

  /**
   * Start the logger. This starts listening for join events and writing them
   * to the storage provider.
   * @param cb Optional callback function. Invoked when a join event is detected.
   */
  start(cb?: () => void) {
    // Starts the logger
    let run = () => {
      this.store.events.on('replicated', () => {
        // Record the join event
        this.recordJoinEvent(this.store._oplog);
        // Notify listener for additional actions
        if (cb != null) {
          cb();
        }
      })
    }

    // Check whether our storageProvider has been initialised
    if (this.storageProvider === undefined || this.storageProvider === null) {
      this.storageProvider = OrbitDBJoinProvider.connectOrReturnLocal(this.ipfs).then((sp) => {
        this.storageProvider = sp;
        this.storageProvider.setUser(this.store._oplog._identity._id);
        this.storageProvider.setDatabase(`${this.store.address.root}/${this.store.address.path}`);
        run();
      })
    } else {
      run();
    }

  }

  /**
   * Record a new join event to the storage provider using the passed oplog.
   * @param newLog The current oplog
   */
  private recordJoinEvent(newLog: Log) {
    // Finds the earliest split node and returns a tree with it as root.
    let D3DAG: D3Data = this.saveHeadsAsD3Data(newLog.heads);

    // Ignoring straight forward joins that don't result in splits.
    if (D3DAG != null) {
      let newJoinEvent = new JoinEvent(D3DAG);
      this.storageProvider.addJoinEvent(newJoinEvent);
    }
  }

  /**
   * Write the current oplog heads to d3data
   * @param heads the array of heads from the oplog
   * @returns the d3data
   */
  private saveHeadsAsD3Data(heads: Array<string>): D3Data {
    let DAGheads = DAGNode.createDAG(heads);
    let D3DAG = DAGheads[0].toD3Data();
    return getTreeAtSplit(D3DAG);
  }

}
