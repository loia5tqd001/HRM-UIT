import firebase from '@/utils/firebase';
import { isArray } from 'lodash';
import { useState, useEffect } from 'react';
import { produce } from 'immer';

const database = firebase.database();

// Timeoff: timeoff__ticketid
// Attendance: attendance__ticketid
// Payslip: payslip__ticketid

type StorageType = 'timeoff' | 'attendance' | 'payslip';
type TicketId = number;
type ConversationId = string;
type ParticipantId = number;
type Storage = Record<ConversationId, ParticipantId[]>;

export const getTopicUrl = (storageType: StorageType) => {
  if (storageType === 'timeoff')
    return 'https://prod.wp.cdn.aws.wfu.edu/sites/82/2017/04/Time-Off-OVER.jpg';
  return '';
};

export const getConversationId = (storageType: StorageType, ticketId: TicketId) =>
  `${storageType}__${ticketId}`;

export default function useFirebaseTalk() {
  const [storage, setStorage] = useState<Storage>();

  useEffect(() => {
    database.ref('getParticipantsByConversationId').on('value', (snapshot) => {
      setStorage(snapshot.val() as Storage);
    });
  }, []);

  const getParticipants = (conversationId: ConversationId) => storage?.[conversationId] || [];

  // index 0 is for the owner of the conversation (aka the person who needs support)
  const addParticipants = (conversationId: ConversationId, participantIds: ParticipantId[]) => {
    if (!storage) {
      throw new Error('Storage is not defined');
    }

    if (isArray(storage[conversationId])) {
      database.ref('getParticipantsByConversationId').set(
        produce(storage, (draft) => {
          draft[conversationId].push(...participantIds);
        }),
      );
    } else {
      database.ref('getParticipantsByConversationId').set(
        produce(storage, (draft) => {
          draft[conversationId] = participantIds;
        }),
      );
    }
  };

  const removeParticipants = (conversationId: ConversationId, participantIds: ParticipantId[]) => {
    if (!storage || !isArray(storage[conversationId])) {
      throw new Error('Storage is not defined');
    }

    database.ref('getParticipantsByConversationId').set(
      produce(storage, (draft) => {
        draft[conversationId] = draft[conversationId].filter((it) => !participantIds.includes(it));
      }),
    );
  };

  return {
    getParticipants,
    addParticipants,
    removeParticipants,
  };
}
