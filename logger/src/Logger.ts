import Store from 'orbit-db-store';
import { D3Data, getTreeAtSplit } from './model/D3DataType';
import DAGNode from './model/DAGNode';
import JoinEvent from './model/JoinEvent';
import JoinStorageProvider from './providers/JoinStorageProvider';
import LocalStoreageJoinProvider from './adapters/LocalJoinStorageAdapter';
import Log from 'ipfs-log';

/**
 * Class to log join events. The events can later be read by the time machine.
 * By default, this uses a local storage provider.
 */
export default class Logger {
  private readonly store;
  private readonly storageProvider;

  /**
   * Create a new logger
   * @param store The orbitdb database to listen for events on
   * @param storageProvider Optionally provide an custom storage provider.
   */
  constructor(store: Store, storageProvider?: JoinStorageProvider) {
    this.store = store;
    if (storageProvider != null) {
      this.storageProvider = storageProvider;
    } else {
      this.storageProvider = new LocalStoreageJoinProvider();
    }
    this.storageProvider.setDatabase(`${store.address.root}/${store.address.path}`);
  }

  /**
   * Start the logger. This starts listening for join events and writing them
   * to the storage provider.
   * @param cb Optional callback function. Invoked when a join event is detected.
   */
  start(cb?: () => void) {
    this.store.events.on('replicated', () => {
      // Record the join event
      this.recordJoinEvent(this.store._oplog);
      // Notify listener for additional actions
      if (cb != null) {
        cb();
      }
    })
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
