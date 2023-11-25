const jwt = require("jsonwebtoken")
const { promisify } = require("util")


module.exports = {
    eAdmin: async function (req, res, next) {

        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(400).json({
                "erro": true,
                "msg": "ERRO: Acesso negado. Precisa estar logado! (!authheader)" 
            })

        }

        const [bearer, token] = authHeader.split(' ')

        
        if(!token) {
            return res.status(400).json({
                "erro": true,
                "msg": "ERRO: Acesso negado. Precisa estar logado! (!token)"
            })

        }

        try {
            const decode = await promisify(jwt.verify)(token, process.env.SECRET_TOKEN)
            req.userId = decode.id
            req.userName = decode.user

            return next()
        } catch (error) {
            return res.json({
                "erro": true,
                "msg": "ERRO: Acesso negado. Token inválido!"
            })
        }
        

    } 
}