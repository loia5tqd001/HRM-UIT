import { allPayrollSystemFields, duplicatePayrollTemplate } from '@/services/payroll.template';
import {
  CloseOutlined,
  CopyOutlined,
  DiffOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  List,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import arrayMove from 'array-move';
import { sortBy } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Access, getIntl, history, useAccess, useIntl } from 'umi';
import styles from './index.less';
import copy from 'copy-to-clipboard';

const EditableContext = React.createContext<any>(null);

const TableContext = React.createContext<any>(null);

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}: any) => {
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext);

  const save = async () => {
    try {
      const values = await form.validateFields();
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
        ...record,
        ...values,
      });
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  // property.columnType
  // property.columnType.systemField
  // property.columnType.formula
  // property.datatype
  // property.datatype.Text
  // property.datatype.Number
  // property.datatype.Currency
  // property.display_name
  // property.codename
  // property.define
  if (editable) {
    if (dataIndex === 'type') {
      childNode = (
        <Form.Item name={dataIndex} style={{ margin: 0, minWidth: 125 }}>
          <Select
            allowClear={false}
            options={[
              {
                value: 'System Field',
                label: getIntl().formatMessage({ id: 'property.columnType.systemField' }),
                disabled: true,
              }, // this's disabled because System Field will be selected programmatically, not support manually
              {
                value: 'Input',
                label: getIntl().formatMessage({ id: 'property.columnType.input' }),
              },
              {
                value: 'Formula',
                label: getIntl().formatMessage({ id: 'property.columnType.formula' }),
              },
            ]}
            ref={inputRef}
            onChange={save}
          />
        </Form.Item>
      );
    } else if (dataIndex === 'datatype') {
      childNode = (
        <Form.Item name={dataIndex} style={{ margin: 0, minWidth: 110 }}>
          <Select
            allowClear={false}
            options={[
              { value: 'Text', label: getIntl().formatMessage({ id: 'property.datatype.Text' }) },
              {
                value: 'Number',
                label: getIntl().formatMessage({ id: 'property.datatype.Number' }),
              },
              {
                value: 'Currency',
                label: getIntl().formatMessage({ id: 'property.datatype.Currency' }),
              },
            ]}
            ref={inputRef}
            onChange={save}
          />
        </Form.Item>
      );
    } else if (dataIndex === 'define') {
      childNode = (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          <Input
            addonBefore={record.type === 'Formula' && '='}
            ref={inputRef}
            onBlur={save}
            disabled={record.type !== 'Formula'}
          />
        </Form.Item>
      );
    } else if (dataIndex === 'code_name') {
      childNode = (
        <Tooltip
          title={
            record.type === 'System Field' &&
            getIntl().formatMessage({
              id: 'property.readonlySystemField',
            })
          }
        >
          <Form.Item style={{ margin: 0 }} name={dataIndex}>
            <Input
              ref={inputRef}
              disabled={record.type === 'System Field'}
              addonAfter={
                <Tooltip title="Copy">
                  <CopyOutlined
                    onClick={() => {
                      copy(inputRef.current.state.value);
                      message.success('Copied to clipboard!');
                    }}
                  />
                </Tooltip>
              }
              onBlur={save}
            />
          </Form.Item>
        </Tooltip>
      );
    } else {
      childNode = (
        <Form.Item style={{ margin: 0 }} name={dataIndex}>
          <Input ref={inputRef} onBlur={save} />
        </Form.Item>
      );
    }
  }

  return <td {...restProps}>{childNode}</td>;
};

const DragHandle = SortableHandle(({ index, record }) => (
  <Badge
    count={
      !record.is_visible ? (
        <Tooltip title={getIntl().formatMessage({ id: 'property.onlyForCalculating' })}>
          <EyeInvisibleOutlined style={{ color: 'red' }} />
        </Tooltip>
      ) : undefined
    }
  >
    <Space key={index}>
      <Typography.Title level={5} style={{ marginTop: 5 }}>
        {index + 1}
      </Typography.Title>
      <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
    </Space>
  </Badge>
));

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableList = SortableContainer((props) => <tbody {...props} />);

const DraggableBodyRow = ({ ...restProps }) => {
  const [form] = Form.useForm();
  const record = restProps.children[0]?.props.record;

  if (form && record) form.setFieldsValue(record);
  // console.log('>  ~ file: PayrollColumns.tsx ~ line 144 ~ restProps', restProps.children[0]?.props.record)
  const { tableData } = useContext(TableContext);
  // function findIndex base on Table rowKey props and should always be a right array index
  const index = tableData?.findIndex((x) => x.index === restProps['data-row-key']);
  return (
    <Form
      form={form}
      component={false}
      name={`${record?.name}_${record?.index}`}
      key={record?.index}
    >
      <EditableContext.Provider value={form}>
        <SortableItem index={index} {...restProps} />
      </EditableContext.Provider>
    </Form>
  );
};

