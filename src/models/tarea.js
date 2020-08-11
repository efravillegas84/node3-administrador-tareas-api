const mongoose = require('mongoose')

const tareaSchema = new mongoose.Schema({
    descripcion:{
        type: String,
        required: true,
        trim: true
    },
    completada:{
        type: Boolean,
        default: false
    },
    propietario:{
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Usuario'
    }
}, {
    timestamps: true
})

const Tarea = mongoose.model('Tarea', tareaSchema)

module.exports = Tarea