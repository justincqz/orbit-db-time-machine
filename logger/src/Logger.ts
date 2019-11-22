import Store from 'orbit-db-store';
import { D3Data, getTreeAtSplit } from './model/D3DataType';
import DAGNode from './model/DAGNode';
import JoinEvent from './model/JoinEvent';

export default class Logger {
  private readonly store;
  private readonly storageProvider;

  constructor(store: Store) {
    this.store = store;

  }

  start(cb?) {
    this.store.events.on('replicated', () => {
      // Record the join event
      this.recordJoinEvent(this.saveHeadsAsD3Data(this.store._oplog));
      // Notify listener for additional actions
      if (cb != null) {
        cb();
      }
    })
  }

  private recordJoinEvent(newLog: any) {
    // Finds the earliest split node and returns a tree with it as root.
    let D3DAG: D3Data = this.saveHeadsAsD3Data(newLog.getHeads());

    // Ignoring straight forward joins that don't result in splits.
    if (D3DAG != null) {
      let newJoinEvent = new JoinEvent(D3DAG);
      this.storageProvider.addJoinEvent(newJoinEvent);
    }
  }

  private saveHeadsAsD3Data(heads: any[]): D3Data {
    let DAGheads = DAGNode.createDAG(heads);
    let D3DAG = DAGheads[0].toD3Data(Infinity);
    return getTreeAtSplit(D3DAG);
  }

}
