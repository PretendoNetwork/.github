let https = require('https'),
    http = require('http'),
    querystring = require('querystring'),
    url = require('url'),
    fs = require('fs'),
    XML = require('pixl-xml'),
    cert = {
        key: fs.readFileSync(__dirname + '/ssl/nintendo/wiiu-common.key'),
        cert: fs.readFileSync(__dirname + '/ssl/nintendo/wiiu-common.crt')
    },
    accountxml = fs.readFileSync(__dirname + '/account.xml');
    
const HEADERS = {
    'X-Nintendo-Platform-ID': '1',
        'X-Nintendo-Device-Type': '2',
        'X-Nintendo-Device-ID': '1156492273',
        'X-Nintendo-Serial-Number': 'FEM108625433',
        'X-Nintendo-System-Version': '0230',
        'X-Nintendo-Region': '4',
        'X-Nintendo-Country': 'NL',
        'Accept-Language': 'en',
        'X-Nintendo-Client-ID': 'a2efa818a34fa16b8afbc8a74eba3eda',
        'X-Nintendo-Client-Secret': 'c91cdb5658bd4954ade78533a339cf9a',
        'Accept': '',
        'X-Nintendo-FPD-Version': '0000',
        'X-Nintendo-Environment': 'L1',
        'X-Nintendo-Title-ID': '0005001010040200',
        'X-Nintendo-Unique-ID': '00402',
        'X-Nintendo-Application-Version': '00C4',
        'X-Nintendo-Device-Cert': 'AAEABQATksZ8BT7HsTOFAISa71IMW0dSFLIvtF0WwV2CNwC5pxEJKiEbhiUDqqktyked1VyvoCkZRhMTgeUHCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSb290LUNBMDAwMDAwMDMtTVMwMDAwMDAxMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAk5HNDRlZWFiZjEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4OBpqAQ+x+U8dDYezjXPsi0KGGFRG0OlZ+iD0QzHBBV8fAHtsItJf4vl7EBy9OsxMqXIKFmW86NhQLTQW0Gx4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Content-type': 'application/x-www-form-urlencoded'
}

let options = {
    method: 'POST',
    key: cert.key,
    cert: cert.cert,
    rejectUnauthorized: false,
    //port: 443,
    headers: HEADERS
};

let payload = querystring.stringify({
    grant_type: 'password',
    user_id: 'regtedting7',
    password: 'd16da07aaa22c07f055778744e8a1f934f6d6ed8246577e664523eea1ab3a0f7',
    password_type: 'hash'
});

apiPostRequest('https://account.pretendo.cc/v1/api/oauth20/access_token/generate', payload, options, (body) => {
    console.log(XML.parse(body));
});

function apiPostRequest(uri, payload, options, cb) {
    let api_url = new url.URL(uri);

    options.host = api_url.hostname;
    options.path = api_url.pathname;

    let port = options.port || 80,
        handler = http;

    if (port == 443) {
        handler = https;
    }

    let end_buffer = '';
    
    let request = http.request(options, (response) => {
        var data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });
        
        response.on('end', () => {
            cb(data);
        });
    });

    request.on('error', (error) => {
        throw new Error(error)
    });
    
    request.write(payload);
    request.end();
}