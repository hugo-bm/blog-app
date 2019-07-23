const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuarios = mongoose.model('usuarios');
const bcrypt = require('bcryptjs')
const passport = require("passport")
require('../config/auth')(passport)
//Rotas
    router.get('/registro',(req,res)=>{
        res.render('usuarios/registro')

            })
//Páginas

//Formularios
        router.get('/login',(req,res)=>{
           res.render('usuarios/login') 
        })
// Interações com servidor
    // salvar dados
            router.post('/registro',(req,res)=>{
                let erros = [];
                if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
                    erros.push({texto: 'Nome inválido'})
                }
                if (!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
                    erros.push({texto: 'E-mail inválido'})
                }
                if (!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
                    erros.push({texto: 'Preencha a senha'})
                }
                if (!req.body.senha2 || typeof req.body.senha2 === undefined || req.body.senha2 === null) {
                    erros.push({texto: 'Preencha a senha novamente'})
                }
                if (req.body.senha.length < 8) {
                    erros.push({texto: 'A senha deve ter no minímo 6 caracteres'})

                }
                if (req.body.senha != req.body.senha2 ) {
                    erros.push({texto: 'As senhas não correspondem, tente novamente!'})
                } 
                if (erros.length > 0) {
                    res.render('usuarios/registro',{erro: erros});
                } else {
                    // verificação de email já registrado 
                    Usuarios.findOne({email: req.body.email}).then((usuario)=>{                        
                        if (usuario) {
                            req.flash('error_msg','Este e-mail já existe, tente novamente!')
                            res.redirect('/usuarios/registro')
                        } else {                            
                            const novoUsuario = new Usuarios({
                                nome: req.body.nome,
                                email: req.body.email,
                                senha: req.body.senha
                                
                            })                            
                            bcrypt.genSalt(10, (erro,salt)=>{
                                bcrypt.hash(novoUsuario.senha, salt,(erro,hash)=>{
                                    if (erro) {
                                        req.flash('error_msg','Houve um erro durante o salvamento do usuário')
                                        res.redirect('/usuarios/registro')
                                    }
                                    novoUsuario.senha = hash;                                   
                                    novoUsuario.save().then(()=>{
                                        req.flash('success_msg','Usuário criado com sucesso!')                                        
                                        res.redirect('/')
                                    }).catch((erro)=>{
                                        req.flash('error_msg','Houve ao registrar o usuário!')
                                        res.redirect('/usuarios/registro')
                                    })
                                })
                            })
                        }
                          
                    }).catch((error)=>{
                        req.flash('error_msg','Houve um erro interno')
                        res.redirect('/')
                    })
                }
            })
    // authenticar
            //Login
        router.post('/login',(req,res,next)=>{
                passport.authenticate('local',{
                    successRedirect: '/',
                    failureRedirect: '/usuarios/login',
                    failureFlash: true
                })(req,res,next)
            })
            //logout
            router.get('/logout',(req,res)=>{
                req.logout();
                req.flash('succes_msg','Deslogado com sucesso!')
                res.redirect('/')
            })

    // editar dados

    //excluir dados

module.exports = router