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

const rooms = {}

const messages = {}

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'chat.html'))
})

function findOrCreateRoom() {
  for (let room in rooms) {
    if (rooms[room] < 2) {
      rooms[room]++
      return room
    }
  }
  const newRoom = nanoid()
  rooms[newRoom] = 1
  messages[newRoom] = []
  return newRoom
}

io.on('connection', (socket) => {
  const room = findOrCreateRoom()
  console.log('file: main.js:38  room', room)
  socket.emit('find room', room)

  socket.on('join room', (roomName) => {
    socket.join(roomName)
  })

  socket.on('send message', ({ content, sender, to }) => {
    console.log('file: main.js:45  to', to)
    if (messages[to]) {
      messages[to].push({ [sender]: content })
      const payload = { content, sender }
      io.to(to).emit('new message', payload)
    }
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})

/*
A button on the page - click on it:
  - server checks for existing queues of length 1
    - if exists, then adds you to one of them
    - else, creates a new queue
You then wait in the queue until another person joins the queue
And then the chat is started

For the queue, using an array would work to test out the concept. And then redis could be used later
*/
