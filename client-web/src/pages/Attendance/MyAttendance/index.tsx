import { getAppConfig } from '@/services/appConfig';
import { allPeriods, attendanceHelper } from '@/services/attendance';
import { detectFaces } from '@/services/auth';
import { checkIn, checkOut, readAttendances } from '@/services/employee';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { formatDurationHm } from '@/utils/utils';
import {
  CameraOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CommentOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  LockOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  Alert,
  Badge,
  Button,
  message,
  notification,
  Popover,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, history, Link, useIntl, useModel } from 'umi';

type RecordType = API.AttendanceRecord;

type CurrentLocation = {
  lat: number;
  lng: number;
};

export const renderCheckInImage = (text: any, record: RecordType, checkKey: keyof RecordType) => {
  return (
    text && (
      <Popover content={<img style={{ width: 500 }} src={text} />}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Avatar src={text}></Avatar>
          {record[checkKey] ? (
            <CheckCircleFilled
              style={{
                color: 'rgb(82, 196, 26)',
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'white',
                borderRadius: '50%',
                fontSize: 16,
              }}
            />
          ) : (
            <CloseCircleFilled
              style={{
                color: 'rgb(255, 77, 79)',
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'white',
                borderRadius: '50%',
                fontSize: 16,
              }}
            />
          )}
        </div>
      </Popover>
    )
  );
};

const CAMERA_WIDTH = 350;
const CAMERA_HEIGHT = 260;

