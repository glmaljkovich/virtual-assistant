import React, { useEffect, useRef } from 'react';

const SpeakText = ({ text }) => {
    const spokenRef = useRef(''); // Track the text that has been spoken
    const utteranceRef = useRef(null); // Reference to the current speech utterance
    const isInitialMount = useRef(true); // To check if it's the initial mounting of the component


    useEffect(() => {
        const speak = (newText) => {
            console.log("received text", newText)
            if (!newText || (utteranceRef.current && !utteranceRef.current.ended)) return;
            utteranceRef.current = new SpeechSynthesisUtterance(newText);
            utteranceRef.current.onend = () => {
                // Allow new text to be spoken once the current one ends
                spokenRef.current = text;
                console.log("utterance done mylord")
            };
            window.speechSynthesis.speak(utteranceRef.current);
        };
        
        if (text === '') {
            utteranceRef.current = new SpeechSynthesisUtterance('');
        }
        // Only speak new text if the previous text has been fully spoken
        if (utteranceRef.current && utteranceRef.current.ended !== false) {
            console.log("calling speak")
            const newText = text.slice(spokenRef.current.length);
            speak(newText);
        }
    }, [text]); // Re-run effect when text prop updates

    return null; // No UI output
};

export default SpeakText;
