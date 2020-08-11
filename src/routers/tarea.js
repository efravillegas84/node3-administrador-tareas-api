const express = require('express')
const Tarea = require('../models/tarea')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tareas', auth, async (req, res)=>{
    //const tarea = new Tarea(req.body)
    const tarea = new Tarea({
        ...req.body,
        propietario: req.usuario._id
    })
    try {
        await tarea.save()
        res.status(201).send(tarea)
    } catch (error) {
        res.status(400).send(error)
    }
})

// GET /tareas?completada=true
// GET /tareas?limit=10&skip=0
// GET /tareas?sortBy=createdAt:desc
router.get('/tareas', auth, async (req, res)=>{
    const match = {}
    const sort = {}

    if(req.query.completada) match.completada = (req.query.completada === 'true')
    if(req.query.sortBy){
        const partes = req.query.sortBy.split(':')
        sort[partes[0]] = ((partes[1]==='desc')? -1: 1)
    } 

    try {
        // const tareas = await Tarea.find({propietario: req.usuario._id})
        await req.usuario.populate({
            path: 'tareas',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.usuario.tareas)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tareas/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try {
        // const tarea = await Tarea.findById(_id)
        const tarea = await Tarea.findOne({_id, propietario: req.usuario._id})
        if(!tarea){
            return res.status(404).send()
        }
        res.send(tarea)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tareas/:id', auth, async (req, res)=>{
    const actualizaciones = Object.keys(req.body)
    const propiedadesPermitidas = Object.keys(Tarea.schema.paths).filter((k)=>!(k==='__v' || k==='_id'))
    // const esOperacionValida = actualizaciones.every((actualiza)=>propiedadesPermitidas.includes(actualiza))
    // if(!esOperacionValida) return res.status(400).send({error: 'actualizacion invalida'})
    const noPermitidas = actualizaciones.filter((act)=>!propiedadesPermitidas.includes(act))
    if(noPermitidas.length > 0) return res.status(400).send({error: 'las siguientes actualizaciones son invalidas:'+noPermitidas})

    try {
        const tarea = await Tarea.findOne({_id: req.params.id, propietario: req.usuario._id})
        
        if(!tarea) return res.status(404).send()
        
        actualizaciones.forEach((update)=> tarea[update] = req.body[update])
        
        await tarea.save()
        
        res.send(tarea)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tareas/:id', auth, async (req, res)=>{
    try {
        const tarea = await Tarea.findOneAndDelete({_id: req.params.id, propietario: req.usuario._id})
        
        if(!tarea) return res.status(404).send()
        
        res.send(tarea)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router