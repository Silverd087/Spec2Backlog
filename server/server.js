const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const router = require('./routes/api')
const userRouter = require("./routes/auth")
const googleAuthRouter = require("./routes/googleAuth")
const githubAuthRouter = require("./routes/githubAuth")
const cookieParser = require('cookie-parser')
dotenv.config()
const { getJwks } = require("./services/dbKeyStore")
const initCronJobs = require("./services/cron")
const { deleteKeys, rotateKey } = require("./services/dbKeyStore")
const projectRouter = require("./routes/project")
const paymentRouter = require("./routes/payment")
const { initializeRedis } = require('./connectRedis')
const app = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())



app.use('/api', router)
app.use('/api/auth', userRouter)
app.use('/api/auth', googleAuthRouter)
app.use('/api/auth', githubAuthRouter)
app.use('/api/project', projectRouter)
app.use('/api', paymentRouter)



app.get('/health', (req, res) => {
  res.json({ message: 'ok' })
})

app.get('/api/auth/.well-known/jwks.json', async (req, res) => {
  return res.json(await getJwks())
})

app.get('/ngnix', async (req, res) => {
  return res.json({
    server: port,
    message: `Handled by server ` + port
  })
})
initializeRedis()
rotateKey()




app.listen(port, initCronJobs(), () => {
  console.log('Server is running on port ', port)
})