function SortableTable() {
  const { tableDataReady, tableData, setTableData } = useContext<any>(TableContext);
  const access = useAccess();

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove([...tableData], oldIndex, newIndex)
        .filter((el) => !!el)
        .map((it: any, index) => ({ ...it, index }));
      setTableData(newData);
    }
  };

  const DraggableContainer = (props) => (
    <SortableList
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const handleDelete = (index: number) => {
    const dataSource = [...tableData];
    const newData = dataSource
      .filter((item) => item.index !== index)
      .map((it, newIndex) => ({ ...it, index: newIndex }));
    setTableData(newData);
  };

  const handleSave = (row) => {
    const newData = [...tableData];
    const { index } = row;
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setTableData(newData);
  };

  const columns = [
    {
      // title: 'Type',
      title: getIntl().formatMessage({ id: 'property.columnType' }),
      dataIndex: 'type',
      width: 'max-content',
      editable: true,
    },
    {
      title: getIntl().formatMessage({ id: 'property.datatype' }),
      dataIndex: 'datatype',
      width: 'max-content',
      editable: true,
    },
    {
      title: getIntl().formatMessage({ id: 'property.display_name' }),
      dataIndex: 'display_name',
      editable: true,
    },
    {
      title: getIntl().formatMessage({ id: 'property.codename' }),
      dataIndex: 'code_name',
      editable: true,
    },
    {
      title: getIntl().formatMessage({ id: 'property.define' }),
      dataIndex: 'define',
      editable: true,
      width: '30%',
    },
  ];
  if (access['change_salarytemplate']) {
    columns.unshift({
      title: '#',
      dataIndex: 'index',
      width: 65,
      className: 'drag-visible',
      render: (_, record, index) => <DragHandle index={index} record={record} />,
    } as any);
    columns.push({
      title: '',
      dataIndex: 'actions',
      width: '30px',
      render: (_, record) => (
        <Space>
          <Button
            icon={record.is_visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            size="small"
            onClick={() =>
              setTableData(
                tableData.map((it: API.PayrollField) =>
                  it.index === record.index ? { ...it, is_visible: !it.is_visible } : it,
                ),
              )
            }
          />
          <Popconfirm
            title={`${getIntl().formatMessage({ id: 'property.actions.sureToDelete' })}?`}
            onConfirm={() => handleDelete(record.index)}
          >
            <Button icon={<CloseOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    } as any);
  }

  return (
    <Table
      pagination={false}
      loading={!tableDataReady}
      dataSource={tableData}
      columns={columns.map((col) => {
        if (!col.editable) {
          return col;
        }

        return {
          ...col,
          onCell: (record) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
          }),
        };
      })}
      rowKey="index"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
          cell: EditableCell,
        },
      }}
      bordered
    />
  );
}

type Props = {
  payrollTemplate: API.PayrollTemplate | undefined;
  onUpdateColumns: (fields: API.PayrollTemplate['fields']) => Promise<void>;
};

