const express = require('express')
const router = require('express').Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('./admin/index.handlebars')
})

router.get('/post', eAdmin, (req, res) => {
    res.send('Página de posts')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('./admin/categorias.handlebars', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias')
      res.redirect('/admin') 
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('./admin/addcategorias.handlebars')
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = [] // Array

    if (!req.body.nome){
        erros.push({texto: 'Nome inválido'}) // Adiciona ao array
    }

    if (!req.body.slug){
        erros.push({texto: 'Slug inválido'})
    }

    if (req.body.nome.length < 3){
        erros.push({texto: 'Nome da categoria muito pequeno!'})
    }

    if (erros.length > 0){
        res.render('./admin/addcategorias.handlebars', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('erro_msg', 'Houve um erro ao salvar a categoria. Tente novamente!')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('./admin/editcategorias.handlebars', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Categoria não encontrada')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
    
    var erros = [] // Array

    if (!req.body.nome){
        erros.push({texto: 'Nome inválido'}) // Adiciona ao array
    }

    if (!req.body.slug){
        erros.push({texto: 'Slug inválido'})
    }

    if (req.body.nome.length < 3){
        erros.push({texto: 'Nome da categoria muito pequeno!'})
    }

    if (erros.length > 0){
        res.render('./admin/addcategorias.handlebars', {erros: erros})
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria '+err)
                res.redirect('/admin/categorias')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria.')
            res.redirect('/admin/categorias')
        })
    }
})

router.post('/categorias/deletar/:id', eAdmin, (req, res) => {

    Categoria.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria!')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('./admin/postagens.handlebars', {postagens: postagens.map(postagens => postagens.toJSON())})  
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar as postagens.')
      res.redirect('/admin') 
    })
})

router.get('/postagens/addpostagem', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('./admin/addpostagem.handlebars', {categorias: categorias})
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
    var erros = []

    if (!req.body.titulo){
        erros.push({texto: 'Título inválido!'})
    }

    if (!req.body.slug){
        erros.push({texto: 'Slug inválido!'})
    }

    if (!req.body.descricao){
        erros.push({texto: 'Descrição inválida!'})
    }

    if (!req.body.conteudo){
        erros.push({texto: 'Conteúdo inválido!'})
    }

    if (req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria!'})
        res.redirect('/admin/categorias')
    }

    if (erros.length > 0){
        res.render('./admin/addpostagem.handlebars')
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            res.flash('error_msg', 'Houve um erro ao salvar a postagem!')
            res.redirect('/admin/postagens')
        })
    }
})

router.post('/postagens/edit', eAdmin, (req, res) => {
    var erros = []

    if (!req.body.titulo){
        erros.push({texto: 'Título inválido!'})
    }

    if (!req.body.slug){
        erros.push({texto: 'Slug inválido!'})
    }

    if (!req.body.descricao){
        erros.push({texto: 'Descrição inválida!'})
    }

    if (!req.body.conteudo){
        erros.push({texto: 'Conteúdo inválido!'})
    }

    if (req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria!'})
        res.redirect('/admin/categorias')
    }

    if (erros.length > 0){
        res.render('./admin/postagens.handlebars')
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada.')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria')
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a postagem.')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render('./admin/editpostagens.handlebars', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Postagem não encontrada')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem!')
        res.redirect('/admin/postagens')
    })
})

module.exports = router