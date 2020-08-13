const express = require('express')
require('./db/mongoose')
const usuarioRouter = require('./routers/usuario')
const tareaRouter = require('./routers/tarea')

const app = express()

app.use(express.json())
app.use(usuarioRouter)
app.use(tareaRouter)

module.exports = app
