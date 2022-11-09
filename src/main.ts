import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import TelegramBot from "node-telegram-bot-api";
import { share } from "./gspread";
import Store from "./store";

const token = process.env.TELEGRAM_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

const company_store = new Store({
    title: "Company",
    header: ["name", "website", "description"],
    indexKey: "name"
});

const user_store = new Store({
    title: "Users",
    header: ["id", "first_name", "last_name"],
    indexKey: "id"
})

const onReplyMessage = (
    chat_id: TelegramBot.ChatId,
    message_id: string | number
) =>
    new Promise<TelegramBot.Message>((resolve, _) => {
        bot.onReplyToMessage(chat_id, message_id, (msg) => {
            resolve(msg);
        });
    });

const start_message = `
Hello welcome {name}, Welcome to Web3-bot to save web3 website data on google spreadsheet.

following commands you can execute -
/start - To start again
/addcompany - To add a new company
/share - To get the google sheet access
`;

bot.onText(/\/start/, async ({ chat: { id, first_name, last_name } }) => {
    await bot.sendMessage(
        id,
        start_message.replace("{name}", `${first_name}`)
    );
    
    const users = await user_store.getData();    
    if (!users.hasOwnProperty(id)) {
        user_store.setData(id, { id, first_name, last_name })
    }
});

bot.onText(/\/addcompany/, async ({ chat: { id } }) => {
    const data: { name?: any; website?: any; description?: any } = {};
    let chat, message_id, text;

    ({ chat, message_id } = await bot.sendMessage(
        id,
        "Please enter the company name",
        { reply_markup: { force_reply: true } }
    ));
    ({ chat, message_id, text } = await onReplyMessage(chat.id, message_id));
    data.name = text;
    await bot.sendMessage(chat.id, "Seems good!");

    ({ chat, message_id } = await bot.sendMessage(
        id,
        "Please enter the company website name",
        { reply_markup: { force_reply: true } }
    ));
    ({ chat, message_id, text } = await onReplyMessage(chat.id, message_id));
    data.website = text;
    await bot.sendMessage(chat.id, "Seems good!");

    ({ chat, message_id } = await bot.sendMessage(
        id,
        "Please enter the company description name",
        { reply_markup: { force_reply: true } }
    ));
    ({ chat, message_id, text } = await onReplyMessage(chat.id, message_id));
    data.description = text;
    await bot.sendMessage(chat.id, "Seems good!");

    company_store.setData(data.name, data);
    await bot.sendMessage(chat.id, "Company added with following data - " + JSON.stringify(data));
});


bot.onText(/\/share/, async ({chat: {id}}) => {
    let chat, message_id, text;

    ({ chat, message_id } = await bot.sendMessage(
        id,
        "Enter your email to get view access to google sheet",
        { reply_markup: { force_reply: true } }
    ));
    ({ chat, message_id, text } = await onReplyMessage(chat.id, message_id));
    
    if (text) {
        await bot.sendMessage(chat.id, "Seems good! Please wait we are giving you access to sheet");
        try {
            const url = await share(text);    
            await bot.sendMessage(chat.id, "You have given access to google spread sheet with email and url is " + url);
        } catch (err) {
            console.log(err);
        }
    }
})
