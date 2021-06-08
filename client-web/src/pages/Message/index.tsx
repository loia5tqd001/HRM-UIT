import { allEmployees } from '@/services/employee';
import { MessageFilled } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProList from '@ant-design/pro-list';
import { Button, Card, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Talk from 'talkjs';
import type { ConversationSelectedEvent } from 'talkjs/all';
import { useModel } from 'umi';
import styles from './index.less';

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

const ChatBox = React.memo(
  ({
    inboxRef,
    onConversationSelected,
  }: {
    inboxRef: React.MutableRefObject<Talk.Inbox | undefined>;
    onConversationSelected: (event: ConversationSelectedEvent) => void;
  }) => {
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState!;
    const talkjsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!talkjsContainerRef.current) return undefined;

      Talk.ready.then(async () => {
        const me = employeeToUser(currentUser!);
        window.talkSession = new Talk.Session({ appId, me });
        inboxRef.current = window.talkSession.createInbox();
        inboxRef.current.mount(talkjsContainerRef.current);
        inboxRef.current.on('conversationSelected', onConversationSelected);
      });

      return () => {
        inboxRef.current?.destroy();
      };
    }, [currentUser, inboxRef]);

    return (
      <div style={{ width: '100%', height: 'calc(100vh - 230px)' }} ref={talkjsContainerRef}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Spin />
        </div>
      </div>
    );
  },
);

export const Message: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState!;
  const inboxRef = useRef<Talk.Inbox>();
  const peopleRef = useRef<API.Employee[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();

  const changeConversation = (otherId: number) => {
    setTimeout(() => setIsLoading(true), 0);
    setTimeout(() => setIsLoading(false), 1000);
    const otherProfile = peopleRef.current?.find((it) => it.id === otherId);
    if (!otherProfile) return;
    const me = employeeToUser(currentUser!);
    const other = employeeToUser(otherProfile);
    const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
    conversation.setParticipant(me);
    conversation.setParticipant(other);
    inboxRef.current?.select(conversation);
  };

  return (
    <PageContainer title={false}>
      <Card style={{ fontFamily: 'inherit !important' }} className="card-shadow">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 30vw', gap: '1rem' }}>
          <Spin spinning={isLoading}>
            <ChatBox
              inboxRef={inboxRef}
              onConversationSelected={({ others }) => setSelectedId(Number(others?.[0].id))}
            />
          </Spin>
          <div className={styles.scrollableList}>
            <ProList<API.Employee>
              search={{
                filterType: 'light',
              }}
              bordered
              split
              rowKey="id"
              headerTitle="All People"
              request={async (query) => {
                const { title: fullname, user } = query;
                if (peopleRef.current === undefined) {
                  peopleRef.current = await allEmployees();
                }
                let data = peopleRef.current;
                if (fullname && typeof fullname === 'string') {
                  data = data.filter((it) =>
                    `${it.first_name} ${it.last_name}`
                      .toLowerCase()
                      .includes(fullname.toLowerCase()),
                  );
                }
                if (user?.username && typeof user.username === 'string') {
                  data = data.filter((it) =>
                    it.user.username.toLowerCase().includes(user.username.toLowerCase()),
                  );
                }
                return {
                  data,
                  success: true,
                };
              }}
              showActions="hover"
              metas={{
                title: {
                  render: (_, entity) => (
                    <Button
                      type="link"
                      style={{
                        color: entity.id === selectedId ? undefined : 'inherit',
                        fontSize: entity.id === selectedId ? '1.4em' : undefined,
                        fontWeight: entity.id === selectedId ? 'bolder' : undefined,
                        transform: entity.id === selectedId ? 'translateY(-0.2em)' : undefined,
                      }}
                      onClick={() => changeConversation(entity.id)}
                    >
                      <b>
                        {entity.first_name} {entity.last_name}
                      </b>
                    </Button>
                  ),
                  title: 'Fullname',
                },
                avatar: {
                  dataIndex: 'avatar',
                  search: false,
                },
                subTitle: {
                  dataIndex: ['user', 'username'],
                  render: (dom) => `@${dom}`,
                  title: 'Username',
                },
                actions: {
                  render: (_, entity) => [
                    <Button
                      type="text"
                      className="colorPrimary"
                      onClick={() => changeConversation(entity.id)}
                      icon={<MessageFilled />}
                    />,
                  ],
                },
              }}
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Message;
