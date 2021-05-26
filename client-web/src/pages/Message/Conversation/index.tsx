import { readEmployee } from '@/services/employee';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Spin } from 'antd';
import React, { useEffect, useRef } from 'react';
import Talk from 'talkjs';
import { useModel, useParams } from 'umi';

declare global {
  interface Window {
    talkSession: Talk.Session;
  }
}

const employeeToUser = (employee: API.Employee): Talk.User => {
  return new Talk.User({
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    email: employee.email,
    photoUrl: employee.avatar,
  });
};

const appId = 't6rbhbrZ';

type ParamType = {
  id: string | undefined;
};

export const Edit: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { id } = useParams<ParamType>();
  const talkjsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { currentUser } = initialState!;
    let inbox: Talk.Inbox;
    if (!currentUser || !talkjsContainerRef.current) return undefined;

    Talk.ready.then(async () => {
      const me = employeeToUser(currentUser);
      window.talkSession = new Talk.Session({ appId, me });
      if (id === undefined) {
        // me without other => most recent message first
        inbox = window.talkSession.createInbox();
      } else {
        // me with an other => select other
        const other = employeeToUser(await readEmployee(Number(id)));
        const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
        conversation.setParticipant(me);
        conversation.setParticipant(other);
        inbox = window.talkSession.createInbox({ selected: conversation });
      }
      inbox.mount(talkjsContainerRef.current);
    });

    return () => {
      inbox?.destroy();
    };
  }, [id, initialState]);

  return (
    <PageContainer title={false}>
      <Card style={{  }} className="card-shadow">
        <div style={{ width: '100%', height: 'calc(100vh - 300px)' }} ref={talkjsContainerRef}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spin />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Edit;
