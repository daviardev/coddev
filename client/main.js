import { $, __ } from './src/utils/dom'

import bot from '/bot.svg'
import user from '/user.svg'

import './style.css'

$('#app')

const form = $('form')
const chatContainer = $('#chat__container')

let loadInterval

// Tenemos un elemento vacío, ese elemento tiene un contenido de un texto, ese texto se le va a agregar
// un . cada vez que pasen 300ms cuando llega a 4 puntos, se reinicia.

const loader = element => {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.'

        if (element.textContent === '....') {
            element.textContent = ''
        }
    }, 300)
}

// Cuando el indice del texto sea menor a la cantidad de carácteres, dibuje el texto de la información
// dentro del html y lo vaya incrementando mientras escribe la respuesta, si no hay respuesta, limpiar

const typeText = (element, text) => {
    let index = 0

    const interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// Genera un ID para cada mensaje

const generateId = () => {
    const timestamp = Date.now()
    const randonNum = Math.random()
    const hexaString = randonNum.toString(16)

    return `id-${timestamp}-${hexaString}`
}

// Dibujar mensajes de la AI y del usuario

const chatDraw = (isAi, value, uniqueId) => {
    return (
        `
        <div class='wrapper ${isAi && 'ai'}'>
            <div class='chat'>
                <div class='profile'>
                    <img 
                      src=${isAi ? bot : user} 
                      alt='${isAi ? 'bot' : 'user'}' 
                    />
                </div>
                <div class='message' id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

// Evento para ejecutar las intrucciones al envíar el texto

const handleSubmit = async e => {
    e.preventDefault()

    const data = new FormData(form)

    // Menaje del usuario
    chatContainer.innerHTML += chatDraw(false, data.get('prompt'))
    form.reset()

    // Mensaje del bot
    const uniqueId = generateId()
    chatContainer.innerHTML += chatDraw(true, ' ', uniqueId)

    // Scroll hacía abajo cuando se escriba el texto
    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = __(uniqueId)
    loader(messageDiv)

    // Obtener datos a la respuesta del bot
    const res = await fetch('https://coddev.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    // Una vez termine la respuesta al bot, detiene el punto del mensaje
    clearInterval(loadInterval)
    messageDiv.innerHTML = ''

    if (res.ok) {
        const data = await res.json()
        const parsedData = data.bot.trim()

        typeText(messageDiv, parsedData)
    } else {
        const err = await res.text()

        messageDiv.innerHTML = 'Algo está pasando.'

        window.alert(err)
    }
}

// Escuchar evento

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        handleSubmit(e) 
    }
})