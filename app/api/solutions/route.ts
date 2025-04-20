import { NextRequest, NextResponse } from 'next/server';

import { GoogleGenAI } from '@google/genai';

const getGCPCredentials = () => {
    // for Vercel, use environment variables
    return process.env.GCP_PRIVATE_KEY
        ? {
            credentials: {
                client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GCP_PRIVATE_KEY,
            },
            projectId: process.env.GCP_PROJECT_ID,
        }
        // for local development, use gcloud CLI
        : {};
};

// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.PROJECT_ID,
    location: process.env.PROJECT_LOCATION,
    googleAuthOptions: getGCPCredentials()
});
const model = process.env.SOLUTIONS_MODEL_STRING;

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
        5. Do not invent any information. Base your suggestions solely on the provided patient information and context.`};

    const req = {
        model: model,
        contents: [
            { role: 'user', parts: [text1] }
        ],
        config: generationConfig,
    };

    const streamingResp = await ai.models.generateContentStream(req);
    let solutions = '';

    // Will use this in the future to stream the response to the client
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


// POST request to get solutions /api/solutions
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