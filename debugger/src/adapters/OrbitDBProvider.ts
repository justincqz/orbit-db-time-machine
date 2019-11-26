import { DatabaseProvider } from "../providers/DatabaseProvider";
import DatabaseFactory from "../model/DatabaseFactory";
import OrbitDBFactory from './OrbitDBFactory';
import OperationsLog from '../providers/OperationsLog'
import Log from 'ipfs-log';
import * as OrbitDB from "orbit-db";
import * as IPFS from "ipfs";
import { OrbitDBOperationsLog } from "./OrbitDBOperationsLog";
import { OrbitDBAdapter } from 'orbitdb-time-machine-logger';

export default class OrbitDBProvider extends OrbitDBAdapter implements DatabaseProvider {
  private constructor(dbInstance: OrbitDB, ipfs: IPFS) {
    super(dbInstance, ipfs);
  }

  createDBFactory(name: string): DatabaseFactory {
    return new OrbitDBFactory(this.dbInstance, name);
  }

  operationsLogFromSnapshot(snapshot: string, callback: (log: OperationsLog) => void) {
    Log.fromJSON(this.ipfs, this.dbInstance.identity, snapshot)
      .then(callback);
  }

  // TODO: Replace with entry class.
  async constructOperationsLogFromEntries(entries: Array<any>): Promise<OperationsLog> {
    let oplog: Log = await Log.fromEntry(this.ipfs, this.dbInstance.identity, entries);
    return new OrbitDBOperationsLog(oplog, this.dbInstance);
  }

  static async build(): Promise<OrbitDBProvider> {
    const [dbInstance, ipfs] = await super.newDBInstance();
    return new OrbitDBProvider(dbInstance, ipfs);
  }
}
