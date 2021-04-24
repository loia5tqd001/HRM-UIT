import { readLocation } from '@/services/admin.organization.location';
import { checkIn, checkOut, readAttendances } from '@/services/employee';
import { formatDurationHm } from '@/utils/utils';
import {
  EditOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import ProForm, { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, DatePicker, Form, message, Space, Tag, TimePicker, Tooltip } from 'antd';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { useIntl, useModel } from 'umi';
import { CrudModal } from './components/CrudModal';

type RecordType = API.AttendanceRecord;

type CurrentLocation = {
  lat: number;
  lng: number;
  office: 'Outside' | string;
};

const MyAttendance: React.FC = () => {
  const intl = useIntl();
  const { actionRef } = useModel('employee');
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const [editedTime, setEditedTime] = useState();
  // const isOutsideRef = useRef(true);
  const currentLocationRef = useRef<CurrentLocation>();
  const [nextStep, setNextStep] = useState<'Clock in' | 'Clock out'>('Clock in');
  const [firstClockIn, setFirstClockIn] = useState<string>('--:--');
  const [lastClockOut, setLastClockOut] = useState<string>('--:--');
  const [lastAction, setLastAction] = useState<string>();
  // const [attendances, setAttendances] = useState<API.EmployeeAttendance[]>();
  // console.log('>  ~ file: index.tsx ~ line 42 ~ attendances', attendances);

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.currentUser!;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      readLocation(id).then(({ lat, lng, radius, name }) => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(lat, lng),
          new google.maps.LatLng(latitude, longitude),
        );
        currentLocationRef.current = {
          lat: latitude,
          lng: longitude,
          office: distance > radius ? 'Outside' : name,
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

        const renderLocation = (check_in_location = record.check_in_location) => {
          if (check_in_location === 'Outside')
            return (
              <Tooltip title="Clock in outside of office">
                <Tag icon={<EnvironmentOutlined />} color="error">
                  {check_in_location}
                </Tag>
              </Tooltip>
            );
          if (check_in_location)
            return <Tag icon={<EnvironmentOutlined />}>{check_in_location}</Tag>;
          return '-';
        };

        return (
          <>
            <Tooltip title={record.check_in_note ? `Note: ${record.check_in_note}` : false}>
              <Tag icon={record.check_in_note ? <MessageOutlined /> : null}>
                {moment(record.check_in).format('HH:mm')}
              </Tag>
            </Tooltip>
            {renderLocation(record.check_in_location)}
          </>
        );
      },
    },
    {
      title: 'Clock out',
      key: 'check_out',
      dataIndex: 'check_out',
      renderText: (check_out, record) => {
        if (!check_out) return '-';

        const renderLocation = (check_out_location = record.check_out_location) => {
          if (check_out_location === 'Outside')
            return (
              <Tooltip title="Clock out outside of office">
                <Tag icon={<EnvironmentOutlined />} color="error">
                  {check_out_location}
                </Tag>
              </Tooltip>
            );
          if (check_out_location)
            return <Tag icon={<EnvironmentOutlined />}>{check_out_location}</Tag>;
          return '-';
        };

        return (
          <>
            <Tooltip title={record.check_out_note ? `Note: ${record.check_out_note}` : false}>
              <Tag icon={record.check_out_note ? <MessageOutlined /> : null}>
                {moment(record.check_out).format('HH:mm')}
              </Tag>
            </Tooltip>
            {renderLocation(record.check_out_location)}
          </>
        );
      },
    },
    {
      title: 'Actual',
      key: 'actual',
      dataIndex: 'actual',
      renderText: (_, record) => {
        if (record.actual_hours_modified) {
          return (
            <Tooltip title={record.actual_hours_modified}>
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
      renderText: (hours_work_by_schedule) => hours_work_by_schedule || ' ',
    },
    {
      title: 'Overtime',
      key: 'overtime',
      dataIndex: 'overtime',
    },
    {
      title: 'Decifit',
      key: 'actual',
      dataIndex: 'decifit',
      renderText: (decifit) => (decifit === undefined ? ' ' : decifit),
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
      title: 'Note',
      key: 'edited_by',
      dataIndex: 'edited_by',
      // renderText: (_, record) => (record.edited_by ? 'hello' : null),
    },
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
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        headerTitle="My attendance"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <>
            {lastAction ? (
              <>
                <Tag>First clock in: {firstClockIn}</Tag>
                <Tag>Last clock out: {lastClockOut}</Tag>
                <Tag>Last action: {lastAction}</Tag>
              </>
            ) : (
              <Tag>No activities today yet</Tag>
            )}
          </>,
          <Button
            type="primary"
            key="primary"
            onClick={async () => {
              if (currentLocationRef.current?.office === 'Outside') {
                setClockModalVisible(true);
              } else {
                try {
                  const { lat, lng } = currentLocationRef.current!;
                  if (nextStep === 'Clock in') {
                    await checkIn(id, { check_in_lat: lat, check_in_lng: lng });
                    message.success('Clocked in successfully');
                  } else {
                    await checkOut(id, { check_out_lat: lat, check_out_lng: lng });
                    message.success('Clocked out successfully');
                  }
                  actionRef.current?.reload();
                } catch {
                  message.error(`${nextStep} unsuccessfully`);
                }
              }
            }}
            loading={!nextStep}
          >
            <Space>
              <HistoryOutlined />
              {nextStep}
              {/* <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Clock in"
              /> */}
            </Space>
          </Button>,
        ]}
        // @ts-ignore
        request={async () => {
          // const fetchData = [
          //   {
          //     id: 1,
          //     type: 'AttendanceDay',
          //     date: moment('08:00', 'hh:mm'),
          //     check_in: moment('08:00', 'hh:mm'),
          //     check_in_note: 'Em di som',
          //     check_in_location: 'Hawaii',
          //     check_out: moment('20:00', 'hh:mm'),
          //     check_out_note: 'Em OT',
          //     check_out_location: 'Outside',
          //     hours_work_by_schedule: '8h',
          //     actual: '8h',
          //     decifit: 0,
          //     overtime: '1h30m',
          //     status: 'Approved',
          //     edited_by: 1,
          //     edited_when: moment(),
          //     edited_to: '10h',
          //     children: [
          //       {
          //         id: 2,
          //         date: undefined,
          //         check_in: moment('08:00', 'hh:mm'),
          //         check_in_note: 'Em di som',
          //         check_in_location: 'Hawaii',
          //         check_out: moment('12:00', 'hh:mm'),
          //         check_out_note: undefined,
          //         check_out_location: 'Outside',
          //         hours_work_by_schedule: undefined,
          //         actual: undefined,
          //         overtime: undefined,
          //         status: undefined,
          //         edited_by: undefined,
          //         edited_when: undefined,
          //         edited_to: undefined,
          //       },
          //       {
          //         id: 2,
          //         date: undefined,
          //         check_in: moment('13:00', 'hh:mm'),
          //         check_in_note: undefined,
          //         check_in_location: 'Outside',
          //         check_out: moment('17:00', 'hh:mm'),
          //         check_out_note: undefined,
          //         check_out_location: 'Outside',
          //         hours_work_by_schedule: undefined,
          //         actual: undefined,
          //         overtime: undefined,
          //         status: undefined,
          //         edited_by: undefined,
          //         edited_when: undefined,
          //         edited_to: undefined,
          //       },
          //       {
          //         id: 2,
          //         date: undefined,
          //         check_in: moment('18:30', 'hh:mm'),
          //         check_in_note: undefined,
          //         check_in_location: 'Outside',
          //         check_out: moment('20:00', 'hh:mm'),
          //         check_out_note: undefined,
          //         check_out_location: 'Outside',
          //         hours_work_by_schedule: undefined,
          //         actual: undefined,
          //         overtime: 'OT ngoài giờ',
          //         status: undefined,
          //         edited_by: undefined,
          //         edited_when: undefined,
          //         edited_to: undefined,
          //       },
          //     ],
          //   },
          //   {
          //     id: 3,
          //     type: 'AttendanceDay',
          //     date: moment('08:00', 'hh:mm'),
          //     check_in: moment('08:00', 'hh:mm'),
          //     check_in_note: 'Em di som',
          //     check_in_location: 'Hawaii',
          //     check_out: moment('20:00', 'hh:mm'),
          //     check_out_note: 'Em OT',
          //     check_out_location: 'Outside',
          //     hours_work_by_schedule: '8h',
          //     actual: '8h',
          //     decifit: 0,
          //     overtime: '1h30m',
          //     status: 'Pending',
          //     edited_by: 1,
          //     edited_when: moment(),
          //     edited_to: '10h',
          //     children: [
          //       {
          //         id: 2,
          //         date: undefined,
          //         check_in: moment('08:00', 'hh:mm'),
          //         check_in_note: 'Em di som',
          //         check_in_location: 'Hawaii',
          //         check_out: moment('12:00', 'hh:mm'),
          //         check_out_note: undefined,
          //         check_out_location: 'Outside',
          //         hours_work_by_schedule: undefined,
          //         actual: undefined,
          //         overtime: undefined,
          //         status: undefined,
          //         edited_by: undefined,
          //         edited_when: undefined,
          //         edited_to: undefined,
          //       },
          //     ],
          //   },
          // ];

          const fetchData = await readAttendances(initialState!.currentUser!.id);
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
              check_in_note: first_check_in?.check_in_note,
              check_in_location: first_check_in?.check_in_outside
                ? 'Outside'
                : first_check_in?.location,
              check_out: last_check_out?.check_out_time,
              check_out_note: last_check_out?.check_out_note,
              check_out_location: last_check_out?.check_out_outside
                ? 'Outside'
                : last_check_out?.location,
              // hours_work_by_schedule: '8h',
              actual: formatDurationHm(it.actual_work_hours * 3600),
              // decifit: 0,
              overtime: formatDurationHm(it.ot_work_hours * 3600),
              children: it.tracking_data.map((x) => {
                return {
                  ...x,
                  id: x.check_in_time,
                  date: undefined,
                  check_in: x.check_in_time,
                  check_in_location: x.check_in_outside ? 'Outside' : x.location,
                  check_out: x.check_out_time,
                  check_out_location: x.check_out_outside ? 'Outside' : x.location,
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
      <CrudModal />
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
        onFinish={() => setEditModalVisible(false)}
        onVisibleChange={(visible) => setEditModalVisible(visible)}
      >
        <ProForm.Group>
          <Form.Item>
            <DatePicker value={seletectedRecord?.date} disabled />
          </Form.Item>
          <Form.Item>
            <TimePicker format="HH:mm" minuteStep={5} />
          </Form.Item>
        </ProForm.Group>
        <ProFormTextArea width="md" rules={[{ required: true }]} name="note" label="Note" />
      </ModalForm>
    </PageContainer>
  );
};

export default MyAttendance;
