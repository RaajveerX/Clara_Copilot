"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [problemsIdentified, setProblemsIdentified] = useState<string[]>([]);
  const [possibleSolutions, setPossibleSolutions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const properCase = (str: string): string => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;
    
    setIsLoading(true);
    
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
    <main className="flex min-h-screen bg-[#f8faf8]">
      {/* Left side - Diagnosis panel */}
      <div className="w-1/3 p-6 border-r border-gray-200">
        <Card className="h-full bg-white">
          <CardHeader>
            <CardTitle className="text-[#2c5a6e]">Summary</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-8">
              {/* Problems Identified Section */}
              <div>
                <h3 className="font-medium text-[#4a8a9c] mb-3 text-lg">Problems Identified</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {problemsIdentified.length > 0 ? (
                    problemsIdentified.map((problem, index) => (
                      <li key={index}>{problem}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">No problems identified yet</li>
                  )}
                </ul>
              </div>
              
              {/* Possible Solutions Section */}
              <div>
                <h3 className="font-medium text-[#4a8a9c] mb-3 text-lg">Possible Solutions</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {possibleSolutions.length > 0 ? (
                    possibleSolutions.map((solution, index) => (
                      <li key={index}>{solution}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">No solutions available yet</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Chatbot */}
      <div className="w-2/3 p-6 flex flex-col">
        <div className="flex items-center justify-center py-4 mb-6">
          <h1 className="text-3xl font-bold text-[#2c5a6e]">Clara</h1>
        </div>
        
        {/* Chat response area */}
        <Card className="h-[50vh] mb-4 bg-white">
          <CardContent className="p-6 h-full flex items-center justify-center">
            {isLoading ? (
              <div className="loader"></div>
            ) : response ? (
              <div className="bg-[#e8f0e8] text-sm text-[#2c5a6e] p-4 rounded-lg w-full">
                {response}
              </div>
            ) : (
              <p className="text-gray-400">Enter patient context to get started...</p>
            )}
          </CardContent>
        </Card>
        
        {/* Input area with send button inside */}
        <div className="relative h-[30vh]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Enter Patient Context..."
            className="w-full p-5 text-sm rounded-md border border-input bg-background resize-none h-full pr-16"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-[#4a8a9c] text-white hover:bg-[#3a7a8c] transition-colors"
            disabled={isLoading}
          >
            <Send size={20}/>
          </button>
        </div>
      </div>
    </main>
  );
}
