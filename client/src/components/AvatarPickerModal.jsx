import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KFP_AVATARS, getKfpAvatar } from '../data/kungFuPandaAvatars';
import { compressAvatarFile, isCustomAvatarUrl } from '../utils/avatarUpload';

export default function AvatarPickerModal({ open, onClose, currentAvatarUrl, onSelect, saving }) {
  const currentKfp = getKfpAvatar(currentAvatarUrl);
  const currentCustom = isCustomAvatarUrl(currentAvatarUrl) ? currentAvatarUrl : null;

  const [picked, setPicked] = useState(currentKfp?.id || KFP_AVATARS[0].id);
  const [customPreview, setCustomPreview] = useState(currentCustom);
  const [useCustom, setUseCustom] = useState(Boolean(currentCustom));
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const custom = isCustomAvatarUrl(currentAvatarUrl) ? currentAvatarUrl : null;
    setCustomPreview(custom);
    setUseCustom(Boolean(custom));
    setPicked(currentKfp?.id || KFP_AVATARS[0].id);
    setUploadError('');
  }, [open, currentAvatarUrl, currentKfp?.id]);

  const selectedChar = KFP_AVATARS.find((a) => a.id === picked) || KFP_AVATARS[0];
  const previewSrc = useCustom && customPreview ? customPreview : selectedChar.src;
  const previewName = useCustom ? 'Gallery Photo' : selectedChar.name;
  const previewSub = useCustom ? 'Uploaded from device' : selectedChar.movie;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      const dataUrl = await compressAvatarFile(file);
      setCustomPreview(dataUrl);
      setUseCustom(true);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const busy = saving || uploading;

  const pickCharacter = (id) => {
    if (busy) return;
    setUseCustom(false);
    setPicked(id);
    setUploadError('');
    onSelect(`kfp:${id}`);
  };

  const removeCustomPhoto = () => {
    setCustomPreview(null);
    setUseCustom(false);
    setUploadError('');
  };

  const handleConfirm = () => {
    if (useCustom && customPreview) {
      onSelect(customPreview);
    } else {
      onSelect(`kfp:${picked}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="avatar-picker-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="avatar-picker-sheet"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-picker-title"
          >
            <div className="avatar-picker-handle" />

            <div className="avatar-picker-head">
              <div>
                <h2 id="avatar-picker-title">Choose Avatar</h2>
                <p>Characters or your own photo</p>
              </div>
              <button type="button" className="avatar-picker-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="avatar-picker-preview">
              <div className={`avatar-circle avatar-circle-md ${useCustom ? 'avatar-preview-custom' : ''}`}>
                <img src={previewSrc} alt={previewName} />
              </div>
              <div>
                <strong>{previewName}</strong>
                <span>{previewSub}</span>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="avatar-picker-file-input"
              onChange={handleFileChange}
            />

            <button
              type="button"
              className="avatar-picker-upload"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <span className="avatar-picker-upload-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
                  <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="avatar-picker-upload-text">
                <strong>{uploading ? 'Processing...' : 'Upload from Gallery'}</strong>
                <small>JPG, PNG from your phone</small>
              </span>
              <span className="avatar-picker-upload-arrow">›</span>
            </button>

            {uploadError && <p className="avatar-picker-upload-error">{uploadError}</p>}

            {customPreview && (
              <div className="avatar-picker-upload-block">
                <div className="avatar-picker-section-label">YOUR UPLOAD</div>
                <div className={`avatar-picker-gallery-card ${useCustom ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="avatar-picker-gallery-select"
                    onClick={() => setUseCustom(true)}
                  >
                    <div className="avatar-picker-gallery-thumb">
                      <img src={customPreview} alt="Your upload" />
                      {useCustom && (
                        <span className="avatar-picker-gallery-thumb-check" aria-hidden>✓</span>
                      )}
                    </div>
                    <div className="avatar-picker-gallery-meta">
                      <div className="avatar-picker-gallery-title-row">
                        <strong>Gallery Photo</strong>
                        <span className={`avatar-picker-gallery-pill ${useCustom ? 'on' : ''}`}>
                          {useCustom ? 'Selected' : 'Ready'}
                        </span>
                      </div>
                      <span className="avatar-picker-gallery-hint">
                        {useCustom ? 'Will be set as your avatar' : 'Tap to use this photo'}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="avatar-picker-gallery-remove"
                    onClick={removeCustomPhoto}
                    aria-label="Remove uploaded photo"
                    disabled={busy}
                  >
                    <span className="avatar-picker-gallery-remove-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M6 7h12M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7m2 0v10.5A1.5 1.5 0 0115.5 19h-7A1.5 1.5 0 017 17.5V7h10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 10v5M14 10v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="avatar-picker-gallery-remove-label">Remove</span>
                  </button>
                </div>
              </div>
            )}

            <div className="avatar-picker-section-label">CHARACTERS</div>

            <div className="avatar-picker-grid">
              {KFP_AVATARS.map((char) => {
                const isActive = !useCustom && picked === char.id;
                const isCurrent = currentKfp?.id === char.id && !currentCustom;

                return (
                  <button
                    key={char.id}
                    type="button"
                    className={`avatar-picker-item ${isActive ? 'active' : ''}`}
                    onClick={() => pickCharacter(char.id)}
                    disabled={busy}
                  >
                    <div className="avatar-circle avatar-circle-sm">
                      <img src={char.src} alt={char.name} />
                    </div>
                    <span className="avatar-picker-item-name">{char.name}</span>
                    {isCurrent && !isActive && <span className="avatar-picker-current-dot" />}
                    {isActive && <span className="avatar-picker-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="avatar-picker-actions">
              <button type="button" className="avatar-picker-btn ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="avatar-picker-btn primary"
                disabled={busy || (useCustom && !customPreview)}
                onClick={handleConfirm}
              >
                {saving ? 'Saving...' : uploading ? 'Processing...' : 'Select Avatar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
