import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import {
  allEmployeeTimeoffs,
  cancelEmployeeTimeoff,
  createEmployeeTimeoff,
  getSchedule,
  updateEmployeeTimeoff,
} from '@/services/employee';
import { allHolidays } from '@/services/timeOff.holiday';
import { allTimeOffTypes } from '@/services/timeOff.timeOffType';
import { filterData } from '@/utils/utils';
import { EnterOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, DatePicker, Form, message, Popconfirm, Space, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, history, useIntl, useModel } from 'umi';

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
  const localeFeature = intl.formatMessage({
    id: 'property.timeoffRequest',
  });

  useEffect(() => {
    allTimeOffTypes().then((fetchData) => setTimeoffTypes(fetchData));
    allHolidays().then((fetchData) => setHolidays(fetchData));
    getSchedule(id).then((fetchData) => setSchedule(fetchData.schedule as API.Schedule));
  }, [id]);

  const buttonAddDisabled = initialState?.currentUser?.status !== 'Working';

  useEffect(() => {
    const { action } = history.location.query as any;
    if (action === 'new' && !buttonAddDisabled) {
      setCrudModalVisible('create');
      history.replace('/timeOff/me');
    }
  }, [buttonAddDisabled]);

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

  const mapStatus = {
    Approved: {
      text: intl.formatMessage({ id: 'property.status.Approved' }),
      status: 'Success',
    },
    Pending: {
      text: intl.formatMessage({ id: 'property.status.Pending' }),
      status: 'Warning',
    },
    Cancelled: {
      text: intl.formatMessage({ id: 'property.status.Cancelled' }),
      status: 'Default',
    },
    Canceled: {
      text: intl.formatMessage({ id: 'property.status.Canceled' }),
      status: 'Default',
    },
    Rejected: {
      text: intl.formatMessage({ id: 'property.status.Rejected' }),
      status: 'Error',
    },
  };

  const columns: ProColumns<RecordType>[] = [
    {
      title: intl.formatMessage({ id: 'property.timeoffType' }),
      dataIndex: 'time_off_type',
      onFilter: true,
      filters: filterData(dataNek || [])((it) => it.time_off_type),
    },
    {
      title: intl.formatMessage({ id: 'property.start_date' }),
      dataIndex: 'start_date',
      valueType: 'date',
      sorter: (a, b) => (moment(a.start_date).isSameOrAfter(b.start_date) ? 1 : -1),
    },
    {
      title: intl.formatMessage({ id: 'property.end_date' }),
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: intl.formatMessage({ id: 'property.numberOfDays' }),
      dataIndex: 'days',
      renderText: (_, record) =>
        moment(record.end_date).diff(moment(record.start_date), 'days') + 1,
    },
    {
      title: intl.formatMessage({ id: 'property.note' }),
      dataIndex: 'note',
      hideInForm: true,
    },
    {
      title: intl.formatMessage({ id: 'property.status' }),
      dataIndex: 'status',
      hideInForm: true,
      onFilter: true,
      filters: filterData(dataNek || [])(
        (it) => it.status,
        (it) => mapStatus[it.status].text,
      ),
      valueEnum: mapStatus,
    },
    {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 'min-content',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Popconfirm
            placement="right"
            title={`${intl.formatMessage({ id: 'property.actions.cancel' })} ${localeFeature}?`}
            onConfirm={async () => {
              await onCrudOperation(
                () => cancelEmployeeTimeoff(id, record.id),
                intl.formatMessage({
                  id: 'error.updateSuccessfully',
                  defaultMessage: 'Update successfully!',
                }),
                intl.formatMessage({
                  id: 'error.updateUnsuccessfully',
                  defaultMessage: 'Update unsuccessfully!',
                }),
              );
            }}
            disabled={!(record.status === 'Approved' || record.status === 'Pending')}
          >
            <Button
              title={`${intl.formatMessage({ id: 'property.actions.cancel' })} ${localeFeature}?`}
              size="small"
              disabled={!(record.status === 'Approved' || record.status === 'Pending')}
            >
              <EnterOutlined />
            </Button>
          </Popconfirm>
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
        headerTitle={intl.formatMessage({ id: 'property.myRequests' })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Tooltip
            title={
              initialState?.currentUser?.status !== 'Working'
                ? intl.formatMessage({ id: 'error.youAreNotWorking' })
                : ''
            }
          >
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCrudModalVisible('create');
              }}
              disabled={buttonAddDisabled}
            >
              <PlusOutlined />{' '}
              <FormattedMessage id="property.actions.create" defaultMessage="New" />
            </Button>
          </Tooltip>,
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
          start_date.set({ hours: 0, minutes: 0 });
          end_date.set({ hours: 23, minutes: 59 });
          const record = {
            ...value,
            start_date,
            end_date,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createEmployeeTimeoff(id, record),
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
              () => updateEmployeeTimeoff(id, record.id, record),
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
          label={intl.formatMessage({ id: 'property.timeoffType' })}
          rules={[{ required: true }]}
          width="md"
          options={timeoffTypes?.map((it) => ({ value: it.name, label: it.name }))}
          hasFeedback={!timeoffTypes}
        />
        <Form.Item
          rules={[{ required: true }]}
          name="off_days"
          label={intl.formatMessage({ id: 'property.offDays' })}
        >
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
          label={intl.formatMessage({ id: 'property.numberOfDays' })}
          width="md"
          readonly
          initialValue={0}
        />
        <ProFormTextArea
          name="note"
          label={intl.formatMessage({ id: 'property.note' })}
          width="md"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Timeoff;
