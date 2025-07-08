import React, { useState } from 'react';

const questions = [
  {
    question: 'Do you read the Terms of Service before clicking "Agree"?',
    options: ['Always', 'Sometimes', 'Never'],
    scores: [0, 1, 2],
  },
  {
    question: 'How often do you share personal information online?',
    options: ['Rarely', 'Sometimes', 'Frequently'],
    scores: [0, 1, 2],
  },
  {
    question: 'Do you use the same password for multiple accounts?',
    options: ['Never', 'Sometimes', 'Often'],
    scores: [0, 1, 2],
  },
  {
    question: 'How likely are you to sign a contract without reading it fully?',
    options: ['Very unlikely', 'Somewhat likely', 'Very likely'],
    scores: [0, 1, 2],
  },
  {
    question: 'Do you check privacy settings on new apps or services?',
    options: ['Always', 'Sometimes', 'Never'],
    scores: [0, 1, 2],
  },
];

const getRiskLevel = (score: number) => {
  if (score <= 2) return { level: 'Low Risk', color: 'text-green-500', tips: [
    'Keep up the good habits!',
    'Continue to stay vigilant online.',
    'Help others learn about digital safety.'
  ]};
  if (score <= 5) return { level: 'Medium Risk', color: 'text-yellow-400', tips: [
    'Review privacy settings regularly.',
    'Consider using a password manager.',
    'Be cautious with sharing personal info.'
  ]};
  return { level: 'High Risk', color: 'text-red-500', tips: [
    'Read all contracts and terms before agreeing.',
    'Never reuse passwords across sites.',
    'Limit sharing sensitive information online.'
  ]};
};

const RiskQuiz: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleOption = (optionScore: number) => {
    if (current < questions.length - 1) {
      setScore(score + optionScore);
      setCurrent(current + 1);
    } else {
      setScore(score + optionScore);
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const { level, color, tips } = getRiskLevel(score);
    return (
      <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-700 rounded-xl p-8 shadow-lg text-center animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2 text-white">Your Risk-Proneness Result</h2>
        <p className={`text-xl font-semibold mb-4 ${color}`}>{level}</p>
        <ul className="text-left mb-6">
          {tips.map((tip, i) => (
            <li key={i} className="mb-2 text-neutral-300">• {tip}</li>
          ))}
        </ul>
        <button onClick={handleRestart} className="px-4 py-2 bg-spotify text-white rounded hover:bg-spotify/80 transition">Retake Quiz</button>
        {onClose && <button onClick={onClose} className="ml-4 px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition">Close</button>}
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-700 rounded-xl p-8 shadow-lg animate-fadeIn">
      <h2 className="text-xl font-bold mb-4 text-white">Risk-Proneness Quiz</h2>
      <p className="text-neutral-200 font-medium mb-6">{q.question}</p>
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleOption(q.scores[i])}
            className="px-4 py-2 bg-spotify/80 text-white rounded hover:bg-spotify transition"
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-6 text-sm text-neutral-400">Question {current + 1} of {questions.length}</div>
      {onClose && <button onClick={onClose} className="mt-6 px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition">Close</button>}
    </div>
  );
};

export default RiskQuiz; 