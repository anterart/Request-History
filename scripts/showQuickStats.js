// Chrome IndexedDB reference
const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});

/**
 * Returns 1 if a has a lower number of request. Returns -1 if a has a higher number of requests.
 * Returns 0 if a and b have the same number of requests.
 * @param {*} a 
 * @param {*} b 
 */
function topComparator(a, b) {
    if (a.numRequests < b.numRequests) {
        return 1;
    }
    if (a.numRequests > b.numRequests) {
        return -1;
    }
    return 0;
}

// Load the requests form IndexedDB, calculate top entries, feed them to the grids
db.requests.toArray().then(requests => {
    const hostMap = new Map();
    for (let i = 0; i < requests.length; i+= 1) {
        let host;
        try
        {
            host = new URL(requests[i].url).host;
        }
        catch(e) {
            host = 'null';
        }
        if (!hostMap.has(host)) {
            hostMap.set(host, 1);
        }
        else {
            hostMap.set(host, hostMap.get(host) + 1);
        }
    }

    topHosts = [];
    for (const [key, value] of hostMap.entries())
    {
        topHosts.push({host: key, numRequests: value});
    }
    topHosts.sort(topComparator);

    const hostMapInitiator = new Map();
    for (let i = 0; i < requests.length; i+= 1) {
        let host;
        try
        {
            host = new URL(requests[i].initiator).host;
        }
        catch(e) {
            host = 'null';
        }
        if (!hostMapInitiator.has(host)) {
            hostMapInitiator.set(host, 1);
        }
        else {
            hostMapInitiator.set(host, hostMapInitiator.get(host) + 1);
        }
    }

    topHostsInitiator = [];
    for (const [key, value] of hostMapInitiator.entries())
    {
        topHostsInitiator.push({host: key, numRequests: value});
    }
    topHostsInitiator.sort(topComparator);
    
    for (let i = 0; i < topHostsInitiator.length; i += 1) {
        topHostsInitiator[i].rank = i + 1;
    }

    for (let i = 0; i < topHosts.length; i += 1) {
        topHosts[i].rank = i + 1;
    }


    const columnDefs = [
        {headerName: "Rank", field: "rank", editable: true, filter: true},
        {headerName: "Origin Host", field: "host", editable: true, filter: true},
        {headerName: "Number of Requests", field: "numRequests", editable: true, filter: true},
      ];
    
      const columnDefsInitiator = [
        {headerName: "Rank", field: "rank", editable: true, filter: true},
        {headerName: "Initiator Host", field: "host", editable: true, filter: true},
        {headerName: "Number of Requests", field: "numRequests", editable: true, filter: true},
      ];
          
      // let the grid know which columns and what data to use
      const gridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: columnDefs,
        rowData: topHosts,
      };

      const gridOptionsInitiator = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: columnDefsInitiator,
        rowData: topHostsInitiator,
      };
      // setup the grid after the page has finished loading
      const gridDiv = document.querySelector('#gridTopOrigins');
      const gridDivInitiators = document.querySelector('#gridTopInitiators');
      new agGrid.Grid(gridDiv, gridOptions);
      new agGrid.Grid(gridDivInitiators, gridOptionsInitiator);
    });