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
      console.table(stats, ['lat', 'lng', 'alt', 'v', 'a', 'head', 'bear', 'hdop', 'vdop', 'rol', 'pit', 'yaw', 'bat', 'volt', 'temp', 'updated'])
    }, 1000)
  }

  log(topic, message) {
    try {
      const payload = JSON.parse(message.toString())
      const imei = payload.IMEI
      if (imei) {
        const stream = this.getStream(imei)
        stream.write(`[${new Date().toISOString()}] ${JSON.stringify(payload)}\n`)
        payload['timestamp'] = new Date()
        stats[imei] = payload
      }
    } catch (error) {
      fs.appendFileSync('error.txt', `[${new Date().toISOString()}] ${topic}: ${message.toString()}\n`)
      console.error('Non JSON payload', error)
    }
  }

  getStream(imei) {
    if (!this.streamMap.has(imei)) {
      const filepath = path.join(this.baseDir, `${imei}.txt`)
      console.info(`Creating ${filepath}`)
      this.streamMap.set(
        imei, fs.createWriteStream(filepath, {flags: 'a'}),
      )
    }
    return this.streamMap.get(imei)
  }
}


module.exports = new TelemetryLogger(path.join(__dirname, 'logs'))
