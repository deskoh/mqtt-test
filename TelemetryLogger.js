const fs = require('fs')
const path = require('path')
const moment = require('moment')

moment.relativeTimeThreshold('s', 59)
moment.relativeTimeThreshold('ss', 0)

const stats = {}

class TelemetryLogger {
  constructor(baseDir) {
    this.baseDir = baseDir
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir)
    }
    console.info(`Logging to ${baseDir}`)
    this.streamMap = new Map()

    setInterval(() => {
      Object.values(stats).forEach(e => {
        e.updated = moment(e.timestamp).fromNow()
      })
      console.clear()
      console.table(stats, ['time', 'updated', 'data'])
    }, 1000)
  }

  log(topic, message) {
    try {
      const data = message.toString()
      const payload = JSON.parse(data)
      if (topic) {
        const stream = this.getStream(topic.replace('/', '_'))
        const now = new Date()
        stream.write(`[${now.toLocaleString()}] ${JSON.stringify(payload)}\n`)
        payload['timestamp'] = now
        payload['time'] = now.toLocaleTimeString()
        payload['data'] = data.slice(0, 100)
        stats[topic] = payload
      }
    } catch (error) {
      fs.appendFileSync('error.txt', `[${new Date().toISOString()}] ${topic}: ${message.toString()}\n`)
      console.error('Non JSON payload', error)
    }
  }

  getStream(key) {
    if (!this.streamMap.has(key)) {
      const filepath = path.join(this.baseDir, `${key}.txt`)
      console.info(`Creating ${filepath}`)
      this.streamMap.set(
        key, fs.createWriteStream(filepath, {flags: 'a'}),
      )
    }
    return this.streamMap.get(key)
  }
}


module.exports = new TelemetryLogger(path.join(__dirname, 'logs'))
