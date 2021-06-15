import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import {
  allPayrollTemplates,
  createPayrollTemplate,
  deletePayrollTemplate,
  duplicatePayrollTemplate,
} from '@/services/payroll.template';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DiffOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useCallback, useRef, useState } from 'react';
import { Access, FormattedMessage, Link, useAccess, useIntl } from 'umi';

type RecordType = API.PayrollTemplate;

export const PayrollTemplate: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'duplicate'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const access = useAccess();
  const localeFeature = intl.formatMessage({ id: 'property.template' });

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
      renderText: (it, record) => (
        <Link to={`/payroll/template/${record.id}?tab=columns`}>{it}</Link>
      ),
    },
    {
      title: intl.formatMessage({ id: 'property.can_be_modified' }),
      dataIndex: 'can_be_modified',
      align: 'center',
      renderText: (it) =>
        it ? (
          <Tooltip title={intl.formatMessage({ id: 'property.can_be_modified' })}>
            <CheckOutlined style={{ color: '#52c41a' }} />
          </Tooltip>
        ) : (
          <Tooltip title={intl.formatMessage({ id: 'property.can_be_modified.no' })}>
            <CloseOutlined style={{ color: '#ff4d4f' }} />
          </Tooltip>
        ),
    },
    {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Button
            title={`${intl.formatMessage({
              id: 'property.actions.duplicate',
            })} ${localeFeature}`}
            size="small"
            onClick={() => {
              setCrudModalVisible('duplicate');
              setSelectedRecord(record);
            }}
          >
            <DiffOutlined />
          </Button>
          <Link to={`/payroll/template/${record.id}?tab=columns`}>
            <Button
              title={`${intl.formatMessage({
                id: 'property.actions.viewDetail',
              })} ${localeFeature}`}
              size="small"
            >
              <EyeOutlined />
            </Button>
          </Link>
          <Access accessible={access['delete_salarytemplate']}>
            <Popconfirm
              placement="right"
              title={
                record.is_default
                  ? intl.formatMessage({
                      id: 'error.cannotDeleteDefaultTemplate',
                    })
                  : `${intl.formatMessage({
                      id: 'property.actions.delete',
                      defaultMessage: 'Delete',
                    })} ${localeFeature}?`
              }
              onConfirm={async () => {
                if (record.is_default) return;
                await onCrudOperation(
                  () => deletePayrollTemplate(record.id),
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
                disabled={record.is_default}
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
      duplicate: `${intl.formatMessage({
        id: 'property.actions.duplicate',
        defaultMessage: 'Duplicate',
      })} ${localeFeature} ${selectedRecord?.name}`,
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        {...tableSettings}
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
          <Access accessible={access['add_salarytemplate']}>
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
          const data = await allPayrollTemplates();
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
          if (crudModalVisible === 'duplicate') {
            form.setFieldsValue({});
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
            record.fields = [];
            await onCrudOperation(
              () => createPayrollTemplate(record),
              intl.formatMessage({
                id: 'error.createSuccessfully',
                defaultMessage: 'Create successfully!',
              }),
              intl.formatMessage({
                id: 'error.createUnsuccessfully',
                defaultMessage: 'Create unsuccessfully!',
              }),
            );
          } else if (crudModalVisible === 'duplicate') {
            await onCrudOperation(
              () => duplicatePayrollTemplate(record.id, { name: value.name }),
              `${intl.formatMessage({
                id: 'property.actions.duplicate',
                defaultMessage: 'Duplicate',
              })} ${localeFeature} ${selectedRecord?.name} ${intl.formatMessage({
                id: 'property.actions.successfully',
              })}`,
              `${intl.formatMessage({
                id: 'property.actions.duplicate',
                defaultMessage: 'Duplicate',
              })} ${localeFeature} ${selectedRecord?.name} ${intl.formatMessage({
                id: 'property.actions.unsuccessfully',
              })}`,
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
                      name: 'Bảng lương chính',
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
      </ModalForm>
    </PageContainer>
  );
};

export default PayrollTemplate;
