const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});

let loadedAgGrid = null;

function selectAll() {
    loadedAgGrid.gridOptions.api.forEachNode(function (rowNode, index) {
        rowNode.setSelected(true);
    });
}

function unselectAll() {
    loadedAgGrid.gridOptions.api.forEachNode(function (rowNode, index) {
        rowNode.setSelected(false);
    });
}

function deleteSelected() {
    selectedNodes = loadedAgGrid.gridOptions.api.getSelectedNodes();
    for (let i = 0; i < selectedNodes.length; i += 1) {
        selectedNodes[i] = selectedNodes[i].data;
    }
    loadedAgGrid.gridOptions.api.applyTransaction({remove: selectedNodes});
    for (let i = 0; i < selectedNodes.length; i += 1) {
        db.requests.delete(selectedNodes[i].id);
    }
}


function requestHeadersCellRenderer(params) {
    if (params.data.requestHeaders)
    {
        function requestHeadersBtnEventListener() {
            let textToDisplay = "The request had the following headers:\n\n";
            let delim = "";
            for (let i = 0; i < params.data.requestHeaders.length; i += 1) {
                textToDisplay += delim + params.data.requestHeaders[i].name + ":\n" + params.data.requestHeaders[i].value;
                delim = '\n\n';
            }
            alert(`${textToDisplay}`);
        }

        const btn = document.createElement("BUTTON");
        const headersNum = params.data.requestHeaders.length;
        btn.textContent = `show ${headersNum} request headers.`
        btn.addEventListener('click', requestHeadersBtnEventListener);
        return btn;
    }
    const span = document.createElement("SPAN");
    span.textContent = "no request headers to show";
    return span;
}

function responseHeadersCellRenderer(params) {
    if (params.data.responseHeaders)
    {
        function responseHeadersBtnEventListener() {
            let textToDisplay = "The response had the following headers:\n\n";
            let delim = "";
            for (let i = 0; i < params.data.responseHeaders.length; i += 1) {
                textToDisplay += delim + params.data.responseHeaders[i].name + ":\n" + params.data.responseHeaders[i].value;
                delim = '\n\n';
            }
            alert(`${textToDisplay}`);
        }

        const btn = document.createElement("BUTTON");
        const headersNum = params.data.requestHeaders.length;
        btn.textContent = `show ${headersNum} response headers.`
        btn.addEventListener('click', responseHeadersBtnEventListener);
        return btn;
    }
    const span = document.createElement("SPAN");
    span.textContent = "no response headers to show";
    return span;
}

function timestampColValueFormatter(params) {
    const timestamp = moment(params.value).local();
    const dateTimeStarted = timestamp.format('YYYY-MM-DD hh:mm:ss.SSS');
    return dateTimeStarted;
}


db.requests.toArray().then(requests => {
    const columnDefs = [
        {headerName: "Initiator URL", field: "initiator", editable: true, filter: true, sortable: true},
        {headerName: "Origin URL", field: "url", editable: true, filter: true, sortable: true},
        {headerName: "Is Successful", field: "isSuccessful", filter: true, sortable: true},
        {headerName: "Method", field: "method", editable: true, filter: true, sortable: true},
        {headerName: "Request Headers", field: "requestHeaders",
         cellRenderer: (params) => requestHeadersCellRenderer(params)},
        {headerName: "Response Headers", field: "responseHeaders",
         cellRenderer: (params) => responseHeadersCellRenderer(params)},
        {headerName: "Status Code", field: "statusCode", editable: true, filter: true, sortable: true},
        {headerName: "Time Stamp Started", field: "timeStampStarted", valueFormatter: timestampColValueFormatter, filter: 'agDateColumnFilter', sortable: true},
        {headerName: "Time Stamp Complete", field: "timeStampComplete", valueFormatter: timestampColValueFormatter, filter: 'agDateColumnFilter', sortable: true},
        {headerName: "Type", field: "type", editable: true, filter: true, sortable: true}
      ];
          
      // let the grid know which columns and what data to use
      const gridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: columnDefs,
        rowData: requests,
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true,
      };
      // setup the grid after the page has finished loading
      const gridDiv = document.querySelector('#myGrid');
      loadedAgGrid = new agGrid.Grid(gridDiv, gridOptions);

      selectAllBtn = document.getElementById('selectAll');
      selectAllBtn.addEventListener('click', selectAll);
      deleteSelectedBtn = document.getElementById('deleteSelected');
      deleteSelectedBtn.addEventListener('click', deleteSelected);
      unselectAllBtn = document.getElementById('unselectAll');
      unselectAllBtn.addEventListener('click', unselectAll);
});

