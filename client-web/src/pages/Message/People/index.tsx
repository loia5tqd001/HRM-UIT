import * as React from 'react';

import { history, Link } from 'umi';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { allEmployees } from '@/services/employee';
import ProList from '@ant-design/pro-list';
import { Button, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

function UserListPage() {
  // const users = useAsyncData(() => allEmployees());
  // const handleUserClick = (user: User) => {
  //   history.push(`/message/conversation/${user.id}`);
  // };

  return (
    <PageContainer title={false}>
      <ProList<API.Employee>
        search={{
          filterType: 'light',
        }}
        className="card-shadow"
        rowKey="id"
        headerTitle="People"
        request={async () => {
          const data = await allEmployees();
          return {
            // data: data.filter((it) => it.status === 'Working'),
            data,
            success: true,
          };
        }}
        showActions="hover"
        metas={{
          title: {
            render: (_, entity) => (
              <Link to={`/message/conversation/${entity.id}`}>
                {entity.first_name} {entity.last_name}
              </Link>
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
        }}
      />
    </PageContainer>
  );
}

export default UserListPage;
