let routes = require('express').Router()

/**
 * [POST]
 * Replacement for: nothing, it's used by maryo
 * Description: tests the validity of this server by returning a predefined message
 */
routes.get('/isthisworking', async (req, res) => {
  return res.send("it works!")
})

module.exports = routes
