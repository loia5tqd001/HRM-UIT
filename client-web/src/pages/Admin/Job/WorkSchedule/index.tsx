import { __DEV__ } from '@/global';
import {
  createSchedule,
  allSchedules,
  updateSchedule,
  deleteSchedule,
} from '@/services/admin.job.workSchedule';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SwapOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Checkbox, Form, Input, message, Popconfirm, Space, TimePicker } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import produce from 'immer';
import { range } from 'lodash';
import moment from 'moment';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

type DayInWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
type DayItem = {
  day: DayInWeek;
  morning_enabled: boolean;
  morning: [moment.Moment, moment.Moment] | null;
  afternoon_enabled: boolean;
  afternoon: [moment.Moment, moment.Moment] | null;
};
type RecordType = {
  id: number;
  name: string;
  workdays: DayItem[];
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

export const calcHours = ({ morning, morning_enabled, afternoon, afternoon_enabled }: DayItem) => {
  let hours = 0;
  if (morning_enabled && morning)
    hours += moment.duration(morning[1].diff(morning[0])).asHours() % 24;
  if (afternoon_enabled && afternoon)
    hours += moment.duration(afternoon[1].diff(afternoon[0])).asHours() % 24;
  return Number(hours.toFixed(1));
};

export const convertFromBackend = (workdays: API.Schedule['workdays']): DayItem[] => {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
    const dayItem = {
      day,
      morning_enabled: false,
      morning: null,
      afternoon_enabled: false,
      afternoon: null,
    } as DayItem;

    const workday = workdays.find((it) => it.day === day);
    if (!workday) return dayItem;

    if (workday.morning_from && workday.morning_to) {
      dayItem.morning_enabled = true;
      dayItem.morning = [moment(workday.morning_from), moment(workday.morning_to)];
    }

    if (workday.afternoon_from && workday.afternoon_to) {
      dayItem.afternoon_enabled = true;
      dayItem.afternoon = [moment(workday.afternoon_from), moment(workday.afternoon_to)];
    }

    return dayItem;
  });
};

const getDisabledHours = (day: DayInWeek, when: 'morning' | 'afternoon', days: DayItem[]) => {
  const foundDay = days.find((it) => it.day === day);
  if (when === 'morning') {
    if (!foundDay?.afternoon_enabled || !foundDay.afternoon) return [];
    return range(foundDay.afternoon[0].hours() + 1, 24);
  }
  // when == 'afternoon'
  if (!foundDay?.morning_enabled || !foundDay.morning) return [];
  return range(0, foundDay.morning[1].hours());
};

export const WorkSchedule: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [days, setDays] = useState(initDays);
  const [curOpen, setCurOpen] = useState<
    | 'Mon-morning'
    | 'Tue-morning'
    | 'Wed-morning'
    | 'Thu-morning'
    | 'Fri-morning'
    | 'Sat-morning'
    | 'Sun-morning'
    | 'Mon-afternoon'
    | 'Tue-afternoon'
    | 'Wed-afternoon'
    | 'Thu-afternoon'
    | 'Fri-afternoon'
    | 'Sat-afternoon'
    | 'Sun-afternoon'
    | 'closed'
  >('closed');

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

  const convertToBackend = (_days: DayItem[]): API.Schedule['workdays'] => {
    return _days
      .filter((it) => (it.morning_enabled && it.morning) || (it.afternoon_enabled && it.afternoon))
      .map((it) => {
        return {
          day: it.day,
          morning_from: it.morning_enabled ? it.morning?.[0] : null,
          morning_to: it.morning_enabled ? it.morning?.[1] : null,
          afternoon_from: it.afternoon_enabled ? it.afternoon?.[0] : null,
          afternoon_to: it.afternoon_enabled ? it.afternoon?.[1] : null,
        };
      });
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

  const columns: ProColumns<RecordType>[] = [
    {
      title: (
        <FormattedMessage id="pages.admin.job.workShift.column.name" defaultMessage="Schedule" />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage id="pages.admin.job.workShift.column.days" defaultMessage="Work days" />
      ),
      dataIndex: 'workdays',
      renderText: (workdays: DayItem[]) =>
        workdays
          .filter(
            (it) => (it.morning_enabled && it.morning) || (it.afternoon_enabled && it.afternoon),
          )
          .map((it) => it.day)
          .join(', '),
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.workShift.column.duration"
          defaultMessage="Weekly work hours"
        />
      ),
      dataIndex: 'workdays',
      renderText: (workdays: DayItem[]) =>
        `${workdays.reduce((acc, cur) => acc + calcHours(cur), 0)} hrs`,
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
            title="Edit this schedule"
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
            title={'Delete this schedule?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteSchedule(record.id),
                'Detete successfully!',
                'Cannot delete schedule!',
              );
            }}
          >
            <Button title="Delete this schedule" size="small" danger>
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
      update: 'Update work schedule',
    },
  };

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        className="card-shadow"
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.workShift.list.title',
          defaultMessage: 'Work schedules',
        })}
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
          const data = await allSchedules();
          return {
            data: data.map((it) => ({ ...it, workdays: convertFromBackend(it.workdays) })),
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
          // if (!midifiedSelectedRecord) return;
          if (crudModalVisible === 'update') {
            if (!selectedRecord) return;
            form.setFieldsValue({
              name: selectedRecord.name,
            });
            setDays(selectedRecord.workdays);
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
            setDays(initDays);
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...selectedRecord,
            ...value,
            workdays: convertToBackend(days),
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createSchedule(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateSchedule(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
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
                      name: `Schedule ${faker.name.title()}`,
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
        <ProFormText
          rules={[{ required: true }]}
          name="name"
          width="xl"
          label={intl.formatMessage({
            id: 'pages.admin.job.workShift.column.name',
            defaultMessage: 'Schedule name',
          })}
        />
        {days.map((it) => (
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
                disabledHours={() => getDisabledHours(it.day, 'morning', days)}
                disabledMinutes={(selectedHour) =>
                  getDisabledMinutes(it.day, 'morning', selectedHour)
                }
                onChange={(values) => onValueChange(it.day, 'morning', values)}
                open={`${it.day}-morning` === curOpen}
                onOpenChange={(open) => setCurOpen(open ? (`${it.day}-morning` as any) : 'closed')}
                renderExtraFooter={() => (
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onSyncAll('morning', it.morning);
                        setCurOpen('closed');
                      }}
                      icon={<SwapOutlined />}
                      title="Sync all"
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onCopyAbove(it.day, 'morning');
                        setCurOpen('closed');
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
                disabledHours={() => getDisabledHours(it.day, 'afternoon', days)}
                disabledMinutes={(selectedHour) =>
                  getDisabledMinutes(it.day, 'afternoon', selectedHour)
                }
                onChange={(values) => onValueChange(it.day, 'afternoon', values)}
                open={`${it.day}-afternoon` === curOpen}
                onOpenChange={(open) =>
                  setCurOpen(open ? (`${it.day}-afternoon` as any) : 'closed')
                }
                renderExtraFooter={() => (
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onSyncAll('afternoon', it.afternoon);
                        setCurOpen('closed');
                      }}
                      icon={<SwapOutlined />}
                      title="Sync all"
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        onCopyAbove(it.day, 'afternoon');
                        setCurOpen('closed');
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
