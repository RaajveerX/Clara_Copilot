import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";

interface ChatbotPanelProps {
    input: string;
    setInput: (input: string) => void;
    response: string;
    isLoading: boolean;
    handleSendMessage: () => void;
}

export default function ChatbotPanel({
    input,
    setInput,
    response,
    isLoading,
    handleSendMessage
}: ChatbotPanelProps) {
    const responseRef = useRef<HTMLDivElement>(null);


    // Format the response from Gemini to be displayed in the chat response pane
    const formatResponse = (text: string) => {
        if (!text) return null;

        // Split by paragraphs (double newlines)
        const paragraphs = text.split(/\n\s*\n/);

        return paragraphs.map((paragraph, index) => {
            // Process bold text with ** ** syntax
            let formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Process line breaks with asterisks
            formattedParagraph = formattedParagraph.replace(/\* (.*?):/g, '<br/><strong>$1:</strong>');

            return (
                <p key={index} className="mb-4 last:mb-0">
                    <span dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                </p>
            );
        });
    };

    return (
        <div className="w-2/3 p-6 flex flex-col">
            {/* Chat response area */}
            <Card className="h-[50vh] mb-4 bg-white">
                <CardContent className="p-6 h-full">
                    <div
                        ref={responseRef}
                        className="h-full overflow-y-auto pr-2 custom-scrollbar"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="loader"></div>
                            </div>
                        ) : response ? (
                            <div className="bg-[#e8f0e8] text-sm text-[#2c5a6e] p-4 rounded-lg w-full">
                                {formatResponse(response)}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">Results will appear here</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Input area with send button inside */}
            <div className="relative h-[34vh]">
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
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
} 