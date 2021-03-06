import { getConversationId } from '@/models/firebaseTalk';
import { allCoWorkers } from '@/services/employee';
import { leaveConversation, unhideConversation } from '@/services/talk';
import { sleepFor } from '@/utils/utils';
import { ExportOutlined, MessageOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProList from '@ant-design/pro-list';
import { Button, Card, message, Popconfirm, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Talk from 'talkjs';
import type { ConversationSelectedEvent } from 'talkjs/all';
import { FormattedMessage, useIntl, useModel } from 'umi';
import styles from './index.less';

declare global {
  interface Window {
    talkSession: Talk.Session;
  }
}

// NOTE: Every time reset the talkjs data, we need to change this key.
const LAST_SELECTED_CONVERSATIONID_STORAGE_KEY = 'LAST_SELECTED_CONVERSATIONID_STORAGE_KEY_1';

export const employeeToUser = (employee: API.EmployeeLite): Talk.User => {
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
    console.log('>  ~ file: index.tsx ~ line 41 ~ talkjsContainerRef', talkjsContainerRef);
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState!;
    const { addParticipants } = useModel('firebaseTalk');

    useEffect(() => {
      if (!talkjsContainerRef.current) return undefined;

      Talk.ready.then(async () => {
        /* eslint-disable no-await-in-loop */
        while (!window.talkSession) {
          // eslint-disable-next-line no-console
          console.log('window.talkSession is not defined', window.talkSession);
          await sleepFor(1000);
        }
        console.log('Talkjs ready in ChatBox');
        inboxRef.current = window.talkSession?.createInbox({
          showFeedHeader: false,
          selected: localStorage.getItem(LAST_SELECTED_CONVERSATIONID_STORAGE_KEY) || undefined,
        });
        inboxRef.current.setFeedFilter({ custom: { hideTo: ['!=', String(currentUser!.id)] } });
        inboxRef.current.mount(talkjsContainerRef.current);
        inboxRef.current.on('conversationSelected', onConversationSelected);
        inboxRef.current.on('sendMessage', ({ conversation }) => {
          addParticipants(getConversationId('payslip', conversation.custom.payroll), [
            conversation.id,
          ]);
          if (
            conversation.subject?.includes('[Payslip]') &&
            conversation.custom.hideTo &&
            conversation.custom.payroll
          ) {
            unhideConversation(conversation.id);
            addParticipants(getConversationId('payslip', conversation.custom.payroll), [
              conversation.id,
            ]);
          }
        });
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
  const peopleRef = useRef<API.EmployeeLite[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [inTheConversation, setInTheConversation] = useState<number[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Talk.ConversationData | null>(
    null,
  );
  const { getParticipants, removeParticipants } = useModel('firebaseTalk');
  const isSupportConversation = selectedConversation?.subject?.includes('[Support]');
  const youAreTheOwner =
    selectedConversation && getParticipants(selectedConversation.id)[0] === currentUser?.id;
  const youLeftTheConversation =
    selectedConversation && !getParticipants(selectedConversation.id).includes(currentUser!.id);
  const intl = useIntl();

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
                  title={intl.formatMessage({
                    id: 'property.actions.youWillBeNoLongerInThisConversation',
                  })}
                  onConfirm={async () => {
                    try {
                      if (!selectedConversation) return;
                      setIsLeaving(true);
                      await leaveConversation(selectedConversation.id, currentUser!);
                      removeParticipants(selectedConversation.id, [currentUser!.id]);
                      message.success(
                        intl.formatMessage({ id: 'property.actions.leaveSuccessfully' }),
                      );
                    } catch (err) {
                      console.log(err);
                      message.error(
                        intl.formatMessage({ id: 'property.actions.leaveUnsuccessfully' }),
                      );
                    } finally {
                      setIsLeaving(false);
                    }
                  }}
                >
                  <Button
                    danger
                    icon={<ExportOutlined />}
                    style={{ background: 'transparent', textTransform: 'capitalize' }}
                    loading={isLeaving}
                  >
                    {intl.formatMessage({ id: 'property.actions.leave' })}
                  </Button>
                </Popconfirm>
              </div>
            )}
            <ChatBox
              inboxRef={inboxRef}
              onConversationSelected={({ others, conversation }) => {
                setInTheConversation(others?.map((it) => +it.id) || []);
                setSelectedConversation(conversation);
                if (conversation) {
                  localStorage.setItem(LAST_SELECTED_CONVERSATIONID_STORAGE_KEY, conversation.id);
                }
              }}
            />
          </Spin>
          <div className={styles.scrollableList}>
            <ProList<API.EmployeeLite>
              search={{
                filterType: 'light',
              }}
              bordered
              split
              headerTitle={<FormattedMessage id="pages.allPeople" defaultMessage="All People" />}
              request={async (query) => {
                const { title: fullname, username } = query;
                if (peopleRef.current === undefined) {
                  peopleRef.current = await allCoWorkers();
                }
                let data = peopleRef.current;
                if (fullname && typeof fullname === 'string') {
                  data = data.filter((it) =>
                    `${it.first_name} ${it.last_name}`
                      .toLowerCase()
                      .includes(fullname.toLowerCase()),
                  );
                }
                if (username && typeof username === 'string') {
                  data = data.filter((it) =>
                    it.username?.toLowerCase().includes(username.toLowerCase()),
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
                        color: inTheConversation.includes(entity.id) ? undefined : 'inherit',
                        fontSize: inTheConversation.includes(entity.id) ? '1.4em' : undefined,
                        fontWeight: inTheConversation.includes(entity.id) ? 'bolder' : undefined,
                        transform: inTheConversation.includes(entity.id)
                          ? 'translateY(-0.2em)'
                          : undefined,
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
                  dataIndex: 'username',
                  render: (dom) => `@${dom}`,
                  title: <FormattedMessage id="property.username" defaultMessage="Username" />,
                },
                actions: {
                  render: (_, entity) => [
                    <Button
                      key={entity.id}
                      type="text"
                      className="colorPrimary"
                      onClick={() => changeConversation(entity.id)}
                      icon={<MessageOutlined />}
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
