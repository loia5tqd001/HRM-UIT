import { __DEV__ } from '@/global';
import {
  allEmployeeTimeoffs,
  createEmployeeTimeoff,
  deleteEmployeeTimeoff,
  updateEmployeeTimeoff,
} from '@/services/employee';
import { allHolidays } from '@/services/timeOff.holiday';
import { allTimeOffTypes } from '@/services/timeOff.timeOffType';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDateRangePicker,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, DatePicker, Form, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl, useModel } from 'umi';

type RecordType = API.TimeoffRequest & {
  off_days?: [moment.Moment, moment.Moment];
  days?: number;
};

export const Timeoff: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [timeoffTypes, setTimeoffTypes] = useState<API.TimeOffType[]>();
  const [holidays, setHolidays] = useState<API.Holiday[]>();

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.currentUser!;

  useEffect(() => {
    allTimeOffTypes().then((fetchData) => setTimeoffTypes(fetchData));
    allHolidays().then((fetchData) => setHolidays(fetchData));
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
      title: 'Type',
      dataIndex: 'time_off_type',
    },
    {
      title: 'Start date',
      dataIndex: 'start_date',
      valueType: 'date',
    },
    {
      title: 'End date',
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: 'Number of days',
      dataIndex: 'days',
      valueType: 'date',
    },
    {
      title: 'Note',
      dataIndex: 'note',
      valueType: 'textarea',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        Approved: {
          text: 'Approved',
          status: 'Success',
        },
        Pending: {
          text: 'Pending',
          status: 'Warning',
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
            title="Edit this timeoff"
            size="small"
            onClick={() => {
              setCrudModalVisible('update');
              setSelectedRecord(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            placement="right"
            title={'Delete this timeoff?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteEmployeeTimeoff(id, record.id),
                'Detete successfully!',
                'Cannot delete timeoff!',
              );
            }}
          >
            <Button title="Delete this timeoff" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create timeoff request',
      update: 'Create timeoff request',
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        headerTitle="My requests"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCrudModalVisible('create');
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async () => {
          const data = await allEmployeeTimeoffs(id);
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
            form.setFieldsValue({
              off_days: [moment(), moment()],
            });
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...value,
            start_date: moment(value.off_days![0]).format('YYYY-MM-DD'),
            end_date: moment(value.off_days![1]).format('YYYY-MM-DD'),
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createEmployeeTimeoff(id, record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateEmployeeTimeoff(id, record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        onValuesChange={({ off_days }) => {
          if (off_days) {
            form.setFieldsValue({
              days: moment(off_days[1]).diff(moment(off_days[0]), 'days') + 1,
            });
          }
        }}
        submitter={{
          render: (props, defaultDoms) => {
            return [
              __DEV__ && (
                <Button
                  key="autoFill"
                  onClick={() => {
                    // const from = moment(faker.date.soon(10));
                    // const to = moment(from).add(faker.random.number(5), 'days');
                    // props.form?.setFieldsValue({
                    //   time_off_type: faker.helpers.randomize(timeoffTypes!.map((it) => it.name)),
                    //   off_days: [from.format('YYYY-MM-DD'), to.format('YYYY-MM-DD')],
                    // });
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
        <ProFormSelect
          name="time_off_type"
          rules={[{ required: true }]}
          width="md"
          label="Timeoff type"
          options={timeoffTypes?.map((it) => ({ value: it.name, label: it.name }))}
          hasFeedback={!timeoffTypes}
        />
        <Form.Item rules={[{ required: true }]} name="off_days" label="Off days">
          <DatePicker.RangePicker
            style={{ width: 328 }}
            disabledDate={(date) =>
              !!holidays?.some((it) => moment(it.start_date) < date && date < moment(it.end_date))
            }
          />
        </Form.Item>
        {/* <ProFormText
          rules={[{ required: true }]}
          name="days"
          label="Number of days"
          width="md"
          readonly
          initialValue={0}
        /> */}
        <ProFormTextArea name="note" label="Note" width="md" />
      </ModalForm>
    </PageContainer>
  );
};

export default Timeoff;