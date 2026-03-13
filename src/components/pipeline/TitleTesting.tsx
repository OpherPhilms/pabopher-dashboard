import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { creatorFromEmail } from '../../utils/creator'
import { updateVideo } from '../../firebase/videos'
import { countVotes } from '../../types/video'
import type { Video, TitleOption } from '../../types/video'

interface Props {
  video: Video
}

export default function TitleTesting({ video }: Props) {
  const { user }  = useAuth()
  const creator   = creatorFromEmail(user?.email)
  const options   = video.titleOptions ?? []

  const [open,     setOpen]     = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [saving,   setSaving]   = useState(false)

  async function handleVote(option: TitleOption, dir: 'up' | 'down') {
    if (!creator) return
    const current = option.votes[creator]
    const next    = current === dir ? null : dir   // toggle off if same direction
    const updated = options.map((o) =>
      o.id === option.id
        ? { ...o, votes: { ...o.votes, [creator]: next } }
        : o
    )
    await updateVideo(video.id, { titleOptions: updated })
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !creator || saving) return
    setSaving(true)
    const newOption: TitleOption = {
      id:          crypto.randomUUID(),
      text:        newTitle.trim(),
      submittedBy: creator,
      votes:       { Pab: null, Opher: null },
    }
    await updateVideo(video.id, { titleOptions: [...options, newOption] })
    setNewTitle('')
    setSaving(false)
  }

  return (
    // Stop drag propagation so clicking inside here doesn't drag the card
    <div
      className="title-testing"
      onDragStart={(e) => e.stopPropagation()}
      draggable={false}
    >
      <button
        className="title-testing-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        TITLE TEST {open ? '[−]' : '[+]'}
        {options.length > 0 && <span className="title-testing-count">{options.length}</span>}
      </button>

      {open && (
        <div className="title-testing-body">
          {options.length === 0 && (
            <p className="title-testing-empty">No options yet — suggest one below.</p>
          )}

          {options.map((option) => {
            const { up, down } = countVotes(option)
            const myVote       = creator ? option.votes[creator] : null

            return (
              <div key={option.id} className="title-option">
                <div className="title-option-text">"{option.text}"</div>
                <div className="title-option-footer">
                  <span className="title-option-author">
                    [{option.submittedBy.toUpperCase()}]
                  </span>
                  <div className="title-option-votes">
                    <button
                      className={`vote-btn vote-up${myVote === 'up' ? ' voted' : ''}`}
                      onClick={() => handleVote(option, 'up')}
                      disabled={!creator}
                    >
                      ▲ {up}
                    </button>
                    <button
                      className={`vote-btn vote-down${myVote === 'down' ? ' voted' : ''}`}
                      onClick={() => handleVote(option, 'down')}
                      disabled={!creator}
                    >
                      ▼ {down}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {creator ? (
            <form className="title-add-form" onSubmit={handleAdd}>
              <input
                className="title-add-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Suggest a title..."
                disabled={saving}
              />
              <button
                type="submit"
                className="title-add-btn"
                disabled={saving || !newTitle.trim()}
              >
                +
              </button>
            </form>
          ) : (
            <p className="title-testing-empty">
              Add PAB/OPHER email to .env.local to vote.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
