import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import { nanoid } from 'nanoid'

const app = express()
const server = createServer(app)
const io = new Server(server)

const __dirname = dirname(fileURLToPath(import.meta.url))

const messages = {
  football: [],
  music: [],
  running: [],
}

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'chat.html'))
})

io.on('connection', (socket) => {
  socket.on('join room', (roomName) => {
    socket.join(roomName)
  })

  socket.on('send message', ({ content, sender, to }) => {
    if (messages[to]) {
      messages[to].push({ [sender]: content })
      console.log(messages)
      const payload = { content, sender }
      io.to(to).emit('new message', payload)
    }
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
