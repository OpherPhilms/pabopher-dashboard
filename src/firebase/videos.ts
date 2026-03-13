import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from './config'
import type { Video, VideoInput, VideoUpdate } from '../types/video'

const COL = collection(db, 'videos')

// ── Firestore → app type conversion ──────────────────────────────────────────

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Video {
  const d = snap.data()
  return {
    id:           snap.id,
    title:        d.title        ?? '',
    platform:     d.platform     ?? 'YouTube',
    stage:        d.stage        ?? 'Idea',
    creator:      d.creator      ?? 'Pab',
    notes:        d.notes        ?? '',
    dueDate:      d.dueDate      ?? '',
    liveUrl:      d.liveUrl      ?? '',
    perfNote:     d.perfNote     ?? '',
    titleOptions: d.titleOptions ?? [],
    createdAt:    (d.createdAt as Timestamp | null)?.toMillis() ?? Date.now(),
    updatedAt:    (d.updatedAt as Timestamp | null)?.toMillis() ?? Date.now(),
  }
}

// ── Real-time subscription ────────────────────────────────────────────────────

/**
 * Subscribes to the full videos collection, ordered by creation date.
 * Both users see each other's changes in real time.
 * Returns the unsubscribe function — call it in useEffect cleanup.
 */
export function subscribeToVideos(onChange: (videos: Video[]) => void): () => void {
  const q = query(COL, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map(fromDoc))
  })
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Creates a new video document.
 * titleOptions starts empty; createdAt/updatedAt are set server-side.
 */
export async function addVideo(input: VideoInput): Promise<void> {
  await addDoc(COL, {
    ...input,
    titleOptions: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Updates any subset of a video's fields.
 * Handles full edits, drag-drop stage changes, and titleOptions updates:
 *   updateVideo(id, { stage: 'Editing' })
 *   updateVideo(id, { titleOptions: updatedArray })
 */
export async function updateVideo(id: string, changes: VideoUpdate): Promise<void> {
  await updateDoc(doc(COL, id), {
    ...changes,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Permanently deletes a video document.
 */
export async function deleteVideo(id: string): Promise<void> {
  await deleteDoc(doc(COL, id))
}
