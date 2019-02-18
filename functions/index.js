'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  agent.handleRequest(commonHandler);

  /**
   * 
   * Function To handle DialogFlow FulFillment
   */
  function commonHandler(agent) {
    console.log(":::::::::: DialogFlow FulFillment Called ::::::::::");
    console.log("::::::::::::::::::::::::::::::::::::::::");
    console.log(JSON.stringify(request.body));
    console.log("::::::::::::::::::::::::::::::::::::::::");

    let knowledgeAnswers = request.body.queryResult.knowledgeAnswers;
    let f_m = "Please be more specific";
    let reqEntities = request.body.queryResult.parameters;
    let payload = [];
    let extractedEntities = [];
    let fulfillmentMessages = request.body.queryResult.fulfillmentMessages;
    //Checking that response is fron knowledgebase or not
    if (knowledgeAnswers && knowledgeAnswers.answers) {
      console.log(":::::::::: Answer Found in Knowledge Center ::::::::::");
      agent.add(knowledgeAnswers.answers[0]); //sending first answer from the knowledge center answers to the user
    } else {
      console.log(":::::::::: Answer Not Found in Knowledge Center So going to fetch answer from fulfillment::::::::::");
      fulfillmentMessages.forEach((e) => {
        for (let key in e) {
          if (key == 'payload') {
            payload = e[key].ModelEntities;
            if (e[key].f_m) { //if fallback msg in payload then override existing one
              f_m = e[key].f_m
            }
          }
        }
      })
      payload.forEach((e) => {
        for (let i = 0; i < e.entity.length; i++) {
          e.entity[i] = e.entity[i].constructor === String ? e.entity[i].toUpperCase() : e.entity[i];
        }
        e.entity.sort();
      }
      )

      for (let key in reqEntities) {
        if (reqEntities[key]) {
          if (reqEntities[key].constructor === String) {
            extractedEntities.push(reqEntities[key].toUpperCase());
          }
          else if (reqEntities[key].constructor === Array) {
            reqEntities[key].forEach(
              (e) => { extractedEntities.push(e.toUpperCase()); });
          } else {
            extractedEntities.push(reqEntities[key]);
          }
        }
      };
      extractedEntities.sort();
      console.log(":::::::::: Extracted Entities ::::::::::");
      console.log(JSON.stringify(extractedEntities))
      let result = payload.filter(z => { return (JSON.stringify(z.entity) == JSON.stringify(extractedEntities)); });
      if (result && result.length > 0) {
        console.log(":::::::::: Answer Found in payload ::::::::::");
        console.log(result[0].value);
        agent.add(result[0].value);
      }
      else {
        console.log(":::::::::: Answer Not Found in payload ::::::::::");
        console.log(f_m);
        agent.add(f_m);
      }
    }
    console.log(":::::::::: DialogFlow FulFillment End ::::::::::");
  }
});

