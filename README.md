<h1>orderFromURL</h1>
<h2>Description</h2>
<p>This application will parse a URL location and insert data into a MySQL database following the matching pattern:
<ul><li><em>order_code,client_name,product_code,quantity</em></li></ul>
</p>

<h2>Configuration</h2>
<p>The database connection should be configured in Database.js. By default it contains some basic testing login for a local databasee.
This should be replaced with your own connection information. Database is assumed to be have a product and order table that can be inserted to
with only the information given in the pattern.</p>

<h2>Stream</h2>
<p>The solution to the issue of avoiding any vertical scaling was to use a stream to manage input data. 
This added quite a bit of complexity to the task, but should allow parsing of arbitrarily large datasets.
Additionally, a Set object is used to manage existing promises, with them being pruned upon resolution to keep
memory usage low while parsing large documents.

<h2>Failure States - Transaction Rollback</h2>
<p>While building this application, I considered three possible results of attempting to read large sets of data into a database. Ranked best to worst:
<ol>
<li>All data inserted correctly</li>
<li>No data inserted</li>
<li>Data partially inserted</li>
</ol>
<p>As data being partially inserted adds the complexity of the document content being in an unknown or complicated state, I considered
any situation which would result in data being partially placed a worst case scenario.</p>

<p>As such, the insertion of data is managed by a transaction. If a stream error occurs or malformed data is encountered
the database is rolled back and the process is terminated. This should remove the possiblity of result case 3, leaving only
case 1 and 2 as possible results.</p>

<h4>The following Scenarios will result in a rollback<h4>
<ul>
<li>Any stream error</li>
<li>Any database read/write error</li>
<li>The product quantity being NaN</li>
<li>Any other order values being empty strings</li>
</ul>

<em>Note: Zero or negative quantities will not cause errors, but will result in the order not being inserted.</em>



<h2>Usage</h2>
<p>Clone project, navigate cmd directory to folder. From this folder you can execute the task by calling node, the getOrdersFromUrl.js, then the URL source, like so:</p>

<p>node getOrdersFromUrl.js http://www.resources-api.tech/test3.html</p>

<p>Note: An internet connection is needed for this task to work.</p>

<h2>Notes</h2>
<p>This program was a little more complicated than I had thought at first. My initial thought was that this would be a pretty simple task in PHP, so why not learn to do it in Node. However, managing the asynchornouos nature of JavaScript with a stream was more challenging than I had expected! It could have been made a bit easier by using async/await functionality along with a promisified mysql library to simplify asynchronous controls, but I opted to keep it to more generic JavaScript as an exercise.</p>
