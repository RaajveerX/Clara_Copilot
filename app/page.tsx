"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import DiagnosisPanel from "./components/DiagnosisPanel";
import ChatbotPanel from "./components/ChatbotPanel";

export default function HomePage() {

    const [input, setInput] = useState(""); // input from the user
    const [lastPrompt, setLastPrompt] = useState(""); // last prompt from the user
    const [response, setResponse] = useState(""); // natural language response from Gemini
    const [problemsIdentified, setProblemsIdentified] = useState<string[]>([]); // problems identified by the Gemini classifier
    const [possibleSolutions, setPossibleSolutions] = useState<string[]>([]); // possible solutions by the Gemini classifier
    const [isLoading, setIsLoading] = useState(false); // loading state

    // Returning everything in proper case
    const properCase = (str: string): string => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Clear state for next patient
    const handleClear = () => {
        setInput("");
        setLastPrompt("");
        setResponse("");
        setProblemsIdentified([]);
        setPossibleSolutions([]);
    };

    const handleSendMessage = async () => {

        // Cleaning the input
        if (input.trim() === "") return;

        setIsLoading(true); // Set the loading state to true
        setLastPrompt(input); // Store the current input as the last prompt

        try {
            // Step 1: Get diagnosis
            const diagnosisResponse = await fetch('/api/diagnosis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ patientContext: input }),
            });

            if (!diagnosisResponse.ok) {
                throw new Error('Failed to get diagnosis');
            }

            const { diagnosis } = await diagnosisResponse.json();

            // Creating an array of problems identified by the Gemini classifier, removing empty strings, propercasing
            setProblemsIdentified(diagnosis.split(',')
                .map((problem: string) => properCase(problem.trim()))
                .filter((problem: string) => problem !== ''));

            // Step 2: Get solutions
            const solutionsResponse = await fetch('/api/solutions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ patientContext: input }),
            });

            if (!solutionsResponse.ok) {
                throw new Error('Failed to get solutions');
            }

            const { solutions } = await solutionsResponse.json();

            // Creating an array of possible solutions by the Gemini classifier, removing empty strings, propercasing
            setPossibleSolutions(solutions.split(',')
                .map((solution: string) => properCase(solution.trim()))
                .filter((solution: string) => solution !== ''));

            // Step 3: Get natural language response
            const responseResponse = await fetch('/api/response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientContext: input,
                    diagnosis: diagnosis.split(',')
                        .map((problem: string) => properCase(problem.trim()))
                        .filter((problem: string) => problem !== ''),
                    solutions: solutions.split(',')
                        .map((solution: string) => properCase(solution.trim()))
                        .filter((solution: string) => solution !== '')
                }),
            });

            if (!responseResponse.ok) {
                throw new Error('Failed to get response');
            }

            const { response: aiResponse } = await responseResponse.json();
            setResponse(aiResponse);

        } catch (error) {
            console.error('Error processing request:', error);
            setResponse("I'm sorry, there was an error processing your request. Please try again.");
        } finally {
            setIsLoading(false);
            setInput("");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8faf8]">
            <Navbar />
            <main className="flex flex-1">
                <DiagnosisPanel
                    problemsIdentified={problemsIdentified}
                    possibleSolutions={possibleSolutions}
                    onClear={handleClear}
                    patientContext={lastPrompt}
                    response={response}
                />

                <ChatbotPanel
                    input={input}
                    setInput={setInput}
                    response={response}
                    isLoading={isLoading}
                    handleSendMessage={handleSendMessage}
                />
            </main>
        </div>
    );
}
