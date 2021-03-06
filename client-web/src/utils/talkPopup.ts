import { useEffect } from 'react';
import type Talk from 'talkjs';

let popup: Talk.Popup;

const mountPopup = async (conversation: Talk.ConversationBuilder) => {
  const oldPopup = popup;
  popup = window.talkSession?.createPopup(conversation);
  await popup.mount({ show: true });
  oldPopup?.destroy();
  return popup;
};

const unmountPopup = () => {
  popup?.destroy();
};

export const useTalkPopup = () => {
  useEffect(() => () => unmountPopup(), []); // unmount Popup everywhen navigating to another page

  return { mountPopup };
};
