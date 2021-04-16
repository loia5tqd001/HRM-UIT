import { __DEV__ } from '@/global';
import {
  allWorkSchedules,
  createWorkSchedule,
  deleteWorkSchedule,
  updateWorkSchedule,
} from '@/services/admin.job.workSchedule';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SwapOutlined,
  SwapRightOutlined,
  SyncOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormCheckbox,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  TimePicker,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import produce from 'immer';
import styles from './index.less';
import { range } from 'lodash';

type RecordType = API.WorkSchedule;

type DayInWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
type DayItem = {
  day: DayInWeek;
  morning_enabled: boolean;
  morning: [moment.Moment, moment.Moment] | null;
  afternoon_enabled: boolean;
  afternoon: [moment.Moment, moment.Moment] | null;
};
type DayItemOpen = {
  day: DayInWeek;
  morning_open: boolean;
  afternoon_open: boolean;
};
const initDays: DayItem[] = [
  {
    day: 'Mon',
    morning_enabled: true,
    morning: [moment('08:30', 'hh:mm'), moment('12:00', 'hh:mm')],
    afternoon_enabled: true,
    afternoon: [moment('13:00', 'hh:mm'), moment('17:30', 'hh:mm')],
  },
  {
    day: 'Tue',
    morning_enabled: true,
    morning: [moment('08:30', 'hh:mm'), moment('12:00', 'hh:mm')],
    afternoon_enabled: true,
    afternoon: [moment('13:00', 'hh:mm'), moment('17:30', 'hh:mm')],
  },
  {
    day: 'Wed',
    morning_enabled: true,
    morning: [moment('08:30', 'hh:mm'), moment('12:00', 'hh:mm')],
    afternoon_enabled: true,
    afternoon: [moment('13:00', 'hh:mm'), moment('17:30', 'hh:mm')],
  },
  {
    day: 'Thu',
    morning_enabled: true,
    morning: [moment('08:30', 'hh:mm'), moment('12:00', 'hh:mm')],
    afternoon_enabled: true,
    afternoon: [moment('13:00', 'hh:mm'), moment('17:30', 'hh:mm')],
  },
  {
    day: 'Fri',
    morning_enabled: true,
    morning: [moment('08:30', 'hh:mm'), moment('12:00', 'hh:mm')],
    afternoon_enabled: true,
    afternoon: [moment('13:00', 'hh:mm'), moment('17:30', 'hh:mm')],
  },
  {
    day: 'Sat',
    morning_enabled: true,
    morning: [moment('08:30', 'hh:mm'), moment('12:00', 'hh:mm')],
    afternoon_enabled: false,
    afternoon: null,
  },
  {
    day: 'Sun',
    morning_enabled: false,
    morning: null,
    afternoon_enabled: false,
    afternoon: null,
  },
];
const initDayOpens: DayItemOpen[] = [
  {
    day: 'Mon',
    morning_open: false,
    afternoon_open: false,
  },
  {
    day: 'Tue',
    morning_open: false,
    afternoon_open: false,
  },
  {
    day: 'Wed',
    morning_open: false,
    afternoon_open: false,
  },
  {
    day: 'Thu',
    morning_open: false,
    afternoon_open: false,
  },
  {
    day: 'Fri',
    morning_open: false,
    afternoon_open: false,
  },
  {
    day: 'Sat',
    morning_open: false,
    afternoon_open: false,
  },
  {
    day: 'Sun',
    morning_open: false,
    afternoon_open: false,
  },
];

