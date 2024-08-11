'use client' // since we are using states

import Image from "next/image";
import { useState } from "react"; // to store messages
import { Box, TextField, Button, Stack } from "@mui/material";



export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant', // to store messages
    content: 'Hello, I am the Headstarter AI Agent, how can I help you?'
    
  }])

  const [message, setMessage] = useState('') // the message that the user types
  // helper function to send messages to the backend
  const sendMessage = async () => {
    // set message
    setMessage('') 
    setMessages((messages)=>[
      ...messages,
      {role: "user", content: message}, // user message
      {role: "assistant", content: ""} // this is the message that the assistant will send back
    ])
    // fetch response from the backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: "user", content: message}]) // send a user message with a role of user and content message
    }).then( async (res) => { // when you get the response, read it 
      const reader = res.body.getReader();
      // decode the response
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({done, value}){
        if (done){
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), {stream: true})
        setMessages((messages)=>{
          let lastMessage = messages[messages.length - 1]; // get the last message
          let otherMessages = message.slice(0, messages.length-1); // get all messages except the last one
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        })
        return reader.read().then(processText);
      })
    
  })
}


  return <Box 
  width = "100vw" 
  height= "100vh" 
  bgcolor = "#343541"
  display="flex"
  flexDirection="column"
  justifyContent="center"
  alignItems="center"
  >
    <Stack
    direction = "column"
    width = "600px"
    bgcolor = "#40414f"
    height = "700px"
    border = "1px solid black"
    paadding = {2}
    spacing = {3}
    >
      <Stack 
      direction = "column"
      spacing = {2}
      flexGrow = {1}
      overflow = "auto"
      maxHeight = "100%"
      >
        {
        messages.map((message,index)=>(
          <Box 
          key = {index}
          display = "flex"
          justifyContent = {message.role === 'assistant' 
            ? 'flex-start' 
            : 'flex-end'
          }
          >
            <Box bgcolor = {message.role === 'assistant'
               ? 'primary.main' 
               : 'secondary.main'
              }
              color = "white"
              borderRadius = {16}
              p={3}
               
               >
                {message.content}
               </Box>
          </Box>
        ))
      }
        
      </Stack>
      <Stack direction = "row" spacing = {2}>
        <TextField
        label = "Message"
        fullWidth
        value = {message}
        onChange =  {e => setMessage(e.target.value)}
        />
        <Button variant = "contained" onClick = {sendMessage}>
          Send
        </Button>
      </Stack>
    </Stack>

  </Box>

}
