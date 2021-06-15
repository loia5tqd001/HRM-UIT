import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import {
  allTimeOffTypes,
  createTimeOffType,
  deleteTimeOffType,
  updateTimeOffType,
} from '@/services/timeOff.timeOffType';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { Access, FormattedMessage, useIntl } from 'umi';
import { useAccess } from 'umi';

type RecordType = API.TimeOffType;

export const TimeOffType: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const access = useAccess();
  const localeFeature = intl.formatMessage({ id: 'property.timeoffType' });

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
    {
      title: intl.formatMessage({ id: 'property.is_paid' }),
      dataIndex: 'is_paid',
      align: 'center',
      renderText: (it) =>
        it ? (
          <Tooltip title="Paid">
            <CheckOutlined style={{ color: '#52c41a' }} />
          </Tooltip>
        ) : (
          <Tooltip title="Unpaid">
            <CloseOutlined style={{ color: '#ff4d4f' }} />
          </Tooltip>
        ),
    },
    {
      title: intl.formatMessage({ id: 'property.description' }),
      dataIndex: 'description',
    },
    (access['change_timeofftype'] || access['delete_timeofftype']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['change_timeofftype']}>
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
          <Access accessible={access['delete_timeofftype']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteTimeOffType(record.id),
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

  const tableSettings = useTableSettings();
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
        {...tableSettings}
        className="card-shadow"
        headerTitle={`${intl.formatMessage({
          id: 'property.actions.list',
          defaultMessage: ' ',
        })} ${localeFeature}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Access accessible={access['add_timeofftype']}>
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
          const data = await allTimeOffTypes();
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
              () => createTimeOffType(record),
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
              () => updateTimeOffType(record.id, record),
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
                    const types = [
                      { name: 'Annual leave', description: '18 days per calendar year' },
                      { name: 'Sick Leave', description: '14 days per calendar year' },
                      {
                        name: 'Maternity Leave',
                        description: '16 weeks, regardless of nationality',
                      },
                      {
                        name: 'Paternity Leave',
                        description: '2 weeks within 12 months of birth of the child',
                      },
                      { name: 'Marriage Leave', description: '3 days per calendar year' },
                      {
                        name: 'Hospitalisation Leave',
                        description:
                          '46 days per calendar year. 6 days child care leave per calendar year for working parents with children below 7 years’ old & 2 days extended childcare leave for working parents with children between 7–12 years old',
                      },
                      {
                        name: 'Compassionate Leave',
                        description:
                          '3 days per calendar year (applicable for full-time employee’s parents, parents-in-laws, siblings, children, spouse, grandparents)',
                      },
                      { name: 'National Service leave', description: 'as required' },
                      {
                        name: 'Time off in lieu',
                        description:
                          'for official work day such as 9.9, 11.11; TOIL must be utilised within 6 months',
                      },
                    ];
                    props.form?.setFieldsValue(faker.helpers.randomize(types));
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
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'property.description' })}
        />
        <ProFormSwitch
          rules={[{ required: true }]}
          name="is_paid"
          label={intl.formatMessage({ id: 'property.is_paid' })}
          initialValue={true}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TimeOffType;
