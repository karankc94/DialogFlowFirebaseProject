// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Dialogflow fulfillment getting started guide:
// https://dialogflow.com/docs/how-tos/getting-started-fulfillment

'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
 // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
 // console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  // commonHandler(agent);
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function commonHandler(agent) {

    let reqEntities = request.body.queryResult.parameters;
    let payload = [];
    let extractedEntities = [];
    request.body.queryResult.fulfillmentMessages.forEach((e) => {
      for (let key in e) {
        if (key == 'payload') {
          payload = e[key].ModelEntities;
        }
      }
    })
    payload.forEach((e) => {
      for (let i = 0; i < e.entity.length; i++) {
        e.entity[i] = e.entity[i].toUpperCase();
      }
      e.entity.sort();
    }
    )

    for (let key in reqEntities) {
      if (reqEntities[key].constructor === String && reqEntities[key]) {
        extractedEntities.push(reqEntities[key].toUpperCase());
      }
      else if (reqEntities[key].constructor === Array) {
        reqEntities[key].forEach(
          (e) => { extractedEntities.push(e.toUpperCase()); });
      }
    };
    extractedEntities.sort();

    let result = payload.filter(z => { return (JSON.stringify(z.entity) == JSON.stringify(extractedEntities)); });
    if (result && result.length > 0) {
      agent.add(result[0].value);
    }
    else {
      agent.add("I don't know.I am still learning.");
    }


  }
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase inline editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://dialogflow.com/images/api_home_laptop.svg',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://docs.dialogflow.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }

  // Run the proper function handler based on the matched Dialogflow intent name
  // let intentMap = new Map();
  // intentMap.set('Default Welcome Intent', welcome);
  // intentMap.set('Default Fallback Intent', fallback);

  // intentMap.set('EnginePowerInfo', commonHandler);
  // intentMap.set('EngineDetailsInfo', commonHandler);
  // intentMap.set('ConfigurationInfo', commonHandler);
  // intentMap.set('PartCapacityInfo', commonHandler);
  // intentMap.set('StyleInfo',commonHandler);
  // intentMap.set('BreakInfo',commonHandler);
  // intentMap.set('CabinInfo',commonHandler);
  // intentMap.set('ProductivityInfo',commonHandler);
  // intentMap.set('TearoutForceInfo',commonHandler);

  // intentMap.set('EnginePower', commonHandler);
  // intentMap.set('EngineDetails', commonHandler);
  // intentMap.set('FunctionOfVariousParts', commonHandler);
  // intentMap.set('Model/PartsDescription', commonHandler);
  // intentMap.set('ModelAttachments', commonHandler);
  // intentMap.set('StructutralDurability', commonHandler);
  // intentMap.set('AdvantageOfModels/Parts/Features', commonHandler);


  
  // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
  // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
  agent.handleRequest(commonHandler);
});

