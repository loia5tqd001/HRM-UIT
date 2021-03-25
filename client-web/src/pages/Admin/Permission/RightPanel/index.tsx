import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { Button, Space } from 'antd';
import React, { useState } from 'react';
import { useModel } from 'umi';
import { MembersTab } from './MembersTab';
import { PermissionsTab } from './PermissionsTab';

type Props = {};

export const RightPanel: React.FC<Props> = (props) => {
  const { selectedRole } = useModel('admin.permissions');
  const [tab, setTab] = useState('tab1');

  return (
    <ProCard
      title={selectedRole?.roleName}
      subTitle={selectedRole?.description}
      extra={[
        <Space>
          {/* <Button key="primary" type="primary" icon={<SaveOutlined />} disabled>
            Save
          </Button> */}
          <Button key="primary" type="primary" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button key="primary" type="primary" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Space>,
      ]}
      tabs={{
        activeKey: tab,
        onChange: (key) => {
          setTab(key);
        },
      }}
    >
      <ProCard.TabPane key="tab1" tab="Permissions">
        <PermissionsTab />
      </ProCard.TabPane>
      <ProCard.TabPane key="tab2" tab="Members">
        <MembersTab />
      </ProCard.TabPane>
    </ProCard>
  );
};
