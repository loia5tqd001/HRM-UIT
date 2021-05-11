import {
  calculatePayslips,
  exportExcel,
  readPayroll,
  readPayslips,
  sendViaEmail,
} from '@/services/payroll.payrolls';
import { FileExcelOutlined, SendOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Affix, Button, Card, message, Space, Table } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'umi';

export const PayrollDetail: React.FC = () => {
  const { id } = useParams<any>();
  const [tableData, setTableData] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<API.Payroll>();
  const [dynamicColumns, setDynamicColumns] = useState<any>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const requestTable = useCallback(() => {
    readPayslips(id).then((fetchData) => {
      if (!fetchData.length) return;
      setDynamicColumns(
        fetchData[0].values
          .map((it) => it.field)
          .sort((a, b) => a.index - b.index)
          .map((it) => ({ dataIndex: it.code_name, title: it.display_name })),
      );
      setTableData(
        fetchData.map((it) => {
          return it.values.reduce((acc, cur) => {
            acc[cur.field.code_name] = cur.num_value ? Number(cur.num_value) : cur.str_value;
            return acc;
          }, {});
        }),
      );
    });
  }, [id]);

  useEffect(() => {
    readPayroll(id).then((fetchData) => setPayroll(fetchData));
    requestTable();
  }, [id, requestTable]);

  const columns: ColumnType<any>[] = [
    {
      title: '#',
      dataIndex: 'index',
      width: 65,
      render: (_, __, index) => index + 1,
    },
    ...(dynamicColumns || []),
  ];

  return (
    <PageContainer title={payroll?.name}>
      <div style={{ display: 'grid', gap: 24 }}>
        <Affix offsetTop={50}>
          <Card
            title="Payslips"
            style={{ minHeight: '50vh', height: '100%' }}
            extra={
              <Space>
                <Button
                  children="Send playslips via email"
                  icon={<SendOutlined />}
                  loading={isSending}
                  onClick={async () => {
                    try {
                      setIsSending(true);
                      await sendViaEmail(id);
                      message.success('Sent successfully!');
                    } catch {
                      message.error('Cannot send!');
                    } finally {
                      setIsSending(false);
                    }
                  }}
                />
                <Button
                  children="Export Excel"
                  icon={<FileExcelOutlined />}
                  loading={isExporting}
                  onClick={async () => {
                    try {
                      setIsExporting(true);
                      await exportExcel(id);
                    } catch {
                      message.error('Export unsuccessfully!');
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                />
                <Button
                  children="Run Calculation"
                  type="primary"
                  loading={isCalculating}
                  onClick={async () => {
                    try {
                      setIsCalculating(true);
                      await calculatePayslips(id);
                      await requestTable();
                      message.success('Calculate successfully!');
                    } catch {
                      message.error('Calculate unsuccessfully!');
                    } finally {
                      setIsCalculating(false);
                    }
                  }}
                />
              </Space>
            }
          >
            <div style={{ height: 'calc(100vh - 50px)', overflow: 'auto', margin: '0 12px' }}>
              <Table<any>
                pagination={false}
                loading={!tableData}
                dataSource={tableData}
                scroll={{ x: 'max-content' }}
                columns={columns}
                rowKey="index"
                bordered
              />
            </div>
          </Card>
        </Affix>
      </div>
    </PageContainer>
  );
};

export default PayrollDetail;
