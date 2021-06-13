import { __DEV__ } from '@/global';
import {
  allEmploymentStatuses,
  createEmploymentStatus,
  deleteEmploymentStatus,
  updateEmploymentStatus,
} from '@/services/admin.job.employmentStatus';
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

type RecordType = API.EmploymentStatus;

export const EmploymentStatus: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const access = useAccess();
  const localeFeature = intl.formatMessage({
    id: 'property.employmentStatus',
    defaultMessage: 'Employment Status',
  });

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        message.success(successMessage);
      } catch (err) {
        message.error(errorMessage);
        throw err;
      }
    },
    [],
  );

  const columns: ProColumns<RecordType>[] = [
    {
      title: localeFeature,
      dataIndex: 'name',
    },
    (access['change_employmentstatus'] || access['delete_employmentstatus']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['change_employmentstatus']}>
            <Button
              title={`${intl.formatMessage({
                id: 'property.actions.update',
                defaultMessage: 'Update',
              })} ${localeFeature}`}
              size="small"
              onClick={() => {
                setCrudModalVisible('update');
                setSelectedRecord(record);
              }}
            >
              <EditOutlined />
            </Button>
          </Access>
          <Access accessible={access['delete_employmentstatus']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteEmploymentStatus(record.id),
                  intl.formatMessage({
                    id: 'error.deleteSuccessfully',
                    defaultMessage: 'Delete successfully!',
                  }),
                  intl.formatMessage({
                    id: 'error.deleteUnsuccessfully',
                    defaultMessage: 'Delete unsuccessfully!',
                  }),
                );
              }}
            >
              <Button
                title={`${intl.formatMessage({
                  id: 'property.actions.delete',
                  defaultMessage: 'Delete',
                })} ${localeFeature}`}
                size="small"
                danger
              >
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
      create: `${intl.formatMessage({
        id: 'property.actions.create',
        defaultMessage: 'Create',
      })} ${localeFeature}`,
      update: `${intl.formatMessage({
        id: 'property.actions.update',
        defaultMessage: 'Update',
      })} ${localeFeature}`,
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        className="card-shadow"
        headerTitle={`${intl.formatMessage({
          id: 'property.actions.list',
          defaultMessage: ' ',
        })} ${localeFeature}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Access accessible={access['add_employmentstatus']}>
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCrudModalVisible('create');
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage id="property.actions.create" defaultMessage="New" />
            </Button>
          </Access>,
        ]}
        request={async () => {
          const data = await allEmploymentStatuses();
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
              () => createEmploymentStatus(record),
              intl.formatMessage({
                id: 'error.createSuccessfully',
                defaultMessage: 'Create successfully!',
              }),
              intl.formatMessage({
                id: 'error.createUnsuccessfully',
                defaultMessage: 'Create unsuccessfully!',
              }),
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateEmploymentStatus(record.id, record),
              intl.formatMessage({
                id: 'error.updateSuccessfully',
                defaultMessage: 'Update successfully!',
              }),
              intl.formatMessage({
                id: 'error.updateUnsuccessfully',
                defaultMessage: 'Update unsuccessfully!',
              }),
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
                    props.form?.setFieldsValue({
                      name: faker.name.jobType(),
                      // description: faker.name.jobDescriptor(),
                      // is_active: true,
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
        <ProFormText rules={[{ required: true }]} name="name" label={localeFeature} />
        {/* <ProFormTextArea
          rules={[{ required: true }]}
          name="description"
          label={intl.formatMessage({
            id: 'pages.admin.job.employmentStatus.column.description',
            defaultMessage: 'Description',
          })}
        /> */}
      </ModalForm>
    </PageContainer>
  );
};

export default EmploymentStatus;
