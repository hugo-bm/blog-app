const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');

//Rotas
// paginas
router.get('/',(req,res)=>{
    res.render("admin/index")
})
router.get('/posts',(req,res)=>res.send('posts'));
router.get('/categorias',(req,res)=>{
    Categoria.find().sort({Date: 'desc'}).then((categorias)=>{
        res.render('admin/categorias',{categorias})
    }).catch((erro)=>{
        req.flash('error_msg','Falha ao listar as categorias'),
        res.render('/admin')
    });    
});
router.get('/postagens',(req,res)=>{
    Postagem.find().populate('categorias').sort({data: 'desc'}).then((postagens)=>{        
        res.render('admin/postagens',{postagens: postagens})
        
    }).catch((erro)=>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
})
// rota para editar
router.get("/categorias/editar/:id",(req,res)=>{
    Categoria.findOne({_id: req.params.id}).then(
        (categoria)=>res.render('admin/categorias_editar',{categoria: categoria})).catch((erro)=>{
            req.flash('error_msg','Esta categoria não existe'),
            res.redirect('/admin/categorias')
        });
});
router.get("/postagens/editar/:id",(req,res)=>{
    Postagem.findOne({_id: req.params.id}).then(
        (postagem)=>{
            Categoria.find().then(
                (categoria)=>res.render('admin/postagens_editar',{postagens: postagem, categorias: categoria})).catch((erro)=>{
                    req.flash('error_msg','Houve um erro ao listar as categorias')
                    res.redirect('/admin/postagens')
                })            
        }).catch((erro)=>{
            req.flash('error_msg','Esta postagem não existe'),
            res.redirect('/admin/postagens')
        });
    });
    // rotas de preenchimento de formulario
router.get('/categorias/add',(req,res)=>res.render('admin/categorias_add'));


router.get('/postagens/add',(req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render('admin/postagens_add',{categorias: categorias})        
    }).catch((erro)=>{
        req.flash('error_msg','Houve um erro ao carregar o formulário'),
        res.redirect('/admin')
    })
});
// Interações com servidor
// introdução de dados
router.post('/categorias/nova',(req,res)=>{// rota do formulario
    let erros = [];
    if (!req.body.nome||typeof req.body.nome === undefined||req.body.nome === null) {
        erros.push({texto: 'Nome inválido'})
    }
    if (!req.body.slug||typeof req.body.slug === undefined||req.body.slug === null) {
        erros.push({texto: 'Slug inválido'})
    }
    if (req.body.slug.length <2) {
        erros.push({texto: 'Slug muito pequeno'})
    }
    if (erros.length > 0) {
        res.render('admin/categorias_add',{erro: erros});
    }
    else{
        const novaCategoria ={ //carregamento dos valores
            nome: req.body.nome,
            slug: req.body.slug    
        }
        new Categoria(novaCategoria).save().then(()=>{            
            req.flash('success_msg','Nova categoria registrada com sucesso!'),            
            res.redirect('/admin/categorias')       
        }).catch((erro)=>{
            req.flash('error_msg','Erro ao registrar a categoria, tente novamente!')
        })
    }
})
router.post('/postagens/nova',(req,res)=>{
    let erros=[]    
    if (!req.body.titulo||req.body.titulo=== null|| req.body.titulo=== undefined) {
        erros.push({titulo: 'Título inválido'})
    }
    if (!req.body.slug||req.body.slug=== null|| req.body.slug=== undefined) {
        erros.push({titulo: 'Slug inválido'})
    }
    if (!req.body.descricao||req.body.descricao=== null|| req.body.descricao=== undefined) {
        erros.push({titulo: 'Descrição inválida'})
    }
    if (!req.body.conteudo||req.body.conteudo=== null|| req.body.conteudo=== undefined) {
        erros.push({titulo: 'Título inválido'})
    }
    if (req.body.categorias === '0') {
        erros.push({titulo: 'Nenhuma categoria selecionada. Selecione uma categoria!'})
    }    
    if (erros.length > 0) {
        res.render('admim/postagens_add',{erro: erros})
    }
    else{        
        const novaPostagem = { //carregamento dos valores
            titulo: req.body.titulo,
            slug: req.body.slug ,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categorias: req.body.categorias
        }
        new Postagem(novaPostagem).save().then(()=>{            
            req.flash('success_msg','Nova postagem registrada com sucesso!'),            
            res.redirect('/admin/postagens')       
        }).catch((erro)=>{
            req.flash('error_msg','Erro ao registrar a postagem, tente novamente!'+erro),
            res.redirect('/admin/postagens')
        }) 
    }
})
// edição de dados
    //Categorias
router.post('/categorias/edit',(req,res)=>{
    Categoria.findOne({_id: req.body.id}).then(
        (categoria)=>{
    let erros=[];
    if (!req.body.nome||typeof req.body.nome === undefined||req.body.nome === null) {
        erros.push({texto: 'Nome inválido'})
    }
    if (!req.body.slug||typeof req.body.slug === undefined||req.body.slug === null) {
        erros.push({texto: 'Slug inválido'})
    }
    if (req.body.slug.length <2) {
        erros.push({texto: 'Slug muito pequeno'})
    }
    if (erros.length > 0) {
        res.render('admin/categorias_editar',{erro: erros,categoria: categoria});
    }
    else{    
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;            
       
           categoria.save().then(()=>{
               req.flash('success_msg','Categoria editada com sucesso!')
               res.redirect('/admin/categorias')
            }).catch(
               (erro)=>{
            req.flash('error_msg','Erro um erro interno ao editar a categoria')
            res.redirect('/admin/categorias')
            })}
         } ).catch((erro)=>req.flash('error_msg','Erro ao editar a categoria'))    
})
    //postagens
router.post('/postagens/edit',(req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{              
            let erros= []
            if (req.body.categorias === '0') {
                erros.push({texto: 'Houve um erro ao registrar a postagem'})
            }
            if (erros.length > 0) {
                res.render('admin/postagens_editar',{erro: erros,postagens: postagens,categorias: postagem.categorias})
            } else {
                postagem.titulo= req.body.titulo,
                postagem.slug= req.body.slug ,
                postagem.descricao= req.body.descricao,
                postagem.conteudo= req.body.conteudo,
                postagem.categorias= req.body.categorias
                postagem.save().then(()=>{
                    req.flash('success_msg','Postagem editada com sucesso!')                    
                    res.redirect('/admin/postagens')
                 }).catch(
                    (erro)=>{
                 req.flash('error_msg','Erro um erro interno ao editar a postagem')
                 
                 res.redirect('/admin/postagens')
                 })}                       
    }).catch((erro)=>req.flash('error_msg','Erro ao editar a postagem'))  
})
// exclusão de dados
router.post('/categorias/delete',(req,res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash('success_msg','Categoria excluida com sucesso!'),
        res.redirect('/admin/categorias')
    }).catch((erro)=>{
        req.flash('error_msg','Erro ao excluir a categoria'),
        res.redirect('/admin/categorias')
    });
});
router.post('/postagens/delete',(req,res)=>{
    Postagem.deleteOne({_id: req.body.id}).then(()=>{        
        req.flash('success_msg','Postagem excluida com sucesso!'),
        res.redirect('/admin/postagens')
    }).catch((erro)=>{
        req.flash('error_msg','Erro ao excluir a postagem'),
        res.redirect('/admin/postagens')
    });
});
module.exports = router