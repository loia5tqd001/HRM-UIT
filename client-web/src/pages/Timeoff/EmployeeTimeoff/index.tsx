import { getConversationId, getTopicUrl } from '@/models/firebaseTalk';
import { employeeToUser } from '@/pages/Message';
import { approveEmployeeTimeoff, rejectEmployeeTimeoff } from '@/services/employee';
import { allTimeoffs } from '@/services/timeOff';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { filterData } from '@/utils/utils';
import { CheckOutlined, CloseOutlined, CommentOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Avatar, Badge, Button, message, Popconfirm, Space, Tooltip } from 'antd';
import moment from 'moment';
import React, { useCallback, useRef, useState } from 'react';
import { Access, FormattedMessage, useAccess, useIntl, useModel } from 'umi';

type RecordType = API.TimeoffRequest & {
  off_days?: [moment.Moment, moment.Moment];
  days?: number;
};

export const Timeoff: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [dataNek, setData] = useState<RecordType[]>();
  const access = useAccess();
  const localeFeature = intl.formatMessage({
    id: 'property.timeoffRequest',
  });
  const tableSettings = useTableSettings();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState!;
  const { getParticipants, addParticipants } = useModel('firebaseTalk');

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
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: intl.formatMessage({ id: 'property.employee' }),
      dataIndex: ['owner', 'id'],
      render: (avatar, record) => (
        <Space>
          <span>
            <Avatar src={record.owner.avatar} />
          </span>
          <span>
            {record.owner.first_name} {record.owner.last_name}
          </span>
        </Space>
      ),
      onFilter: true,
      filters: filterData(dataNek || [])(
        (it) => it.owner.id,
        (it) => `${it.owner.first_name} ${it.owner.last_name}`,
      ),
    },
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
    (access['can_approve_timeoff'] || access['can_reject_timeoff']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => {
        const conversationId = getConversationId('timeoff', record.id);
        const participants = getParticipants(conversationId);

        type ConversationState = 'Not started' | 'Need support' | 'You are in' | 'Other supported';
        const getConversationState = (): ConversationState => {
          if (participants.length === 0) return 'Not started';
          if (participants.length === 1) return 'Need support';
          if (participants.includes(currentUser!.id)) return 'You are in';
          return 'Other supported';
        };
        const conversationState = getConversationState();
        const ownerFullname = `${record.owner.first_name} ${record.owner.last_name}`;

        const getTooltip = () => {
          if (currentUser?.id === record.owner.id) return 'This is your request';
          if (conversationState === 'Not started') return 'Start a conversation for this request';
          if (conversationState === 'Need support') return 'This request needs support';
          if (conversationState === 'You are in') return 'Open your conversation';
          if (conversationState === 'Other supported')
            return 'Other manager is supporting this request';
          return false;
        };

        const disabledReason = () => {
          if (currentUser?.id === record.owner.id) {
            return 'This is your request';
          }
          if (conversationState === 'Other supported') {
            return 'There is another manager support this request';
          }
          return false;
        };

        return (
          <Space size="small">
            <Access accessible={access['can_approve_timeoff']}>
              <Popconfirm
                placement="right"
                title={`${intl.formatMessage({
                  id: 'property.actions.approve',
                })} ${localeFeature}?`}
                onConfirm={async () => {
                  await onCrudOperation(
                    () => approveEmployeeTimeoff(record.owner.id, record.id),
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
                disabled={record.status !== 'Pending'}
              >
                <Button
                  title={`${intl.formatMessage({
                    id: 'property.actions.approve',
                  })} ${localeFeature}?`}
                  size="small"
                  type="default"
                  disabled={record.status !== 'Pending'}
                >
                  <CheckOutlined />
                </Button>
              </Popconfirm>
            </Access>
            <Access accessible={access['can_reject_timeoff']}>
              <Popconfirm
                placement="right"
                title={`${intl.formatMessage({ id: 'property.actions.reject' })} ${localeFeature}?`}
                onConfirm={async () => {
                  await onCrudOperation(
                    () => rejectEmployeeTimeoff(record.owner.id, record.id),
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
                disabled={record.status !== 'Pending'}
              >
                <Button
                  title={`${intl.formatMessage({
                    id: 'property.actions.reject',
                  })} ${localeFeature}?`}
                  size="small"
                  danger
                  disabled={record.status !== 'Pending'}
                >
                  <CloseOutlined />
                </Button>
              </Popconfirm>
            </Access>
            <Tooltip title={getTooltip()}>
              {conversationState === 'You are in' || conversationState === 'Other supported' ? (
                <Button
                  size="small"
                  onClick={() => {
                    // case1: "You are in": because you're already in the conversation, just open it
                    const conversation =
                      window.talkSession?.getOrCreateConversation(conversationId);
                    const popup = window.talkSession?.createPopup(conversation, {
                      keepOpen: false,
                    });
                    popup.mount({ show: true });
                    // case2: "Other supported": the button will be disabled, onClick cannot be called
                  }}
                  className="primary-outlined-button"
                  disabled={!!disabledReason()}
                >
                  <CommentOutlined />
                </Button>
              ) : (
                <Popconfirm
                  title={
                    conversationState === 'Not started'
                      ? `Do you want to start a conversation with ${ownerFullname}?`
                      : `Do you want to support the request of ${ownerFullname}?`
                  }
                  onConfirm={async () => {
                    const me = employeeToUser(currentUser!);
                    const conversation =
                      window.talkSession?.getOrCreateConversation(conversationId);
                    if (conversationState === 'Not started') {
                      // 1. you start the conversation
                      const another = employeeToUser(record.owner);
                      conversation.subject = `[Support][Time off][id: ${record.id}][for: ${record.owner?.first_name} ${record.owner?.last_name}]`;
                      conversation.photoUrl = getTopicUrl('timeoff');
                      conversation.welcomeMessages = [
                        `${currentUser?.first_name} ${currentUser?.last_name} started this conversation`,
                      ];
                      conversation.setParticipant(another, { notify: true });
                    } else {
                      // 2. the conversation is already started by the owner, you join
                    }
                    conversation.setParticipant(me);
                    const popup = window.talkSession?.createPopup(conversation, {
                      keepOpen: false,
                    });
                    popup.mount({ show: true });
                    popup.on('sendMessage', () => {
                      if (conversationState === 'Not started') {
                        addParticipants(conversationId, [record.owner.id, currentUser!.id]);
                      } else {
                        addParticipants(conversationId, [currentUser!.id]);
                      }
                    });
                  }}
                  disabled={!!disabledReason()}
                >
                  <Badge
                    count={
                      (conversationState === 'Need support' && (
                        <div
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: 'red',
                          }}
                        />
                      )) ||
                      0
                    }
                  >
                    <Button size="small" disabled={!!disabledReason()}>
                      <CommentOutlined />
                    </Button>
                  </Badge>
                </Popconfirm>
              )}
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        {...tableSettings}
        className="card-shadow"
        headerTitle={intl.formatMessage({ id: 'property.employeeRequests' })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        request={async () => {
          let data = await allTimeoffs();
          data.reverse();
          data = data.filter((it) => it.owner.id !== currentUser?.id);
          setData(data);
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default Timeoff;
