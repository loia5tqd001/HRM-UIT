import type Talk from 'talkjs';

export const TALKJS_APP_ID = 't6rbhbrZ';
export const TALKJS_SECRET_KEY = 'sk_test_qBe8ww5q6CN8mMWKZ8DPesRdp0siOjpq';

// export async function getConversationData(conversationId: string) {
//   return fetch(`https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
//     },
//   })
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error(res.statusText);
//       }
//       return res.json();
//     })
//     .then((data) => data as Talk.ConversationData);
// }

// export async function setCustomForConversation(
//   conversationId: string,
//   custom: Record<string, string>,
// ) {
//   await fetch(`https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
//     },
//     body: JSON.stringify({
//       custom,
//     }),
//   }).then((res) => {
//     if (!res.ok) {
//       throw new Error(res.statusText);
//     }
//   });
// }

export async function leaveConversation(conversationId: string, userId: string) {
  await fetch(
    `https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}/participants/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
      },
    },
  ).then((res) => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }
  });
}
