import {NodeProvider} from '../providers/NodeProvider'
import React, {createContext, useContext} from 'react';
import {OrbitDBNodeProvider} from '../adapters/OrbitDBNodeProvider';
import {DatabaseProvider} from '../providers/DatabaseProvider';
import OrbitDBProvider from '../adapters/OrbitDBProvider';
import { OrbitDBJoinProvider, JoinStorageProvider } from 'orbit-db-time-machine-logger';

// Injector to mock dependencies
export interface Injector {
  createNodeProvider(store: any, dbInstance: DatabaseProvider): NodeProvider;
  createDBProvider(): Promise<DatabaseProvider>;
  createJoinStorageProvider(): Promise<JoinStorageProvider>;
}

// This injector is used in the main application
export class DefaultInjector implements Injector {
  createJoinStorageProvider(): Promise<JoinStorageProvider> {
    return OrbitDBJoinProvider.connectOrReturnLocal();
  }
  createDBProvider(): Promise<DatabaseProvider> {
    return OrbitDBProvider.build();
  }
  createNodeProvider(store: any, dbInstance: DatabaseProvider): NodeProvider {
    return new OrbitDBNodeProvider(store, dbInstance);
  }
}

const InjectorContext: React.Context<Injector> = createContext(null);

// This provides the inejctor
export const InjectorProvider = ({children, injector}: { children: any, injector: Injector }) => {
  return (<InjectorContext.Provider value={injector}>
    {children}
  </InjectorContext.Provider>);
}

export const useDependencyInjector = () => useContext(InjectorContext);
