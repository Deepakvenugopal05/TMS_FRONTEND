import { useState, useEffect } from "react";

let speech;
if (window.webkitSpeechRecognition) {
    console.log("API Supported!!");
  // eslint-disable-next-line
  const SpeechRecognition = webkitSpeechRecognition;
  speech = new SpeechRecognition();
  speech.continuous = false;
  speech.interimResults = false;
} else {
  speech = null;
}

const useVoice = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const listen = () => {
    setIsListening(!isListening);
    if (isListening) {
      speech.stop();
    } else {
      speech.start();
    }
  };

  useEffect(() => {
    if (!speech) {
      return;
    }

    speech.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setIsListening(false);
      speech.stop();
    };

    speech.onend = () => {
      setIsListening(false);
    };

    speech.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    return () => {
      if (speech) {
        speech.stop();
      }
    };
  }, []);

  return {
    text,
    isListening,
    listen,
    voiceSupported: speech !== null
  };
};

export { useVoice };