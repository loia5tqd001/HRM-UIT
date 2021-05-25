import ProCard from '@ant-design/pro-card';
import React from 'react';
import LeftPanel from './LeftPanel';
import { RightPanel } from './RightPanel';
import { CrudModal } from './components/CrudModal';
import { PageContainer } from '@ant-design/pro-layout';

const Permission: React.FC = () => {
  return (
    <PageContainer title={false}>
      <ProCard split="vertical" style={{ height: '100%' }} className="card-shadow">
        <ProCard colSpan="380px" ghost>
          <LeftPanel />
        </ProCard>
        <RightPanel />
        <CrudModal />
      </ProCard>
    </PageContainer>
  );
};

export default Permission;
