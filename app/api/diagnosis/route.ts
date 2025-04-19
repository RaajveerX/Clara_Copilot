import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
    vertexai: true,
    project: '764803801890',
    location: 'us-central1'
  });
  const model = 'projects/764803801890/locations/us-central1/endpoints/381280945698766848';
  

const siText1 = { text: `You are a mental health analysis assistant. Your task is to help mental health counselors identify potential problem areas their patients might be experiencing based on the provided patient context.  You are not a substitute for a licensed professional and your output should be used for informational purposes only.` };

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


async function getDiagnosis(patientContext: string) {

    const text1 = {
        text: `You will be provided with the following information:

        Patient Context: ${patientContext}
        
        Instructions:
        
        1. Carefully analyze the provided patient context.
        2. Identify potential problem areas the patient might be experiencing based on the information provided.
        3. Output the potential problem areas as a comma-separated Proper cased list of values.  For example: anxiety, depression, relationship issues, work stress, grief.
        4. If no specific problems can be identified based on the context, output "Insufficient information to determine problem areas."
        5. Remember, your output is for informational purposes only and should not be considered a diagnosis.  Always consult with a licensed mental health professional for diagnosis and treatment.`};

    const req = {
        model: model,
        contents: [
            { role: 'user', parts: [text1] }
        ],
        config: generationConfig,
    };

    const streamingResp = await ai.models.generateContentStream(req);

    let diagnosis = '';
    for await (const chunk of streamingResp) {
        if (chunk.text) {
            diagnosis += chunk.text;
            process.stdout.write(chunk.text);
        } else {
            process.stdout.write(JSON.stringify(chunk) + '\n');
        }
    }

    return diagnosis;
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

        const diagnosis = await getDiagnosis(patientContext);
        console.log(diagnosis);

        return NextResponse.json({ diagnosis: diagnosis });
    } catch (error) {
        console.error('Error in diagnosis endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to process diagnosis request' },
            { status: 500 }
        );
    }
} 