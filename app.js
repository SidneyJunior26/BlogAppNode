// Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)

// Configurações
    // Sessão
        app.use(session({// App.use Middleware
            secret: 'cursodenode',
            resave: true,
            saveUninitialized: true
        })) 

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })

    // Body Barser
        app.use(bodyParser.urlencoded({extended: false}))
        app.use(bodyParser.json())

    // Handlebars
        app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
        app.set('view engine', 'handlebars')

    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://localhost/blogapp').then(() => {
            console.log('Conectado ao MongoDB')
        }).catch((err) => {
            console.log('Erro ao se conectar: '+err)
        })
    // Public
        app.use(express.static('public'))

// Rodas
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).lean().then((postagens) => {
            res.render('index.handlebars', {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
        
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render('postagem/index.handlebars', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Postagem não encontrada')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('categorias/index.handlebars', {categorias: categorias})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listas as categorias.')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){

                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render('categorias/postagens.handlebars', {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar os posts')
                    res.redirect('/')
                })

            }else{
                req.flash('error_msg', 'Categoria não localizada!')
                req.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página desta categoria.')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })


    app.use('/admin', admin)

    app.use('/usuarios', usuarios)

// Outros
const port = 8081
app.listen(port, () => {
    console.log('Servidor rodando na porta ' + port)
})