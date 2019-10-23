import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import { useParams } from 'react-router-dom';
import GraphDisplay from '../components/GraphDisplay';
import { useDependencyInjector } from '../state/dependencyInjector';
import { D3Data } from '../model/D3Data';
import { NodeProvider } from "../providers/NodeProvider";
import { DatabaseProvider } from '../providers/DatabaseProvider';
import { Store } from "orbit-db-store";
import databaseStyles from './Database.module.css';
import { MdLibraryAdd, MdHome } from 'react-icons/md';
import { withRouter } from 'react-router-dom';

const DatabaseView: React.FC = withRouter(({ history }) => {
  // URL parameters
  let { hash, name }: { hash: string, name: string } = useParams();
  const injector = useDependencyInjector();
  let nodeProvider: MutableRefObject<NodeProvider> = useRef(null);
  let store: MutableRefObject<Store> = useRef(null);
  let dbProvider: MutableRefObject<DatabaseProvider> = useRef(null);

  // Limit number of nodes to fetch
  const LIMIT = 10;

  const [loading, setLoading] = useState(true);
  const [d3data, setD3data]: [D3Data, React.Dispatch<React.SetStateAction<D3Data>>] = useState(null);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!dbProvider.current) {
      injector.createDBProvider().then((provider) => {
        dbProvider.current = provider;
        dbProvider.current.openDatabase(`/orbitdb/${hash}/${name}`).then((s: Store) => {
          store.current = s;
          nodeProvider.current = injector.createNodeProvider(s);
          loadData();
          if (!listening) {
            setListening(true);
            listenForChanges();
          }
        }).catch((e) => setError(e.toString()));
      });
    }
  });

  function listenForChanges() {
    console.log('listening')
    nodeProvider.current.listenForDatabaseGraph(() => {
      loadData(true);
    });
  }

  async function loadData(forceLoad: boolean = false): Promise<void> {
    // Check whether we've already fetched the data. In the future, maybe diff?
    if ((d3data !== null && !forceLoad) || error !== '') {
      return;
    }
    setLoading(true);
    try {
      let childNode = await nodeProvider.current.getDatabaseGraph();
      console.log(childNode.toD3Data(LIMIT));
      setD3data(childNode.toD3Data(LIMIT));
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }

  async function addNode() {
    let value = prompt('Enter a value to insert:');

    if (value === null || value === '') {
      return;
    }

    try {
      await store.current.add(value);
    } catch (e) {
      setError(e.toString());
    }
    loadData(true);
  }

  const goHome = () => {
    history.push("/");
  }

  if (error) {
    return <div className={databaseStyles.container}>
      <div className={databaseStyles.error}>{error}</div>
    </div>
  }

  if (loading) {
    return <div className={databaseStyles.loadContainer}>
      <span className={databaseStyles.loadTitle}>Loading database</span>
      <div>Loading...</div>
    </div>
  }

  let mockData: D3Data = [
    // head 1
    {
      id: "0",
      parentIds: ["1"]
    },
    {
      id: "1",
      parentIds: ["4"]
    },
    // head 2
    {
      id: "2",
      parentIds: ["4"]
    },
    {
      id: "3",
      parentIds: ["4"]
    },
    // tail
    {
      id: "4",
      parentIds: ["5"]
    },
    {
      id: "5",
      parentIds: ["6"]
    },
    {
      id: "6",
      parentIds: ["7"]
    },
    {
      id: "7",
      parentIds: ["8"]
    },
    {
      id: "8",
      parentIds: ["9"]
    },
    {
      id: "9",
      parentIds: ["10"]
    },
    {
      id: "10",
      parentIds: ["11"]
    },
    {
      id: "11",
      parentIds: []
    }
  ];

  console.log(d3data);

  let mockNodeProvider = new MockNodeProvider();

  return <div>
    <div className={databaseStyles.container}>
      <div className={databaseStyles.addressContainer}>
        Viewing: {`/orbitdb/${hash}/${name}`}
      </div>
      <div className={databaseStyles.titleContainer}>Timeline</div>
      <GraphDisplay nodeProvider={mockNodeProvider} inputData={mockData} nodeColour='#7bb1f1ff' lineColour='#1d5495ff' />
      <div className={databaseStyles.iconTaskbarBorder}>
        <div className={databaseStyles.iconTaskbar}>
          <div className={databaseStyles.icon} onClick={goHome}>
            <MdHome size={'6vh'} />
          </div>
          <div className={databaseStyles.icon} onClick={addNode}>
            <MdLibraryAdd size={'6vh'} />
          </div>
        </div>
      </div>
    </div>
  </div>
});

class MockNodeProvider implements NodeProvider {
  getDatabaseGraph(): Promise<import("../model/DAGNode").default> {
    throw new Error("Method not implemented.");
  }  listenForDatabaseGraph(cb: () => void): void {
    throw new Error("Method not implemented.");
  }
  getEdges(node: import("../model/DAGNode").default) {
    throw new Error("Method not implemented.");
  }
  getNodeInfo(node: import("../model/DAGNode").default): Promise<any> {
    return Promise.resolve(node.hash);
  }
  getNodeInfoFromHash(nodeHash: String): Promise<any> {
    return Promise.resolve({
      payload: {
        op: nodeHash,
        value: nodeHash
      },
      id: nodeHash
    });
  }

    
}

export default DatabaseView;
