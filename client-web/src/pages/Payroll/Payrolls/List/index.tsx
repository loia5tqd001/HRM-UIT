import { __DEV__ } from '@/global';
import { allPeriods } from '@/services/attendance';
import { allPayrolls, createPayroll, deletePayroll } from '@/services/payroll.payrolls';
import { allPayrollTemplates } from '@/services/payroll.template';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Button, message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, Link, useIntl, useAccess, Access } from 'umi';

type RecordType = API.Payroll;

export const Payroll: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [templates, setTemplates] = useState<API.PayrollTemplate[]>();
  const [periods, setPeriods] = useState<API.Period[]>();
  const access = useAccess();
  const localeFeature = intl.formatMessage({ id: 'property.payrolls' });

  useEffect(() => {
    allPayrollTemplates().then((fetchData) => setTemplates(fetchData));
    allPeriods().then((fetchData) => setPeriods(fetchData));
  }, []);

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
      title: intl.formatMessage({ id: 'property.payrolls' }),
      dataIndex: 'name',
      renderText: (it, record) =>
        access['view_payslip'] ? <Link to={`/payroll/payrolls/${record.id}`}>{it}</Link> : it,
    },
    {
      title: intl.formatMessage({ id: 'property.template' }),
      dataIndex: 'template',
    },
    {
      title: intl.formatMessage({ id: 'property.period' }),
      dataIndex: 'period',
      renderText: (it) =>
        `${moment(it.start_date).format('DD MMM YYYY')} → ${moment(it.end_date).format(
          'DD MMM YYYY',
        )}`,
    },
    {
      title: intl.formatMessage({ id: 'property.created_at' }),
      dataIndex: 'created_at',
      renderText: (it) => moment(it).format('DD MMM YYYY HH:mm:ss'),
    },
    {
      title: <FormattedMessage id="property.status" defaultMessage="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 'max-content',
      renderText: (status, record) => {
        const symbols = {
          Confirmed: (
            <Tooltip title={`Confirmed by ${record.confirmed_by}`}>
              <Tag icon={<LockOutlined />} color="success">
                {intl.formatMessage({ id: 'property.status.Confirmed' })}
              </Tag>
            </Tooltip>
          ),
          Temporary: (
            <Tag icon={<SyncOutlined spin />} color="processing">
              {intl.formatMessage({ id: 'property.status.Temporary' })}
            </Tag>
          ),
        };
        return (
          <Space size="small">
            <span>{symbols[status]}</span>
          </Space>
        );
      },
    },
    (access['view_payslip'] || access['delete_payroll']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 'min-content',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['view_payslip']}>
            <Link to={`/payroll/payrolls/${record.id}`}>
              <Button
                title={`${intl.formatMessage({
                  id: 'property.actions.viewDetail',
                })} ${localeFeature}`}
                size="small"
              >
                <EyeOutlined />
              </Button>
            </Link>
          </Access>
          <Access accessible={access['delete_payroll']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deletePayroll(record.id),
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
          <Access accessible={access['add_payroll']}>
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
          const data = await allPayrolls();
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
              () => createPayroll(record),
              intl.formatMessage({
                id: 'error.createSuccessfully',
                defaultMessage: 'Create successfully!',
              }),
              intl.formatMessage({
                id: 'error.createUnsuccessfully',
                defaultMessage: 'Create unsuccessfully!',
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
                      name: `Payroll ${Math.random().toFixed(5)}`,
                      template: faker.helpers.randomize(templates?.map((it) => it.name) || []),
                      period: faker.helpers.randomize(periods?.map((it) => it.id) || []),
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
        <ProFormSelect
          name="template"
          label={intl.formatMessage({ id: 'property.template' })}
          rules={[{ required: true }]}
          options={templates?.map((it) => ({ value: it.name, label: it.name }))}
          hasFeedback={!templates}
        />
        <ProFormSelect
          name="period"
          label={intl.formatMessage({ id: 'property.period' })}
          rules={[{ required: true }]}
          options={periods?.map((it) => ({
            value: it.id,
            label: `${moment(it.start_date).format('DD MMM YYYY')} → ${moment(it.end_date).format(
              'DD MMM YYYY',
            )}`,
          }))}
          hasFeedback={!periods}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Payroll;
