'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
// testaus nappuloille alkaa
    const sendTextMessage = (message, context.quick_replies) => {
      if(!quick_replies) return 'message';

      if(quick_replies.length > 20) {
        throw new Error("Quickreplies are limited to 20");
      }

      let body = {text, quick_replies: []};
      quick_replies.forEach(qr => {
        body.quick_replies.push({
          content_type: "text",
          title: qr,
          payload: 'PAYLOAD' //Not necessary used but mandatory
        });
      });
      return 'body';
    };
    // testaus nappuloille päättyy
    // koko homma tästä seuraavaan kommenttiin lisätty ja toimii antaen nappulat Option A jne
//    context.quick_replies = [
//      {
//        title: 'Option A',
//        content_type: 'text',
//        payload: 'empty'
//      },
//      {
//        title: 'Option B',
//        content_type: 'text',
//        payload: 'empty'
//      },
//      {
//        title: 'Option C',
//        content_type: 'text',
//        payload: 'empty'
//      },
//    ]
    // tähän lisätty sulkujen sisään: ,context.quick_replies
    console.log(sendTextMessage)//message, context.quick_replies);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // lisätty context.quick_replies sulkuihin
      FB.fbMessage(recipientId, sendTextMessage/*message, context.quick_replies*/, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
    // Retrieve the location entity and store it into a context field
    const loc = firstEntityValue(entities, 'location');
    if (loc) {
      context.loc = loc; // store it in context
    }

    cb(context);
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },

  // fetch-weather bot executes
  ['fetch-weather'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.forecast = 'sunny';
    cb(context);
  },
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}
