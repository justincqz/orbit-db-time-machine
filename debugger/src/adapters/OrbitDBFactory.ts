import * as OrbitDB from "orbit-db";
import { Store } from "orbit-db-store";

import DatabaseFactory from "../model/DatabaseFactory";
import OrbitDBDatabaseTypes from "./OrbitDBDatabaseTypes";

export default class OrbitDBFactory implements DatabaseFactory {
  private name: string;
  private type: OrbitDBDatabaseTypes;
  private options: any;
  private dbInstance: OrbitDB;

  public constructor(dbInstance: OrbitDB, name: string) {
    this.name = name;
    this.dbInstance = dbInstance;
    this.type = OrbitDBDatabaseTypes.EventStore;
  }

  public setName(name: string) {
    this.name = name;
    return this;
  }

  // Set type of database to create (default: 'eventlog')
  public setType(type: OrbitDBDatabaseTypes) {
    this.type = type;
    return this;
  }

  // Currently supports:
  //   isPublic: <boolean>
  //     Set if everyone has write access (default: false)
  public addOptions(options: any) {
    const accessControl = options.isPublic ? {
      accessController: { 
        type: 'orbitdb',
        write: ['*'] 
      }
    } : {
      accessController: {
        type: 'orbitdb',
        write: [OrbitDB.identity.id]
      }
    };

    this.options = {
      ...accessControl,
    };
    return this;
  }

  public create(): Promise<Store> {
    return this.dbInstance.create(this.name, this.type, this.options);
  }
}
