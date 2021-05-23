import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import React, { useEffect, useReducer, useRef } from 'react';
import { useModel } from 'umi';
import Talk from 'talkjs';
import InboxPageContainer from './InboxPageContainer';

declare global {
  interface Window {
    talkSession: Talk.Session;
  }
}

export const Edit: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const id = initialState?.currentUser?.id;
  const record = useAsyncData<API.Employee>(() => readEmployee(id!));
  const talkjsContainerRef = useRef<any>();

  const [, rerender] = useReducer((x) => ++x, 0);

  const isActive = record.data?.status !== 'Terminated';

  useEffect(() => {
    refresh();
  }, [record.data, refresh]);

  useEffect(() => {
    const currentUser = initialState?.currentUser;
    console.log('>  ~ file: index.tsx ~ line 34 ~ currentUser', JSON.stringify(currentUser))
    let inbox: Talk.Inbox;
    if (!currentUser || !talkjsContainerRef.current) return;
    Talk.ready.then(() => {
      const me = new Talk.User({
        id: currentUser.id,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        email: currentUser.email,
        photoUrl: currentUser.avatar,
        welcomeMessage: 'Hey there! How are you? :-)',
      });
      window.talkSession = new Talk.Session({
        appId: 't6rbhbrZ',
        me,
      });
      const other = new Talk.User({
        id: '123456',
        name: 'Sebastian',
        email: 'Sebastian@example.com',
        photoUrl: 'https://demo.talkjs.com/img/sebastian.jpg',
        welcomeMessage: 'Hey, how can I help?',
      });
      const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
      conversation.setParticipant(me);
      conversation.setParticipant(other);
      inbox = window.talkSession.createInbox({ selected: conversation });
      console.log('>  ~ file: index.tsx ~ line 57 ~ inbox', inbox, talkjsContainerRef.current);
      inbox.mount(talkjsContainerRef.current).then(rerender);
    });

    // return () => {
    //   inbox?.destroy();
    // };
  }, [initialState?.currentUser]);

  return (
    <PageContainer loading={!id}>
      <div style={{ height: 500 }}>
        <div style={{ height: 500 }} ref={talkjsContainerRef}></div>
        {/* <InboxPageContainer /> */}
      </div>
    </PageContainer>
  );
};

export default Edit;
