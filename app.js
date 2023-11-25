const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require("@prisma/client")


const app = express()

app.use(express.json())
const prisma = new PrismaClient()

const { eAdmin } = require("./middlewares/auth")

app.get('/', async (req, res) => {

    const posts = await prisma.post.findMany()

   return res.json({
    "erro": false,
    "msg": "Listar posts",
    posts
   })

})

app.get('/home', eAdmin, async (req, res) => {

    const posts = await prisma.post.findMany()
    

   return res.json({
    "erro": false,
    "msg": "Listar posts",
    userLogado: {
        "id": req.userId,
        "user": req.userName,
    },
    posts
   })

})

app.post('/signUp', async (req, res) => {


    const users = await prisma.user.findUnique({ 
        where: {
            user: req.body.user  
        }  
    })
    

    if(users != undefined) {
        return res.status(400).json({
            "erro": true,
            "msg": "ERRO: Usuário já existe"
        })
    }


    if(!req.body.user || !req.body.password) {
        return res.status(400).json({
            "erro": true,
            "msg": "ERRO: As informaçoes não estão corretas."
        })

    } else {

        const password = await bcrypt.hash(req.body.password, 8)

        const user = await prisma.User.create({
            data: {
                user: req.body.user,
                password: password
            }
        })

        return res.json({
            "erro": false,
            "msg": "Cadastrar usuário",
            user
        })
    }
    

})

app.post('/signIn', async (req, res) => {

    const users = await prisma.user.findMany()
    const user = users.find(user => user.user == req.body.user)

    if(user == undefined) {
        return res.status(400).json({
            "erro": true,
            "msg": "Nome ou senha incorretos!"
        })
    }


    if(!(await bcrypt.compare(req.body.password, user.password.toString()))) {
        return res.status(400).json({
            "erro": true,
            "msg": "Nome ou senha incorretos!"
        })
    }

    const token = jwt.sign({ id: user.id, user: user.user }, process.env.SECRET_TOKEN, {
        // expiresIn: '7d' // 7 dias
        // expiresIn: 60 // 1min
        // expiresIn: 60 * 10 //10min

        expiresIn: '1d'
    })


    return res.json({
        "erro": false,
        "msg": "Login",
        token
    })

})

app.post('/post', eAdmin, async (req, res) => {

    const post = await prisma.post.create({
        data: {
            
            title: req.body.title,
            about: req.body.about,
            userId: req.userId
        }
    })

    return res.json({
        "erro": false,
        "msg": "Postagem criada.",
        post
    })

})

app.put('/putUser', eAdmin, async (req, res) => {

    const user = await prisma.user.update({
        where: {
            user: req.userName
        }, data: {
            user: req.body.user
        }

    })

    return res.json({
        "erro": false,
        "msg": "Nome de usuário alterado.",
        user
    })

})

const PORT = 3000
app.listen(PORT, () => console.log("Servidor rodando na porta: "+PORT ))