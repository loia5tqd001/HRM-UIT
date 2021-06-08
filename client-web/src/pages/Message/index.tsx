import { allEmployees, readEmployee } from '@/services/employee';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { PageContainer } from '@ant-design/pro-layout';
import ProList from '@ant-design/pro-list';
import { Avatar, Button, Card, List, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Talk from 'talkjs';
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

const ChatBox = React.memo(({ otherId }) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState!;
  const inboxRef = useRef<Talk.Inbox>();
  const talkjsContainerRef = useRef<HTMLDivElement>(null);
  const people = useAsyncData<API.Employee[]>(allEmployees);

  useEffect(() => {
    if (!talkjsContainerRef.current) return undefined;

    Talk.ready.then(async () => {
      const me = employeeToUser(currentUser!);
      window.talkSession = new Talk.Session({ appId, me });
      if (otherId === undefined) {
        // me without other => most recent message first
        inboxRef.current = window.talkSession.createInbox();
      } else {
        // me with an other => select other
        const other = employeeToUser(await readEmployee(Number(otherId)));
        const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
        conversation.setParticipant(me);
        conversation.setParticipant(other);
        inboxRef.current = window.talkSession.createInbox({ selected: conversation });
      }
      inboxRef.current.mount(talkjsContainerRef.current);
    });

    return () => {
      inboxRef.current?.destroy();
    };
  }, [currentUser, otherId, people]);

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
});

export const Edit: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState!;
  const inboxRef = useRef<Talk.Inbox>();
  const talkjsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<number>();
  // const peopleRef = useRef<API.Employee[]>();
  const [talkReady, setTalkReady] = useState(false);
  const people = useAsyncData<API.Employee[]>(allEmployees);

  // useEffect(() => {
  //   people.subSuccess((data) =>
  //     Talk.ready.then(() =>
  //       setTimeout(() => {
  //         setSelectedId(data![0].id);
  //       }, 5000),
  //     ),
  //   );
  // }, [people]);
  // useEffect(() => {
  //   if (!talkjsContainerRef.current) return undefined;

  //   // people.subSuccess(() => {
  //   Talk.ready.then(async () => {
  //     // setTalkReady(true);
  //     const me = employeeToUser(currentUser!);
  //     window.talkSession = new Talk.Session({ appId, me });
  //     // if (selectedId === undefined) {
  //     // me without other => most recent message first
  //     inboxRef.current = window.talkSession.createInbox();
  //     // } else {
  //     // me with an other => select other
  //     //   const other = employeeToUser(people.data!.find((it) => it.id === selectedId)!);
  //     //   const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
  //     //   conversation.setParticipant(me);
  //     //   conversation.setParticipant(other);
  //     //   inboxRef.current = window.talkSession.createInbox({ selected: conversation });
  //     // }
  //     inboxRef.current.mount(talkjsContainerRef.current);
  //     console.log(talkjsContainerRef.current, inboxRef.current);
  //     // inboxRef.current.on('selectConversation', (e) => setSelectedId(Number(e.others[0].id)));
  //   });
  //   // });

  //   return () => {
  //     inboxRef.current?.destroy();
  //   };
  // }, [currentUser, people]);

  // useEffect(() => {
  // const changeConversation = (otherId: number) => {
  //   if (!currentUser || people.isLoading || !talkReady) return;
  //   const me = employeeToUser(currentUser);
  //   const other = employeeToUser(people.data!.find((it) => it.id === otherId)!);
  //   const conversation = window.talkSession.getOrCreateConversation(Talk.oneOnOneId(me, other));
  //   conversation.setParticipant(me);
  //   conversation.setParticipant(other);
  //   inboxRef.current = window.talkSession.createInbox({ selected: conversation });
  // };
  // changeConversation
  // }, [currentUser, selectedId, talkReady]);

  return (
    <PageContainer title={false}>
      <Card style={{ fontFamily: 'inherit !important' }} className="card-shadow">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 30vw', gap: '1rem' }}>
          {/* <div style={{ width: '100%', height: 'calc(100vh - 230px)' }} ref={talkjsContainerRef}>
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
          </div> */}
          <ChatBox otherId={selectedId} 
          // people={people.data}
           />
          <div className={styles.scrollableList}>
            <ProList<API.Employee>
              search={{
                filterType: 'light',
              }}
              bordered
              split
              rowKey="id"
              headerTitle="All People"
              loading={people.isLoading}
              dataSource={people.data}
              // request={async ({ title: fullname, subTitle: username }) => {
              //   console.log('>  ~ file: index.tsx ~ line 109 ~ data', people)
              //   let data = people.data!;
              //   if (fullname && typeof fullname === 'string') {
              //     data = data.filter((it) =>
              //       `${it.first_name} ${it.last_name}`
              //         .toLowerCase()
              //         .includes(fullname.toLowerCase()),
              //     );
              //   }
              //   if (username && typeof username === 'string') {
              //     data = data.filter((it) =>
              //       it.user.username.toLowerCase().includes(username.toLowerCase()),
              //     );
              //   }
              //   return {
              //     data,
              //     success: true,
              //   };
              // }}
              renderItem={(item, i) => {
                return (
                  <List.Item
                    key={item.id || i}
                    onClick={() => {
                      setSelectedId(item.id);
                      // changeConversation(item.id);
                    }}
                    style={{ display: 'flex', padding: '12px 24px' }}
                    className={item.id === selectedId ? 'selected-item' : ''}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={
                        <>
                          <Button style={{ display: 'inline', color: 'inherit' }} type="link">
                            <b>
                              {item.first_name} {item.last_name}
                            </b>
                          </Button>
                          @{item.user.username}
                        </>
                      }
                    />
                  </List.Item>
                );
              }}
              // metas={{
              //   title: {
              //     render: (_, entity) => (
              //       <Button type="link" onClick={() => setSelectedId(entity.id)}>
              //         <b>
              //           {entity.first_name} {entity.last_name}
              //         </b>
              //       </Button>
              //     ),
              //     title: 'Fullname',
              //   },
              //   avatar: {
              //     dataIndex: 'avatar',
              //     search: false,
              //   },
              //   subTitle: {
              //     dataIndex: ['user', 'username'],
              //     render: (dom) => `@${dom}`,
              //     title: 'Username',
              //   },
              // }}
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Edit;
