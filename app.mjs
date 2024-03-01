import express from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.static('public'));

const config = {
    client: {
        id: process.env.APP_ID, 
        secret: process.env.APP_SECRET 
    },
    auth: {
        tokenHost: 'https://www.openstreetmap.org',
        tokenPath: '/oauth2/token',
        authorizePath: '/oauth2/authorize'
    }
};

const callback = 'http://127.0.0.1:3000/osm/oauth2';
const client = new AuthorizationCode(config);
const authorizationUri = client.authorizeURL({
    redirect_uri: callback, 
    scope: 'read_prefs',
});

// EXAMPLE ONLY for running on 127.0.0.1 with ONE client only
// In a real example, this would probably be attached to a session
let token = null;

app.post('/osm/auth', async(req, res) => {
    res.redirect(authorizationUri);
});

app.get('/osm/oauth2', async(req, res) => {
    console.log('Callback running');
    if(req.query.code) {
        try {
            console.log('Got an authorization code');
            const accessToken = await client.getToken({
                code: req.query.code,
                redirect_uri: callback
            });
            console.log('Got an access token');
            token = accessToken.token.access_token;
            res.json({'success': 1});
        }catch(e) {
            res.status(400).json({error: e.message});
        }
    } else {
        res.send({'error': 1});
    }
});

app.get('/osm/user', async(req, res) => {
    if(token) {
        try {
            const response = await fetch('https://api.openstreetmap.org/api/0.6/user/details', {
                    headers: {
                        'Authorization' : `Bearer ${token}`
                }
            });
            const text = await response.text();
            const parser = new XMLParser({
                ignoreAttributes: false
            });
            const jObj = parser.parse(text);
            res.json({
                id: jObj.osm.user['@_id'], 
                display_name: jObj.osm.user['@_display_name']
            });
        } catch(e) {
            res.status(400).json({error: e});
        }
    } else {
        res.status(401).json({error: 'No access token'});
    }
});
app.listen(3000);
