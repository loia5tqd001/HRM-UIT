import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import {
  allInsurancePlans,
  createInsurancePlan,
  deleteInsurancePlan,
  updateInsurancePlan,
} from '@/services/admin.payroll.insurancePlan';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { Access, FormattedMessage, useAccess, useIntl } from 'umi';

type RecordType = API.InsurancePlan;

export const InsurancePlan: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const access = useAccess();
  const localeFeature = intl.formatMessage({
    id: 'property.insurancePlan',
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
    {
      title: intl.formatMessage({
        id: 'property.code',
      }),
      dataIndex: 'code',
    },
    {
      title: intl.formatMessage({
        id: 'property.insuranceType',
      }),
      dataIndex: 'base_on',
    },
    {
      title: intl.formatMessage({
        id: 'property.companyPercent',
      }),
      dataIndex: 'percent_company',
      valueType: 'percent',
    },
    {
      title: intl.formatMessage({
        id: 'property.employeePercent',
      }),
      dataIndex: 'percent_employee',
      valueType: 'percent',
    },
    (access['change_insurancepolicy'] || access['delete_insurancepolicy']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['change_insurancepolicy']}>
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
          <Access accessible={access['delete_insurancepolicy']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteInsurancePlan(record.id),
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
          <Access accessible={access['add_insurancepolicy']}>
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
          const data = await allInsurancePlans();
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
              () => createInsurancePlan(record),
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
              () => updateInsurancePlan(record.id, record),
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
                      name: 'VN Standard',
                      code: 'vn_standard',
                      base_on: 'Basic Salary',
                      percent_company: 21.5,
                      percent_employee: 10.5,
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
        <ProFormText
          rules={[{ required: true }]}
          name="code"
          label={intl.formatMessage({
            id: 'property.code',
          })}
        />
        <ProFormSelect
          rules={[{ required: true }]}
          name="base_on"
          label={intl.formatMessage({
            id: 'property.insuranceType',
          })}
          options={[{ value: 'Basic Salary', label: 'Basic Salary' }]}
        />
        <ProFormDigit
          rules={[{ required: true }]}
          name="percent_company"
          label={intl.formatMessage({
            id: 'property.companyPercent',
          })}
          min={0}
          max={100}
          fieldProps={{
            step: 0.5,
            formatter: (value) => `${value}%`,
            parser: (value) => value?.replace('%', '') || '',
          }}
        />
        <ProFormDigit
          rules={[{ required: true }]}
          name="percent_employee"
          label={intl.formatMessage({
            id: 'property.employeePercent',
          })}
          min={0}
          max={100}
          fieldProps={{
            step: 0.5,
            formatter: (value) => `${value}%`,
            parser: (value) => value?.replace('%', '') || '',
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default InsurancePlan;
