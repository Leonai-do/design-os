
export const parsePartialStream = (buffer: string) => {
    // Simple logic to extract AI message if JSON is not fully formed yet
    let aiMessage = buffer;
    let status = "Thinking...";

    // Try to find if JSON block started
    const jsonStart = buffer.indexOf('```json');
    if (jsonStart > -1) {
        aiMessage = buffer.substring(0, jsonStart).trim();
        status = "Designing form fields...";
    } else {
        // If we see a raw brace start without code block
        const braceStart = buffer.indexOf('{');
        if (braceStart > -1 && braceStart < 50) { // Assuming message is short or non-existent
             // Heuristic: if brace starts early, maybe no message
        } else if (braceStart > -1) {
             aiMessage = buffer.substring(0, braceStart).trim();
             status = "Designing form fields...";
        }
    }

    return {
        aiMessage,
        fields: [],
        status
    };
};