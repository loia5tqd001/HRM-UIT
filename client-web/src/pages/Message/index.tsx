import { allEmployees } from '@/services/employee';
import { leaveConversation } from '@/services/talk';
import { ExportOutlined, MessageFilled } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProList from '@ant-design/pro-list';
import { Button, Card, message, Popconfirm, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Talk from 'talkjs';
import type { ConversationSelectedEvent } from 'talkjs/all';
import { FormattedMessage, useModel } from 'umi';
import styles from './index.less';

declare global {
  interface Window {
    talkSession: Talk.Session;
  }
}

export const employeeToUser = (employee: API.Employee): Talk.User => {
  return new Talk.User({
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    email: employee.email,
    photoUrl: employee.avatar,
    role: 'Admin',
  });
};

const ChatBox = React.memo(
  ({
    inboxRef,
    onConversationSelected,
  }: {
    inboxRef: React.MutableRefObject<Talk.Inbox | undefined>;
    onConversationSelected: (event: ConversationSelectedEvent) => void;
  }) => {
    const talkjsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!talkjsContainerRef.current) return undefined;

      Talk.ready.then(() => {
        if (!window.talkSession) {
          // eslint-disable-next-line no-console
          console.log('window.talkSession is not defined', window.talkSession);
          return;
        }
        inboxRef.current = window.talkSession?.createInbox();
        inboxRef.current.mount(talkjsContainerRef.current);
        inboxRef.current.on('conversationSelected', onConversationSelected);
      });

      return () => {
        inboxRef.current?.destroy();
      };
    }, [inboxRef]);

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
  const [selectdPartnerId, setSelectedPartnerId] = useState<number>();
  const [selectedConversation, setSelectedConversation] = useState<Talk.ConversationData | null>(
    null,
  );
  const { getParticipants, removeParticipants } = useModel('firebaseTalk');
  const isSupportConversation = selectedConversation?.subject?.includes('[Support]');
  const youAreTheOwner =
    selectedConversation && getParticipants(selectedConversation.id)[0] === currentUser?.id;
  const youLeftTheConversation =
    selectedConversation && !getParticipants(selectedConversation.id).includes(currentUser!.id);

  const changeConversation = (otherId: number) => {
    setTimeout(() => setIsLoading(true), 0);
    setTimeout(() => setIsLoading(false), 1000);
    const otherProfile = peopleRef.current?.find((it) => it.id === otherId);
    if (!otherProfile) return;
    const me = employeeToUser(currentUser!);
    const other = employeeToUser(otherProfile);
    const conversation = window.talkSession?.getOrCreateConversation(Talk.oneOnOneId(me, other));
    conversation.setParticipant(me);
    conversation.setParticipant(other);
    inboxRef.current?.select(conversation);
  };

  return (
    <PageContainer title={false}>
      <Card style={{ fontFamily: 'inherit !important' }} className="card-shadow">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 30vw', gap: '1rem' }}>
          <Spin spinning={isLoading}>
            {isSupportConversation && !youAreTheOwner && !youLeftTheConversation && (
              <div
                style={{
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 80,
                  top: 0,
                }}
              >
                <Popconfirm
                  title="You will be no longer in this conversation. Are you sure?"
                  onConfirm={async () => {
                    try {
                      if (!selectedConversation) return;
                      const toDeleteConversation = window.talkSession?.getOrCreateConversation(
                        selectedConversation.id,
                      );
                      await toDeleteConversation.sendMessage(
                        `${currentUser?.first_name} ${currentUser?.last_name} left the conversation`,
                        {},
                      );
                      await leaveConversation(selectedConversation.id, String(currentUser?.id));
                      removeParticipants(selectedConversation.id, [currentUser!.id]);
                      message.success('Leave the conversation successfully!');
                    } catch (err) {
                      console.log(err);
                      message.error('Leave the conversation unsuccessfully!');
                    }
                  }}
                >
                  <Button danger icon={<ExportOutlined />}>
                    Leave
                  </Button>
                </Popconfirm>
              </div>
            )}
            <ChatBox
              inboxRef={inboxRef}
              onConversationSelected={({ others, conversation }) => {
                setSelectedPartnerId(Number(others?.[0]?.id));
                setSelectedConversation(conversation);
              }}
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
              headerTitle={<FormattedMessage id="pages.allPeople" defaultMessage="All People" />}
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
                        color: entity.id === selectdPartnerId ? undefined : 'inherit',
                        fontSize: entity.id === selectdPartnerId ? '1.4em' : undefined,
                        fontWeight: entity.id === selectdPartnerId ? 'bolder' : undefined,
                        transform:
                          entity.id === selectdPartnerId ? 'translateY(-0.2em)' : undefined,
                      }}
                      onClick={() => changeConversation(entity.id)}
                    >
                      <b>
                        {entity.first_name} {entity.last_name}
                      </b>
                    </Button>
                  ),
                  title: <FormattedMessage id="property.full_name" defaultMessage="Fullname" />,
                },
                avatar: {
                  dataIndex: 'avatar',
                  search: false,
                },
                subTitle: {
                  dataIndex: ['user', 'username'],
                  render: (dom) => `@${dom}`,
                  title: <FormattedMessage id="property.username" defaultMessage="Username" />,
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
