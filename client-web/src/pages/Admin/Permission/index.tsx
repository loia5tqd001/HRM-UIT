import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
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
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Input, message, Popconfirm, Space, Switch, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import produce from 'immer';
import { sortBy } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
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

  const dict = {
    title: {
      create: 'Create role',
      update: 'Update role',
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
          title="Roles"
        >
          <ProTable<RecordType>
            columns={[
              {
                title: 'Name',
                key: 'name',
                dataIndex: 'name',
              },
              {
                title: 'Actions',
                key: 'actions',
                dataIndex: 'actions',
                align: 'center',
                renderText: (value, record) => (
                  <Space>
                    <Button
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
                    </Button>
                    <Button
                      title="Edit this role"
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
                      title={'Delete this role?'}
                      onConfirm={async (e) => {
                        e?.stopPropagation();
                        await onCrudOperation(
                          () => deleteRole(record.id),
                          'Detete successfully!',
                          'Cannot delete role!',
                        );
                      }}
                    >
                      <Button
                        title="Delete this role"
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
              let data = await allRoles();
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
          title={`Permissions of: ${viewingRecord?.name || ''}`}
          extra={
            <Button
              onClick={async () => {
                if (!viewingRecord) return;
                setSaving(true);
                await onCrudOperation(
                  () => updateRole(viewingRecord.id, viewingRecord),
                  'Update successfully!',
                  'Update unsuccessfully!',
                );
                setSaving(false);
              }}
              type="primary"
              key="primary"
              loading={saving}
            >
              <SaveOutlined /> Save
            </Button>
          }
        >
          <Table<RecordType['permissions'][0]>
            columns={[
              {
                title: 'Id',
                key: 'id',
                dataIndex: 'id',
              },
              {
                title: 'Permission',
                key: 'name',
                dataIndex: 'name',
                ...getColumnSearchProps('name', 'Search permissions'),
              },
              {
                title: 'Enabled',
                key: 'has_perm',
                dataIndex: 'has_perm',
                align: 'center',
                render: (value: boolean, record) => (
                  <Switch
                    checked={value}
                    onChange={(checked) => {
                      setViewingRecord(
                        produce(viewingRecord, (draft) => {
                          const toChange = draft?.permissions.find((it) => it.id === record.id);
                          if (!toChange) return;
                          toChange.has_perm = checked;
                        }),
                      );
                    }}
                  />
                ),
                width: 100,
              },
            ]}
            dataSource={viewingRecord?.permissions}
            style={{ height: 'calc(100vh - 350px)' }}
            scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
            pagination={false}
            className="no-header-color"
          />
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
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateRole(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
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
        <ProFormText
          rules={[{ required: true }]}
          name="name"
          label={intl.formatMessage({
            id: 'pages.admin.job.jobTitle.column.name',
            defaultMessage: 'Name',
          })}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'pages.admin.job.jobTitle.column.description',
            defaultMessage: 'Description',
          })}
        />
        {crudModalVisible === 'create' && (
          <ProFormSelect
            name="based_on"
            label="Copy permissions from"
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
