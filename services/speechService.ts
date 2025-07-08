// Text-to-Speech (TTS)
export function speakText(text: string, onEnd?: () => void, voice?: SpeechSynthesisVoice) {
  if (!('speechSynthesis' in window)) {
    alert('Sorry, your browser does not support text-to-speech.');
    return;
  }
  window.speechSynthesis.cancel(); // Stop any current speech
  const utterance = new window.SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.onend = onEnd || null;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech-to-Text (STT)
let recognition: SpeechRecognition | null = null;
let isRecognizing = false;

export function startRecognition(
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: (error: string) => void
) {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Sorry, your browser does not support speech recognition.');
    return;
  }
  const SpeechRecognitionImpl =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognitionImpl();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };
  recognition.onend = () => {
    isRecognizing = false;
    if (onEnd) onEnd();
  };
  isRecognizing = true;
  recognition.start();
}

export function stopRecognition() {
  if (recognition && isRecognizing) {
    recognition.stop();
    isRecognizing = false;
  }
}

// Add type declarations for browsers that do not have them
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
// If types are not available, declare them as any
// @ts-ignore
type SpeechRecognition = any;
// @ts-ignore
type SpeechRecognitionEvent = any; 