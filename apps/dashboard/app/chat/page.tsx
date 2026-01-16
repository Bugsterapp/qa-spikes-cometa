'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PromptInput, PromptInputTextarea, PromptInputToolbar, PromptInputSubmit } from '../../components/prompt-input';
import { Response } from '../../components/response';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '../../components/tool';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import type { ToolUIPart } from 'ai';
import ChatWrapper from '../../components/chat-wrapper';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { cn } from '@cometa/utils';
import { ReportDisplay } from '../../components/report-display';
import { MessageFeedback } from '../../components/message-feedback';
import { useSchoolSync } from '/src/hooks/useSchoolSync';

// Component for rendering clickable suggestions
function SuggestionButtons({
  suggestions,
  onSelect,
}: {
  suggestions: Array<{ id: number; text: string; query: string }>;
  onSelect: (query: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.query)}
          className="px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors text-sm font-medium"
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
}

function ChatContent() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, status: authStatus } = useSession();
  const allowedExternalEmails = [
    'carlos.linan@babyboomers.edu.mx',
    'javier.osorio@luminos.mx',
    'lrobertochavez@liceoloscabos.edu.mx',
    'kinder@ombuthefourth.com',
  ];
  const userEmail = session?.user?.email || '';
  const isUserAllowed =
    userEmail && (userEmail.endsWith('@getcometa.com') || allowedExternalEmails.includes(userEmail));
  const isAllowed = isUserAllowed && authStatus === 'authenticated';
  const selectedSchool = useSelectedSchool();
  const [sessionId] = useState(() => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const userId = `${selectedSchool?.name}_${selectedSchool?.id}_${userEmail}`;
  const [showSchoolChangeNotification, setShowSchoolChangeNotification] = useState(false);
  const initialSchoolIdRef = useRef(selectedSchool?.id);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSchoolSync((newSchoolId) => {
    if (initialSchoolIdRef.current && initialSchoolIdRef.current !== newSchoolId) {
      setShowSchoolChangeNotification(true);
      reloadTimeoutRef.current = setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  });

  const handleCancelReload = () => {
    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
      reloadTimeoutRef.current = null;
    }
    setShowSchoolChangeNotification(false);
  };

  useEffect(() => {
    if (selectedSchool?.id) {
      initialSchoolIdRef.current = selectedSchool.id;
    }
  }, [selectedSchool?.id]);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        schoolId: selectedSchool?.id,
        schoolName: selectedSchool?.name,
        email: session?.user?.email ?? '',
        sessionId,
      },
    }),
  });

  const scrollToBottom = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    // Always use smooth scrolling
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;

    sendMessage({ text: input });
    setInput('');
  };
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No tienes acceso a este chat</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen bg-background font-lota">
      {showSchoolChangeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-[#212B36] px-6 py-3 rounded-lg shadow-lg border border-[#DDE1E5]"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 animate-spin flex-shrink-0 text-[#00AB55]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm font-medium">Escuela cambiada. Recargando en 5 segundos...</p>
            <button
              onClick={handleCancelReload}
              className="ml-2 text-[#7E83B0] hover:text-[#212B36] font-semibold text-sm transition-colors"
              aria-label="Cancelar recarga"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold flex gap-4 items-center">
            <Link
              href="/charge"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <Image src="/favicon/cometa.svg" alt="Cometa" width={28} height={24} />
            Cometa AI
          </h1>
          {selectedSchool && <span className="text-sm text-muted-foreground">{selectedSchool.name}</span>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex justify-center transition-all duration-300 ease-in-out">
        <div className="max-w-[650px] mx-auto px-4 py-8 relative w-full min-h-full flex flex-col">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 mt-12"
            >
              <h2 className="text-2xl font-semibold mb-2">¿En qué puedo ayudarte hoy?</h2>
              <p className="text-muted-foreground">Pregúntame lo que quieras</p>
            </motion.div>
          )}
          <AnimatePresence>
            {messages.map((message, index) => {
              let messageText = '';
              let analyticsData: { query?: string; answer?: string } | undefined;

              message.parts.forEach((part) => {
                if (part.type === 'text') {
                  messageText += part.text.split('<suggestions>')[0];
                } else if (part.type === 'tool-analytics') {
                  const toolPart = part as ToolUIPart;
                  if (toolPart.state === 'output-available' && toolPart.output) {
                    const output = toolPart.output as any;
                    analyticsData = {
                      query: output.query,
                      answer: output.answer,
                    };
                  }
                }
              });

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn('mb-4 flex', {
                    'justify-end': message.role === 'user',
                    'justify-start': message.role === 'assistant',
                    'flex-1 min-h-[50vh] flex-grow': messages.length - 1 === index,
                  })}
                >
                  <div
                    className={cn('flex gap-3 max-w-[85%]', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <div className="flex-1 space-y-2 max-w-[650px] mt-3">
                      {message.parts.map((part, partIndex) => {
                        if (part.type === 'text') {
                          return (
                            <div
                              key={partIndex}
                              className={cn(
                                'rounded-2xl px-4 py-3',

                                message.role === 'user'
                                  ? 'bg-gray-700 text-gray-100 justify-end'
                                  : 'bg-muted justify-start '
                              )}
                            >
                              {message.role === 'assistant' ? (
                                <>
                                  <Response>{part.text.split('<suggestions>')[0]}</Response>
                                  {part.text.includes('<suggestions>') &&
                                    (() => {
                                      try {
                                        const suggestionsMatch = part.text.match(
                                          /<suggestions>([\s\S]*?)<\/suggestions>/
                                        );
                                        if (suggestionsMatch) {
                                          const suggestions = JSON.parse(suggestionsMatch[1]);
                                          return (
                                            <SuggestionButtons
                                              suggestions={suggestions}
                                              onSelect={(query) => sendMessage({ text: query })}
                                            />
                                          );
                                        }
                                      } catch (e) {
                                        // Ignore parsing errors
                                      }
                                      return null;
                                    })()}
                                </>
                              ) : (
                                <div className="text-sm leading-relaxed justify-end">{part.text}</div>
                              )}
                            </div>
                          );
                        } else if (part.type.startsWith('tool-')) {
                          const toolPart = part as ToolUIPart;
                          const toolType = part.type as ToolUIPart['type'];

                          // Custom UI for weather tool
                          if (part.type === 'tool-weather') {
                            const weatherData = toolPart.output as any;

                            return (
                              <Tool key={partIndex}>
                                <ToolHeader type={toolType} state={toolPart.state || 'input-available'} />
                                <ToolContent>
                                  <div className="p-4 space-y-3">
                                    {toolPart.input && (
                                      <div className="text-sm text-muted-foreground">
                                        Fetching weather for:{' '}
                                        <span className="font-medium">{(toolPart.input as any)?.city}</span>
                                      </div>
                                    )}
                                    {toolPart.state === 'output-available' && weatherData && (
                                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h3 className="font-semibold text-lg">{weatherData.city}</h3>
                                            <p className="text-2xl font-bold mt-1">{weatherData.temperature}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                              {weatherData.condition}
                                            </p>
                                          </div>
                                          <div className="text-4xl">
                                            {weatherData.condition?.includes('sunny')
                                              ? '☀️'
                                              : weatherData.condition?.includes('cloudy')
                                              ? '☁️'
                                              : weatherData.condition?.includes('rainy')
                                              ? '🌧️'
                                              : weatherData.condition?.includes('snowy')
                                              ? '❄️'
                                              : '⛅'}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">Humidity:</span>
                                            <span className="ml-2 font-medium">{weatherData.humidity}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Wind:</span>
                                            <span className="ml-2 font-medium">{weatherData.windSpeed}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {toolPart.state === 'output-error' && (
                                      <div className="text-red-600 text-sm">Failed to fetch weather data</div>
                                    )}
                                  </div>
                                </ToolContent>
                              </Tool>
                            );
                          }

                          // Custom UI for analytics tool
                          if (part.type === 'tool-analytics') {
                            const analyticsData = toolPart.output as any;

                            return (
                              <Tool key={partIndex} defaultOpen>
                                {/*<ToolHeader type={toolType} state={toolPart.state || 'input-available'} />*/}
                                <ToolContent>
                                  <div className="p-4 space-y-3">
                                    {/* Show loading state when input is available but output is not */}
                                    {toolPart.state === 'input-available' && toolPart.input && (
                                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10">
                                        <div className="flex-1">
                                          <motion.div
                                            className="text-sm font-semibold text-purple-700 dark:text-purple-300"
                                            animate={{
                                              opacity: [0.7, 1, 0.7],
                                            }}
                                            transition={{
                                              duration: 2,
                                              ease: 'easeInOut',
                                              repeat: Infinity,
                                            }}
                                          >
                                            Analizando datos
                                          </motion.div>
                                          <motion.div
                                            className="mt-0.5 text-xs font-medium italic bg-clip-text"
                                            style={{
                                              WebkitTextFillColor: 'transparent',
                                              backgroundImage:
                                                'linear-gradient(90deg, #6b7280 0%, rgba(168, 85, 247, 0.6) 40%, rgba(219, 39, 119, 0.6) 60%, #6b7280 100%)',
                                              backgroundSize: '200% 100%',
                                              backgroundClip: 'text',
                                              WebkitBackgroundClip: 'text',
                                            }}
                                            animate={{
                                              backgroundPosition: ['200% 0', '-200% 0'],
                                            }}
                                            transition={{
                                              duration: 2.5,
                                              ease: 'easeInOut',
                                              repeat: Infinity,
                                              delay: 0.3,
                                            }}
                                          >
                                            "{(toolPart.input as any)?.query}"
                                          </motion.div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Show output when available */}
                                    {toolPart.state === 'output-available' && analyticsData && (
                                      <div className="bg-gradient-to-br from-purple-50/70 to-pink-50/70 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="flex-1">
                                            <div className="max-w-[300px] md:max-w-[600px] space-y-4">
                                              {/* Always show the answer first */}
                                              {analyticsData.answer && (
                                                <Response className="[&_p]:text-gray-900 [&_p]:dark:text-gray-100">
                                                  {analyticsData.answer}
                                                </Response>
                                              )}

                                              {/* Show report generation separately if there's a background job */}
                                              {analyticsData.background_job && (
                                                <ReportDisplay
                                                  backgroundJob={analyticsData.background_job}
                                                  query={analyticsData.query}
                                                />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {toolPart.state === 'output-error' && (
                                      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                          <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <span className="text-sm font-medium">Error al consultar los datos</span>
                                        </div>
                                        {analyticsData?.error && (
                                          <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                                            {analyticsData.error}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </ToolContent>
                              </Tool>
                            );
                          }

                          // Default rendering for other tools
                          return (
                            <Tool key={partIndex}>
                              <ToolHeader type={toolType} state={toolPart.state || 'input-available'} />
                              <ToolContent>
                                {/* TODO: FIX THIS*/}
                                {/* @ts-ignore */}
                                {toolPart.input ? <ToolInput input={toolPart.input} /> : null}
                                {/* @ts-ignore */}
                                {toolPart.state === 'output-available' && toolPart.output ? (
                                  // @ts-ignore
                                  <ToolOutput output={toolPart.output as ReactNode} errorText={undefined} />
                                ) : null}

                                {toolPart.state === 'output-error' && (
                                  <ToolOutput output={null} errorText={toolPart.errorText || 'An error occurred'} />
                                )}
                              </ToolContent>
                            </Tool>
                          );
                        }
                        return null;
                      })}
                      {message.role === 'assistant' && (
                        <MessageFeedback
                          messageId={message.id}
                          messageText={messageText}
                          analyticsData={analyticsData}
                          sessionId={sessionId}
                          userId={userId}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/*<AnimatePresence>
            {status === 'streaming' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-end"
              >
                <motion.div
                  className="text-pink-500 text-4xl font-bold"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                >
                  •
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>*/}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t flex justify-center w-full">
        <div className="max-w-[600px] mx-auto p-4 w-full">
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-2xl border-gray-200 bg-gray-50 shadow-sm transition-all focus-within:shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={status !== 'ready'}
              className="min-h-[56px] max-h-[200px] outline-none ring-0 ring-offset-0 focus-visible:ring-offset-0"
              rows={1}
            />
            <PromptInputToolbar>
              <div className="flex-1" />
              <PromptInputSubmit disabled={status !== 'ready' || !input.trim()} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatWrapper>
      <ChatContent />
    </ChatWrapper>
  );
}
