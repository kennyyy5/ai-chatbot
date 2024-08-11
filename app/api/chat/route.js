import { NextResponse } from "next/server";
import OpenAI from "openai";
export async function POST(req){
    const openai = new OpenAI();
    //console.log("POST/api/chat")
    const data = await req.json()
    //console.log(data)
    const completion = await openai.chat.completions.create({
      messages: [{"role": "system", "content": "Ask me anything!"},
       ...data ],
      model: "gpt-4o-mini",
      stream:true
     });
    
    //console.log("completionStream", completionStream);

    const stream = new ReadableStream({
       async start(controller){
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
        },
    })
   
    return new NextResponse(stream)
}
