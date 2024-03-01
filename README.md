# Node.js OSM OAuth2 Client example

This is an example OSM OAuth2 client, using the `simple-oauth2` client library (available on npm). It's an absolute basic and simplified example; for reasons given below **it is intended for testing on localhost only, and must not be run on a production public server**.

I've put it together based on my reading of the OSM OAuth2 and `simple-oauth2` documentation. Note that the storing of the access token in a global variable is **absolutely not secure** (which hopefully is obvious, as all clients accessing the server will be able to use it). Thus, this example should **only be run on a development server on localhost which the outside world cannot access**. In a real production application you'd probably store the token in a session.

It's possible that the security could be improved in other ways; pull requests welcome.

Note the example endpoint `/osm/user` showing how you can send the access token in the headers and parse the XML to get the user details.
