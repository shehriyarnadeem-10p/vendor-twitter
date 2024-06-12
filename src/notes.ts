import dotenv from 'dotenv';
import { NoteFormatted, NoteStream } from './types/Note';
import { dynamodbUpdateTweet, sqsSendMessage } from './aws';

const axios = require('axios');
const EventEmitter = require('events');

dotenv.config();

// ENV
const STREAM_URL='https://eo82c1dc1lgwdta.m.pipedream.net'
const AWS_VENDORS_TABLE_NAME = process.env.AWS_VENDORS_TABLE_NAME ?? '';
const AWS_SQS_URL = 'https://sqs.us-east-1.amazonaws.com/918360564172/simplequeue';

const messageEmitter = new EventEmitter();
let lastCheckTime = new Date();

const parseNote = (stream: NoteStream): NoteFormatted | Error => {
    try {
        console.log(JSON.stringify(stream));
        const user = stream.includes.users[0];
        const note = stream.includes.notes[0];
        const place = stream.includes.places[0];

        return {
            userName: user.name,
            userId: user.username,
            text: note.text,
            geo: {
                id: place.id,
                name: place.name,
                coordinates: {
                    long: place.geo.bbox[0],
                    lat: place.geo.bbox[1],
                }
            }
        }
    } catch (e) {
        if (e instanceof Error) {
            return e;
        }
        
        throw new Error('parsenote unexpected error');
    }
}


export const checkRequestBin = async () => {
    try {
        const response = await axios.get(STREAM_URL);
        const messages = response.data; // Adjust this based on the actual structure of your data
        messages.forEach((message:NoteStream) => {
            const messageTime = new Date(message.timestamp); // Adjust this based on your message timestamp field
            if (messageTime > lastCheckTime) {
                messageEmitter.emit('data', message);
            }
        });
        lastCheckTime = new Date();
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

const connectStream = (retryAttempt: number = 0) => {
    const stream = axios.get(STREAM_URL, {
        timeout: 20000
    });
    
    stream.on('data', (data:any) => {
        // try {
            console.log(data,'--new')
            //const json: NoteStream = JSON.parse(data);

        //     const parsedNote = parseNote(json);
        //     console.log('Tweet', parsedNote);
        //     if (parsedNote instanceof Error) {
        //         console.log('parseTweet error:', parsedNote.message);
        //     } else {
        //         // Update the db
        //         const updatedTweetRes = await dynamodbUpdateTweet(AWS_VENDORS_TABLE_NAME, parsedNote, parsedNote.userId);
        //         if (updatedTweetRes instanceof Error) {
        //             console.log('dynamodbUpdateTweet error:', updatedTweetRes.message);
        //         }
        //         // Send to SQS
        //         // const sqsRes = await sqsSendMessage(AWS_SQS_URL, JSON.stringify(parsedNote))
        //         // if (sqsRes instanceof Error) {
        //         //     console.log('sqsSendmessage error:', sqsRes.message);
        //         // }
        //     }

        //     retryAttempt = 0;
        // } catch(e) {
        //     if (data.status === 401) {
        //         console.log('error status 401', data);
        //         throw new Error('Error status 401')
        //     } else if (data.detail === 'This stream is currently at the maximum allowed connection limit.') {
        //         console.log('error', data.detail);
        //         throw new Error('Stream max limit');
        //     } else {
        //         // Do nothing, keep alive signal
        //     }
        // }
    });

    return stream;
}

export const streamVendors = async (vendorList: string[]) => {
    try {

        connectStream();
    } catch(e) {
        if (e instanceof Error) {
            throw e;
        }

        throw new Error('streamVendors unexpected error');
    }
}