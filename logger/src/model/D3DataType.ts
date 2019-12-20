interface D3DataOutput {
  toD3Data(limit: number): D3Data;
}

export type D3Data = { id: string; children: D3Data[]; payload: any };
export default D3DataOutput;

/** Get the first node of the tree where it splits into branches */
const getTreeAtSplit = function(root: D3Data): D3Data {
  if (root.children.length === 0) {
    return null;
  }

  if (root.children.length >= 2) {
    return root;
  }

  return getTreeAtSplit(root.children[0]);
};

export { getTreeAtSplit };
