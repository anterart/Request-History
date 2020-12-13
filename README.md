![alt text](https://github.com/anterart/Request-History/blob/master/images/icon128.png "Logo Title Text 1")
# Request-History

This a Chrome extension that allows to store all requests done in the browser and later browse their details in a comfortable environment, as well as see some quick stats about the requests.

## Usage:
1. Install the extension:
   *  Download the files from the repository.
   *  Unpack the contents to one folder.
   *  Go to "chrome://extensions/".
   *  Switch to developer mode.
   *  Choose load unpacked and browse to the folder where the extension files are located.
2. Click the extension icon.
3. Toggle on the "Request Tracking" option in the popup menu.
4. In order to view the collected request, click the "Show Collected Requests" button in the popup menu.
5. In order to view quick stats, click the "Show Quick Stats" button in the popup menu.
6. In order to export collected requests to a JSON file, click the "Export Collected Requests" in the popup menu.

### Show Collected Requests:
The following requests and their relative responses attributes are tracked as of now and are visible in Show Collected Requests page:
* Initiator Url
* Origin Url
* Is Successful - whether the request was successful or not
* Method
* Request Headers
* Response Headers
* Status Code
* Time Stamp Started - when the request was fired
* Time Stamp Complete - when the request was completed
* Type
For more information about request and response attributes see: <br>
https://developer.mozilla.org/en-US/docs/Web/API/Request <br>
https://developer.mozilla.org/en-US/docs/Web/API/Response

It's possible to delete stored requests in Show Collected Requests page by selecting them and pressing the "Delete Selected Requests" button.
It's possible to sort and filter the requests by different attributes as well.

### Show Quick Stats:
As of now it's possible to see the leading board of top hosts of initiators and origins by number of fired request.
It's possible to export a JSON file of all collected requests in order to analyze it more.

## Future Work:
1. After using the extension for a long time, it might collect a lot of data. It might be useful to use pagination techniques in order to load the data and show it.
2. The body of requests is not tracked as of now. It's more complicated to track it since the body needs to be decoded, and the decode mechanism depedns on the mechanism that generated the request.
