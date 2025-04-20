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
const model = 'gemini-2.0-flash-001';

const siText1 = { text: `You are a mental health support tool designed to assist counselors in providing the best possible care to their patients.  Your role is to analyze patient information and generate natural language responses that can aid the counselor in their treatment approach.` };

// Set up generation config
const generationConfig = {
    systemInstruction: {
        parts: [siText1]
    },
};


async function getResponse(patientContext: string, diagnosis: string, solutions: string) {

    const text1 = {
        text: `You will be provided with the following information:

            Patient Context: ${patientContext}
            Problem Areas: ${diagnosis}
            Possible Solutions: ${solutions}
        
        Instructions:
        
        1. Carefully consider the provided patient context, problem areas, and possible solutions.
        2. Generate a natural language response that can help the mental health counselor deliver the best care to the patient.
        3. Your response should be informative, supportive, and focused on aiding the counselor in their decision-making process.
        4. Return properly formatted text with paragraphs, breaks, and an easily readable format.
        5. Do not offer medical advice or diagnoses. Your role is to provide support and insights based on the given information, Do not ask follow up questions.
        6. If any information is missing or unclear, request clarification using the appropriate placeholder name.
        
        Example:
        
        Patient Context: A 25-year-old female experiencing increased stress due to work and relationship issues.  She reports difficulty sleeping and concentrating.
        
        Problem Areas: anxiety, stress, insomnia
        
        Possible Solutions: CBT, mindfulness exercises, medication
        
        Response:
        
        Considering the patient's context, her reported anxiety, stress, and insomnia seem to be stemming from work and relationship issues.  CBT and mindfulness exercises could be beneficial in helping her manage stress and improve sleep quality.  It's also important to explore medication as a potential option in conjunction with therapy.  Further assessment is recommended to determine the severity of her symptoms and tailor the treatment plan accordingly.  The counselor should also consider exploring the specific work and relationship issues contributing to her distress.`};
    const req = {
        model: model,
        contents: [
            { role: 'user', parts: [text1] }
        ],
        config: generationConfig,
    };

    const response = await ai.models.generateContent(req);

    return response;
}

export async function POST(request: NextRequest) {
    try {
        const { patientContext, diagnosis, solutions } = await request.json();

        if (!patientContext) {
            return NextResponse.json(
                { error: 'Patient context is required' },
                { status: 400 }
            );
        }

        if (!diagnosis || !Array.isArray(diagnosis) || diagnosis.length === 0) {
            return NextResponse.json(
                { error: 'Valid diagnosis array is required' },
                { status: 400 }
            );
        }

        if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
            return NextResponse.json(
                { error: 'Valid solutions array is required' },
                { status: 400 }
            );
        }

        const response = await getResponse(
            patientContext,
            diagnosis.join(', '),
            solutions.join(', ')
        );

        const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text as string || "No response generated";

        return NextResponse.json({ response: responseText });
    } catch (error) {
        console.error('Error in response endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to process response request' },
            { status: 500 }
        );
    }
}