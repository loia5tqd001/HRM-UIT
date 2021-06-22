import { employeeToUser } from '@/pages/Message';
import { NotificationOutlined } from '@ant-design/icons';
import { Badge, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import Talk from 'talkjs';
import { Link, SelectLang, useModel } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import Favicon from 'react-favicon';
import { TALKJS_APP_ID } from '@/services/talk';

export type SiderTheme = 'light' | 'dark';

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [amountOfUnreads, setAmountOfUnreads] = useState(0);

  useEffect(() => {
    if (!initialState?.currentUser) {
      console.log('currentUser is not defined when trying to initialize Talkjs');
      return;
    }
    Talk.ready.then(() => {
      const me = employeeToUser(initialState.currentUser!);
      window.talkSession = new Talk.Session({ appId: TALKJS_APP_ID, me });
      window.talkSession?.setDesktopNotificationEnabled(
        Boolean(localStorage.getItem('talkjs:desktop_notify')) || true,
      );
      window.talkSession?.unreads.on('change', (unreadConversations) => {
        setAmountOfUnreads(unreadConversations.length);
      });
    });
  }, [initialState?.currentUser]);

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <Space className={className}>
      {/* <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        defaultValue="umi ui"
        options={[
          { label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>, value: 'umi ui' },
          {
            label: <a href="next.ant.design">Ant Design</a>,
            value: 'Ant Design',
          },
          {
            label: <a href="https://protable.ant.design/">Pro Table</a>,
            value: 'Pro Table',
          },
          {
            label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
            value: 'Pro Layout',
          },
        ]}
        // onSearch={value => {
        //   console.log('input', value);
        // }}
      /> */}
      {/* <NoticeIcon /> */}
      <Badge count={amountOfUnreads}>
        <Favicon url="/favicon.ico" alertCount={amountOfUnreads} />
        <Link to="/message">
          <NotificationOutlined />
        </Link>
      </Badge>
      <Avatar />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
