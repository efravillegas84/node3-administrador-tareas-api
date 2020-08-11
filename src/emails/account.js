const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const enviarEmailbienvenida = (email, nombre)=>{
    sgMail.send({
        to: email,
        from: process.env.MAIL_FROM,
        subject: 'Gracias por preferirnos',
        text: `Bienvenido a la aplicación de tareas, ${nombre}, háganos saber cómo funciona la App.`
      })
}

const enviarEmailDespedida = (email, nombre)=>{
    sgMail.send({
        to: email,
        from: process.env.MAIL_FROM,
        subject: 'Lamentamos su partida',
        text: `Buenas ${nombre}, lamentamos que deje nuestra App, déjenos saber que pudimos hacer mejor.`
      })
}

module.exports = {
    enviarEmailbienvenida,
    enviarEmailDespedida
}