const mqtt = require('mqtt')

const host = process.env.HOST
const client  = mqtt.connect(host, {
  username: process.env.USER,
  password: process.env.PASSWORD,
})

client.on('message', function (topic, message) {
  console.log(`${topic}: ${message.toString()}`)
})

client.subscribe('#')

console.log(`Connecting to ${host}`)
client.on('connect', function () {
  console.log('Connected!');
  client.publish('presence', 'Hello mqtt from node')
})

client.on('error', function (error) {
  console.log("Can't connect" + error)
  process.exit(1)
})
