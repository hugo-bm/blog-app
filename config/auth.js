const localStrategy = require('passport-local').Strategy

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// model dos usuarios
    require('../models/Usuario');
    const Usuario = mongoose.model('usuarios');
// 
module.exports = (passport)=>{
 
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'},(email,senha,done)=>{
        
        Usuario.findOne({email: email}).then((usuarios)=>{  
                      
            if (!usuarios) {
                return done(null,false,{message: 'Este email não existe, tente novamente'})
            }    
                 
            bcrypt.compare(senha,usuarios.senha,(error,bateu)=>{
               
               if (error) throw error;
                if (bateu) {
                    return done(null,usuarios)
                } else {                    
                    return done(null,false,{message: 'Senha incorreta!'})
                }
            })
        })
    }))
    passport.serializeUser((usuarios,done)=>{        
        done(null,usuarios.id)
    })
    passport.deserializeUser((id,done)=>{
        Usuario.findById(id).then((usuarios)=>{
            done(null,usuarios)
        }).catch((error)=>console.log(error))
    })
   
}    