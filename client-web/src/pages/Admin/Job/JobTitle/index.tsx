import { rule } from '@/services/__rule';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Input, Popconfirm, Space } from 'antd';
import faker from 'faker';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

export const JobTitle: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.JobTitle>();
  const [selectedRowsState, setSelectedRows] = useState<API.JobTitle[]>([]);
  const intl = useIntl();

  const columns: ProColumns<API.JobTitle>[] = [
    {
      title: (
        <FormattedMessage id="pages.admin.job.jobTitle.column.name" defaultMessage="Job title" />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.jobTitle.column.description"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'description',
      valueType: 'textarea',
      hideInForm: true,
    },
    {
      title: <FormattedMessage id="pages.admin.job.jobTitle.column.note" defaultMessage="Note" />,
      dataIndex: 'note',
      valueType: 'textarea',
      hideInForm: true,
    },
    {
      title: (
        <FormattedMessage id="pages.admin.job.jobTitle.column.is_active" defaultMessage="Status" />
      ),
      dataIndex: 'is_active',
      hideInForm: true,
      valueEnum: {
        true: {
          text: (
            <FormattedMessage
              id="pages.employee.list.column.status.active"
              defaultMessage="Status"
            />
          ),
          status: 'Success',
        },
        false: {
          text: (
            <FormattedMessage
              id="pages.employee.list.column.status.inactive"
              defaultMessage="Status"
            />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Button
            title="Edit this employee"
            size="small"
            onClick={() => {
              // setCrudModalVisible('update');
              // setSelectedRecord(record);
            }}
          >
            <EditOutlined />
          </Button>
          {/* Delete button: might need in the future */}
          <Popconfirm
            placement="right"
            title={'Delete this employee?'}
            onConfirm={async () => {
              // await onCrudOperation(() => deleteEmployee(record.id), 'Cannot delete employee!');
            }}
          >
            <Button title="Delete this employee" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <PageContainer>
      <ProTable<API.JobTitle>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.jobTitle.list.title',
          defaultMessage: 'Job Titles',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async () => {
          return {
            data: Array.from({ length: 20 }).map((it, id) => {
              return {
                id,
                name: faker.name.jobTitle(),
                description: faker.name.jobDescriptor(),
                note: faker.name.jobType(),
                specification: 1,
                is_active: true,
              };
            }),
            success: true,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default JobTitle;
