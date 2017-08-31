<h1>orderFromURL</h1>
<h2>Description</h2>
<p>This application will parse a URL location and insert data into a MySQL database following the matching pattern:
<ol><li><em>order_code,client_name,product_code,quantity</em></li></ol>
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
As data being partially inserted adds the complexity of the document content being in an unknown or complicated state, I considered
any situation which would result in data being partially placed a worst case scenario. 
As such, the insertion of data is managed by a transaction. If a stream error occurs or malformed data is encountered
the database is rolled back and the process is terminated. This should remove the possiblity of result case 3, leaving only
case 1 and 2 as possible results.

<h2>Usage</h2>
