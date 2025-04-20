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
    project: 'title-and-segmentation',
    location: 'us-central1',
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


// A sample response from the API

// {
//     "response": {
//         "candidates": [
//             {
//                 "content": {
//                     "parts": [
//                         {
//                             "text": "Okay, I understand. Here's my response based on the provided information about the 35-year-old male patient:\n\nConsidering the patient's presentation with symptoms of depression, anxiety, and insomnia, it appears that his work responsibilities are a significant contributing factor. The loss of interest in previously enjoyed activities further supports a diagnosis of Major Depressive Disorder. Generalized Anxiety Disorder also needs to be carefully considered given his reported anxiety symptoms.\n\nHere are some thoughts for the counselor to consider:\n\n*   **Treatment Approach:** A combined approach of Cognitive Behavioral Therapy (CBT) and medication (SSRI) might be the most effective way to address both the depression and anxiety. CBT can help him develop coping mechanisms for managing work-related stress and challenge negative thought patterns.\n*   **Sleep Hygiene:** Implementing sleep hygiene practices is crucial for addressing the insomnia. This could involve establishing a regular sleep schedule, creating a relaxing bedtime routine, and optimizing his sleep environment.\n*   **Lifestyle Modifications:** Encouraging regular exercise and mindfulness meditation can also play a significant role in improving his mood and reducing anxiety levels. These practices can help him manage stress and promote overall well-being.\n*   **Work-Life Balance:** It would be beneficial to explore the specific aspects of his work that are contributing to his feelings of being overwhelmed. Helping him develop strategies for managing his workload, setting boundaries, and prioritizing tasks could alleviate some of the pressure.\n*   **SSRI Considerations:** If medication is considered, the counselor should monitor the patient for potential side effects and assess its effectiveness regularly.\n*   **Further Assessment:** It's important to assess the severity of his symptoms using standardized assessment tools to track his progress and tailor the treatment plan accordingly. Also, exploring any potential contributing factors, such as relationship issues or financial stressors, could provide a more comprehensive understanding of his situation.\n"
//                         }
//                     ],
//                     "role": "model"
//                 },
//                 "finishReason": "STOP",
//                 "avgLogprobs": -0.2701895205680467
//             }
//         ],
//         "createTime": "2025-04-19T05:05:50.841890Z",
//         "responseId": "Li8DaKKxM_qg3NoPmZ_M0QE",
//         "modelVersion": "gemini-2.0-flash-001",
//         "usageMetadata": {
//             "promptTokenCount": 444,
//             "candidatesTokenCount": 381,
//             "totalTokenCount": 825,
//             "trafficType": "ON_DEMAND",
//             "promptTokensDetails": [
//                 {
//                     "modality": "TEXT",
//                     "tokenCount": 444
//                 }
//             ],
//             "candidatesTokensDetails": [
//                 {
//                     "modality": "TEXT",
//                     "tokenCount": 381
//                 }
//             ]
//         }
//     }
// }