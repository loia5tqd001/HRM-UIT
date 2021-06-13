import { __DEV__ } from '@/global';
import {
  allTerminationReasons,
  createTerminationReason,
  deleteTerminationReason,
  updateTerminationReason,
} from '@/services/admin.job.terminationReason';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { Access, FormattedMessage, useAccess, useIntl } from 'umi';

type RecordType = API.TerminationReason;

export const TerminationReason: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const access = useAccess();

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        message.success(successMessage);
      } catch (err) {
        if (err.data?.name?.[0]) {
          message.error(err.data?.name?.[0]);
        } else {
          message.error(errorMessage);
        }
        throw err;
      }
    },
    [],
  );

  const columns: ProColumns<RecordType>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.terminationReason.column.name"
          defaultMessage="Termination reason"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.terminationReason.column.description"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'description',
      valueType: 'textarea',
      hideInForm: true,
    },
    (access['change_terminationreason'] || access['delete_terminationreason']) && {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['change_terminationreason']}>
            <Button
              title="Edit this termination reason"
              size="small"
              onClick={() => {
                setCrudModalVisible('update');
                setSelectedRecord(record);
              }}
            >
              <EditOutlined />
            </Button>
          </Access>
          <Access accessible={access['delete_terminationreason']}>
            <Popconfirm
              placement="right"
              title={'Delete this termination reason?'}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteTerminationReason(record.id),
                  'Detete successfully!',
                  'Cannot delete termination reason!',
                );
              }}
            >
              <Button title="Delete this termination reason" size="small" danger>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create termination reason',
      update: 'Update termination reason',
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        className="card-shadow"
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.terminationReason.list.title',
          defaultMessage: 'Termination Reasons',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Access accessible={access['add_terminationreason']}>
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCrudModalVisible('create');
              }}
            >
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
            </Button>
          </Access>,
        ]}
        request={async () => {
          const data = await allTerminationReasons();
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
      <ModalForm<RecordType>
        title={dict.title[crudModalVisible]}
        width="400px"
        visible={crudModalVisible !== 'hidden'}
        form={form}
        onVisibleChange={(visible) => {
          if (!visible) {
            setCrudModalVisible('hidden');
            form.resetFields();
            return;
          }
          if (!selectedRecord) return;
          if (crudModalVisible === 'update') {
            form.setFieldsValue({
              ...selectedRecord,
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...selectedRecord,
            ...value,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createTerminationReason(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateTerminationReason(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        submitter={{
          render: (props, defaultDoms) => {
            return [
              __DEV__ && (
                <Button
                  key="autoFill"
                  onClick={() => {
                    const reason = faker.helpers.randomize([
                      'Contract Not Renewed',
                      'Deceased',
                      'Dismissed',
                      'Laid-off',
                      'Other',
                      'Physically Disabled/Compensated',
                      'Resigned',
                      'Resigned - Company Requested',
                      'Resigned - Self Proposed',
                      'Retired',
                    ]);
                    props.form?.setFieldsValue({
                      name: reason,
                      description: reason,
                    });
                  }}
                >
                  Auto fill
                </Button>
              ),
              ...defaultDoms,
            ];
          },
        }}
      >
        <ProFormText
          rules={[{ required: true }]}
          name="name"
          label={intl.formatMessage({
            id: 'pages.admin.job.terminationReason.column.name',
            defaultMessage: 'Termination reason',
          })}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'pages.admin.job.terminationReason.column.description',
            defaultMessage: 'Description',
          })}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TerminationReason;
