import { useState } from 'react';

export interface Question {
  question: string;
  type: 'multiple_choice' | 'open_ended' | 'text';
  options: string[];
}

export interface AnnouncementAIResult {
  title: string;
  message: string;
  questions: Question[];
  needsExtraData: boolean;
  extraDataPrompt?: string;
}

export const useAnnouncementAI = () => {
  const [isImproving, setIsImproving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExtraDataPopup, setShowExtraDataPopup] = useState(false);
  const [extraDataRequest, setExtraDataRequest] = useState('');
  const [userExtraData, setUserExtraData] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const improveText = async (currentMessage: string): Promise<string | null> => {
    if (!currentMessage.trim()) return currentMessage;

    setIsImproving(true);
    setError(null);
    setIsRateLimited(false);
    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'improveText',
          text: currentMessage,
        }),
      });

      if (response.status === 429) {
        setIsRateLimited(true);
        return null;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.text;
    } catch (err) {
      setError('No se pudo mejorar el texto. Por favor, intenta de nuevo.');
      return null;
    } finally {
      setIsImproving(false);
    }
  };

  const summarizeText = async (currentMessage: string): Promise<string | null> => {
    if (!currentMessage.trim()) return currentMessage;

    setIsImproving(true);
    setError(null);
    setIsRateLimited(false);
    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'summarizeText',
          text: currentMessage,
        }),
      });

      if (response.status === 429) {
        setIsRateLimited(true);

        return null;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.text;
    } catch (err) {
      setError('No se pudo resumir el texto. Por favor, intenta de nuevo.');
      return null;
    } finally {
      setIsImproving(false);
    }
  };

  const emojifyText = async (currentMessage: string): Promise<string | null> => {
    if (!currentMessage.trim()) return currentMessage;

    setIsImproving(true);
    setError(null);
    setIsRateLimited(false);
    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'emojifyText',
          text: currentMessage,
        }),
      });

      if (response.status === 429) {
        setIsRateLimited(true);

        return null;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.text;
    } catch (err) {
      setError('No se pudo emojificar el texto. Por favor, intenta de nuevo.');
      return null;
    } finally {
      setIsImproving(false);
    }
  };

  const generateContent = async (
    currentMessageForPrompt: string,
    customPrompt?: string
  ): Promise<AnnouncementAIResult | null> => {
    setIsGenerating(true);
    setError(null);
    setIsRateLimited(false);

    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateContent',
          currentMessageForPrompt,
          customPrompt,
        }),
      });

      if (response.status === 429) {
        setIsRateLimited(true);

        setIsGenerating(false);
        return null;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.needsExtraData) {
        setExtraDataRequest(data.extraDataPrompt);
        setShowExtraDataPopup(true);
        setIsGenerating(false);
        return {
          title: '',
          message: '',
          questions: [],
          needsExtraData: true,
          extraDataPrompt: data.extraDataPrompt,
        };
      } else {
        setShowExtraDataPopup(false);
        setIsGenerating(false);
        return {
          title: data.title,
          message: data.message,
          questions: data.questions,
          needsExtraData: false,
        };
      }
    } catch (err) {
      setError('No se pudo generar el contenido. Por favor, intenta de nuevo.');
      setIsGenerating(false);
      return null;
    }
  };

  const submitExtraData = async (initialUserMessage: string): Promise<AnnouncementAIResult | null> => {
    setShowExtraDataPopup(false);
    setIsGenerating(true); // Indicate that we are now generating the final content
    setError(null);
    setIsRateLimited(false);

    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submitExtraData',
          currentMessageForPrompt: initialUserMessage,
          extraDataRequest,
          userExtraData,
        }),
      });

      if (response.status === 429) {
        setIsRateLimited(true);
        setIsGenerating(false);
        setUserExtraData('');
        return null;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUserExtraData('');
      setIsGenerating(false);

      return {
        title: data.title,
        message: data.message,
        questions: data.questions,
        needsExtraData: false,
      };
    } catch (err) {
      setError('No se pudo generar el contenido. Por favor, intenta de nuevo.');
      setIsGenerating(false);
      setUserExtraData('');
      return null;
    }
  };

  const cancelExtraData = () => {
    setShowExtraDataPopup(false);
    setUserExtraData('');
    setIsGenerating(false);
  };

  return {
    isImproving,
    isGenerating,
    error,
    isRateLimited,
    showExtraDataPopup,
    extraDataRequest,
    userExtraData,
    setUserExtraData,
    improveText,
    summarizeText,
    emojifyText,
    generateContent,
    submitExtraData,
    cancelExtraData,
  };
};
