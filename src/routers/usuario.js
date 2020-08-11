const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const Usuario = require('../models/usuario')
const auth = require('../middleware/auth')
const {enviarEmailbienvenida, enviarEmailDespedida} = require('../emails/account')
const router = new express.Router()

router.post('/usuarios', async (req, res)=>{
    const usuario = new Usuario(req.body)
    try {
        const token = await usuario.generarAuthToken()
        await usuario.save()
        enviarEmailbienvenida(usuario.email, usuario.nombre)
        res.status(201).send({usuario, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/usuarios/login', async (req, res)=>{
    try {
        const usuario = await Usuario.buscarPorCredencial(req.body.email, req.body.contraseña)
        const token = await usuario.generarAuthToken()
        res.send({usuario, token})
    } catch (error) {
        res.status(400).send({'error':""+error})
    }
})

router.post('/usuarios/logout', auth, async (req, res)=>{
    try {
        req.usuario.tokens = req.usuario.tokens.filter((token)=>token.token !== req.token)
        await req.usuario.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/usuarios/logoutAll', auth, async (req, res)=>{
    try {
        req.usuario.tokens = []
        await req.usuario.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/usuarios/yo', auth, async (req, res)=>{
    res.send(req.usuario)
})

router.patch('/usuarios/yo', auth, async (req, res)=>{
    const actualizaciones = Object.keys(req.body)
    const propiedadesPermitidas = ['nombre', 'email', 'contraseña', 'edad']
    const esOperacionValida = actualizaciones.every((actualiza)=> propiedadesPermitidas.includes(actualiza))
    if(!esOperacionValida) return res.status(400).send({error: 'actualizacion invalida'})

    try {
        actualizaciones.forEach((update)=>req.usuario[update] = req.body[update])
        await req.usuario.save()
        res.send(req.usuario)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/usuarios/yo', auth, async (req, res)=>{
    try {
        await req.usuario.remove()
        enviarEmailDespedida(req.usuario.email, req.usuario.nombre)
        res.send(req.usuario)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    // dest: 'avatars',
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))return cb(new Error('porfavor suba una imagen jpg, jpeg o png'))
        cb(undefined, true)
    }
})

router.post('/usuarios/yo/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.usuario.avatar = buffer
    await req.usuario.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/usuarios/yo/avatar', auth, async (req, res)=>{
    req.usuario.avatar = undefined
    await req.usuario.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.get('/usuarios/:id/avatar', async (req, res)=>{
    try {
        const usuario = await Usuario.findById(req.params.id)
        if(!usuario || !usuario.avatar) throw new Error()
        res.set('Content-Type', 'image/jpg')
        res.send(usuario.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router