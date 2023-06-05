/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
const request = require("request"),
    express = require("express"),
    body_parser = require("body-parser"),
    axios = require("axios").default,
    app = express().use(body_parser.json()); // creates express http server
let port = process.env.PORT || 1337
// Sets server port and logs message on success
app.listen(port, () => {
    console.log("webhook is listening" + `${port}`)
    try {
        axios({
            method: "POST",
            url: "https://graph.facebook.com/v12.0/100819983038758/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                to: "15550433499",
                text: { body: "HELLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOO" }
            },
            headers: { "Content-Type": "application/json" }
        })
            .then(response => {
                console.log("Axios request successful:", response.data);
            })
            .catch(error => {
                console.log("Axios request failed:", error);
            });


    } catch (error) {
        console.log("first re failed", error)
    }
});

app.get('/', (req, res) => {
    console.log("helllooooooGETTTTTT")
    res.json({
        "deploy": true
    })
})

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
    // Parse the request body from the POST

    // if (!req) {
    //     console.log("--NO REQUEST--")
    //     return;
    // }

    let body = req.body;

    // console.log("whatsapp post request", req.body)

    // Check the Incoming webhook message
    // console.log("--------------------------------------------------------/n", JSON.stringify(req.body, null, 2));

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
        if (
            req.body.entry &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value.messages &&
            req.body.entry[0].changes[0].value.messages[0]
        ) {
            // console.log("req.body.entry[0].changes[0].value", req.body.entry[0].changes[0].value)
            console.log("context", req.body.entry[0].changes[0].value.messages[0].context)
            console.log("interactive", req.body.entry[0].changes[0].value.messages[0].interactive)
            let interactiveReplies = {
                '101': {
                    "res": "Thank you for your amazing feedback! We greatly appreciate it!"
                },
                '102': {
                    "res": "Thank you for your positive feedback! We appreciate your kind words! we will work to give you amazing Results."
                },
                '103': {
                    "res": "We're sorry to hear that you had a less than satisfactory experience with our product/service. We take customer feedback seriously, and we apologize for any inconvenience caused. We would like to understand the issue better and work towards a resolution."
                }
            }

            let phone_number_id =
                req.body.entry[0].changes[0].value.metadata.phone_number_id;
            console.log("phone_number_id", phone_number_id)
            let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
            let msg_body = "Okay"
            if (req.body.entry[0].changes[0].value.messages[0].text) {
                msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
            } else if (req.body.entry[0].changes[0].value.messages[0].interactive) {
                console.log("---console--ala", req.body.entry[0].changes[0].value)
                let replyId = req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.id
                msg_body = interactiveReplies[replyId].res
            }
            // extract the message text from the webhook payload

            // console.log("msg_body-----------------------------------------/n", msg_body)
            console.log("postttttttttttttttt", "https://graph.facebook.com/v12.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token)

            axios({
                method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                url:
                    "https://graph.facebook.com/v12.0/" +
                    phone_number_id +
                    "/messages?access_token=" +
                    token,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: { body: "Ack: " + msg_body },
                },
                headers: { "Content-Type": "application/json" },
            });
        }
        res.sendStatus(200);
    } else {
        // Return a '404 Not Found' if event is not from a WhatsApp API
        console.log("hihihihihihihi")
        res.sendStatus(404);
    }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {

    console.log("helloooooooooooo Request", req)
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
    **/
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
