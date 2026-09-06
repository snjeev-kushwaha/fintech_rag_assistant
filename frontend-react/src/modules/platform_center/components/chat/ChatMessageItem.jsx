/**
 * ChatMessageItem.jsx — ChatGPT-style Bot & User Message Row with Action Toolbar
 */
import { useState } from 'react';
import {
  FileEarmarkText,
  LightningChargeFill,
  Clipboard,
  ClipboardCheck,
  HandThumbsUp,
  HandThumbsDown,
  Book,
} from 'react-bootstrap-icons';
import styles from '../../styles/platform_center.module.css';

function SourceCard({ src }) {
  return (
    <div className={styles.sourceCard}>
      <div className={styles.sourceCardHeader}>
        <FileEarmarkText size={13} style={{ flexShrink: 0, marginRight: '6px' }} />
        <span>{src.source_file || 'Document Citation'}</span>
        {src.department && <span>— {src.department}</span>}
      </div>
      {src.content_preview && (
        <div className={styles.sourcePreview}>{src.content_preview}</div>
      )}
    </div>
  );
}

function renderFormattedLine(line) {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatMessageItem({ msg }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = msg.role === 'user';

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isUser) {
    return (
      <div className={styles.msgUserRow}>
        <div className={styles.msgUserBubble}>{msg.content}</div>
      </div>
    );
  }

  return (
    <div className={styles.msgBotRow}>
      <div className={styles.msgBotAvatar}>
        <LightningChargeFill size={15} />
      </div>
      <div className={styles.msgBotContent}>
        <div className={styles.msgBotText}>
          {msg.content.split('\n').map((line, i) => (
            <span key={i}>
              {renderFormattedLine(line)}
              {i < msg.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className={styles.botActionBar}>
          <button
            className={styles.actionBtn}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <ClipboardCheck size={13} style={{ color: '#22c55e' }} />
            ) : (
              <Clipboard size={13} />
            )}
          </button>

          <button className={styles.actionBtn} title="Helpful" aria-label="Helpful">
            <HandThumbsUp size={13} />
          </button>
          <button className={styles.actionBtn} title="Not helpful" aria-label="Not helpful">
            <HandThumbsDown size={13} />
          </button>

          {msg.sources && msg.sources.length > 0 && (
            <div className={styles.sourcesWrapper}>
              <button
                className={styles.sourcesToggle}
                onClick={() => setSourcesOpen((o) => !o)}
              >
                <Book size={13} style={{ marginRight: '6px' }} />
                {msg.sources.length} Source{msg.sources.length > 1 ? 's' : ''} Referenced
                <span className={sourcesOpen ? styles.chevronOpen : styles.chevron}>▾</span>
              </button>
            </div>
          )}
        </div>

        {/* Sources Drawer */}
        {sourcesOpen && msg.sources && msg.sources.length > 0 && (
          <div className={styles.sourcesList}>
            {msg.sources.map((src, i) => (
              <SourceCard key={i} src={src} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
