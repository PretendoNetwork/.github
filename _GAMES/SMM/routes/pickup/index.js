let routes = require('express').Router(),
    helpers = require('../../helpers'),
    json2xml = require('json2xml');


/**
 * [GET]
 * Replacement for: https://wup-ama.app.nintendo.net/api/v1/pickup/:difficulty
 * Description: Gets a course pickup list based on difficulty
 */
routes.get('/:difficulty', (request, response) => {
    response.set('Content-Type', 'application/xml;charset=UTF-8');

    // Need to check `X-Nintendo-ServiceToken` header here
    // The official headers seem to be base64
    // This means we might be able to use JWT for these, which would be great

    let courses = {
        root: {
            courses: []
        }
    }

    // This is temp. Only for demo purposes, to show the format
    // In production we would pull these from the database
    for (let i=0;i<400;i++) {
        courses.root.courses.push({
            course: {
                id: helpers.generateRandID(8)
            }
        })
    }

    response.send(json2xml(courses));
});

module.exports = routes;
