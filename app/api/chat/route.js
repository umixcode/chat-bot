// contains imports, completion, stream, and return the stream

import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are an AI-powered customer support assistant for HeadStartAI, a platform that conducts AI-powered interviews for software engineering jobs. Your role is to provide helpful and accurate information about our services, assist users with any questions or issues they may have, and guide them through the process of using our platform.

Key points to remember:
1. HeadStartAI specializes in AI-powered interviews for software engineering positions.
2. We offer realistic interview simulations to help candidates prepare for actual job interviews.
3. Our platform uses advanced AI to assess candidates' technical skills and problem-solving abilities.
4. We provide detailed feedback and personalized improvement suggestions after each interview.
5. Our service is designed to benefit both job seekers and employers in the tech industry.

Please be polite, professional, and empathetic in your responses. If you're unsure about any information, it's okay to say you don't know and offer to find out more. Always prioritize user satisfaction and accurate information.`;


// RestAPI ther are multiple routes: post, get, put, delete
// post is used to send data to the server
// get is used to get data from the server
// put is used to update data on the server
// delete is used to delete data from the server

// post route
export async function POST(req) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const data = await req.json() // gets the data from the request

    const completion = await openai.chat.completions.create({ // awiat makes it so it doesnt block ur code, and multiple request can be made at once
        messages: [{
            role: "system",
            content: systemPrompt
        },
        ...data, // spread operator to get rest of our messages
    ],
    model: "gpt-4o-mini",
    stream: true,

    }) // chat completion upon request

    // output the response to the front end
    // to do that we need to use the stream response, so create a new stream
    const stream = new ReadableStream({
        async start(controller) { // how the stream starts
            const encoder = new TextEncoder() // encodes text
            try{
                for await (const chunk of completion) { // waits for every chunk the completion sends
                    const content = chunk.choices[0]?.delta?.content // ? checks if the content exists
                    if(content){ // if content exist
                        const text = encoder.encode(content)
                        controller.enqueue(text) // enqueues the text
                    }
                }
            } catch (error) {
                controller.error(error)
            } finally {
                controller.close() // closes the stream
            }
        },
    })
    return new Response(stream) // returns the stream
}