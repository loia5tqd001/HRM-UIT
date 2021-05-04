import { __DEV__ } from '@/global';
import {
  allEmployeeTimeoffs,
  createEmployeeTimeoff,
  getSchedule,
  updateEmployeeTimeoff,
} from '@/services/employee';
import { allHolidays } from '@/services/timeOff.holiday';
import { allTimeOffTypes } from '@/services/timeOff.timeOffType';
import { filterData } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, DatePicker, Form, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [schedule, setSchedule] = useState<API.Schedule>();
  const [dataNek, setData] = useState<RecordType[]>();

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.currentUser!;

  useEffect(() => {
    allTimeOffTypes().then((fetchData) => setTimeoffTypes(fetchData));
    allHolidays().then((fetchData) => setHolidays(fetchData));
    getSchedule(id).then((fetchData) => setSchedule(fetchData.schedule as API.Schedule));
  }, [id]);

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

  const isHoliday = useCallback(
    (date: moment.Moment) =>
      !!holidays?.some(
        (it) =>
          moment(it.start_date).isSameOrBefore(date, 'days') &&
          moment(it.end_date).isSameOrAfter(date, 'days'),
      ),
    [holidays],
  );

  const workWeekdays = useMemo(() => {
    if (!schedule) return [];
    const mapWeekdayToValue = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return schedule.workdays.map((it) => mapWeekdayToValue[it.day]);
  }, [schedule]);

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Type',
      dataIndex: 'time_off_type',
      onFilter: true,
      filters: filterData(dataNek || [])((it) => it.time_off_type),
    },
    {
      title: 'Start date',
      dataIndex: 'start_date',
      valueType: 'date',
      sorter: (a, b) => (moment(a.start_date).isSameOrAfter(b.start_date) ? 1 : -1),
    },
    {
      title: 'End date',
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: 'Number of days',
      dataIndex: 'days',
      renderText: (_, record) =>
        moment(record.end_date).diff(moment(record.start_date), 'days') + 1,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      hideInForm: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      onFilter: true,
      filters: filterData(dataNek || [])((it) => it.status),
      valueEnum: {
        Approved: {
          text: 'Approved',
          status: 'Success',
        },
        Pending: {
          text: 'Pending',
          status: 'Warning',
        },
        Cancelled: {
          text: 'Cancelled',
          status: 'Default',
        },
        Canceled: {
          text: 'Canceled',
          status: 'Default',
        },
        Rejected: {
          text: 'Rejected',
          status: 'Error',
        },
      },
    },
    // {
    //   title: 'Actions',
    //   key: 'action',
    //   fixed: 'right',
    //   align: 'center',
    //   search: false,
    //   render: (dom, record) => (
    //     <Space size="small">
    //       <Button
    //         title="Edit this timeoff"
    //         size="small"
    //         onClick={() => {
    //           setCrudModalVisible('update');
    //           setSelectedRecord(record);
    //         }}
    //         disabled={record.status !== 'Pending'}
    //       >
    //         <EditOutlined />
    //       </Button>
    //       <Popconfirm
    //         placement="right"
    //         title={'Delete this timeoff?'}
    //         onConfirm={async () => {
    //           await onCrudOperation(
    //             () => deleteEmployeeTimeoff(id, record.id),
    //             'Detete successfully!',
    //             'Cannot delete timeoff!',
    //           );
    //         }}
    //         disabled={record.status !== 'Pending'}
    //       >
    //         <Button
    //           title="Delete this timeoff"
    //           size="small"
    //           danger
    //           disabled={record.status !== 'Pending'}
    //         >
    //           <DeleteOutlined />
    //         </Button>
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
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
          setData(data);
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
          if (crudModalVisible === 'update') {
            if (!selectedRecord) return;
            form.setFieldsValue({
              ...selectedRecord,
              off_days: [moment(selectedRecord.start_date), moment(selectedRecord.end_date)],
              days:
                moment(selectedRecord.end_date).diff(moment(selectedRecord.start_date), 'days') + 1,
            });
          } else if (crudModalVisible === 'create') {
            const todayIsHoliday = isHoliday(moment());
            if (!todayIsHoliday)
              form.setFieldsValue({
                off_days: [moment(), moment()],
                days: 1,
              });
          }
        }}
        onFinish={async (value) => {
          const start_date = moment(value.off_days![0]);
          const end_date = moment(value.off_days![1]);
          start_date.set({ hours: 23, minutes: 59 });
          end_date.set({ hours: 0, minutes: 0 });
          const record = {
            ...value,
            start_date,
            end_date,
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
                    props.form?.setFieldsValue({
                      time_off_type: faker.helpers.randomize(timeoffTypes!.map((it) => it.name)),
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
            disabledDate={(theDate) => {
              const notAWorkDay = !workWeekdays.includes(theDate.day());
              return notAWorkDay || isHoliday(theDate);
            }}
          />
        </Form.Item>
        <ProFormText
          rules={[{ required: true }]}
          name="days"
          label="Number of days"
          width="md"
          readonly
          initialValue={0}
        />
        <ProFormTextArea name="note" label="Note" width="md" />
      </ModalForm>
    </PageContainer>
  );
};

export default Timeoff;
