const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});


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


db.requests.toArray().then(requests => {
    const columnDefs = [
        {headerName: "Initiator", field: "initiator"},
        {headerName: "Is Successful", field: "isSuccessful"},
        {headerName: "Method", field: "method"},
        {headerName: "Request Headers", field: "requestHeaders",
         cellRenderer: (params) => requestHeadersCellRenderer(params)},
        {headerName: "Response Headers", field: "responseHeaders",
         cellRenderer: (params) => responseHeadersCellRenderer(params)},
        {headerName: "Status Code", field: "statusCode"},
        {headerName: "Time Stamp Complete", field: "timeStampComplete"},
        {headerName: "Time Stamp Started", field: "timeStampStarted"},
        {headerName: "Type", field: "type"},
        {headerName: "URL", field: "url"}
      ];
          
      // let the grid know which columns and what data to use
      const gridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: columnDefs,
        rowData: requests
      };
      // setup the grid after the page has finished loading
      const gridDiv = document.querySelector('#myGrid');
      new agGrid.Grid(gridDiv, gridOptions);
});

