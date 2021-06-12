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
      title: 'Name',
      dataIndex: 'name',
      renderText: (it, record) =>
        access['payroll.view_payslip'] ? (
          <Link to={`/payroll/payrolls/${record.id}`}>{it}</Link>
        ) : (
          it
        ),
    },
    {
      title: 'Template',
      dataIndex: 'template',
    },
    {
      title: 'Cycle',
      dataIndex: 'period',
      renderText: (it) =>
        `${moment(it.start_date).format('DD MMM YYYY')} → ${moment(it.end_date).format(
          'DD MMM YYYY',
        )}`,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      renderText: (it) => moment(it).format('DD MMM YYYY HH:mm:ss'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 'max-content',
      renderText: (status, record) => {
        const symbols = {
          Confirmed: (
            <Tooltip title={`Confirmed by ${record.confirmed_by}`}>
              <Tag icon={<LockOutlined />} color="success">
                Confirmed
              </Tag>
            </Tooltip>
          ),
          Temporary: (
            <Tag icon={<SyncOutlined spin />} color="processing">
              Temporary
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
    (access['payroll.view_payslip'] || access['payroll.delete_payroll']) && {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['payroll.view_payslip']}>
            <Link to={`/payroll/payrolls/${record.id}`}>
              <Button title="View detail this payroll" size="small">
                <EyeOutlined />
              </Button>
            </Link>
          </Access>
          <Access accessible={access['payroll.delete_payroll']}>
            <Popconfirm
              placement="right"
              title={'Delete this payroll?'}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deletePayroll(record.id),
                  'Detete successfully!',
                  'Cannot delete payroll!',
                );
              }}
            >
              <Button title="Delete this payroll" size="small" danger>
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
      create: 'Create payroll',
      update: 'Update payroll',
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        className="card-shadow"
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.jobTitle.list.title',
          defaultMessage: 'Payrolls',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Access accessible={access['payroll.add_payroll']}>
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
              'Create successfully!',
              'Create unsuccessfully!',
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
        <ProFormText rules={[{ required: true }]} name="name" label="Name" />
        <ProFormSelect
          name="template"
          label="Template"
          rules={[{ required: true }]}
          options={templates?.map((it) => ({ value: it.name, label: it.name }))}
          hasFeedback={!templates}
        />
        <ProFormSelect
          name="period"
          label="Period"
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
