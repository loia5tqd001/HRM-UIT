import {
  editActual,
  editOvertime,
  getSchedule,
  readAttendances,
  readEmployee,
} from '@/services/employee';
import { allHolidays } from '@/services/timeOff.holiday';
import { formatDurationHm } from '@/utils/utils';
import {
  EditOutlined,
  EnvironmentOutlined,
  LockOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import ProForm, { ModalForm, ProFormDatePicker, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  Badge,
  Button,
  Dropdown,
  Form,
  Menu,
  message,
  Space,
  Tag,
  TimePicker,
  Tooltip,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl, useParams } from 'umi';
import { toolbarButtons } from '../EmployeeAttendance';

type RecordType = API.AttendanceRecord;

const EmployeeAttendanceDetail: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [editModalVisible, setEditModalVisible] = useState<'hidden' | 'actual' | 'overtime'>(
    'hidden',
  );
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const [editModalForm] = useForm();
  const [holidays, setHolidays] = useState<API.Holiday[]>();
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);

  const [employee, setEmployee] = useState<API.Employee>();
  const { id } = useParams<any>();

  useEffect(() => {
    allHolidays().then((fetchData) => setHolidays(fetchData));
    readEmployee(id).then((fetchData) => setEmployee(fetchData));
  }, [id]);

  const isHoliday = useCallback(
    (date: moment.Moment) =>
      !!holidays?.some(
        (it) =>
          moment(it.start_date).isSameOrBefore(date, 'days') &&
          moment(it.end_date).isSameOrAfter(date, 'days'),
      ),
    [holidays],
  );

  const getHourWorkDay = useCallback(
    (date: moment.Moment, schedule: API.Schedule) => {
      if (!schedule) throw Error('Schedule needs to be defined first');
      if (isHoliday(date)) return 0;
      const mapWeekdayToValue = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };

      const calcHours = ({
        morning_from,
        morning_to,
        afternoon_from,
        afternoon_to,
      }: typeof schedule.workdays[0]) => {
        let hours = 0;
        if (morning_from && morning_to)
          hours += moment.duration(moment(morning_to).diff(moment(morning_from))).asHours() % 24;
        if (afternoon_from && afternoon_to)
          hours +=
            moment.duration(moment(afternoon_to).diff(moment(afternoon_from))).asHours() % 24;
        return Number(hours.toFixed(1));
      };

      const workDay = schedule.workdays.find((it) => mapWeekdayToValue[it.day] === date.day());
      // In schedule, find one has weekday (Mon, Tue,..) equals to "date"
      if (!workDay) return 0;
      // Then calculate work hours based on schdule item has been found
      return calcHours(workDay);
    },
    [isHoliday],
  );

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Date',
      key: 'date',
      dataIndex: 'date',
      renderText: (date) => (date ? moment(date).format('ddd - DD MMM yyyy') : ' '),
    },
    {
      title: 'Clock in',
      key: 'check_in',
      dataIndex: 'check_in',
      renderText: (check_in, record) => {
        if (!check_in) return '-';

        return record.check_in_note ? (
          <Tooltip title={`Note: ${record.check_in_note}`}>
            <Tag icon={<MessageOutlined />}>{moment(record.check_in).format('HH:mm')}</Tag>
          </Tooltip>
        ) : (
          moment(record.check_in).format('HH:mm')
        );
      },
    },
    {
      title: 'Clock in location',
      key: 'check_in_location',
      dataIndex: 'check_in_location',
      renderText: (check_in_location) => {
        if (!check_in_location) return '-';

        if (check_in_location === 'Outside')
          return (
            <Tooltip title="Clock in outside of office">
              <Tag icon={<EnvironmentOutlined />} color="error">
                {check_in_location}
              </Tag>
            </Tooltip>
          );
        if (check_in_location) return <Tag icon={<EnvironmentOutlined />}>{check_in_location}</Tag>;
        return '-';
      },
    },
    {
      title: 'Clock out',
      key: 'check_out',
      dataIndex: 'check_out',
      renderText: (check_out, record) => {
        if (!check_out) return '-';

        return record.check_out_note ? (
          <Tooltip title={`Note: ${record.check_out_note}`}>
            <Tag icon={<MessageOutlined />}>{moment(record.check_out).format('HH:mm')}</Tag>
          </Tooltip>
        ) : (
          moment(record.check_out).format('HH:mm')
        );
      },
    },
    {
      title: 'Clock out location',
      key: 'check_out_location',
      dataIndex: 'check_out_location',
      renderText: (check_out_location) => {
        if (!check_out_location) return '-';

        if (check_out_location === 'Outside')
          return (
            <Tooltip title="Clock in outside of office">
              <Tag icon={<EnvironmentOutlined />} color="error">
                {check_out_location}
              </Tag>
            </Tooltip>
          );
        if (check_out_location)
          return <Tag icon={<EnvironmentOutlined />}>{check_out_location}</Tag>;
        return '-';
      },
    },
    {
      title: 'Work schedule',
      key: 'hours_work_by_schedule',
      dataIndex: 'hours_work_by_schedule',
      renderText: (hours_work_by_schedule) => {
        if (hours_work_by_schedule === undefined || hours_work_by_schedule === null) return ' ';
        return formatDurationHm(hours_work_by_schedule * 3600);
      },
    },
    {
      title: 'Actual',
      key: 'actual',
      dataIndex: 'actual_work_hours',
      renderText: (_, record) => {
        if (record.actual_hours_modified) {
          return (
            <Tooltip title={record.actual_hours_modification_note}>
              <Tag icon={<EditOutlined />}>{formatDurationHm(record.actual_work_hours * 3600)}</Tag>
            </Tooltip>
          );
        }
        if (record.actual_work_hours) {
          return formatDurationHm(record.actual_work_hours * 3600);
        }
        return '-';
      },
    },
    {
      title: 'Overtime',
      key: 'overtime',
      dataIndex: 'ot_work_hours',
      renderText: (_, record) => {
        if (record.ot_hours_modified) {
          return (
            <Tooltip title={record.ot_hours_modification_note}>
              <Tag icon={<EditOutlined />}>{formatDurationHm(record.ot_work_hours * 3600)}</Tag>
            </Tooltip>
          );
        }
        if (record.ot_work_hours) {
          return formatDurationHm(record.ot_work_hours * 3600);
        }
        return '-';
      },
    },
    {
      title: 'Decifit',
      key: 'deficit',
      dataIndex: 'decifit',
      renderText: (decifit, record) => {
        if (record.hours_work_by_schedule === undefined || record.hours_work_by_schedule === null)
          return ' ';

        return formatDurationHm(
          (record.actual_work_hours + record.ot_work_hours - record.hours_work_by_schedule) * 3600,
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      renderText: (it) => {
        const symbols = {
          Pending: <Badge status="warning" />,
          Approved: <Badge status="success" />,
          Rejected: <Badge status="error" />,
          Confirmed: <LockOutlined style={{ color: '#52c41a', marginRight: 3 }} />,
        };
        return (
          <>
            {symbols[it]}
            {it}
          </>
        );
      },
    },
    // {
    //   title: 'Note',
    //   key: 'edited_by',
    //   dataIndex: 'edited_by',
    //   renderText: (_, record) => (record.edited_by ? 'hello' : null),
    // },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) =>
        record.type === 'AttendanceDay' ? (
          <Space size="small">
            <Dropdown
              disabled={record.status === 'Confirmed'}
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      setEditModalVisible('actual');
                      setSelectedRecord(record);
                      editModalForm.setFieldsValue({
                        date: record.date,
                        edited_time: moment(
                          formatDurationHm(record.actual_work_hours * 3600),
                          'HH:mm',
                        ),
                      });
                    }}
                  >
                    Edit actual
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setEditModalVisible('overtime');
                      setSelectedRecord(record);
                      editModalForm.setFieldsValue({
                        date: record.date,
                        edited_time: moment(formatDurationHm(record.ot_work_hours * 3600), 'HH:mm'),
                      });
                    }}
                  >
                    Edit overtime
                  </Menu.Item>
                </Menu>
              }
            >
              <Button size="small" disabled={record.status === 'Confirmed'}>
                <EditOutlined />
              </Button>
            </Dropdown>
          </Space>
        ) : null,
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        headerTitle={employee && `${employee.first_name} ${employee.last_name}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        tableAlertRender={false}
        rowSelection={{
          onChange: (_, _selectedRows) => {
            setSelectedRows(_selectedRows);
          },
        }}
        toolBarRender={() => [
          ...toolbarButtons.map((toolbar) => (
            <Button
              onClick={async () => {
                const bulkAction = Promise.all(
                  selectedRows.map((it) => toolbar.api(it.owner, it.id)),
                );
                try {
                  await bulkAction;
                  message.success(`${toolbar.action} successfully!`);
                  actionRef.current?.reloadAndRest?.();
                } catch (err) {
                  message.error('Some error occurred!');
                }
              }}
              disabled={selectedRows.filter(toolbar.filter as any).length === 0}
              {...(toolbar.buttonProps as any)}
            >
              <Space>
                {toolbar.icon}
                {toolbar.action}
              </Space>
            </Button>
          )),
        ]}
        request={async () => {
          const fetchData = await readAttendances(id);

          const schedule = await getSchedule(id).then((it) => it.schedule as API.Schedule);
          // manipulate backend data
          const data = fetchData.map((it) => {
            const first_check_in = it.tracking_data[0];
            const last_check_out = it.tracking_data[it.tracking_data.length - 1];

            return {
              ...it,
              type: 'AttendanceDay',
              date: moment(it.date),
              check_in: first_check_in?.check_in_time,
              check_in_note: first_check_in?.check_in_time && first_check_in?.check_in_note,
              check_in_location:
                first_check_in?.check_in_time &&
                (first_check_in?.check_in_outside ? 'Outside' : first_check_in?.location),
              check_out: last_check_out?.check_out_time,
              check_out_note: last_check_out?.check_out_time && last_check_out?.check_out_note,
              check_out_location:
                last_check_out?.check_out_time &&
                (last_check_out?.check_out_outside ? 'Outside' : last_check_out?.location),
              hours_work_by_schedule: getHourWorkDay(moment(it.date), schedule),
              children: it.tracking_data?.map((x) => {
                return {
                  ...x,
                  id: x.check_in_time,
                  date: undefined,
                  check_in: x.check_in_time,
                  check_in_location:
                    x.check_in_time && (x.check_in_outside ? 'Outside' : x.location),
                  check_out: x.check_out_time,
                  check_out_location:
                    x.check_out_time && (x.check_out_outside ? 'Outside' : x.location),
                  status: ' ',
                };
              }),
            };
          });

          return {
            success: true,
            data: data as any,
            total: data.length,
          };
        }}
        columns={columns}
      />
      <ModalForm
        visible={editModalVisible !== 'hidden'}
        title={`Edit ${editModalVisible} attendance`}
        width="400px"
        onFinish={async (values) => {
          try {
            const edited_to = moment(values.edited_time);
            const work_hours = edited_to.hour() + edited_to.minute() / 60;
            if (editModalVisible === 'actual') {
              await editActual(id, seletectedRecord!.id, {
                actual_work_hours: work_hours,
                actual_hours_modification_note: values.note,
              });
            }
            if (editModalVisible === 'overtime') {
              await editOvertime(id, seletectedRecord!.id, {
                ot_work_hours: work_hours,
                ot_hours_modification_note: values.note,
              });
            }
            message.success('Edit succesfully');
            setEditModalVisible('hidden');
            editModalForm.setFieldsValue({ note: '' });
            actionRef.current?.reload();
          } catch {
            message.error('Edit unsuccesfully');
          }
        }}
        onVisibleChange={(visible) => {
          if (!visible) {
            setEditModalVisible('hidden');
          }
        }}
        form={editModalForm}
      >
        <ProForm.Group>
          <ProFormDatePicker name="date" label="Date" disabled rules={[{ required: true }]} />
          <Form.Item name="edited_time" label="Edited time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={5} />
          </Form.Item>
        </ProForm.Group>
        <ProFormTextArea width="md" rules={[{ required: true }]} name="note" label="Note" />
      </ModalForm>
    </PageContainer>
  );
};

export default EmployeeAttendanceDetail;