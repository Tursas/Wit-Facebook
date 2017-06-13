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
// testaus nappuloille alkaa, ei toiminut, mutta tästä voisi saada apua otsikoiden haluun.
/*   const sendTextMessage = (message, quickreplies) => {
      if(!quickreplies) return 'message';
      response.quickreplies.map(x => {title: x, content_type: "text", payload: "empty"});
     let body = {msg, quickreplies: []};
      quickreplies.forEach(qr => {
        body.quickreplies.push({
          content_type: "text",
          title: qr,
          payload: 'PAYLOAD' //Not necessary used but mandatory
        });
      });
      return body;
    };
    // testaus nappuloille päättyy*/
    // koko homma tästä seuraavaan kommenttiin lisätty ja toimii antaen dynaamiset nappulat
  /*  context.quick_replies = [ {
      title: 'title',
      content_type: 'text',
      payload: 'empty'
    },   {
      title: 'title',
      content_type: 'text',
      payload: 'empty'
    }, {
      title: 'title',
      content_type: 'text',
      payload: 'empty'
    } ]*/
  console.log(message);

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

      FB.fbMessage(recipientId, message, (err, data) => {
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


// nappulatestausta
send(request, response) {
  const {sessionId, context, entities} = request;
  let {text, quickreplies} = response;
  if(text.substring(0,6) === IDENTIFY_PAYLOAD){
    text = text.substring(6); // It is a payload, not raw text
  } else {
    text = {"text": text};
  }
  if(typeof quickreplies !== "undefined"){
    text.quick_replies = response.quickreplies
      .map(x => { return {
        "title": x, "content_type": "text", "payload": "empty"}
    });
  }
}
// testaus päättyy


  /*// fetch-weather bot executes
    ['fetch-weather'](sessionId, context, cb) {
    //Here should go the api call, e.g.:
      context.forecast = apiCall(context.loc)
      context.forecast = 'sunny';
      cb(context);
  }*/
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
