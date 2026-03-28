import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --accent: #7c6aff;
    --accent2: #ff6a9b;
    --accent3: #6affda;
    --text: #e8e8f0;
    --text-muted: #6b6b80;
    --user-bg: #1e1a3a;
    --bot-bg: #111118;
    --success: #6affda;
    --error: #ff6a6a;
    --warning: #ffca6a;
  }

  body {
    background: var(--bg);
    font-family: 'DM Mono', monospace;
    color: var(--text);
    min-height: 100vh;
    overflow: hidden;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 900px;
    margin: 0 auto;
    position: relative;
  }

  .bg-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.12;
    pointer-events: none;
    z-index: 0;
  }
  .blob1 { width: 500px; height: 500px; background: var(--accent); top: -100px; left: -100px; }
  .blob2 { width: 400px; height: 400px; background: var(--accent2); bottom: -50px; right: -50px; }
  .blob3 { width: 300px; height: 300px; background: var(--accent3); top: 40%; left: 40%; }

  /* ── Header ── */
  .header {
    padding: 20px 32px 18px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    z-index: 10;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
  }

  .header-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }

  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; letter-spacing: -0.5px;
  }
  .header-title span {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .header-sub { font-size: 11px; color: var(--text-muted); letter-spacing: 0.5px; margin-top: 2px; }

  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    margin-left: auto; animation: pulse 2s infinite;
  }
  .status-dot.ready { background: var(--accent3); box-shadow: 0 0 8px var(--accent3); }
  .status-dot.idle  { background: var(--text-muted); }

  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* ── Upload Panel ── */
  .upload-panel {
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    position: relative; z-index: 10;
    background: rgba(10,10,15,0.6);
    backdrop-filter: blur(10px);
  }

  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: 14px;
    padding: 22px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.25s;
    background: var(--surface);
    position: relative;
    overflow: hidden;
  }

  .drop-zone:hover, .drop-zone.dragging {
    border-color: var(--accent);
    background: rgba(124,106,255,0.06);
  }

  .drop-zone.has-file {
    border-color: var(--accent3);
    border-style: solid;
    background: rgba(106,255,218,0.04);
  }

  .drop-zone.error-state {
    border-color: var(--error);
    background: rgba(255,106,106,0.05);
  }

  .drop-icon {
    width: 44px; height: 44px; flex-shrink: 0;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  .drop-icon.default { background: var(--surface2); border: 1px solid var(--border); }
  .drop-icon.success { background: rgba(106,255,218,0.12); border: 1px solid var(--accent3); }
  .drop-icon.error   { background: rgba(255,106,106,0.12); border: 1px solid var(--error); }
  .drop-icon.loading { background: rgba(124,106,255,0.12); border: 1px solid var(--accent); }

  .drop-content { flex: 1; min-width: 0; }

  .drop-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .drop-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

  .file-badges {
    display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;
  }

  .badge {
    font-size: 10px; padding: 2px 8px; border-radius: 20px;
    border: 1px solid; letter-spacing: 0.3px;
  }
  .badge.pages  { color: var(--accent);  border-color: rgba(124,106,255,0.4); background: rgba(124,106,255,0.08); }
  .badge.chunks { color: var(--accent2); border-color: rgba(255,106,155,0.4); background: rgba(255,106,155,0.08); }
  .badge.ready  { color: var(--accent3); border-color: rgba(106,255,218,0.4); background: rgba(106,255,218,0.08); }

  .upload-btn {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid var(--accent);
    background: rgba(124,106,255,0.1);
    color: var(--accent);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .upload-btn:hover:not(:disabled) { background: rgba(124,106,255,0.2); }
  .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .progress-bar {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
    margin-top: 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    border-radius: 1px;
    animation: progressAnim 1.5s ease-in-out infinite;
  }

  @keyframes progressAnim {
    0%   { width: 0%;   margin-left: 0; }
    50%  { width: 60%;  margin-left: 20%; }
    100% { width: 0%;   margin-left: 100%; }
  }

  /* ── Messages ── */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative; z-index: 10;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .messages::-webkit-scrollbar { width: 4px; }
  .messages::-webkit-scrollbar-track { background: transparent; }
  .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* Empty state */
  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; text-align: center; padding: 40px;
    animation: fadeIn 0.5s ease;
  }

  .empty-icon { font-size: 44px; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .empty-sub { font-size: 13px; color: var(--text-muted); max-width: 300px; line-height: 1.6; }

  .upload-cta {
    margin-top: 8px;
    padding: 10px 20px;
    border-radius: 24px;
    border: 1px dashed var(--accent);
    background: rgba(124,106,255,0.06);
    color: var(--accent);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Mono', monospace;
  }
  .upload-cta:hover { background: rgba(124,106,255,0.14); }

  /* Messages */
  .message {
    display: flex; gap: 12px;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity:0; } to { opacity:1; }
  }

  .message.user { flex-direction: row-reverse; }

  .avatar {
    width: 32px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; margin-top: 2px;
  }
  .avatar.user { background: linear-gradient(135deg, var(--accent), var(--accent2)); }
  .avatar.bot  { background: var(--surface2); border: 1px solid var(--border); }

  .bubble {
    max-width: 72%; padding: 14px 18px;
    border-radius: 16px; font-size: 14px; line-height: 1.75;
  }
  .bubble.user {
    background: var(--user-bg);
    border: 1px solid rgba(124,106,255,0.3);
    border-top-right-radius: 4px;
  }
  .bubble.bot {
    background: var(--bot-bg);
    border: 1px solid var(--border);
    border-top-left-radius: 4px;
  }
  .bubble.error-bubble { border-color: rgba(255,106,106,0.4); }

  .source-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; color: var(--text-muted);
    margin-top: 8px; padding-top: 8px;
    border-top: 1px solid var(--border);
  }

  .bubble-meta { font-size: 10px; color: var(--text-muted); margin-top: 5px; }
  .message.user .bubble-meta { text-align: right; }

  /* Typing */
  .typing { display:flex; align-items:center; gap:4px; padding: 6px 0; }
  .typing-dot {
    width:6px; height:6px; border-radius:50%; background: var(--accent);
    animation: typingBounce 1.2s infinite;
  }
  .typing-dot:nth-child(2) { animation-delay:.2s; background:var(--accent2); }
  .typing-dot:nth-child(3) { animation-delay:.4s; background:var(--accent3); }

  @keyframes typingBounce {
    0%,60%,100% { transform:translateY(0); opacity:.4; }
    30%          { transform:translateY(-6px); opacity:1; }
  }

  /* ── Input ── */
  .input-area {
    padding: 16px 32px 24px;
    border-top: 1px solid var(--border);
    position: relative; z-index: 10;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
  }

  .input-wrapper {
    display: flex; align-items: flex-end; gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 12px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-wrapper:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124,106,255,0.1);
  }

  .input-wrapper.disabled-state {
    opacity: 0.5; pointer-events: none;
  }

  .input-field {
    flex: 1; background: transparent; border: none; outline: none;
    color: var(--text); font-family: 'DM Mono', monospace;
    font-size: 14px; line-height: 1.5; resize: none;
    min-height: 22px; max-height: 120px; overflow-y: auto;
  }
  .input-field::placeholder { color: var(--text-muted); }

  .send-btn {
    width: 36px; height: 36px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; font-size: 16px;
  }
  .send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 16px rgba(124,106,255,0.4); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .input-hint {
    font-size: 11px; color: var(--text-muted);
    margin-top: 8px; text-align: center;
  }

  input[type="file"] { display: none; }
