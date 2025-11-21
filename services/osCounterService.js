import { db } from "~/plugins/firebase";

export async function getNextOSNumber() {
  const year = new Date().getFullYear().toString();
  const ref = db.collection("os_counters").doc(year);

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    let last = 0;
    if (snap.exists) {
      last = snap.data().last_number || 0;
    }

    const next = last + 1;

    tx.set(ref, { last_number: next }, { merge: true });

    return `${next}/${year}`;
  });
}
