import React from 'react';
import ReactTable from "react-table";
import "react-table/react-table.css";

const DatabaseTableDisplay: React.FC<{tableHeader: string, data: any}> = ({tableHeader, data}) => {
  let columns = [{
    Header: tableHeader == null ? "Header" : tableHeader,
    columns: [{Header: "Empty Database", accessor: "empty"}]
  }];

  if (data[0] != null) {
    columns[0].columns = Object.keys(data[0]).map((key) => {
      return {
        Header: key,
        accessor: key
      }
    });
  }

  return (
    <ReactTable
      className="-striped -highlight"
      data={data}
      columns={columns}
      defaultPageSize={5}
      pageSizeOptions={[5,10,20]}
    />
    );
  };

  export default DatabaseTableDisplay;
