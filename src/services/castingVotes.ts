import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { projectCol } from './firestore';

export type CastingVoteValue = 'like' | 'dislike';

const voteRef = (optionId: string, voterId: string) =>
  doc(projectCol('castingVotes'), `${optionId}--${voterId}`);

// One deterministic document per candidate and user makes like/dislike
// mutually exclusive without relying on client-side counting.
export async function setCastingVote(
  optionId: string,
  voterId: string,
  value: CastingVoteValue | null,
) {
  const ref = voteRef(optionId, voterId);
  if (!value) {
    await deleteDoc(ref);
    return;
  }

  await setDoc(
    ref,
    {
      optionId,
      voterId,
      value,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
