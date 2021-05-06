import { allPayrollSystemFields } from '@/services/payroll.template';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  EyeOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
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
  Typography,
} from 'antd';
import arrayMove from 'array-move';
import { sortBy } from 'lodash';
// import 'antd/dist/antd.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SplitPane } from 'react-collapse-pane';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import './index.css';
import styles from './index.less';

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
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      form.setFieldsValue({
        ...record,
        ...values,
      });
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    if (dataIndex === 'type') {
      childNode = (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          <Select
            allowClear={false}
            options={[
              { value: 'System Field', label: 'System Field' },
              { value: 'Input', label: 'Input' },
              { value: 'Formula', label: 'Formula' },
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
    } else {
      childNode = (
        <Form.Item style={{ margin: 0 }} name={dataIndex}>
          <Input
            ref={inputRef}
            disabled={dataIndex === 'code_name' && record.type === 'System Field'}
            onBlur={save}
          />
        </Form.Item>
      );
    }
  }

  return <td {...restProps}>{childNode}</td>;
};

const DragHandle = SortableHandle(({ index }) => (
  <Space>
    <Typography.Title level={5} style={{ marginTop: 5 }}>
      {index + 1}
    </Typography.Title>
    <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
  </Space>
));

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableList = SortableContainer((props) => <tbody {...props} />);

const DraggableBodyRow = ({ className, style, ...restProps }) => {
  const [form] = Form.useForm();
  const record = restProps.children[0]?.props.record;

  if (form && record) form.setFieldsValue(record);
  // console.log('>  ~ file: PayrollColumns.tsx ~ line 144 ~ restProps', restProps.children[0]?.props.record)
  const { tableData } = useContext(TableContext);
  // function findIndex base on Table rowKey props and should always be a right array index
  const index = tableData?.findIndex((x) => x.index === restProps['data-row-key']);
  return (
    <Form form={form} component={false} name={`${record?.name}_${record?.index}`}>
      <EditableContext.Provider value={form}>
        <SortableItem index={index} {...restProps} />
      </EditableContext.Provider>
    </Form>
  );
};

function SortableTable() {
  const { tableDataReady, tableData, setTableData } = useContext<any>(TableContext);

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      width: 65,
      className: 'drag-visible',
      render: (_, __, index) => <DragHandle index={index} />,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      className: 'drag-visible',
      editable: true,
    },
    {
      title: 'Display name',
      dataIndex: 'display_name',
      editable: true,
    },
    {
      title: 'Code name',
      dataIndex: 'code_name',
      editable: true,
    },
    {
      title: 'Define',
      dataIndex: 'define',
      editable: true,
      width: '30%',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: 'min-content',
      render: (_, record) =>
        tableData.length >= 1 ? (
          <Space>
            <Button icon={<EyeOutlined />} size="small" disabled />
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.index)}>
              <Button icon={<CloseOutlined />} danger size="small" />
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

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
      rowClassName={() => 'editable-row'}
      bordered
    />
  );
}

type Props = {
  payrollTemplate: API.PayrollTemplate | undefined;
};

export const PayrollColumns: React.FC<Props> = (props) => {
  const { payrollTemplate } = props;
  const [systemFields, setSystemFields] = useState<API.SystemField[]>();
  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    setTableData(
      sortBy(payrollTemplate?.fields, 'index').map((it, index) => ({ ...it, index })) || [],
    );
  }, [payrollTemplate?.fields]);

  useEffect(() => {
    allPayrollSystemFields().then((fetchData) => setSystemFields(fetchData));
  }, []);

  const [collapsed, setCollapse] = useState(false);

  const resizerCss = {
    height: '1px',
    background: 'rgba(0, 0, 0, 0.1)',
  };
  const resizerHoverCss = {
    height: '10px',
    marginTop: '-10px',
    backgroundImage:
      'radial-gradient(at center center,rgba(0,0,0,0.2) 0%,transparent 70%,transparent 100%)',
    backgroundSize: '100% 50px',
    backgroundPosition: '50% 0',
    backgroundRepeat: 'no-repeat',
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
  };

  return (
    <TableContext.Provider
      value={{ tableData, setTableData, tableDataReady: !!payrollTemplate?.fields }}
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {/* <Button onClick={() => setVisible(!visible)}>Toggle</Button> */}
        <Card title="Columns configuration" style={{ minHeight: '100vh', height: '100%' }}>
          {/* <SplitPane style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}> */}
          <SplitPane
            split="vertical"
            initialSizes={[800, 300]}
            minSizes={[50, 100]}
            collapseOptions={{
              beforeToggleButton: (
                <Button>
                  <ArrowRightOutlined />
                </Button>
              ),
              afterToggleButton: (
                <Button>
                  <ArrowLeftOutlined />
                </Button>
              ),
              collapseDirection: 'right',
            }}
            resizerOptions={{
              css: resizerCss,
              hoverCss: resizerHoverCss,
              grabberSize: '1rem',
            }}
            hooks={{
              onCollapse: (it) => setCollapse(!!it[1]),
              // onDragStarted: action('onDragStarted'),
              // onSaveSizes: action('onDragFinished'),
            }}
          >
            <div style={{ margin: '0 12px' }}>
              <SortableTable />
            </div>
            <div
              style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.3s', marginRight: 12 }}
            >
              <Button
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
                children="Add Column"
                onClick={() => {
                  setTableData([
                    ...tableData,
                    {
                      type: 'Formula',
                      code_name: `formula_${tableData.length + 1}`,
                      define: '',
                      display_name: '',
                      index: tableData.length,
                    },
                  ]);
                }}
              />
              <List
                itemLayout="horizontal"
                dataSource={systemFields}
                loading={!systemFields}
                bordered
                renderItem={(item, index) => (
                  <List.Item
                    onClick={(e) => {
                      const codeName = systemFields?.[index].code_name;
                      const codeNameExists = tableData.some((it) => it.code_name === codeName);
                      if (codeNameExists) {
                        message.error(`${codeName} already exists`);
                        return;
                      }
                      setTableData([
                        ...tableData,
                        {
                          type: 'System Field',
                          code_name: systemFields?.[index].code_name,
                          define: '',
                          display_name: systemFields?.[index].name,
                          index: tableData.length,
                        },
                      ]);
                    }}
                    className={styles.listItem}
                  >
                    <List.Item.Meta
                      title={`${item.code_name} (${item.name})`}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </div>
          </SplitPane>
        </Card>
      </div>
    </TableContext.Provider>
  );
};
