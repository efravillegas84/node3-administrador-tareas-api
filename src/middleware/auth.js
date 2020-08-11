const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario')

const auth = async (req, res, next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const usuario = await Usuario.findOne({_id: decoded._id, 'tokens.token':token}) 
        if(!usuario) throw new Error()
        req.token = token
        req.usuario = usuario
        next()
    } catch (error) {
        res.status(401).send({error: 'debe autentificarse'})
    }
}

module.exports = auth