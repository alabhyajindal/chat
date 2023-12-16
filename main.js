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
  // console.log(socket.id)
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
  socket.emit('find room', room)

  socket.on('join room', (roomName) => {
    socket.join(roomName)
    if (rooms[roomName] === 2) {
      io.to(roomName).emit('room full')
    }
  })

  socket.on('send message', ({ content, sender, to }) => {
    if (messages[to]) {
      messages[to].push({ [sender]: content })
      const payload = { content, sender }
      io.to(to).emit('new message', payload)
    }
  })

  console.log({ rooms })

  socket.on('disconnecting', () => {
    for (let room of socket.rooms) {
      if (rooms[room]) {
        io.to(room).emit('stranger left')
        delete rooms[room]
        delete messages[room]
      }
    }
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
