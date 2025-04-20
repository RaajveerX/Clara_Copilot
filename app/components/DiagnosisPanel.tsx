import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";

interface DiagnosisPanelProps {
    problemsIdentified: string[];
    possibleSolutions: string[];
    onClear: () => void;
    patientContext: string;
    response: string;
}

export default function DiagnosisPanel({
    problemsIdentified,
    possibleSolutions,
    onClear,
    patientContext,
    response
}: DiagnosisPanelProps) {

    const handleSave = () => {
        const data = {
            patientContext,
            problemsIdentified,
            possibleSolutions,
            response,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patient-summary-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-1/3 p-6 border-r border-gray-200">
            <Card className="h-full bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-[#2c5a6e]">Summary</CardTitle>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Save to file"
                        >
                            <Download size={18} className="text-[#4a8a9c]" />
                        </button>
                        <button
                            onClick={onClear}
                            className="px-3 py-1 text-sm rounded-md border border-[#4a8a9c] text-[#2c5a6e] hover:bg-[#e8f0f5] transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={16} className="text-[#4a8a9c]" />
                            Clear Patient Data
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="space-y-8">
                        {/* Problems Identified */}
                        <div>
                            <h3 className="font-medium text-[#4a8a9c] mb-3 text-lg">Problems Identified</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                {problemsIdentified.length > 0 ? (
                                    problemsIdentified.map((problem, index) => (
                                        <li
                                            key={index}
                                            className="animate-fade-in opacity-0"
                                            style={{
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            {problem}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-400">No problems identified yet</li>
                                )}
                            </ul>
                        </div>

                        {/* Possible Solutions */}
                        <div>
                            <h3 className="font-medium text-[#4a8a9c] mb-3 text-lg">Possible Solutions</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                {possibleSolutions.length > 0 ? (
                                    possibleSolutions.map((solution, index) => (
                                        <li
                                            key={index}
                                            className="animate-fade-in opacity-0"
                                            style={{
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            {solution}
                                        </li>
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
    );
} 