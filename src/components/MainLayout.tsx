import React from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MainContent from './MainContent';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-[330px_1fr_330px] gap-[20px] md:p-5 p-1.5 max-w-[1500px] mx-auto">
                <LeftSidebar />
                <MainContent />
                <RightSidebar />
            </div>
        </div>
    );
};

export default MainLayout;
