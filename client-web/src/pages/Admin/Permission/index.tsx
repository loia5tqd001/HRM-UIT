import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import { allRoles, createRole, deleteRole, updateRole } from '@/services/auth';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import {
  ModalForm,
  ProFormCheckbox,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import { groupBy, omit, sortBy } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { useIntl } from 'umi';
import styles from './index.less';

type RecordType = API.RoleItem & {
  based_on?: API.RoleItem['id'];
};

const Permission: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<
    'hidden' | 'detail' | 'create' | 'update' | 'delete'
  >('hidden');
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [viewingRecord, setViewingRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const dataRef = useRef<RecordType[]>();
  const localeFeature = intl.formatMessage({
    id: 'property.role',
  });
  type PermissionForm = Record<string, string[]>;
  const [permissionsForm] = useForm<PermissionForm>();

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

  const tableSettings = useTableSettings();
  const dict = {
    title: {
      create: `${intl.formatMessage({
        id: 'property.actions.create',
        defaultMessage: 'Create',
      })} ${localeFeature}`,
      update: `${intl.formatMessage({
        id: 'property.actions.update',
        defaultMessage: 'Update',
      })} ${localeFeature}`,
    },
  };

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [saving, setSaving] = useState(false);
  const searchInput = useRef<any>();

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string, placeholder = `Search ${dataIndex}`) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ fontSize: '1.2em', color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const permissions =
    viewingRecord?.permissions &&
    omit(groupBy(viewingRecord?.permissions, 'content_type'), [
      'user',
      'country',
      'education level',
      'language',
      'license',
      'skill',
      'employee license',
      'employee language',
      'employee education',
      'employee skill',
      'tracking',
      'timeofftype',
      'timeoff',
      'payroll config',
      'salary system field',
      'period',
      'termination',
      'contact info',
    ]);
  // console.log(
  //   '>  ~ file: index.tsx ~ line 150 ~ permissions',
  //   permissions && Object.keys(permissions),
  // );
  // console.log(
  //   '>  ~ file: index.tsx ~ line 150 ~ permissions',
  //   permissions &&
  //     Object.values(permissions)
  //       .flat()
  //       .reduce(
  //         (acc, cur) => ({
  //           ...acc,
  //           [`permission.${cur.content_type}.${cur.codename}`]: cur.name,
  //           [`permission.${cur.content_type}`]: startCase(camelCase(cur.content_type)),
  //         }),
  //         {},
  //       ),
  // );

  useEffect(() => {
    const permissionFormValues: PermissionForm | undefined =
      permissions &&
      Object.entries(permissions).reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]: v.filter((item) => item.has_perm).map((item) => item.codename),
        }),
        {},
      );

    if (permissionFormValues) permissionsForm.setFieldsValue(permissionFormValues);
  }, [viewingRecord]);

  return (
    <PageContainer title={false}>
      <ProCard split="vertical" style={{ height: '100%' }} className="card-shadow">
        <ProCard
          colSpan="384px"
          extra={
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCrudModalVisible('create');
                setSelectedRecord(undefined);
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage id="pages.employee.list.table.new" defaultMessage="New" />
            </Button>
          }
          title={intl.formatMessage({ id: 'property.roles' })}
        >
          <ProTable<RecordType>
            {...tableSettings}
            columns={[
              {
                title: 'Name',
                key: 'name',
                dataIndex: 'name',
              },
              {
                title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
                key: 'actions',
                dataIndex: 'actions',
                align: 'center',
                renderText: (value, record) => (
                  <Space>
                    {/* <Button
                      title="View permissions"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCrudModalVisible('detail');
                        setSelectedRecord(record);
                        setViewingRecord(record);
                      }}
                    >
                      <EyeOutlined />
                    </Button> */}
                    <Button
                      title={`${intl.formatMessage({
                        id: 'property.actions.update',
                        defaultMessage: 'Update',
                      })} ${localeFeature}`}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCrudModalVisible('update');
                        setSelectedRecord(record);
                      }}
                    >
                      <EditOutlined />
                    </Button>
                    <Popconfirm
                      placement="right"
                      title={`${intl.formatMessage({
                        id: 'property.actions.delete',
                        defaultMessage: 'Delete',
                      })} ${localeFeature}?`}
                      onConfirm={async (e) => {
                        e?.stopPropagation();
                        await onCrudOperation(
                          () => deleteRole(record.id),
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteOutlined />
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
                width: 100,
              },
            ]}
            toolBarRender={false}
            search={false}
            pagination={false}
            showHeader={false}
            actionRef={actionRef}
            rowKey="id"
            request={async () => {
              let data: any = await allRoles();
              // data = data.map((it) => ({
              //   ...it,
              //   permissions: groupBy(it.permissions, 'content_type'),
              // }));
              // console.log('>  ~ file: index.tsx ~ line 247 ~ data', data);
              data = sortBy(data, 'id');
              if (data.length) {
                const index = data.findIndex((it) => it.id === viewingRecord?.id);
                setSelectedRecord(data[index === -1 ? 0 : index]);
                setViewingRecord(data[index === -1 ? 0 : index]);
                dataRef.current = data;
              }
              return {
                data,
                success: true,
              };
            }}
            onRow={(data) => {
              return {
                onClick: () => {
                  setCrudModalVisible('detail');
                  setSelectedRecord(data);
                  setViewingRecord(data);
                },
              };
            }}
            rowClassName={(record) => {
              return record.id === viewingRecord?.id
                ? styles['selected-row']
                : styles['non-selected-row'];
            }}
          />
        </ProCard>
        <ProCard
          className="header-capitalize"
          title={`${intl.formatMessage({ id: 'property.permissionsOf' })}: ${
            viewingRecord?.name || ''
          }`}
          extra={
            <Button
              // onClick={async () => {
              //   if (!viewingRecord) return;
              //   setSaving(true);
              // await onCrudOperation(
              //   () => updateRole(viewingRecord.id, viewingRecord),
              //   'Update successfully!',
              //   'Update unsuccessfully!',
              // );
              //   setSaving(false);
              // }}
              type="primary"
              key="primary"
              loading={saving}
              htmlType="submit"
              form="permissions-form"
            >
              <SaveOutlined /> {intl.formatMessage({ id: 'component.button.save' })}
            </Button>
          }
        >
          <Form<Record<string, string[]>>
            onFinish={async (values) => {
              try {
                setSaving(true);
                let updatedPermission = viewingRecord?.permissions;
                if (!updatedPermission || !viewingRecord) return;
                const allPermissionsEnabled = Object.values(values).flat();
                updatedPermission = updatedPermission.map((it) => ({
                  ...it,
                  has_perm: allPermissionsEnabled.includes(it.codename),
                }));
                const updatedRecord = {
                  ...viewingRecord,
                  permissions: updatedPermission,
                };
                await onCrudOperation(
                  () => updateRole(viewingRecord.id, updatedRecord),
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              } finally {
                setSaving(false);
              }
            }}
            id="permissions-form"
            form={permissionsForm}
            className={styles.permissionForm}
            style={{ height: 'calc(100vh - 250px)', overflowX: 'auto' }}
          >
            {/* <ProFormGroup> */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                height: 'calc(100vh - 260px)',
                columnGap: 32,
              }}
            >
              {permissions &&
                Object.entries(permissions).map(([k, v]) => (
                  <ProFormCheckbox.Group
                    layout="vertical"
                    style={{ marginRight: 24 }}
                    name={k}
                    label={intl.formatMessage({
                      id: `permission.${k}`,
                    })}
                    options={v.map((it) => ({
                      label: intl.formatMessage({
                        id: `permission.${it.content_type}.${it.codename}`,
                      }),
                      value: it.codename,
                    }))}
                  />
                ))}
              {/* </ProFormGroup> */}
            </div>
          </Form>
        </ProCard>
      </ProCard>
      <ModalForm<RecordType>
        title={dict.title[crudModalVisible]}
        width="400px"
        visible={crudModalVisible === 'update' || crudModalVisible === 'create'}
        form={form}
        onVisibleChange={(visible) => {
          if (!visible) {
            setCrudModalVisible('hidden');
            form.resetFields();
            return;
          }
          if (!selectedRecord) return;
          if (crudModalVisible === 'update') {
            form.setFieldsValue({
              ...selectedRecord,
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...selectedRecord,
            ...value,
          } as RecordType;
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () =>
                createRole({
                  ...record,
                  permissions:
                    dataRef.current?.find((it) => it.id === value.based_on)?.permissions || [],
                }),
              intl.formatMessage({
                id: 'error.createSuccessfully',
                defaultMessage: 'Create successfully!',
              }),
              intl.formatMessage({
                id: 'error.createUnsuccessfully',
                defaultMessage: 'Create unsuccessfully!',
              }),
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateRole(record.id, record),
              intl.formatMessage({
                id: 'error.updateSuccessfully',
                defaultMessage: 'Update successfully!',
              }),
              intl.formatMessage({
                id: 'error.updateUnsuccessfully',
                defaultMessage: 'Update unsuccessfully!',
              }),
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
                      name: `Role ${dataRef.current!.length + 1}`,
                      description: faker.name.jobDescriptor(),
                      based_on: faker.helpers.randomize(dataRef.current?.map((it) => it.id) || []),
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
        <ProFormText rules={[{ required: true }]} name="name" label={localeFeature} />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'property.description',
            defaultMessage: 'Description',
          })}
        />
        {crudModalVisible === 'create' && (
          <ProFormSelect
            name="based_on"
            label={intl.formatMessage({
              id: 'property.copyPermissionFrom',
            })}
            options={dataRef.current?.map((it) => ({
              value: it.id,
              label: it.name,
            }))}
            allowClear
          />
        )}
      </ModalForm>
    </PageContainer>
  );
};

export default Permission;
