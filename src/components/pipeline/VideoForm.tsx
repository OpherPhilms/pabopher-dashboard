import { useState } from 'react'
import type { FormEvent } from 'react'
import { PLATFORMS, STAGES, CREATORS } from '../../types/video'
import type { Video, VideoInput } from '../../types/video'
import { addVideo, updateVideo, deleteVideo } from '../../firebase/videos'

interface Props {
  initial: Video | null  // null = add mode, Video = edit mode
  onClose: () => void
}

const EMPTY: VideoInput = {
  title:    '',
  platform: 'YouTube',
  stage:    'Idea',
  creator:  'Pab',
  notes:    '',
  dueDate:  '',
  liveUrl:  '',
}

export default function VideoForm({ initial, onClose }: Props) {
  const [fields, setFields] = useState<VideoInput>(
    initial
      ? {
          title:    initial.title,
          platform: initial.platform,
          stage:    initial.stage,
          creator:  initial.creator,
          notes:    initial.notes,
          dueDate:  initial.dueDate,
          liveUrl:  initial.liveUrl,
        }
      : EMPTY
  )
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof VideoInput>(key: K, value: VideoInput[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fields.title.trim()) { setError('Title is required.'); return }
    setBusy(true)
    setError('')
    try {
      if (initial) {
        await updateVideo(initial.id, fields)
      } else {
        await addVideo(fields)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!initial) return
    if (!confirm(`Delete "${initial.title}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      await deleteVideo(initial.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
      setBusy(false)
    }
  }

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <h2 className="modal-title">{initial ? 'EDIT VIDEO' : 'ADD VIDEO'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">TITLE</label>
            <input
              className="form-input"
              value={fields.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Video title"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label">PLATFORM</label>
            <select
              className="form-select"
              value={fields.platform}
              onChange={(e) => set('platform', e.target.value as VideoInput['platform'])}
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">STAGE</label>
            <select
              className="form-select"
              value={fields.stage}
              onChange={(e) => set('stage', e.target.value as VideoInput['stage'])}
            >
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">CREATOR</label>
            <select
              className="form-select"
              value={fields.creator}
              onChange={(e) => set('creator', e.target.value as VideoInput['creator'])}
            >
              {CREATORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">DUE DATE</label>
            <input
              type="date"
              className="form-input"
              value={fields.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>

          {fields.stage === 'Published' && (
            <div className="form-field">
              <label className="form-label">LIVE URL</label>
              <input
                className="form-input"
                type="url"
                value={fields.liveUrl}
                onChange={(e) => set('liveUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          <div className="form-field">
            <label className="form-label">NOTES</label>
            <textarea
              className="form-textarea"
              value={fields.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any notes..."
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            {initial && (
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={busy}
              >
                DELETE
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
              CANCEL
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'SAVING...' : initial ? 'SAVE' : 'ADD VIDEO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
