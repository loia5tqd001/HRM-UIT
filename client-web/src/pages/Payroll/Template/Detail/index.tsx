import { PageContainer } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import { GeneralInformation } from './GeneralInformation';
import { PayrollColumns } from './PayrollColumns';

export const List: React.FC = () => {
  const [activeKey, setActiveKey] = useState('general-information');

  const renderContent = (key: string) => {
    if (key === 'general-information') return <GeneralInformation />;
    if (key === 'payroll-columns') return <PayrollColumns />;
    if (key === 'payslip-template') return <div>payslip-template</div>;
    return null;
  };

  return (
    <PageContainer
      title="Bảng lương chính"
      tabList={[
        {
          tab: 'General Information',
          key: 'general-information',
        },
        {
          tab: 'Payroll Columns',
          key: 'payroll-columns',
        },
        {
          tab: 'Payslip Template',
          key: 'payslip-template',
        },
      ]}
      onTabChange={(key) => setActiveKey(key)}
    >
      {renderContent(activeKey)}
    </PageContainer>
  );
};

export default List;