const MyAttendance: React.FC = () => {
  const intl = useIntl();
  // const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const actionRef = useRef<ActionType>();
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation>();
  const [clockModalForm] = useForm();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>();
  const [locationDenied, setLocationDenied] = useState(false);
  const [faceDenied, setFaceDenied] = useState(false);
  const [periods, setPeriods] = useState<API.Period[]>();
  const [selectedPeriod, setSelectedPeriod] = useState<any>();
  const tableSettings = useTableSettings();
  const attendanceState = useAsyncData<API.AttendanceHelper>(attendanceHelper);
  const [distance, setDistance] = useState<number>();
  const appConfig = useAsyncData<API.AppConfig>(getAppConfig);
  const [isPaused, setIsPaused] = useState(false);
  const capturedFaceBlobRef = useRef<Blob>();
  const [capturing, setCapturing] = useState(false);
  const [captureValid, setCaptureValid] = useState(false);

  const nextStepTranslate = {
    'Clock in': intl.formatMessage({ id: 'property.check_in' }),
    'clock in': intl.formatMessage({ id: 'property.check_in' }),
    'Clock out': intl.formatMessage({ id: 'property.check_out' }),
    'clock out': intl.formatMessage({ id: 'property.check_out' }),
    undefined: null,
  };

  useEffect(() => {
    allPeriods()
      .then((fetchData) => fetchData.reverse())
      .then((fetchData) => {
        setSelectedPeriod(fetchData[0]?.id);
        setPeriods(fetchData);
        actionRef.current?.reload();
      });
  }, []);

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.currentUser!;

  const clearUpCamera = useCallback(() => {
    if (clockModalVisible === false) {
      videoRef.current?.pause();
      streamRef.current?.getTracks().forEach((it) => it.stop());
    }
  }, [clockModalVisible]);

  useEffect(() => {
    clearUpCamera();
  });

  React.useEffect(() => {
    if (navigator.geolocation && attendanceState.data?.location) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const { lat, lng } = attendanceState.data!.location!;
          setDistance(
            window.google?.maps.geometry.spherical.computeDistanceBetween(
              new window.google.maps.LatLng(lat, lng),
              new window.google.maps.LatLng(latitude, longitude),
            ),
          );
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          if (err.PERMISSION_DENIED) {
            setLocationDenied(true);
          }
        },
      );
    }
  }, [id, attendanceState.data, attendanceState.data?.location]);

  const isOutside =
    attendanceState.isLoading ||
    attendanceState.isError ||
    !!(
      distance &&
      attendanceState.data?.location &&
      distance > attendanceState.data.location.radius
    );
  const errorMustWorkInOffice = isOutside && !attendanceState.data?.location?.allow_outside;
  const clockButtonDisabled =
    errorMustWorkInOffice ||
    attendanceState.data?.location === null ||
    initialState?.currentUser?.status !== 'Working';
  const clockButtonLoading =
    attendanceState.isLoading || (attendanceState.data?.location !== null && !distance);

  useEffect(() => {
    const { action } = history.location.query as any;
    if (action === 'nextStep' && appConfig.data && !clockButtonDisabled && !clockButtonLoading) {
      setClockModalVisible(true);
      history.replace('/attendance/me');
    }
  }, [clockButtonDisabled, clockButtonLoading, appConfig.data]);

  const columns: ProColumns<RecordType>[] = [
    {
      title: intl.formatMessage({ id: 'property.date' }),
      dataIndex: 'date',
      renderText: (date) => (date ? moment(date).format('ddd - DD MMM yyyy') : ' '),
    },
    {
      title: intl.formatMessage({ id: 'property.check_in' }),
      dataIndex: 'check_in',
      renderText: (check_in, record) => {
        if (!check_in) return '-';

        return record.check_in_note ? (
          <Tooltip
            title={`${intl.formatMessage({ id: 'property.note' })}: ${record.check_in_note}`}
          >
            <Tag icon={<MessageOutlined />}>{moment(record.check_in).format('HH:mm')}</Tag>
          </Tooltip>
        ) : (
          moment(record.check_in).format('HH:mm')
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'property.check_in_location' }),
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
      dataIndex: 'check_in_image',
      valueType: 'avatar',
      renderText: (text, record) => renderCheckInImage(text, record, 'check_in_face_authorized'),
    },
    {
      title: intl.formatMessage({ id: 'property.check_out' }),
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
      dataIndex: 'check_out_image',
      valueType: 'avatar',
      renderText: (text, record) => renderCheckInImage(text, record, 'check_out_face_authorized'),
    },
    {
      title: intl.formatMessage({ id: 'property.hours_work_by_schedule' }),
      dataIndex: 'hours_work_by_schedule',
      renderText: (hours_work_by_schedule) => {
        if (hours_work_by_schedule === undefined || hours_work_by_schedule === null) return ' ';
        return formatDurationHm(hours_work_by_schedule * 3600);
      },
    },
    {
      title: intl.formatMessage({ id: 'property.actual_work_hours' }),
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
    {
      title: intl.formatMessage({ id: 'property.actions' }),
      fixed: 'right',
      align: 'center',
      width: 'min-content',
      key: 'id',
      search: false,
      render: (dom, record) => (
        <Link to={'/message'}>
          <Button title={`Khieu nai`} size="small">
            <CommentOutlined />
          </Button>
        </Link>
      ),
    },
    // {
    //   title: 'Note',
    //   key: 'edited_by',
    //   dataIndex: 'edited_by',
    //   renderText: (_, record) => (record.edited_by ? 'hello' : null),
    // },
    // {
    //   title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
    //   key: 'action',
    //   fixed: 'right',
    //   align: 'center',
    //   search: false,
    //   render: (dom, record) =>
    //     record.type === 'AttendanceDay' ? (
    //       <Space size="small">
    //         <Dropdown
    //           disabled={record.status === 'Confirmed'}
    //           overlay={
    //             <Menu>
    //               <Menu.Item
    //                 onClick={() => {
    //                   setEditModalVisible('actual');
    //                   setSelectedRecord(record);
    //                   editModalForm.setFieldsValue({
    //                     date: record.date,
    //                     edited_time: moment(
    //                       formatDurationHm(record.actual_work_hours * 3600),
    //                       'HH:mm',
    //                     ),
    //                   });
    //                 }}
    //               >
    //                 Edit actual
    //               </Menu.Item>
    //               <Menu.Item
    //                 onClick={() => {
    //                   setEditModalVisible('overtime');
    //                   setSelectedRecord(record);
    //                   editModalForm.setFieldsValue({
    //                     date: record.date,
    //                     edited_time: moment(formatDurationHm(record.ot_work_hours * 3600), 'HH:mm'),
    //                   });
    //                 }}
    //               >
    //                 Edit overtime
    //               </Menu.Item>
    //             </Menu>
    //           }
    //         >
    //           <Button size="small" disabled={record.status === 'Confirmed'}>
    //             <EditOutlined />
    //           </Button>
    //         </Dropdown>
    //       </Space>
    //     ) : null,
    // },
  ];

  return (
    <PageContainer title={false}>
      {locationDenied && (
        <Alert
          message="You need to grant location permission in order to check in / check out"
          type="error"
          showIcon
        />
      )}
      {faceDenied && (
        <Alert
          message="You need to grant camera permission in order to check in / check out"
          type="error"
          showIcon
        />
      )}
      <ProTable<RecordType, API.PageParams>
        {...tableSettings}
        className="card-shadow"
        headerTitle={intl.formatMessage({ id: 'property.myAttendance' })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        tableAlertRender={false}
        toolBarRender={() => [
          <div key="tags">
            {attendanceState.data?.last_action ? (
              <>
                <Tag>
                  {intl.formatMessage({ id: 'property.firstCheckIn' })}:{' '}
                  <span className="emphasize-tag">
                    {attendanceState.data.first_clock_in
                      ? moment(attendanceState.data.first_clock_in).format('HH:mm')
                      : '--:--'}
                  </span>
                </Tag>
                <Tag>
                  {intl.formatMessage({ id: 'property.lastCheckOut' })}:{' '}
                  <span className="emphasize-tag">
                    {attendanceState.data.last_clock_out
                      ? moment(attendanceState.data.last_clock_out).format('HH:mm')
                      : '--:--'}
                  </span>
                </Tag>
                <Tag color="processing">
                  {intl.formatMessage({ id: 'property.lastAction' })}:{' '}
                  <span className="emphasize-tag">
                    {nextStepTranslate[attendanceState.data.last_action]}{' '}
                    {moment(attendanceState.data.last_action_at).format('HH:mm')}
                  </span>
                </Tag>
              </>
            ) : (
              <Tag color="processing">
                <span className="emphasize-tag">
                  {intl.formatMessage({ id: 'error.noActivities' })}
                </span>
              </Tag>
            )}
          </div>,
          <Select<number>
            key="periods"
            loading={!periods}
            style={{ minWidth: 100 }}
            value={selectedPeriod}
            onChange={(value) => {
              setSelectedPeriod(value);
              actionRef.current?.reload();
            }}
          >
            {periods?.map((it) => (
              <Select.Option value={it.id} key={it.id}>
                {moment(it.start_date).format('DD MMM YYYY')} →{' '}
                {moment(it.end_date).format('DD MMM YYYY')}
              </Select.Option>
            ))}
          </Select>,
          <Tooltip
            title={(() => {
              if (initialState?.currentUser?.status !== 'Working')
                return intl.formatMessage({ id: 'error.youAreNotWorking' });
              if (attendanceState.data?.location === null)
                return intl.formatMessage({ id: 'error.mustSetupLocationFirst' });
              if (errorMustWorkInOffice)
                return intl.formatMessage({ id: 'error.yourOfficeNotAllowAttendance' });
              return '';
            })()}
          >
            <Button
              type="primary"
              key="primary"
              disabled={clockButtonDisabled}
              onClick={() => {
                setClockModalVisible(true);
              }}
              style={{ textTransform: 'capitalize', fontWeight: 'bold' }}
              loading={clockButtonLoading}
            >
              <Space>
                <HistoryOutlined />
                {attendanceState.data && nextStepTranslate[attendanceState.data?.next_step]}
              </Space>
            </Button>
          </Tooltip>,
        ]}
        loading={periods === undefined ? true : undefined}
        request={async () => {
          const fetchData = await readAttendances(id, {
            params: { period_id: selectedPeriod },
          });
          fetchData.reverse();

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
        visible={clockModalVisible}
        title={`${
          attendanceState.data && nextStepTranslate[attendanceState.data?.next_step]
        } ${moment().format('HH:mm')}`}
        width="398px"
        submitter={{
          submitButtonProps: {
            disabled: appConfig.data?.require_face_id && (!isPaused || !captureValid || capturing),
          },
          render: (_, defaultDoms) => {
            return [
              appConfig.data?.require_face_id && (
                <Button
                  key="capture-button"
                  icon={<CameraOutlined />}
                  {...(isPaused && !capturing && !captureValid
                    ? { type: 'primary' }
                    : { className: 'primary-outlined-button' })}
                  loading={capturing}
                  onClick={async () => {
                    try {
                      setCapturing(true);
                      if (isPaused) {
                        videoRef.current?.play();
                        setIsPaused(false);
                      } else {
                        videoRef.current?.pause();
                        setIsPaused(true);
                        const canvas = document.createElement('canvas');
                        if (!videoRef.current) {
                          message.error('Video is not ready yet');
                          return;
                        }
                        canvas.width = CAMERA_WIDTH;
                        canvas.height = CAMERA_HEIGHT;
                        canvas
                          .getContext('2d')
                          ?.drawImage(videoRef.current, 0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);
                        const datauri = canvas.toDataURL('image/png');
                        capturedFaceBlobRef.current = await fetch(datauri).then((it) => it.blob());
                        if (!capturedFaceBlobRef.current) {
                          throw new Error();
                        }
                        const submitData = new FormData();
                        submitData.append('image', capturedFaceBlobRef.current, 'face_image.png');
                        const faces = await detectFaces(submitData);
                        setCaptureValid(faces.length === 1);
                      }
                    } finally {
                      setCapturing(false);
                    }
                  }}
                >
                  {intl.formatMessage({
                    id:
                      isPaused && !capturing
                        ? 'property.actions.retake'
                        : 'property.actions.capture',
                  })}
                </Button>
              ),
              ...defaultDoms,
            ];
          },
        }}
        onFinish={async (values) => {
          try {
            if (!currentLocation) return false;
            const { lat, lng } = currentLocation!;
            const submitData = new FormData();
            if (appConfig.data?.require_face_id && capturedFaceBlobRef.current) {
              submitData.append('face_image', capturedFaceBlobRef.current, 'face_image.png');
            }
            if (attendanceState.data?.next_step === 'clock in') {
              submitData.append('check_in_lat', String(lat));
              submitData.append('check_in_lng', String(lng));
              submitData.append('check_in_note', values.note);
              await checkIn(id, submitData);
            } else {
              submitData.append('check_out_lat', String(lat));
              submitData.append('check_out_lng', String(lng));
              submitData.append('check_out_note', values.note);
              await checkOut(id, submitData);
            }
            message.success(
              `${
                attendanceState.data && nextStepTranslate[attendanceState.data?.next_step]
              } ${intl.formatMessage({
                id: 'property.actions.successfully',
              })}`,
            );
            setClockModalVisible(false);
            actionRef.current?.reload();
            attendanceState.fetchData();
            clearUpCamera();
            return true;
          } catch (error) {
            if (error.data === 'Face recognition failed') {
              message.error(intl.formatMessage({ id: 'error.cannotRecognizeFace' }));
            } else {
              message.error(
                `${
                  attendanceState.data && nextStepTranslate[attendanceState.data?.next_step]
                } ${intl.formatMessage({
                  id: 'property.actions.unsuccessfully',
                })}`,
              );
            }
            return false;
          }
        }}
        onVisibleChange={(visible) => {
          let timeout: any;
          if (visible) {
            setIsPaused(false);
            videoRef.current?.play();
            if (
              appConfig.data!.require_face_id &&
              navigator.mediaDevices &&
              navigator.mediaDevices.getUserMedia
            ) {
              navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                  timeout = setTimeout(() => {
                    if (!videoRef.current) return;
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    videoRef.current.play();
                  }, 100);
                })
                .catch((err) => {
                  // console.log(err.name);
                  if (err?.name === 'NotReadableError') {
                    message.error('Your camera might be obtained by another software');
                    return;
                  }
                  setFaceDenied(true);
                  notification.error({
                    message: 'You need to grant camera permission in order to check in / check out',
                  });
                });
            }
          } else {
            clearTimeout(timeout);
            clockModalForm.resetFields();
          }
          setClockModalVisible(visible);
        }}
        form={clockModalForm}
      >
        <Space style={{ marginBottom: 20, color: isOutside ? '#f5222d' : '#389e0d' }}>
          <EnvironmentOutlined />
          {isOutside
            ? intl.formatMessage({ id: 'property.attendance.outside.long' })
            : attendanceState.data?.location?.name}
        </Space>
        <ProFormTextArea
          width="md"
          rules={isOutside ? [{ required: true }] : undefined}
          name="note"
          label={intl.formatMessage({ id: 'property.note' })}
        />
        {appConfig.data?.require_face_id && (
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} width={CAMERA_WIDTH} height={CAMERA_HEIGHT} />
            {isPaused &&
              !capturing &&
              (!captureValid ? (
                <Alert
                  message={intl.formatMessage({ id: 'error.cannotFindYourFace' })}
                  type="error"
                  style={{ marginTop: 16 }}
                />
              ) : (
                <Alert
                  message={`${intl.formatMessage({ id: 'error.readyTo' })} ${
                    attendanceState.data && nextStepTranslate[attendanceState.data?.next_step]
                  }`}
                  type="success"
                  style={{ marginTop: 16 }}
                />
              ))}
          </div>
        )}
      </ModalForm>
    </PageContainer>
  );
};

export default MyAttendance;
