const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3030;

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

app.get('/', (req, res) => {
    res.json({msg: 'Hello, world!', scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'].join('%20')});
});


app.get('/login', (req, res) => {
    const LI_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';

    res.redirect(
       `${LI_AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&`+
       `redirect_uri=http://localhost:3030/userinfo&state=${genRanHex(8).toUpperCase()}&`+
       `scope=${['r_liteprofile', 'r_emailaddress', 'w_member_social'].join('%20')}`
    );

    red.end();
});

app.get('/userinfo', async (req, res) => {
    const LI_ACCESS_TOKEN_EXCHANGE_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
    const {code} = req.query;
    
    const response = await axios.request({
        method: 'POST',
        url: LI_ACCESS_TOKEN_EXCHANGE_URL,
        headers: {
            'Content-Type': 'x-www-form-urlencoded'
        },
        params: {
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:3030/userinfo',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        }
    });

    const {access_token} = response.data;
    const LI_PROFILE_API_ENDPOINT = `https://api.linkedin.com/v2/me`;

    let profile_info;
    try {
        profile_info = await axios.get(LI_PROFILE_API_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
    } catch(err) {
        res.json(err);
    }

    res.json(profile_info.data);
});

app.listen(port, () => {
    console.log(`Server opened on port ${port}!`);
});