const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tarea = require('./tarea')

const usuarioSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true, 
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email invalido')
            }
        }
    },
    contraseña:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('contraseña')){
                throw new Error('contraseña no debe contener la palabra contraseña')
            }
        }
    },
    edad:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('edad debe ser un numero deve ser positivo')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            require: true
        }
    }],
    avatar:{
        type: Buffer
    }
}, {
    timestamps: true
})

usuarioSchema.virtual('tareas', {
    ref: 'Tarea',
    localField: '_id',
    foreignField: 'propietario'
})

usuarioSchema.methods.toJSON = function(){
    const usuario = this
    
    const usuarioObjeto = usuario.toObject()

    delete usuarioObjeto.contraseña
    delete usuarioObjeto.tokens
    delete usuarioObjeto.avatar

    return usuarioObjeto
}

usuarioSchema.methods.generarAuthToken = async function(){
    const usuario = this

    const token = jwt.sign({_id: usuario._id.toString()}, process.env.JWT_SECRET)

    usuario.tokens = usuario.tokens.concat({token})

    await usuario.save()

    return token
}

usuarioSchema.statics.buscarPorCredencial = async (email, contraseña)=>{
    const usuario = await Usuario.findOne({email})
    if(!usuario) throw new Error('error al logear')
    const validacion = await bcrypt.compare(contraseña, usuario.contraseña)
    if(!validacion)throw new Error('error al logear')
    return usuario
}

//para hashear conraseña al guardar ususrio
usuarioSchema.pre('save', async function(next){
    const usuario = this

    if(usuario.isModified('contraseña')){
        usuario.contraseña = await bcrypt.hash(usuario.contraseña, 8)
    }

    next()
})

usuarioSchema.pre('remove', async function(next){
    const usuario = this

    await Tarea.deleteMany({propietario: usuario._id})

    next()
})

const Usuario = mongoose.model('Usuario', usuarioSchema)

module.exports= Usuario