// module that shows collected requests in a grid and allows to analyze, look and make manipulations on it.

// reference to Chrome IndexedDb
const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});

// initializing globals
let loadedAgGrid = null;
let modal = null;
let spanModal = null;
let modalAgGrid = null;
let showRequestHistoryRequestCheckBox = null;

/**
 * Selects all rows shown in the grid at the moment
 */
function selectAll() {
    loadedAgGrid.gridOptions.api.forEachNode(function (rowNode, index) {
        rowNode.setSelected(true);
    });
}

/**
 * Unselects all rows shown in the grid at the moment
 */
function unselectAll() {
    loadedAgGrid.gridOptions.api.forEachNode(function (rowNode, index) {
        rowNode.setSelected(false);
    });
}

/**
 * Reloads the grid
 */
async function refreshGrid() {
    if (loadedAgGrid.gridOptions.api)
    {
        loadedAgGrid.gridOptions.api.destroy();
    }
    db.requests.toArray().then(requests => {
        initGrid(requests);
    });
}

/**
 * Deletes selected rows from the grid and also deletes their representative entries in Chrome IndexedDB
 */
async function deleteSelected() {
    selectedNodes = loadedAgGrid.gridOptions.api.getSelectedNodes();
    for (let i = 0; i < selectedNodes.length; i += 1) {
        selectedNodes[i] = selectedNodes[i].data;
    }
    loadedAgGrid.gridOptions.api.applyTransaction({remove: selectedNodes});
    for (let i = 0; i < selectedNodes.length; i += 1) {
        await db.requests.delete(selectedNodes[i].id);
    }
}


/**
 * Renders the HTML elements in request headers column of the grid
 * @param {object} params 
 */
function requestHeadersCellRenderer(params) {
    if (params.data.requestHeaders)
    {
        const btn = document.createElement("BUTTON");
        /**
         * Opens a modal with request headers information when the button is pressed
         */
        function requestHeadersBtnEventListener() {
            const columnDefs = [
                {headerName: "Name", field: "name", editable: true, sortable: true},
                {headerName: "Value", field: "value", editable: true, sortable: true},
            ];
                  
              // let the grid know which columns and what data to use
            const gridOptions = {
                defaultColDef: {
                    resizable: true
                },
                columnDefs: columnDefs,
                rowData: params.data.requestHeaders,
                rowSelection: 'multiple',
                rowMultiSelectWithClick: true,
            };
              // setup the grid after the page has finished loading
            const modalGrid = document.querySelector('#modalGrid');

            modal.style.display = "block";
            modalAgGrid = new agGrid.Grid(modalGrid, gridOptions);
        }
        const headersNum = params.data.requestHeaders.length;
        btn.textContent = `show ${headersNum} request headers.`
        btn.addEventListener('click', requestHeadersBtnEventListener);
        return btn;
    }
    const span = document.createElement("SPAN");
    span.textContent = "no request headers to show";
    return span;
}

/**
 * Renders the HTML elements in response headers column of the grid
 * @param {object} params 
 */
function responseHeadersCellRenderer(params) {
    if (params.data.responseHeaders)
    {
        /**
         * Opens a modal with response headers information when the button is pressed
         */
        function responseHeadersBtnEventListener() {
            const columnDefs = [
                {headerName: "Name", field: "name", editable: true, sortable: true},
                {headerName: "Value", field: "value", editable: true, sortable: true},
            ];
                  
              // let the grid know which columns and what data to use
            const gridOptions = {
                defaultColDef: {
                    resizable: true
                },
                columnDefs: columnDefs,
                rowData: params.data.responseHeaders,
                rowSelection: 'multiple',
                rowMultiSelectWithClick: true,
            };
              // setup the grid after the page has finished loading
            const modalGrid = document.querySelector('#modalGrid');

            modal.style.display = "block";
            modalAgGrid = new agGrid.Grid(modalGrid, gridOptions);
        }

        const btn = document.createElement("BUTTON");
        const headersNum = params.data.responseHeaders.length;
        btn.textContent = `show ${headersNum} response headers.`
        btn.addEventListener('click', responseHeadersBtnEventListener);
        return btn;
    }
    const span = document.createElement("SPAN");
    span.textContent = "no response headers to show";
    return span;
}

