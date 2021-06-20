import { allPeriods } from '@/services/attendance';
import { editActual, editOvertime, readAttendances, readEmployee } from '@/services/employee';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { formatDurationHm } from '@/utils/utils';
import {
  CommentOutlined,
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
  Select,
  Space,
  Tag,
  TimePicker,
  Tooltip,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Access, FormattedMessage, history, Link, useAccess, useIntl, useParams } from 'umi';
import { toolbarButtons } from '../EmployeeAttendance';
import { renderCheckInImage } from '../MyAttendance';

type RecordType = API.AttendanceRecord;

const EmployeeAttendanceDetail: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [editModalVisible, setEditModalVisible] = useState<'hidden' | 'actual' | 'overtime'>(
    'hidden',
  );
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const [editModalForm] = useForm();
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);

  const [employee, setEmployee] = useState<API.Employee>();
  const { id } = useParams<any>();
  const access = useAccess();

  const { period } = history.location.query as any;
  const [periods, setPeriods] = useState<API.Period[]>();

  useEffect(() => {
    allPeriods()
      .then((fetchData) => fetchData.reverse())
      .then((fetchData) => {
        setPeriods(fetchData);
        if (period === undefined) history.replace(`?period=${fetchData?.[0].id}`);
        actionRef.current?.reload();
      });
  }, [period]);

  useEffect(() => {
    readEmployee(id).then((fetchData) => setEmployee(fetchData));
  }, [id]);

  const columns: ProColumns<RecordType>[] = [
    {
      title: intl.formatMessage({ id: 'property.date' }),
      key: 'date',
      dataIndex: 'date',
      renderText: (date) => (date ? moment(date).format('ddd - DD MMM yyyy') : ' '),
    },
    {
      title: intl.formatMessage({ id: 'property.check_in' }),
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
      title: intl.formatMessage({ id: 'property.check_in_location' }),
      key: 'check_in_location',
      dataIndex: 'check_in_location',
      renderText: (check_in_location) => {
        if (!check_in_location) return '-';

        if (check_in_location === 'Outside')
          return (
            <Tooltip title={intl.formatMessage({ id: 'property.attendance.outside.long' })}>
              <Tag icon={<EnvironmentOutlined />} color="error">
                {intl.formatMessage({ id: 'property.attendance.outside.short' })}
              </Tag>
            </Tooltip>
          );
        if (check_in_location)
          return (
            <Tag icon={<EnvironmentOutlined />} color="green">
              {check_in_location}
            </Tag>
          );
        return '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'property.check_in_image' }),
      key: 'check_in_image',
      dataIndex: 'check_in_image',
      valueType: 'avatar',
      renderText: (text, record) => renderCheckInImage(text, record, 'check_in_face_authorized'),
    },
    {
      title: intl.formatMessage({ id: 'property.check_out' }),
      key: 'check_out',
      dataIndex: 'check_out',
      renderText: (check_out, record) => {
        if (!check_out) return '-';

        return record.check_out_note ? (
          <Tooltip
            title={`${intl.formatMessage({ id: 'property.note' })}: ${record.check_out_note}`}
          >
            <Tag icon={<MessageOutlined />}>{moment(record.check_out).format('HH:mm')}</Tag>
          </Tooltip>
        ) : (
          moment(record.check_out).format('HH:mm')
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'property.check_out_location' }),
      key: 'check_out_location',
      dataIndex: 'check_out_location',
      renderText: (check_out_location) => {
        if (!check_out_location) return '-';

        if (check_out_location === 'Outside')
          return (
            <Tooltip title={intl.formatMessage({ id: 'property.attendance.outside.long' })}>
              <Tag icon={<EnvironmentOutlined />} color="error">
                {intl.formatMessage({ id: 'property.attendance.outside.short' })}
              </Tag>
            </Tooltip>
          );
        if (check_out_location)
          return (
            <Tag icon={<EnvironmentOutlined />} color="green">
              {check_out_location}
            </Tag>
          );
        return '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'property.check_out_image' }),
      key: 'check_out_image',
      dataIndex: 'check_out_image',
      valueType: 'avatar',
      renderText: (text, record) => renderCheckInImage(text, record, 'check_out_face_authorized'),
    },
    {
      title: intl.formatMessage({ id: 'property.hours_work_by_schedule' }),
      key: 'hours_work_by_schedule',
      dataIndex: 'hours_work_by_schedule',
      renderText: (hours_work_by_schedule) => {
        if (hours_work_by_schedule === undefined || hours_work_by_schedule === null) return ' ';
        return formatDurationHm(hours_work_by_schedule * 3600);
      },
    },
    {
      title: intl.formatMessage({ id: 'property.actual_work_hours' }),
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
      title: intl.formatMessage({ id: 'property.ot_work_hours' }),
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
      title: intl.formatMessage({ id: 'property.decifit' }),
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
      title: <FormattedMessage id="property.status" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      renderText: (it) => {
        const mapStatus = {
          Pending: {
            icon: <Badge status="warning" />,
            text: intl.formatMessage({ id: 'property.status.Pending' }),
          },
          Approved: {
            icon: <Badge status="success" />,
            text: intl.formatMessage({ id: 'property.status.Approved' }),
          },
          Rejected: {
            icon: <Badge status="error" />,
            text: intl.formatMessage({ id: 'property.status.Rejected' }),
          },
          Confirmed: {
            icon: <LockOutlined style={{ color: '#52c41a', marginRight: 3 }} />,
            text: intl.formatMessage({ id: 'property.status.Confirmed' }),
          },
        } as const;
        return (
          <>
            {mapStatus[it]?.icon}
            {mapStatus[it]?.text || it}
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
    (access['can_edit_actual_hours_attendance'] ||
      access['can_edit_overtime_hours_attendance']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      width: 'min-content',
      render: (dom, record) =>
        record.type === 'AttendanceDay' ? (
          <Space size="small">
            <Dropdown
              disabled={record.status === 'Confirmed'}
              overlay={
                <Menu>
                  {access['can_edit_actual_hours_attendance'] && (
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
                      {intl.formatMessage({ id: 'property.actions.editActual' })}
                    </Menu.Item>
                  )}
                  {access['can_edit_overtime_hours_attendance'] && (
                    <Menu.Item
                      onClick={() => {
                        setEditModalVisible('overtime');
                        setSelectedRecord(record);
                        editModalForm.setFieldsValue({
                          date: record.date,
                          edited_time: moment(
                            formatDurationHm(record.ot_work_hours * 3600),
                            'HH:mm',
                          ),
                        });
                      }}
                    >
                      {intl.formatMessage({ id: 'property.actions.editOvertime' })}
                    </Menu.Item>
                  )}
                </Menu>
              }
            >
              <Button size="small" disabled={record.status === 'Confirmed'}>
                <EditOutlined />
              </Button>
            </Dropdown>
            <Link to={'/message'}>
              <Badge count={Math.round(Math.random())}>
                <Button title={`Khieu nai`} size="small">
                  <CommentOutlined />
                </Button>
              </Badge>
            </Link>
          </Space>
        ) : null,
    },
  ];

  const dict = {
    overtime: intl.formatMessage({ id: 'property.actions.editOvertime' }),
    actual: intl.formatMessage({ id: 'property.actions.editActual' }),
  };

  const tableSettings = useTableSettings();

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        {...tableSettings}
        className="card-shadow header-capitalize"
        headerTitle={
          employee &&
          `${intl.formatMessage({ id: 'property.attendanceOf' })} ${employee.first_name} ${
            employee.last_name
          }`
        }
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        tableAlertRender={false}
        rowSelection={
          toolbarButtons.reduce((acc, cur) => acc || access[cur.access], false) && {
            onChange: (_, _selectedRows) => {
              setSelectedRows(_selectedRows);
            },
          }
        }
        toolBarRender={() => [
          <Select<number>
            loading={!periods}
            style={{ minWidth: 100 }}
            value={Number(period)}
            onChange={(value) => {
              history.replace(`?period=${value}`);
              actionRef.current?.reload();
            }}
          >
            {periods?.map((it) => (
              <Select.Option value={it.id}>
                {moment(it.start_date).format('DD MMM YYYY')} →{' '}
                {moment(it.end_date).format('DD MMM YYYY')}
              </Select.Option>
            ))}
          </Select>,
          ...toolbarButtons.map((toolbar) => (
            <Access accessible={access[toolbar.access]}>
              <Button
                onClick={async () => {
                  const bulkAction = Promise.all(
                    selectedRows.map((it) => toolbar.api(it.owner, it.id)),
                  );
                  try {
                    await bulkAction;
                    message.success(
                      `${toolbar.action} ${intl.formatMessage({
                        id: 'property.actions.successfully',
                      })}`,
                    );
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
            </Access>
          )),
        ]}
        loading={periods === undefined ? true : undefined}
        request={async () => {
          const fetchData = await readAttendances(id, {
            params: { period_id: period },
          });
          fetchData.reverse(); // most recent comes first

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
              check_in_image: first_check_in?.check_in_image,
              check_in_face_authorized: first_check_in?.check_in_face_authorized,
              check_out: last_check_out?.check_out_time,
              check_out_note: last_check_out?.check_out_time && last_check_out?.check_out_note,
              check_out_location:
                last_check_out?.check_out_time &&
                (last_check_out?.check_out_outside ? 'Outside' : last_check_out?.location),
              check_out_image: last_check_out?.check_out_image,
              check_out_face_authorized: last_check_out?.check_out_face_authorized,
              hours_work_by_schedule: it.schedule_hours,
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
        title={dict[editModalVisible]}
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
            message.success(
              intl.formatMessage({
                id: 'error.updateSuccessfully',
                defaultMessage: 'Update successfully!',
              }),
            );
            setEditModalVisible('hidden');
            editModalForm.setFieldsValue({ note: '' });
            actionRef.current?.reload();
          } catch {
            message.error(
              intl.formatMessage({
                id: 'error.updateUnsuccessfully',
                defaultMessage: 'Update unsuccessfully!',
              }),
            );
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
          <ProFormDatePicker
            name="date"
            label={intl.formatMessage({ id: 'property.date' })}
            disabled
            rules={[{ required: true }]}
          />
          <Form.Item
            name="edited_time"
            label={intl.formatMessage({ id: 'property.edited_time' })}
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" minuteStep={5} />
          </Form.Item>
        </ProForm.Group>
        <ProFormTextArea
          width="md"
          rules={[{ required: true }]}
          name="note"
          label={intl.formatMessage({ id: 'property.note' })}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default EmployeeAttendanceDetail;
