require('dotenv/config')
const express = require('express')
const twilio = require('twilio')
const VoiceResponse = twilio.twiml.VoiceResponse
const bodyParser = require('body-parser')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const destNumber = process.env.DEST_NUMBER
const client = twilio(accountSid, authToken)

const app = express()
const voice = 'alice'

app.use(bodyParser.urlencoded())

app.post('/start', (request, response) => {
  const twiml = new VoiceResponse()

  twiml.say({voice}, "Thank you for calling the Super Saver Web Store")

  twiml.pause()

  const gather = twiml.gather({numDigits: 1, input: 'dtmf speech', hints: ['one', 'two', 'three'], finishOnKey: '', voice, action: '/menu', method: 'POST'})

  twiml.pause()

  gather.say({voice}, 'To check the status of an order, press 1. To initiate a refund, press 2. For all other inquiries, press zero.')

  response.type('text/xml')
  response.send(twiml.toString())
})

app.post('/menu', (request, response) => {
  const twiml = new VoiceResponse()
  let gather

  twiml.pause()

  if (request.body.Digits) {
    switch (request.body.Digits) {
      case '0':
        twiml.say({voice}, 'Please enter a callback number and customer service rep will call you back.')
        twiml.say({voice}, 'Expected wait time is 10 to 20 minutes')
        twiml.hangup()
      case '1':
        gather = twiml.gather({numDigits: 8, input: 'dtmf speech', finishOnKey: '#', voice, action: '/status', method: 'POST'})
        gather.say({voice}, 'Please enter your 8 digit order number, followed by the # key')

        break

      case '2':
        gather = twiml.gather({numDigits: 8, input: 'dtmf speech', finishOnKey: '#', voice, action: '/refund', method: 'POST'})
        gather.say({voice}, 'Please enter your 8 digit order number, followed by the # key')

        break

      default:
        twiml.say({voice}, "Sorry, I didn't understand that choice")
        twiml.redirect('/start')
        break
    }
  } else {
    twiml.redirect('/start')
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml')
  response.send(twiml.toString())
})

app.post('/status', async (request, response) => {
  const twiml = new VoiceResponse()
  const number = request.body.Digits

  twiml.pause()

  if (number) {
    await sendOrderStatus(number)

    twiml.say({voice}, "We found that order. We've just sent you an email with the status of the order. Please check your email.")
    twiml.pause()
    twiml.say({voice}, "Good bye")
    twiml.hangup()
  } else {
    twiml.redirect('/start')
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml')
  response.send(twiml.toString())
})

app.post('/refund', async (request, response) => {
  const twiml = new VoiceResponse()
  const number = request.body.Digits

  twiml.pause()

  if (number) {
    await sendRefundIntructions(number)

    twiml.say({voice}, "We found that order. We've just sent you an email with instructions for returning the order. Please check your email.")
    twiml.pause()
    twiml.say({voice}, "Good bye")
    twiml.hangup()
  } else {
    twiml.redirect('/start')
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml')
  response.send(twiml.toString())
})

// Create an HTTP server and listen for requests on port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log(
    'Now listening, be sure to restart when you make code changes!'
  )
})

function sendOrderStatus(number) {
  // fake for now, but you get the point
  console.log(`Sending order status for ${number}`)
}

function sendRefundIntructions(number) {
  // fake for now, but you get the point
  console.log(`Sending refund instructions for ${number}`)
}
