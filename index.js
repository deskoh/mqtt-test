const mqtt = require('mqtt')
const fs = require('fs')

const logger = require('./TelemetryLogger')

const host = process.env.HOST
const client  = mqtt.connect(host, {
  username: process.env.USER,
  password: process.env.PASSWORD,
  ca: fs.readFileSync('serverCA.crt'),
  // key: fs.readFileSync('f6f39ebf37-private.pem.key'),
  // cert: fs.readFileSync('f6f39ebf37-certificate.pem.crt'),
  // rejectUnauthorized: false,
})

client.on('message', function (topic, message) {
  // console.log(`${topic}: ${message.toString()}`)
  logger.log(topic, message)
})

client.subscribe('#')

console.log(`Connecting to ${host}`)
client.on('connect', () => {
  console.log('Connected!')
  // setInterval(() => client.publish('test', '{"hello": "world"}', 2000), 1000)
})

client.on('error', function (error) {
  console.log("Can't connect" + error)
  process.exit(1)
})
