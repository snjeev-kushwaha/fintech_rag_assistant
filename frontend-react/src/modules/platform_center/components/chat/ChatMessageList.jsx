/**
 * ChatMessageList.jsx — ChatGPT Hero Welcome View & Active Conversation Stream
 */
import { useRef, useEffect } from 'react';
import ChatMessageItem from './ChatMessageItem';
import styles from '../../styles/platform_center.module.css';

function TypingIndicator() {
  return (
    <div className={styles.typingRow}>
      <div className={styles.msgBotAvatar}>⚡</div>
      <div className={styles.typingBubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}

export default function ChatMessageList({ messages, loading, onSelectSuggestion, roleConf }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestions = roleConf?.suggestions || [
    'What was our total revenue in 2024?',
    'Show me the net profit margin for Q4 2024',
    'What is our headcount by department?',
    'What tech stack does FinSolve use?',
  ];

  // If only the default welcome message or empty state
  const isHeroState = messages.length <= 1;

  if (isHeroState) {
    return (
      <div className={styles.messagesList}>
        <div className={styles.emptyHeroContainer}>
          <div className={styles.emptyHeroIcon}>⚡</div>
          <h1 className={styles.emptyHeroTitle}>Where should we begin?</h1>
          <p className={styles.emptyHeroSubtitle}>
            Ask questions scoped to your {roleConf?.label || 'department'} data, financial reports, HR policies, or operational documentation.
          </p>

          <div className={styles.suggestionsGrid}>
            {suggestions.slice(0, 4).map((item, idx) => (
              <button
                key={idx}
                className={styles.suggestionCard}
                onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
              >
                <span className={styles.suggestionCardTitle}>{item}</span>
                <span className={styles.suggestionCardSub}>Query {roleConf?.label || 'knowledge base'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesList}>
      <div className={styles.messagesListInner}>
        {messages.map((msg, i) => (
          <ChatMessageItem key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
