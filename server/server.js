require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `webhook/${TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}/${URI}`;

const app = express();

app.use(bodyParser.json());

const init = async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
        console.log(res.data);
    } catch (error) {
        console.error('Error setting webhook:', error.message);
        if (error.response) {
            console.error('Error response data:', error.response.data);
        }
    }
};



const response = (text) => {
    switch (text) {
        case "/start":
            return {
                text: `welcome to malikCoin`,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Apply Now", url: "https://master--startling-sundae-cc5914.netlify.app/" }]
                    ]
                }
            }
            break;
        default:
            return {
                text: `welcome to malikCoin`,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Apply Now", url: "https://master--startling-sundae-cc5914.netlify.app/" }]
                    ]
                }
            }
            break;
    }
}

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        console.log(req.body);

        // Determine the text and chatId based on the received data
        const text = req.body.callback_query ? req.body.callback_query.data : req.body.message ? req.body.message.text : "/start";
        const chatId = req.body.callback_query ? req.body.callback_query.message.chat.id : req.body.message ? req.body.message.chat.id : req.body.my_chat_member.chat.id;

        // Get the response content based on the received text
        const responseContent = response(text);

        // Send the response to the user
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: responseContent.text ? responseContent.text : responseContent,
            reply_markup: responseContent.reply_markup
        });

        res.send({});
    } catch (error) {
        console.error('Error processing request:', error.message);

        if (error.response) {
            const { error_code, description } = error.response.data;
            console.error(`Error code: ${error_code}, Description: ${description}`);

            // Handle specific error codes
            if (error_code === 403 && description.includes('bot was blocked by the user')) {
                console.log('The bot was blocked by the user. Skipping message sending.');
                res.send({});
                return;
            }
        }

        res.status(500).send('Internal Server Error');
    }
});



app.listen(5000, async () => {
    console.log('App running on port 5000');
    await init();
});