/**
 * Convert timestamp to human readable datetime string
 * @param {object} params 
 */
function timestampColValueFormatter(params) {
    const timestamp = moment(params.value).local();
    const dateTimeStarted = timestamp.format('YYYY-MM-DD HH:mm:ss.SSS');
    return dateTimeStarted;
}


/**
 * Returns true if showRequestHistoryRequestCheckBox is checked
 */
function isExternalFilterPresent() {
    return showRequestHistoryRequestCheckBox.checked;
}

/**
 * Checks whether the initiator or url host equal to Request History host
 * @param {object} rowNode 
 */
function doesExternalFilterPass(rowNode) {
    let urlHost;
    let initiatorHost;
    try {
        urlHost = new URL(rowNode.data.url).host;
    }
    catch (e) {
        urlHost = '';
    }
    try {
        initiatorHost = new URL(rowNode.data.initiator).host;
    }
    catch (e) {
        initiatorHost = '';
    } 
    extensionHost = chrome.runtime.id;
    return !((extensionHost === initiatorHost) || (extensionHost === urlHost));
}

/**
 * Initializes the grid and loads the data into it
 * @param {Array<object>} requests 
 */
function initGrid(requests) {
    const columnDefs = [
        {headerName: "Initiator Host", field: "initiator", editable: true, filter: true, sortable: true},
        {headerName: "Destination URL", field: "url", editable: true, filter: true, sortable: true},
        {headerName: "Is Successful", field: "isSuccessful", filter: true, sortable: true},
        {headerName: "Method", field: "method", editable: true, filter: true, sortable: true},
        {headerName: "Request Headers", field: "requestHeaders",
         cellRenderer: (params) => requestHeadersCellRenderer(params)},
        {headerName: "Response Headers", field: "responseHeaders",
         cellRenderer: (params) => responseHeadersCellRenderer(params)},
        {headerName: "Status Code", field: "statusCode", editable: true, filter: true, sortable: true},
        {headerName: "Time Stamp Started", field: "timeStampStarted", valueFormatter: timestampColValueFormatter, filter: 'agDateColumnFilter', sortable: true, sort: 'desc'},
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
        isExternalFilterPresent: isExternalFilterPresent,
        doesExternalFilterPass: doesExternalFilterPass,
      };
      // setup the grid after the page has finished loading
      const gridDiv = document.querySelector('#myGrid');
      loadedAgGrid = new agGrid.Grid(gridDiv, gridOptions);

      
}

// Loads the data from Chrome IndexedDB and initializes the grid with it
db.requests.toArray().then(requests => {
    selectAllBtn = document.getElementById('selectAll');
    selectAllBtn.addEventListener('click', selectAll);
    deleteSelectedBtn = document.getElementById('deleteSelected');
    deleteSelectedBtn.addEventListener('click', deleteSelected);
    unselectAllBtn = document.getElementById('unselectAll');
    unselectAllBtn.addEventListener('click', unselectAll);
    refreshGridBtn = document.getElementById('refreshGrid');
    refreshGridBtn.addEventListener('click', refreshGrid);
    showRequestHistoryRequestCheckBox = document.getElementById('showRequestHistoryRequests');
    showRequestHistoryRequestCheckBox.addEventListener('change', refreshGrid);
    initGrid(requests);

    modal = document.getElementById("myModal");

    spanModal = document.getElementsByClassName("close")[0];

    // Closes the modal when user clicked on the (x) button.
    spanModal.onclick = function() {
        modal.style.display = "none";
        modalAgGrid.gridOptions.api.destroy();
    }

    // Closes the modal when user clicked outside its bounds
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        modalAgGrid.gridOptions.api.destroy();
        }
    }
});

