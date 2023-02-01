import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'

import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const config = new Configuration({
    apiKey: process.env.OPENAI_APIKEY
})

const openai = new OpenAIApi(config)

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello World!'
    })
})

app.post('', async (req, res) => {
    try {
        const prompt = req.body.prompt

        const res = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: .5,
            presence_penalty: 0
        })
        
        res.status(200).send({
            bot: res.data.choices[0].text
        })
    } catch (err) {
        console.error(err)
        res.status(500).send({ err })
    }
})

app.listen(5000, () => console.log('El servidor está corriendo en el puerto http://localhost:5000'))