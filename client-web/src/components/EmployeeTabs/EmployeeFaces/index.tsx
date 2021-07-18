import { renderZoomInImage } from '@/pages/Attendance/MyAttendance';
import { allFaces, deleteFace, uploadFace } from '@/services/employee';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space, Upload } from 'antd';
import moment from 'moment';
import React, { useCallback, useRef } from 'react';
import { Access, FormattedMessage, useIntl } from 'umi';
import type { EmployeeTabProps } from '..';

type RecordType = API.EmployeeFaces;

export const EmployeeFaces: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const intl = useIntl();
  const localeFeature = intl.formatMessage({ id: 'property.faces' });

  // == RBAC.BEGIN
  const { canViewFaces, canAddFaces, canDeleteFaces } = useEmployeeDetailAccess({
    employeeId,
    isActive,
  });
  // == RBAC.END

  const actionRef = useRef<ActionType>();

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        // onChange?.();
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
      title: intl.formatMessage({ id: 'property.timestamp' }),
      dataIndex: 'timestamp',
      renderText: (date) => (date ? moment(date).format('DD MMM yyyy - HH:mm:ss') : ' '),
    },
    {
      title: intl.formatMessage({ id: 'property.image' }),
      dataIndex: 'image',
      renderText: (text) => renderZoomInImage(text),
    },
    canDeleteFaces
      ? {
          title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
          key: 'action',
          fixed: 'right',
          align: 'center',
          width: 'min-content',
          search: false,
          render: (dom, record) => (
            <Space size="small">
              <Access accessible={canDeleteFaces}>
                <Popconfirm
                  placement="right"
                  title={`${intl.formatMessage({
                    id: 'property.actions.delete',
                    defaultMessage: 'Delete',
                  })} ${localeFeature}?`}
                  onConfirm={async () => {
                    await onCrudOperation(
                      () => deleteFace(employeeId, record.id),
                      intl.formatMessage({
                        id: 'error.deleteSuccessfully',
                        defaultMessage: 'Delete successfully!',
                      }),
                      intl.formatMessage({
                        id: 'error.deleteUnsuccessfully',
                        defaultMessage: 'Delete unsuccessfully!',
                      }),
                    );
                  }}
                >
                  <Button
                    title={`${intl.formatMessage({
                      id: 'property.actions.delete',
                      defaultMessage: 'Delete',
                    })} ${localeFeature}?`}
                    size="small"
                    danger
                  >
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>
              </Access>
            </Space>
          ),
        }
      : {},
  ];

  const tableSettings = useTableSettings();

  return (
    <Access accessible={canViewFaces}>
      <ProTable<RecordType>
        {...tableSettings}
        headerTitle={`${intl.formatMessage({
          id: 'property.actions.list',
          defaultMessage: ' ',
        })} ${localeFeature}`}
        className="card-shadow"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        locale={{ emptyText: 'No Faces' }}
        toolBarRender={() => [
          <Access accessible={canAddFaces}>
            <Upload
              // disabled={!canChangeAvatar}
              showUploadList={false}
              // style={{ display: 'block', cursor: `${canChangeAvatar ? 'pointer' : undefined}` }}
              // multiple={true}
              maxCount={1}
              accept="image/*"
              customRequest={async (options) => {
                const { file } = options;
                const config = {
                  // headers: {
                  //   'content-type': 'multipart/form-data',
                  // },
                  // If you set the 'content-type' header manually yourself, you fucked up: https://stackoverflow.com/a/38271059/9787887
                };
                const hide = message.loading(
                  `${intl.formatMessage({ id: 'property.actions.uploading' })}...`,
                );
                try {
                  const data = new FormData();
                  data.append('image', file);
                  await uploadFace(employeeId!, data, config);
                  actionRef.current?.reload();
                  message.success(
                    `${intl.formatMessage({
                      id: 'property.actions.upload',
                    })} ${intl.formatMessage({ id: 'property.actions.successfully' })}`,
                  );
                } catch (err) {
                  message.error(
                    `${intl.formatMessage({
                      id: 'property.actions.upload',
                    })} ${intl.formatMessage({ id: 'property.actions.unsuccessfully' })}`,
                  );
                } finally {
                  hide?.();
                }
              }}
            >
              <Button type="primary" key="primary">
                <UploadOutlined />{' '}
                <FormattedMessage id="property.actions.upload" defaultMessage="Upload" />
              </Button>
            </Upload>
          </Access>,
        ]}
        request={async () => {
          const data = await allFaces(employeeId);
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
    </Access>
  );
};

export default EmployeeFaces;
