import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './config'
import type { Creator } from '../types/video'

const COL = collection(db, 'channelVideos')

/**
 * Subscribes to all creator assignments.
 * Returns a map of { youtubeVideoId: Creator }.
 */
export function subscribeToChannelVideos(
  onChange: (assignments: Record<string, Creator>) => void
): () => void {
  return onSnapshot(COL, (snap) => {
    const map: Record<string, Creator> = {}
    for (const d of snap.docs) {
      map[d.id] = d.data().creator as Creator
    }
    onChange(map)
  })
}

/** Assigns a creator to a YouTube video. */
export function setVideoCreator(videoId: string, creator: Creator): Promise<void> {
  return setDoc(doc(COL, videoId), { creator })
}

/** Removes the creator assignment from a YouTube video. */
export function clearVideoCreator(videoId: string): Promise<void> {
  return deleteDoc(doc(COL, videoId))
}
