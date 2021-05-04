import { readLocation } from '@/services/admin.organization.location';
import {
  checkIn,
  checkOut,
  editActual,
  getSchedule,
  readAttendances,
  allEmployees,
  readEmployee,
} from '@/services/employee';
import { allHolidays } from '@/services/timeOff.holiday';
import { formatDurationHm } from '@/utils/utils';
import {
  CheckCircleOutlined,
  CheckOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  MessageOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import ProForm, { ModalForm, ProFormDatePicker, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, message, Space, Tag, TimePicker, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl, useModel, useParams } from 'umi';

type RecordType = API.AttendanceRecord;

type CurrentLocation = {
  lat: number;
  lng: number;
  office: 'Outside' | string;
  allow_outside: boolean;
};

const MyAttendance: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const currentLocationRef = useRef<CurrentLocation>();
  const [nextStep, setNextStep] = useState<'Clock in' | 'Clock out'>('Clock in');
  const [firstClockIn, setFirstClockIn] = useState<string>('--:--');
  const [lastClockOut, setLastClockOut] = useState<string>('--:--');
  const [lastAction, setLastAction] = useState<string>();
  const [editModalForm] = useForm();
  const [holidays, setHolidays] = useState<API.Holiday[]>();
  const [schedule, setSchedule] = useState<API.Schedule>();
  const [selectedRowsState, setSelectedRows] = useState<RecordType[]>([]);

  const [employee, setEmployee] = useState<API.Employee>();
  const { id } = useParams<any>();

  useEffect(() => {
    allHolidays().then((fetchData) => setHolidays(fetchData));
    getSchedule(id).then((fetchData) => setSchedule(fetchData.schedule as API.Schedule));
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
    (date: moment.Moment) => {
      if (!schedule) return 0;
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
          hours += moment.duration(morning_to.diff(morning_from)).asHours() % 24;
        if (afternoon_from && afternoon_to)
          hours += moment.duration(afternoon_to.diff(afternoon_from)).asHours() % 24;
        return Number(hours.toFixed(1));
      };

      const workDay = schedule.workdays.find((it) => mapWeekdayToValue[it.day] === date.day());
      if (!workDay) return 0;
      return calcHours(workDay);
    },
    [schedule, isHoliday],
  );

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      readLocation(id).then(({ lat, lng, radius, name, allow_outside }) => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(lat, lng),
          new google.maps.LatLng(latitude, longitude),
        );
        currentLocationRef.current = {
          lat: latitude,
          lng: longitude,
          office: distance > radius ? 'Outside' : name,
          allow_outside,
        };
      });
    });
  }

  // useEffect(() => {
  //   readAttendances(initialState!.currentUser!.id).then((fetchData) => setAttendances(fetchData));
  // }, [initialState]);

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
      title: 'Actual',
      key: 'actual',
      dataIndex: 'actual',
      renderText: (_, record) => {
        if (record.actual_hours_modified) {
          return (
            <Tooltip title={record.actual_hours_modification_note}>
              <Tag icon={<EditOutlined />}>{record.actual}</Tag>
            </Tooltip>
          );
        }
        if (record.actual) {
          return record.actual;
        }
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
      title: 'Overtime',
      key: 'overtime',
      dataIndex: 'overtime',
      renderText: (overtime) => {
        if (typeof overtime === 'string') return overtime;
        if (typeof overtime !== 'number') return overtime;
        return formatDurationHm(overtime * 3600);
      },
    },
    {
      title: 'Decifit',
      key: 'actual',
      dataIndex: 'decifit',
      renderText: (decifit, record) => {
        if (record.hours_work_by_schedule === undefined || record.hours_work_by_schedule === null)
          return ' ';
        return formatDurationHm((record.actual_work_hours - record.hours_work_by_schedule) * 3600);
      },
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
            <Button
              title="Edit actual"
              size="small"
              onClick={() => {
                setEditModalVisible(true);
                setSelectedRecord(record);
                editModalForm.setFieldsValue({
                  date: record.date,
                  actual_work_hours: moment(
                    formatDurationHm(record.actual_work_hours * 3600),
                    'HH:mm',
                  ),
                });
              }}
            >
              <EditOutlined />
            </Button>
            {/* Delete button: might need in the future */}
            {/* <Popconfirm
            placement="right"
            title={'Delete this employee?'}
            onConfirm={async () => {
              await onCrudOperation(() => deleteEmployee(record.id), 'Cannot delete employee!');
            }}
          >
            <Button title="Delete this employee" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm> */}
          </Space>
        ) : null,
    },
  ];

  return (
    <PageContainer title={employee && `${employee.first_name} ${employee.last_name}`}>
      <ProTable<RecordType, API.PageParams>
        headerTitle="Attendance"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => [
          <Button
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <CheckOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Approve"
              />
            </Space>
          </Button>,
          <Button
            onClick={() => {
              setClockModalVisible(true);
            }}
            danger
          >
            <Space>
              <RollbackOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Revert"
              />
            </Space>
          </Button>,
          <Button
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <CheckCircleOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Confirm"
              />
            </Space>
          </Button>,
        ]}
        request={async () => {
          const fetchData = await readAttendances(id);
          // Handle for today data
          const todayData = fetchData.find((it) => it.date === moment().format('YYYY-MM-DD'));
          if (todayData) {
            if (todayData.tracking_data.length) {
              // Handle for: firstClock, lastClockOut, lastAction, nextStep
              setFirstClockIn(moment(todayData.tracking_data[0].check_in_time).format('HH:mm'));
              const continueStep = todayData.tracking_data[todayData.tracking_data.length - 1]
                .check_out_time
                ? 'Clock in'
                : 'Clock out';
              setNextStep(continueStep);
              const lastClockOutRecord =
                todayData.tracking_data[
                  todayData.tracking_data.length - (continueStep === 'Clock in' ? 1 : 2)
                ];
              if (lastClockOutRecord) {
                setLastClockOut(moment(lastClockOutRecord.check_out_time).format('HH:mm'));
              }

              const lastRecord = todayData.tracking_data[todayData.tracking_data.length - 1];
              setLastAction(
                lastRecord.check_out_time
                  ? `Clocked out at ${moment(lastRecord.check_out_time).format('HH:mm')}`
                  : `Clocked in at ${moment(lastRecord.check_in_time).format('HH:mm')}`,
              );
            }
          }
          // manipulate backend data
          const data = fetchData.map((it) => {
            const first_check_in = it.tracking_data[0];
            const last_check_out = it.tracking_data[it.tracking_data.length - 1];
            return {
              ...it,
              type: 'AttendanceDay',
              date: moment(it.date, 'YYYY-MM-DD'),
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
              hours_work_by_schedule: getHourWorkDay(moment(it.date)),
              actual: formatDurationHm(it.actual_work_hours * 3600),
              // decifit: 0,
              overtime: it.ot_work_hours, // formatDurationHm(it.ot_work_hours * 3600),
              children: it.tracking_data.map((x) => {
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
                  overtime: x.overtime_type,
                  status: ' ',
                  actual:
                    x.check_out_time &&
                    formatDurationHm(
                      moment(x.check_out_time).diff(moment(x.check_in_time), 'seconds'),
                    ),
                };
              }),
            };
          });

          return {
            success: true,
            data,
            total: fetchData.length,
          };
        }}
        columns={columns}
      />
      <ModalForm
        visible={clockModalVisible}
        title={`${nextStep} at ${moment().format('HH:mm')}`}
        width="400px"
        onFinish={async (values) => {
          try {
            const { lat, lng } = currentLocationRef.current!;
            if (nextStep === 'Clock in') {
              await checkIn(id, {
                check_in_lat: lat,
                check_in_lng: lng,
                check_in_note: values.note,
              });
              message.success('Clocked in successfully');
            } else {
              await checkOut(id, {
                check_out_lat: lat,
                check_out_lng: lng,
                check_out_note: values.note,
              });
              message.success('Clocked out successfully');
            }
            actionRef.current?.reload();
          } catch {
            message.error(`${nextStep} unsuccessfully`);
          }

          setClockModalVisible(false);
        }}
        onVisibleChange={(visible) => setClockModalVisible(visible)}
      >
        <Space style={{ marginBottom: 20 }}>
          <EnvironmentOutlined />
          {currentLocationRef.current?.office === 'Outside'
            ? 'Outside the designated area'
            : currentLocationRef.current?.office}
        </Space>
        <ProFormTextArea width="md" rules={[{ required: true }]} name="note" label="Note" />
      </ModalForm>
      <ModalForm
        visible={editModalVisible}
        title={`Edit actual attendance`}
        width="400px"
        onFinish={async (values) => {
          try {
            const edited_to = moment(values.actual_work_hours);
            const work_hours = edited_to.hour() + edited_to.minute() / 60;
            await editActual(id, seletectedRecord!.id, {
              actual_work_hours: work_hours,
              actual_hours_modification_note: values.note,
            });
            message.success('Edit succesfully');
            setEditModalVisible(false);
            actionRef.current?.reload();
          } catch {
            message.error('Edit unsuccesfully');
          }
        }}
        onVisibleChange={(visible) => setEditModalVisible(visible)}
        form={editModalForm}
      >
        <ProForm.Group>
          <ProFormDatePicker name="date" label="Date" disabled rules={[{ required: true }]} />
          <Form.Item name="actual_work_hours" label="Actual hours" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={5} />
          </Form.Item>
        </ProForm.Group>
        <ProFormTextArea width="md" rules={[{ required: true }]} name="note" label="Note" />
      </ModalForm>
    </PageContainer>
  );
};

export default MyAttendance;
