import { NextRequest, NextResponse } from 'next/server';

import { GoogleGenAI } from '@google/genai';

// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
    vertexai: true,
    project: '764803801890',
    location: 'us-central1'
});
const model = 'projects/764803801890/locations/us-central1/endpoints/3831601210217988096';

const siText1 = { text: `You are a "Mental Health Copilot" designed to assist mental health counselors. Your task is to analyze patient information and their current context to suggest possible solutions or interventions.` };

// Set up generation config
const generationConfig = {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95,
    responseModalities: ["TEXT"],
    speechConfig: {
        voiceConfig: {
            prebuiltVoiceConfig: {
                voiceName: "zephyr",
            },
        },
    },
    systemInstruction: {
        parts: [siText1]
    },
};


async function getSolutions(patientContext: string) {

    const text1 = {
        text: `You will be provided with the following information:

        Patient Context: ${patientContext}
        
        Instructions:
        
        1. Carefully analyze the provided patient information and context.
        2. Based on the provided information, suggest possible solutions or interventions that could be beneficial for the patient.
        3. Output the suggestions as a comma-separated Proper cased list of values.
        4. Do not include any explanations or additional text beyond the list of suggestions.
        5. Do not invent any information. Base your suggestions solely on the provided patient information and context.
        6. If the provided information is insufficient to suggest any solutions, output: "Insufficient information to provide suggestions. Please provide more details about the patient and their context."`};
    
        const req = {
        model: model,
        contents: [
            { role: 'user', parts: [text1] }
        ],
        config: generationConfig,
    };

    const streamingResp = await ai.models.generateContentStream(req);
    let solutions = '';

    for await (const chunk of streamingResp) {
        if (chunk.text) {
            solutions += chunk.text;
            process.stdout.write(chunk.text);
        } else {
            process.stdout.write(JSON.stringify(chunk) + '\n');
        }
    }

    return solutions;
}



export async function POST(request: NextRequest) {
    try {
        const { patientContext } = await request.json();

        if (!patientContext) {
            return NextResponse.json(
                { error: 'Patient context is required' },
                { status: 400 }
            );
        }

        const solutions = await getSolutions(patientContext);

        return NextResponse.json({ solutions });
    } catch (error) {
        console.error('Error in solutions endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to process solutions request' },
            { status: 500 }
        );
    }
} 