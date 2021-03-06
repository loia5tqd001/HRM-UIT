import Talk from 'talkjs';
import { getIntl } from 'umi';

export const TALKJS_APP_ID = process.env.REACT_APP_TALKJS_APP_ID!;
export const TALKJS_SECRET_KEY = process.env.REACT_APP_TALKJS_SECRET_KEY!;

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

export async function createTalkjsUser(userId: string, user: Talk.User) {
  return fetch(`https://api.talkjs.com/v1/${TALKJS_APP_ID}/users/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
    },
    body: JSON.stringify(user),
  }).then((res) => {
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
  });
}

export async function sendSystemMessage(conversationId: string, messages: string[]) {
  return fetch(
    `https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
      },
      body: JSON.stringify(messages.map((message) => ({ text: message, type: 'SystemMessage' }))),
    },
  ).then((res) => {
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
  });
}

export async function sendMessage(conversationId: string, sender: string, messages: string[]) {
  return fetch(
    `https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
      },
      body: JSON.stringify(
        messages.map((message) => ({ text: message, sender, type: 'UserMessage' })),
      ),
    },
  ).then((res) => {
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
  });
}

export async function leaveConversation(conversationId: string, user: API.Employee) {
  await sendSystemMessage(conversationId, [
    `*${user.first_name} ${user.last_name}* _${getIntl().formatMessage({
      id: 'property.actions.left',
    })}_ ${getIntl().formatMessage({
      id: 'property.actions.theConversation',
    })}`,
  ]);
  await fetch(
    `https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}/participants/${user.id}`,
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

export async function createConversation(conversationId: string, body?: any) {
  await fetch(`https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function unhideConversation(conversationId: string) {
  await fetch(`https://api.talkjs.com/v1/${TALKJS_APP_ID}/conversations/${conversationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TALKJS_SECRET_KEY}`,
    },
    body: JSON.stringify({
      custom: {
        hideTo: '',
      },
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }
  });
}