`;

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const BASE = "http://127.0.0.1:8000";

export default function App() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);

  // Upload state
  const [docReady, setDocReady]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);  // { filename, pages, chunks }
  const [uploadError, setUploadError] = useState(null);
  const [dragging, setDragging]     = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── File upload handler ────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are supported.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setDocReady(false);
    setUploadInfo(null);
    setMessages([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadInfo({
        filename: res.data.filename,
        pages:    res.data.pages,
        chunks:   res.data.chunks,
      });
      setDocReady(true);
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload failed. Is the backend running?";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    const question = (text || input).trim();
    if (!question || loading || !docReady) return;

    setMessages((prev) => [...prev, { role: "user", text: question, time: new Date() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${BASE}/ask`, { query: question });
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.data.answer, time: new Date(), source: res.data.source_file },
      ]);
    } catch (err) {
      const msg = err.response?.data?.detail || "⚠️ Could not reach the backend.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: msg, time: new Date(), error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Drop-zone content ─────────────────────────────────────────────────────
  const renderDropZone = () => {
    if (uploading) return (
      <>
        <div className="drop-icon loading">⚙️</div>
        <div className="drop-content">
          <div className="drop-title">Processing PDF…</div>
          <div className="drop-subtitle">Chunking & embedding — hang tight</div>
          <div className="progress-bar"><div className="progress-fill" /></div>
        </div>
      </>
    );

    if (uploadError) return (
      <>
        <div className="drop-icon error">❌</div>
        <div className="drop-content">
          <div className="drop-title" style={{ color: "var(--error)" }}>Upload failed</div>
          <div className="drop-subtitle">{uploadError}</div>
        </div>
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>Retry</button>
      </>
    );

    if (docReady && uploadInfo) return (
      <>
        <div className="drop-icon success">📄</div>
        <div className="drop-content">
          <div className="drop-title">{uploadInfo.filename}</div>
          <div className="file-badges">
            <span className="badge pages">{uploadInfo.pages} pages</span>
            <span className="badge chunks">{uploadInfo.chunks} chunks</span>
            <span className="badge ready">✓ Ready</span>
          </div>
        </div>
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
          Replace
        </button>
      </>
    );

    return (
      <>
        <div className="drop-icon default">📂</div>
        <div className="drop-content">
          <div className="drop-title">Drop your PDF here</div>
          <div className="drop-subtitle">or click to browse — the chatbot will answer from its contents</div>
        </div>
        <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Browse
        </button>
      </>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bg-blob blob1" />
      <div className="bg-blob blob2" />
      <div className="bg-blob blob3" />

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-icon">🧠</div>
          <div>
            <div className="header-title"><span>JEFF</span> bot</div>
            <div className="header-sub">
              {docReady ? `Answering from: ${uploadInfo?.filename}` : "Upload a PDF to get started"}
            </div>
          </div>
          <div className={`status-dot ${docReady ? "ready" : "idle"}`}
               title={docReady ? "Document loaded" : "No document"} />
        </div>

        {/* Upload Panel */}
        <div className="upload-panel">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div
            className={`drop-zone ${dragging ? "dragging" : ""} ${docReady ? "has-file" : ""} ${uploadError ? "error-state" : ""}`}
            onClick={() => !uploading && !docReady && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {renderDropZone()}
          </div>
        </div>

        {/* Messages */}
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{docReady ? "💬" : "📋"}</div>
              <div className="empty-title">
                {docReady ? "Ask anything about your document" : "No document loaded"}
              </div>
              <div className="empty-sub">
                {docReady
                  ? `I'll find answers directly from "${uploadInfo?.filename}".`
                  : "Upload a PDF above and I'll answer questions from its contents using local AI."}
              </div>
              {!docReady && (
                <button className="upload-cta" onClick={() => fileInputRef.current?.click()}>
                  ↑ Upload a PDF to begin
                </button>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className={`avatar ${msg.role}`}>
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div>
                  <div className={`bubble ${msg.role} ${msg.error ? "error-bubble" : ""}`}>
                    {msg.text}
                    {msg.source && msg.role === "bot" && !msg.error && (
                      <div className="source-tag">📄 {msg.source}</div>
                    )}
                  </div>
                  <div className="bubble-meta">{formatTime(msg.time)}</div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message bot">
              <div className="avatar bot">🤖</div>
              <div className="bubble bot">
                <div className="typing">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className={`input-wrapper ${!docReady ? "disabled-state" : ""}`}>
            <textarea
              className="input-field"
              placeholder={docReady ? "Ask a question about your PDF…" : "Upload a PDF first…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading || !docReady}
            />
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading || !docReady}
            >
              ↑
            </button>
          </div>
          {docReady && (
            <div className="input-hint">
              Press <kbd style={{background:"#1a1a24",border:"1px solid #2a2a3a",borderRadius:"4px",padding:"1px 5px",fontSize:"10px",fontFamily:"DM Mono"}}>Enter</kbd> to send · <kbd style={{background:"#1a1a24",border:"1px solid #2a2a3a",borderRadius:"4px",padding:"1px 5px",fontSize:"10px",fontFamily:"DM Mono"}}>Shift+Enter</kbd> for new line
            </div>
          )}
        </div>
      </div>
    </>
  );
}