export const PayrollColumns: React.FC<Props> = (props) => {
  const { payrollTemplate, onUpdateColumns } = props;
  const [systemFields, setSystemFields] = useState<API.SystemField[]>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tableData, setTableData] = useState<API.PayrollTemplate['fields']>([]);
  const [isCollapsed, setIsCollapse] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const access = useAccess();
  const intl = useIntl();

  useEffect(() => {
    setTableData(
      sortBy(payrollTemplate?.fields, 'index').map((it, index) => ({ ...it, index })) || [],
    );
  }, [payrollTemplate?.fields]);

  useEffect(() => {
    allPayrollSystemFields().then((fetchData) => setSystemFields(fetchData));
  }, []);

  return (
    <TableContext.Provider
      value={{
        tableData,
        setTableData,
        tableDataReady: !!payrollTemplate?.fields,
      }}
    >
      <div style={{ display: 'grid', gap: 24 }}>
        <Card
          className="card-shadow"
          title={
            <>
              {payrollTemplate?.can_be_modified ? null : <LockOutlined />} {payrollTemplate?.name}
            </>
          }
          style={{ minHeight: '50vh', height: '100%' }}
          extra={
            <Access accessible={access['change_salarytemplate']}>
              <Space>
                <Tooltip
                  title={
                    payrollTemplate?.can_be_modified
                      ? null
                      : getIntl().formatMessage({ id: 'property.can_be_modified.no' })
                  }
                >
                  <Button
                    children={getIntl().formatMessage({ id: 'component.button.save' })}
                    type="primary"
                    loading={isSaving}
                    disabled={!payrollTemplate?.can_be_modified}
                    onClick={async () => {
                      try {
                        setIsSaving(true);
                        await onUpdateColumns(tableData);
                        message.success(
                          intl.formatMessage({
                            id: 'error.updateSuccessfully',
                            defaultMessage: 'Update successfully!',
                          }),
                        );
                      } catch {
                        message.success(
                          intl.formatMessage({
                            id: 'error.updateUnsuccessfully',
                            defaultMessage: 'Update unsuccessfully!',
                          }),
                        );
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  />
                </Tooltip>

                <ModalForm<API.PayrollTemplate>
                  title={`${getIntl().formatMessage({
                    id: 'property.actions.duplicate',
                  })} ${getIntl().formatMessage({ id: 'property.template' })} ${
                    payrollTemplate?.name
                  }`}
                  width="400px"
                  onFinish={async (value) => {
                    try {
                      const { id } = await duplicatePayrollTemplate(payrollTemplate!.id, {
                        name: value.name,
                      });
                      history.push(`${id}`);
                      message.success(
                        `${intl.formatMessage({
                          id: 'property.actions.duplicate',
                        })} ${intl.formatMessage({
                          id: 'property.actions.successfully',
                        })}`,
                      );
                    } catch {
                      message.error(
                        `${intl.formatMessage({
                          id: 'property.actions.duplicate',
                        })} ${intl.formatMessage({
                          id: 'property.actions.unsuccessfully',
                        })}`,
                      );
                    }
                  }}
                  trigger={
                    <Button
                      children={getIntl().formatMessage({ id: 'property.actions.duplicate' })}
                      icon={<DiffOutlined />}
                      className="primary-outlined-button"
                    />
                  }
                >
                  <ProFormText
                    rules={[{ required: true }]}
                    name="name"
                    label={getIntl().formatMessage({ id: 'property.template.new_name' })}
                  />
                </ModalForm>

                <Tooltip
                  title={`${
                    isCollapsed
                      ? getIntl().formatMessage({ id: 'property.actions.showSystemFields' })
                      : getIntl().formatMessage({ id: 'property.actions.hideSystemFields' })
                  }`}
                >
                  <Button
                    icon={isCollapsed ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
                    onClick={() => {
                      setIsCollapse(!isCollapsed);
                    }}
                    type={isCollapsed ? 'primary' : undefined}
                    className={isCollapsed ? undefined : 'primary-outlined-button'}
                  />
                </Tooltip>
              </Space>
            </Access>
          }
        >
          <div
            style={{
              display: 'flex',
              // gridTemplateColumns: `1fr ${isCollapsed ? '0' : 'minmax(300px, 25vw)'}`,
              margin: '0 12px',
              gap: 12,
              overflow: 'hidden',
            }}
          >
            <div style={{ height: 'calc(100vh - 120px)', overflow: 'auto', flex: '2 0 70%' }}>
              <SortableTable />
            </div>
            <Access accessible={access['change_salarytemplate']}>
              <div
                style={{ flex: isCollapsed ? 0 : '1 0 250px', width: isCollapsed ? 0 : undefined }}
              >
                <div>
                  <Button
                    className="primary-outlined-button"
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                    children={getIntl().formatMessage({ id: 'property.actions.addRegularColumn' })}
                    onClick={() => {
                      let nextNumber = String(tableData.length + 1);
                      // eslint-disable-next-line @typescript-eslint/no-loop-func
                      while (tableData.find((it) => it.code_name === `formula_${nextNumber}`)) {
                        nextNumber += '.1';
                      }
                      setTableData([
                        ...tableData,
                        {
                          type: 'Formula',
                          datatype: 'Text',
                          code_name: `formula_${nextNumber}`,
                          is_visible: true,
                          define: '',
                          display_name: `Column ${nextNumber}`,
                          index: tableData.length,
                        },
                      ]);
                    }}
                  />
                  <Input.Search
                    style={{ width: '100%' }}
                    placeholder={getIntl().formatMessage({
                      id: 'property.actions.orAddSystemFieldColumnBelow',
                    })}
                    onSearch={setSearchKeyword}
                  />
                </div>
                <div
                  style={{ height: 'calc(100vh - 182px)', overflow: 'auto', background: 'white' }}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={systemFields?.filter(
                      (it) =>
                        it.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        it.code_name.toLowerCase().includes(searchKeyword.toLowerCase()),
                    )}
                    loading={!systemFields}
                    bordered
                    renderItem={(item, index) => (
                      <List.Item
                        onClick={(e) => {
                          if (!systemFields) {
                            message.error('Cannot find system fields');
                            return;
                          }
                          const codeName = systemFields?.[index].code_name;
                          const codeNameExists = tableData.some((it) => it.code_name === codeName);
                          if (codeNameExists) {
                            message.error(
                              `${codeName} ${getIntl().formatMessage({
                                id: 'error.alreadyExists',
                              })}`,
                            );
                            return;
                          }
                          setTableData([
                            ...tableData,
                            {
                              type: 'System Field',
                              datatype: 'Text',
                              code_name: systemFields[index].code_name,
                              is_visible: true,
                              define: '',
                              display_name: systemFields[index].name,
                              index: tableData.length,
                            },
                          ]);
                        }}
                        className={styles.listItem}
                      >
                        <span style={{ fontWeight: 500 }}>{item.code_name}</span> ({item.name})
                        <List.Item.Meta description={item.description} />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </Access>
          </div>
        </Card>
      </div>
    </TableContext.Provider>
  );
};
