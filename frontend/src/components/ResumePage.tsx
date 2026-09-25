import { useRef, useState } from 'react';

interface Props {
  resumeText: string | null;
  loading: boolean;
  uploading: boolean;
  error: string;
  onUpload: (file: File) => Promise<boolean>;
}

export function ResumePage({ resumeText, loading, uploading, error, onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    onUpload(file);
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Resume</h2>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Upload your resume to unlock AI resume-fit analysis on your applications.
      </p>

      {loading ? (
        <div className="text-muted" style={{ fontSize: 13 }}>Loading...</div>
      ) : (
        <>
          {resumeText && (
            <div className="card" style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a7c5c', boxShadow: '0 0 6px #4a7c5c' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Resume on file</span>
              </div>
              <div
                className="text-muted"
                style={{
                  fontSize: 12, lineHeight: 1.6, maxHeight: 120, overflow: 'hidden',
                  background: '#1c1a20', borderRadius: 8, padding: 12, border: '1px solid #38343f',
                }}
              >
                {resumeText.slice(0, 400)}...
              </div>
            </div>
          )}

          <div
            className="card"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: 32, textAlign: 'center', cursor: 'pointer',
              border: dragOver ? '2px dashed #8b6dd6' : '2px dashed #38343f',
              background: dragOver ? 'rgba(139, 109, 214, 0.06)' : '#26232b',
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {uploading ? 'Uploading...' : resumeText ? 'Drop a new PDF to replace' : 'Drop your resume PDF here'}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>or click to browse</div>
          </div>

          {error && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#e08a8a', background: 'rgba(224, 138, 138, 0.1)', border: '1px solid rgba(224, 138, 138, 0.25)', borderRadius: 8, padding: '8px 12px' }}>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}