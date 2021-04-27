import ProForm, { ProFormText } from '@ant-design/pro-form';
import ProList from '@ant-design/pro-list';
import { Card, Space, Tag } from 'antd';
import faker from 'faker';
import React from 'react';

export const GeneralInformation: React.FC = () => {
  const dataSource = [
    {
      name: 'Work day',
      desc: 'Description: number of days of working',
    },
    {
      name: 'Career change day',
      desc: 'Description: no description',
    },
    {
      name: 'Old stage salary',
      desc: 'Description: the previous position salary',
    },
    {
      name: 'Salary',
      desc: 'Description: The current salary',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Card title="Information">
        <ProForm
          submitter={{
            searchConfig: {
              submitText: 'Update',
            },
          }}
        >
          <ProForm.Group>
            <ProFormText
              width="sm"
              rules={[{ required: true, type: 'email' }]}
              name="email"
              label="Name"
            />
            <ProFormText
              width="sm"
              rules={[{ required: true }]}
              name="first_name"
              label="Department"
            />
            <ProFormText width="sm" rules={[{ required: true }]} name="last_name" label="Creator" />
            <ProFormText
              width="sm"
              rules={[{ required: true }]}
              name="last_name"
              label="Create time"
            />
            <ProFormText
              width="sm"
              rules={[{ required: true }]}
              name="last_name"
              label="Workflow"
            />
          </ProForm.Group>
        </ProForm>
      </Card>
      <Card title="Columns">
        <ProList<any>
          rowKey="name"
          headerTitle={false}
          dataSource={dataSource}
          showActions="hover"
          showExtra="hover"
          toolBarRender={false}
          metas={{
            title: {
              dataIndex: 'name',
            },
            description: {
              dataIndex: 'desc',
            },
            subTitle: {
              render: () => {
                return (
                  <Space size={0}>
                    <Tag>{faker.helpers.randomize(['Currency', 'Text', 'Number'])}</Tag>
                  </Space>
                );
              },
            },
          }}
        />
      </Card>
    </div>
  );
};
