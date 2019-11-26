import { Store } from 'ipfs-log';

export default interface DatabaseProvider {
  openDatabase(address: string): Promise<Store>;

  close(): Promise<void>;
}