export const WorkSchedule: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [days, setDays] = useState(initDays);
  const [dayOpens, setDayOpens] = useState(initDayOpens);

  const getDisabledHours = (day: DayInWeek, when: 'morning' | 'afternoon') => {
    const foundDay = days.find((it) => it.day === day);
    if (when === 'morning') {
      if (!foundDay?.afternoon_enabled || !foundDay.afternoon) return [];
      return range(foundDay.afternoon[0].hours() + 1, 24);
    }
    // when == 'afternoon'
    if (!foundDay?.morning_enabled || !foundDay.morning) return [];
    return range(0, foundDay.morning[1].hours());
  };

  const getDisabledMinutes = (
    day: DayInWeek,
    when: 'morning' | 'afternoon',
    selectedHour: number,
  ) => {
    const foundDay = days.find((it) => it.day === day);
    if (when === 'morning') {
      if (!foundDay?.afternoon_enabled || !foundDay.afternoon) return [];
      const afternoon_start = foundDay.afternoon[0];
      if (afternoon_start.hours() > selectedHour) return [];
      return range(afternoon_start.minutes() + 5, 60, 5);
    }
    // when == 'afternoon'
    if (!foundDay?.morning_enabled || !foundDay.morning) return [];
    const morning_end = foundDay.morning[1];
    if (morning_end.hours() < selectedHour) return [];
    return range(-5, morning_end.minutes(), 5);
  };

  const onValueChange = (day: DayInWeek, key: keyof DayItem, value: any) => {
    const index = days.findIndex((it) => it.day === day);
    setDays(
      produce(days, (draft) => {
        (draft[index] as any)[key] = value;
      }),
    );
  };

  const onSyncAll = (when: 'morning' | 'afternoon', time: DayItem[typeof when]) => {
    setDays(
      produce(days, (draft) => {
        draft.forEach((it) => {
          it[when] = time;
        });
      }),
    );
  };

  const onOpenChange = (day: DayInWeek, key: keyof DayItemOpen, value: boolean) => {
    const index = dayOpens.findIndex((it) => it.day === day);
    setDayOpens(
      produce(dayOpens, (draft) => {
        (draft[index] as any)[key] = value;
      }),
    );
  };

  const onCopyAbove = (day: DayInWeek, when: 'morning' | 'afternoon') => {
    const index = days.findIndex((it) => it.day === day);
    setDays(
      produce(days, (draft) => {
        let foundIndex = index === 0 ? draft.length - 1 : index - 1;
        while (foundIndex !== index) {
          const found = draft[foundIndex][when];
          if (found !== null) {
            draft[index][when] = found;
            break;
          }
          foundIndex -= 1;
          if (foundIndex < 0) foundIndex += draft.length;
        }
      }),
    );
  };

  const calcHours = ({
    morning,
    morning_enabled,
    afternoon,
    afternoon_enabled,
  }: typeof days[0]) => {
    let hours = 0;
    if (morning_enabled && morning)
      hours += moment
        .duration(moment(morning[1], 'hh:mm').diff(moment(morning[0], 'hh:mm')))
        .asHours();
    if (afternoon_enabled && afternoon)
      hours += moment
        .duration(moment(afternoon[1], 'hh:mm').diff(moment(afternoon[0], 'hh:mm')))
        .asHours();
    return Number(hours.toFixed(1));
  };

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

  // const calcDuration = (record: RecordType) => {
  //   const hours = moment
  //     .duration(moment(record.morning[0], 'hh:mm').diff(moment(record.morning[1], 'hh:mm')))
  //     .asHours();
  //   return Number(hours.toFixed(1));
  // };

  const calcDuration = (record: RecordType) => {
    return 8; // mock first
    const hours =
      moment
        .duration(moment(record.morning[0], 'hh:mm:ss').diff(moment(record.morning[1], 'hh:mm:ss')))
        .asHours() +
      moment
        .duration(
          moment(record.afternoon[0], 'hh:mm:ss').diff(moment(record.afternoon[1], 'hh:mm:ss')),
        )
        .asHours();

    return Number(hours.toFixed(1));
  };

  const addDuration = useCallback((record: RecordType) => {
    return {
      ...record,
      duration: calcDuration(record),
    } as RecordType;
  }, []);

  const midifiedSelectedRecord = useMemo(() => {
    if (!selectedRecord) return selectedRecord;
    return addDuration(selectedRecord);
  }, [addDuration, selectedRecord]);

  const columns: ProColumns<RecordType>[] = [
    {
      title: (
        <FormattedMessage id="pages.admin.job.workShift.column.name" defaultMessage="Schedule" />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage id="pages.admin.job.workShift.column.morning" defaultMessage="Morning" />
      ),
      dataIndex: 'morning_from',
      renderText: (_, record) => `${record.start_time} → ${record.end_time}`,
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.workShift.column.afternoon"
          defaultMessage="Afternoon"
        />
      ),
      dataIndex: 'afternoon_from',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.workShift.column.duration"
          defaultMessage="Duration"
        />
      ),
      dataIndex: 'duration',
    },
    {
      title: <FormattedMessage id="pages.admin.job.workShift.column.days" defaultMessage="Days" />,
      dataIndex: 'days',
    },

    // {
    //   title: (
    //     <FormattedMessage id="pages.admin.job.workShift.column.is_active" defaultMessage="Status" />
    //   ),
    //   dataIndex: 'is_active',
    //   hideInForm: true,
    //   valueEnum: {
    //     true: {
    //       text: (
    //         <FormattedMessage
    //           id="pages.employee.list.column.status.active"
    //           defaultMessage="Status"
    //         />
    //       ),
    //       status: 'Success',
    //     },
    //     false: {
    //       text: (
    //         <FormattedMessage
    //           id="pages.employee.list.column.status.inactive"
    //           defaultMessage="Status"
    //         />
    //       ),
    //       status: 'Error',
    //     },
    //   },
    // },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Button
            title="Edit this work shift"
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
            title={'Delete this work shift?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteWorkSchedule(record.id),
                'Detete successfully!',
                'Cannot delete work shift!',
              );
            }}
          >
            <Button title="Delete this work shift" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create work schedule',
      update: 'Create work schedule',
    },
  };

  return (
    <PageContainer>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.workShift.list.title',
          defaultMessage: 'Work schedules',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
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
          const data = await allWorkSchedules();
          return {
            data: data.map((it) => addDuration(it)),
            success: true,
          };
        }}
        columns={columns}
      />
      <ModalForm<RecordType>
        title={dict.title[crudModalVisible]}
        width="600px"
        visible={crudModalVisible !== 'hidden'}
        form={form}
        onVisibleChange={(visible) => {
          if (!visible) {
            setCrudModalVisible('hidden');
            form.resetFields();
            return;
          }
          if (!midifiedSelectedRecord) return;
          if (crudModalVisible === 'update') {
            form.setFieldsValue({
              ...midifiedSelectedRecord,
              start_time: moment(midifiedSelectedRecord.start_time, 'hh:mm:ss'),
              end_time: moment(midifiedSelectedRecord.end_time, 'hh:mm:ss'),
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...midifiedSelectedRecord,
            ...value,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createWorkSchedule(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateWorkSchedule(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        onValuesChange={(changedValues) => {
          if (changedValues.morning || changedValues.afternoon) {
            form.setFieldsValue({
              ...form.getFieldsValue(),
              duration: calcDuration(form.getFieldsValue()),
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
                    // @ts-ignore
                    const newValue = {
                      name: `Schedule ${faker.name.title()}`,
                      morning: [moment('08:00', 'hh:mm'), moment('12:00:00', 'hh:mm:ss')],
                      afternoon: [moment('13:00:00', 'hh:mm:ss'), moment('17:00:00', 'hh:mm:ss')],
                      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                      // start_time: faker.helpers.randomize([
                      //   moment('08:00:00', 'hh:mm:ss'),
                      //   moment('08:30:00', 'hh:mm:ss'),
                      //   moment('09:00:00', 'hh:mm:ss'),
                      // ]),
                      // end_time: faker.helpers.randomize([
                      //   moment('18:00:00', 'hh:mm:ss'),
                      //   moment('17:30:00', 'hh:mm:ss'),
                      //   moment('17:00:00', 'hh:mm:ss'),
                      // ]),
                      duration: '',
                      // is_active: true,
                    } as RecordType;
                    props.form?.setFieldsValue(addDuration(newValue));
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
          width="xl"
          label={intl.formatMessage({
            id: 'pages.admin.job.workShift.column.name',
            defaultMessage: 'Schedule name',
          })}
        />
        {days.map((it, index) => (
          <Form.Item
            name={it.day}
            label={intl.formatMessage({
              id: 'pages.admin.job.workShift.column.morning',
              defaultMessage: `${it.day} (${calcHours(it)}hrs)`,
            })}
            labelCol={{ flex: 1 }}
            wrapperCol={{ span: 20 }}
            style={{ flexDirection: 'row' }}
          >
            <Space>
              <Checkbox
                checked={it.morning_enabled}
                onChange={(e) => onValueChange(it.day, 'morning_enabled', e.target.checked)}
              ></Checkbox>
              <TimePicker.RangePicker
                format="HH:mm"
                minuteStep={5}
                style={{ width: '100%' }}
                value={it.morning}
                disabled={!it.morning_enabled}
                disabledHours={() => getDisabledHours(it.day, 'morning')}
                disabledMinutes={(selectedHour) =>
                  getDisabledMinutes(it.day, 'morning', selectedHour)
                }
                onChange={(values) => onValueChange(it.day, 'morning', values)}
                open={dayOpens[index].morning_open}
                onOpenChange={(open) => onOpenChange(it.day, 'morning_open', open)}
                renderExtraFooter={() => (
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onSyncAll('morning', it.morning);
                        onOpenChange(it.day, 'morning_open', false);
                      }}
                      icon={<SwapOutlined />}
                      title="Sync all"
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onCopyAbove(it.day, 'morning');
                        onOpenChange(it.day, 'morning_open', false);
                      }}
                      icon={<VerticalAlignBottomOutlined />}
                      title="Copy above"
                    />
                  </Space>
                )}
              />
              <Checkbox
                checked={it.afternoon_enabled}
                onChange={(e) => onValueChange(it.day, 'afternoon_enabled', e.target.checked)}
              ></Checkbox>
              <TimePicker.RangePicker
                format="HH:mm"
                minuteStep={5}
                style={{ width: '100%' }}
                value={it.afternoon}
                disabled={!it.afternoon_enabled}
                disabledHours={() => getDisabledHours(it.day, 'afternoon')}
                disabledMinutes={(selectedHour) =>
                  getDisabledMinutes(it.day, 'afternoon', selectedHour)
                }
                onChange={(values) => onValueChange(it.day, 'afternoon', values)}
                open={dayOpens[index].afternoon_open}
                onOpenChange={(open) => onOpenChange(it.day, 'afternoon_open', open)}
                renderExtraFooter={() => (
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onSyncAll('afternoon', it.afternoon);
                        onOpenChange(it.day, 'afternoon_open', false);
                      }}
                      icon={<SwapOutlined />}
                      title="Sync all"
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onCopyAbove(it.day, 'afternoon');
                        onOpenChange(it.day, 'afternoon_open', false);
                      }}
                      icon={<VerticalAlignBottomOutlined />}
                      title="Copy above"
                    />
                  </Space>
                )}
              />
              <p style={{ marginRight: 5 }}></p>
            </Space>
          </Form.Item>
        ))}
        <Form.Item label="Total week hours">
          <Input readOnly suffix="hrs" value={days.reduce((acc, cur) => acc + calcHours(cur), 0)} />
        </Form.Item>
      </ModalForm>
    </PageContainer>
  );
};

export default WorkSchedule;
