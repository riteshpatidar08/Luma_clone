import { useCallback, useRef, useState } from 'react';
import { baseURL } from '../lib/api';

// Consumes the server's SSE chat stream via fetch()+ReadableStream (not
// native EventSource, since the question is sent as a POST body).
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [sources, setSources] = useState([]);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || streaming) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setStreaming(true);
    setSources([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Chat request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop();

        for (const frame of frames) {
          const lines = frame.split('\n');
          let eventName = 'message';
          let dataLine = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            if (line.startsWith('data:')) dataLine = line.slice(5).trim();
          }
          if (!dataLine) continue;

          if (eventName === 'sources') {
            try {
              setSources(JSON.parse(dataLine));
            } catch (e) {}
          } else if (eventName === 'done') {
            // no-op
          } else {
            try {
              const parsed = JSON.parse(dataLine);
              if (parsed.text) {
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + parsed.text };
                  return next;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong reaching the AI concierge.' };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }, [streaming]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setSources([]);
  }, []);

  return { messages, sendMessage, streaming, sources, reset };
}
