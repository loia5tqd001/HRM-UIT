import { allLocations } from '@/services/admin.organization.location';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Tooltip } from 'antd';
import React, { useRef } from 'react';
import { FormattedMessage, Link, useIntl } from 'umi';

type RecordType = API.Location;

export const Office: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const intl = useIntl();

  const columns: ProColumns<RecordType>[] = [
    {
      title: intl.formatMessage({ id: 'property.office' }),
      dataIndex: 'name',
      renderText: (text, record) => (
        <Link to={`/attendance/configuration/office/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: intl.formatMessage({ id: 'property.accurate_address' }),
      dataIndex: 'accurate_address',
    },
    {
      title: intl.formatMessage({ id: 'property.radius' }),
      dataIndex: 'radius',
      renderText: (text) => `${text}m`,
    },
    {
      title: intl.formatMessage({ id: 'property.allow_outside' }),
      dataIndex: 'allow_outside',
      align: 'center',
      renderText: (it) =>
        it ? (
          <Tooltip title={intl.formatMessage({ id: 'property.allow_outside.allowed' })}>
            <CheckOutlined style={{ color: '#52c41a' }} />
          </Tooltip>
        ) : (
          <Tooltip title={intl.formatMessage({ id: 'property.allow_outside.not_allowed' })}>
            <CloseOutlined style={{ color: '#ff4d4f' }} />
          </Tooltip>
        ),
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        className="card-shadow"
        headerTitle={`${intl.formatMessage({ id: 'property.actions.list' })} ${intl.formatMessage({
          id: 'property.office',
        })}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        request={async () => {
          const data = await allLocations();
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

export default Office;
