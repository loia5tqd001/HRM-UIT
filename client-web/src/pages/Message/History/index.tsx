import { EmployeeLeftPanel } from '@/components/EmployeeLeftPanel';
import { EmployeeTabs } from '@/components/EmployeeTabs';
import { readEmployee } from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import React, { useEffect, useRef } from 'react';
import { useModel } from 'umi';
import Talk from 'talkjs';

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

  const isActive = record.data?.status !== 'Terminated';

  useEffect(() => {
    refresh();
  }, [record.data, refresh]);

  useEffect(() => {
    const currentUser = initialState?.currentUser;
    let inbox: Talk.Inbox;
    if (!currentUser) return;
    Talk.ready.then(() => {
      const me = new Talk.User({
        id: currentUser.id,
        name: currentUser.first_name,
        email: currentUser.email,
        photoUrl: currentUser.avatar,
        welcomeMessage: 'Hey there! How are you? :-)',
      });
      window.talkSession = new Talk.Session({
        appId: 't6rbhbrZ',
        me,
      });
      const other = new Talk.User({
        id: '654321',
        name: 'Sebastian',
        email: 'Sebastian@example.com',
        photoUrl: 'https://demo.talkjs.com/img/sebastian.jpg',
        welcomeMessage: 'Hey, how can I help?',
      });
      const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
      conversation.setParticipant(me);
      conversation.setParticipant(other);
      inbox = window.talkSession.createInbox({ selected: conversation });
      inbox.mount(talkjsContainerRef.current);
    });

    return () => {
      inbox?.destroy();
    };
  }, [initialState?.currentUser]);

  return (
    <PageContainer title="Profile" loading={!id}>
      <div ref={talkjsContainerRef}></div>
      <GridContent>
        <div className={styles.layout}>
          <EmployeeLeftPanel
            employee={record.data}
            setEmployee={record.setData}
            type="account-profile"
          />
          <EmployeeTabs
            employeeId={id!}
            isActive={isActive}
            onChange={{
              status: (newStatus) => {
                if (!record.data) return;
                record.setData({ ...record.data, status: newStatus });
              },
              basicInfo: (newInfo) => {
                if (!record.data) return;
                record.setData({ ...record.data, ...newInfo, user: record.data.user });
              },
            }}
          />
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
