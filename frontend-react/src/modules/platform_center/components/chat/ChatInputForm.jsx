/**
 * ChatInputForm.jsx — Authentic ChatGPT-style Floating Input Bar with File Attachment Upload
 */
import { useRef } from 'react';
import styles from '../../styles/platform_center.module.css';

export default function ChatInputForm({ input, setInput, onSubmit, loading, onFileUpload }) {
  const fileInputRef = useRef(null);

  function handleAttachClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset file input value so same file can be re-uploaded if needed
    e.target.value = '';
  }

  return (
    <div className={styles.inputContainerWrapper}>
      <form className={styles.inputForm} onSubmit={onSubmit} id="chat-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="chat-file-upload-input"
        />

        <button
          type="button"
          className={styles.attachBtn}
          onClick={handleAttachClick}
          disabled={loading}
          title="Upload department document attachment"
          aria-label="Upload department document attachment"
          id="chat-attachment-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <input
          id="chat-input-field"
          type="text"
          placeholder="Ask anything about your department data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className={styles.inputField}
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={styles.sendBtn}
          id="chat-submit-btn"
          title="Send message"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </form>

      <div className={styles.disclaimerText}>
        FinSolve RAG Assistant can make mistakes. Verify important department info.
      </div>
    </div>
  );
}
