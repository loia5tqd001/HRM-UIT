import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { Button, Popconfirm, Space } from 'antd';
import React, { useState } from 'react';
import { useModel } from 'umi';
import { MembersTab } from './MembersTab';
import { PermissionsTab } from './PermissionsTab';

type Props = {};

export const RightPanel: React.FC<Props> = (props) => {
  const {
    selectedRole,
    hasModified,
    saveChanges,
    saveChangesPending,
    popconfirmVisible,
    onOkDiscardChanges,
    onCancelDiscardChanges,
    setCrudModalVisible,
    onDeleteRole,
  } = useModel('admin.permissions');
  const [tab, setTab] = useState('tab1');

  return (
    <ProCard
      title={selectedRole?.roleName}
      subTitle={selectedRole?.description}
      extra={
        <Space>
          <Popconfirm
            title="Discard all changes?"
            visible={popconfirmVisible}
            onConfirm={onOkDiscardChanges}
            onCancel={onCancelDiscardChanges}
          >
            <Button
              type="primary"
              icon={<SaveOutlined />}
              disabled={!hasModified}
              onClick={saveChanges}
              loading={saveChangesPending}
            >
              Save
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setCrudModalVisible('update')}
          >
            Edit
          </Button>
          <Popconfirm title="Delete current role?" onConfirm={onDeleteRole}>
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      }
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
