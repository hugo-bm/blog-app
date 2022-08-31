// Carregando móduulos
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const admin = require('./routes/admin');
const path  = require ('path');
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuarios')
const passport = require('passport')
require('./config/auth')(passport)
const {eAdmin} = require('./helpers/eAdmin');
const db = require('./config/db')
// Configurações 
    //Sessão
        app.use(session({
            secret: process.env.SECRET_SESSION,
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    //Midleware
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null
            next()
        });
    //Body parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
       app.engine('handlebars', handlebars({defaultLayout: 'main'}));
       app.set('view engine', 'handlebars');
    //mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true}).then(
        ()=>console.log('Conectado no mongo\nAi caramba!!!')).catch(
            (erro)=>console.log('Erro na conexao do servidor: '+ erro));
// public - statics arquives
app.use(express.static(path.join(__dirname,'/public')));
// Rotas
    app.get('/',(req,res)=>{
        Postagem.find().populate('categorias').sort({data: 'desc'}).then((postagens)=>{
            res.render('index',{postagens: postagens})
        }).catch((erro)=>{
            req.flash('error_msg','Houve um erro interno')
            res.redirect('/erro_404')
        })
        
    })
    //posts
    app.get('/postagens/:slug',(req,res)=>{
        Postagem.findOne({slug: req.params.slug}).then((postagens)=>{
            if (postagens) {
                res.render('postagens/index',{postagens: postagens})
            } else {
                req.flash('error_msg','Esta postagem não  existe!')
                res.redirect('/') 
            }
        }).catch((erro)=>{
            req.flash('error_msg','Esta postgem não  existe!')
            res.redirect('/') 
        })
    })
    app.get('/erro_404',(req,res)=>{
       res.send(document.body.innerHTML= '<h4><i class="fas fa-exclamation-triangle"></i>Erro 404</h4>')
     })
    
     //categorias
     app.get('/categorias',(req,res)=>{
         Categoria.find().sort({date: 'desc'}).then((categoria)=>{
            res.render('categorias/index',{categorias: categoria})
         }).catch((erro)=>{
            req.flash('error_msg','Erro interno ao listar as categorias')
            res.redirect('/') 
         })
     })
     app.get('/categorias/:slug',(req,res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
           if (categoria) {
                Postagem.find({categorias: categoria._id}).then((postagem)=>{
                    res.render('categorias/postagens',{postagens: postagem, categoria: categoria})
                }).catch((erro)=>{
                    req.flash('error_msg','Houve um erro interno ao listar as postagens'),
                    res.redirect('/')
                })
           } else {
            req.flash('error_msg','Esta categoria não existe')
            res.redirect('/') 
           }
        }).catch((erro)=>{
           req.flash('error_msg','Erro interno ao ao carregar a página dessa categoria')
           res.redirect('/categorias') 
        })
    })
//chamar servidor
app.use('/admin',eAdmin,admin);
app.use('/usuarios', usuarios);
let PORT = process.env.PORT|| 1234;
app.listen(PORT,()=>console.log("Ai caramba! \nconectado na porta "+PORT));
