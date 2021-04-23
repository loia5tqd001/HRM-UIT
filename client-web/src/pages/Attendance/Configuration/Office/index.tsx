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
      title: (
        <FormattedMessage
          id="pages.admin.organization.office.column.name"
          defaultMessage="Office"
        />
      ),
      dataIndex: 'name',
      renderText: (text, record) => (
        <Link to={`/attendance/configuration/office/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Accurate address',
      dataIndex: 'accurate_address',
    },
    {
      title: 'Radius',
      dataIndex: 'radius',
      renderText: (text) => `${text}m`,
    },
    {
      title: 'Allow outside',
      dataIndex: 'allow_outside',
      align: 'center',
      renderText: (it) =>
        it ? (
          <Tooltip title="Allowed">
            <CheckOutlined />
          </Tooltip>
        ) : (
          <Tooltip title="Now allowed">
            <CloseOutlined />
          </Tooltip>
        ),
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.organization.office.list.title',
          defaultMessage: 'Offices',
        })}
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
